/*
 * <scroll-video>
 *
 * Drives a pinned video's playhead from scroll position and reveals tooltips at
 * authored timestamps.
 *
 * Two things here are less obvious than they look:
 *
 * 1. The video is object-fit:cover, so it crops differently at every window
 *    shape. Tooltips are authored against the VIDEO FRAME, not the viewport, so
 *    we measure the video's real rendered box (including the cropped-off parts)
 *    and hand CSS four custom properties to position against. Measured on resize
 *    only — never during scroll.
 *
 * 2. Tooltips read the SMOOTHED playhead, not the raw scroll target. If they read
 *    the target they would lead the picture during the ease and desync from the
 *    frame the visitor is actually looking at.
 */

if (!customElements.get('scroll-video')) {
  customElements.define(
    'scroll-video',
    class ScrollVideo extends HTMLElement {
      /* How hard the playhead eases toward the scroll target each frame.
         1 = locked to scroll (feels connected, slightly mechanical),
         lower = smoother but laggier. Tuning candidate during QA. */
      static SMOOTHING = 0.2;

      /* Don't write currentTime for sub-frame changes — redundant seeks cost
         decode work and buy nothing visible. */
      static SEEK_EPSILON = 1 / 60;

      /* Keep labels this far inside the stage edge when clamping. */
      static LABEL_PADDING = 16;

      connectedCallback() {
        this.track = this.querySelector('.scroll-video__track');
        this.stage = this.querySelector('.scroll-video__stage');
        this.video = this.querySelector('.scroll-video__video');
        this.poster = this.querySelector('.scroll-video__poster');

        if (!this.track || !this.stage || !this.video) return;

        /* Parse block timings once. Schema can't enforce end > start, or that
           times fall inside the video, so anything malformed is dropped here
           rather than allowed to break the section. */
        this.cues = Array.from(this.querySelectorAll('.scroll-video__tooltip'))
          .map((el) => ({
            el,
            label: el.querySelector('.scroll-video__label'),
            start: parseFloat(el.dataset.start),
            end: parseFloat(el.dataset.end),
          }))
          .filter((cue) => Number.isFinite(cue.start) && Number.isFinite(cue.end) && cue.end > cue.start);

        this.activeCue = null;
        this.playhead = 0;
        this.duration = 0;
        this.rafId = null;

        const breakpoint = parseInt(this.dataset.breakpoint, 10) || 990;
        this.desktopQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);
        this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        this.handleContextChange = this.handleContextChange.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleMetadata = this.handleMetadata.bind(this);
        this.handleBuffered = this.handleBuffered.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleBlockSelect = this.handleBlockSelect.bind(this);
        this.tick = this.tick.bind(this);

        this.desktopQuery.addEventListener('change', this.handleContextChange);
        this.motionQuery.addEventListener('change', this.handleContextChange);
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('shopify:block:select', this.handleBlockSelect);

        /* From here on JS owns tooltip visibility. Before this class lands they
           are visible by default, so a no-JS visitor still gets the callouts. */
        this.classList.add('is-ready');

        this.observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) this.startLoop();
            else this.stopLoop();
          },
          { rootMargin: '10% 0px' }
        );

        this.loadVideo();
      }

      disconnectedCallback() {
        this.stopLoop();
        if (this.observer) this.observer.disconnect();
        this.desktopQuery.removeEventListener('change', this.handleContextChange);
        this.motionQuery.removeEventListener('change', this.handleContextChange);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('shopify:block:select', this.handleBlockSelect);
        this.video.removeEventListener('loadedmetadata', this.handleMetadata);
        this.video.removeEventListener('canplaythrough', this.handleBuffered);
        this.video.removeEventListener('progress', this.handleBuffered);
        this.video.removeEventListener('error', this.handleError);
        if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
      }

      /* Only load where the video will actually be used. display:none still
         downloads, so phones and tablets must never be given the src at all. */
      get shouldLoad() {
        return this.desktopQuery.matches && !this.motionQuery.matches;
      }

      loadVideo() {
        const url = this.dataset.videoUrl;
        if (!url || !this.shouldLoad || this.video.src) return;

        this.video.addEventListener('loadedmetadata', this.handleMetadata);
        this.video.addEventListener('canplaythrough', this.handleBuffered);
        this.video.addEventListener('progress', this.handleBuffered);
        this.video.addEventListener('error', this.handleError);
        this.video.src = url;
      }

      handleContextChange() {
        if (this.shouldLoad) {
          this.loadVideo();
          if (this.duration) this.observer.observe(this.track);
        } else {
          this.stopLoop();
          this.observer.unobserve(this.track);
        }
      }

      handleMetadata() {
        this.duration = this.video.duration;
        if (!Number.isFinite(this.duration) || this.duration <= 0) return;
        this.measure();
        this.observer.observe(this.track);
      }

      /* canplaythrough is the browser's own "I can get through this" estimate.
         Back it with a buffered-range check, because a video that is only ever
         seeked (never played) doesn't always get there. */
      handleBuffered() {
        if (this.classList.contains('is-playable')) return;
        const ready =
          this.video.readyState >= 4 ||
          (this.video.buffered.length > 0 &&
            this.duration > 0 &&
            this.video.buffered.end(this.video.buffered.length - 1) >= this.duration * 0.9);
        if (ready) this.classList.add('is-playable');
      }

      handleError() {
        this.classList.remove('is-playable');
        /* With no poster there is nothing left to look at, so fall back to the
           static image layout rather than leaving an empty pinned box. */
        if (!this.poster) this.classList.add('is-errored');
        this.stopLoop();
      }

      handleResize() {
        if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
        this.resizeFrame = requestAnimationFrame(() => this.measure());
      }

      /* Work out where the video's frame really sits, given object-fit:cover.
         If the stage is proportionally wider than the video, the video fills by
         width and overflows vertically; otherwise it fills by height and
         overflows horizontally. Half the overflow is cropped off each side. */
      measure() {
        const vw = this.video.videoWidth;
        const vh = this.video.videoHeight;
        const sw = this.stage.clientWidth;
        const sh = this.stage.clientHeight;
        if (!vw || !vh || !sw || !sh) return;

        const videoAspect = vw / vh;
        let renderedWidth;
        let renderedHeight;

        if (sw / sh > videoAspect) {
          renderedWidth = sw;
          renderedHeight = sw / videoAspect;
        } else {
          renderedHeight = sh;
          renderedWidth = sh * videoAspect;
        }

        this.stage.style.setProperty('--sv-rw', `${renderedWidth}px`);
        this.stage.style.setProperty('--sv-rh', `${renderedHeight}px`);
        this.stage.style.setProperty('--sv-ox', `${(renderedWidth - sw) / 2}px`);
        this.stage.style.setProperty('--sv-oy', `${(renderedHeight - sh) / 2}px`);

        this.clampLabels();
      }

      /* A tooltip's dot holds its true position even near a cropped edge, but its
         text must not run off screen. Nudge only the label. */
      clampLabels() {
        if (!this.cues.length) return;

        this.cues.forEach(({ label }) => {
          if (label) label.style.removeProperty('--sv-label-shift');
        });

        const stageRect = this.stage.getBoundingClientRect();
        const pad = ScrollVideo.LABEL_PADDING;

        this.cues.forEach(({ label }) => {
          if (!label) return;
          const rect = label.getBoundingClientRect();
          let shift = 0;
          if (rect.right > stageRect.right - pad) {
            shift = stageRect.right - pad - rect.right;
          } else if (rect.left < stageRect.left + pad) {
            shift = stageRect.left + pad - rect.left;
          }
          if (shift) label.style.setProperty('--sv-label-shift', `${Math.round(shift)}px`);
        });
      }

      startLoop() {
        if (this.rafId === null && this.shouldLoad) this.rafId = requestAnimationFrame(this.tick);
      }

      stopLoop() {
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
      }

      tick() {
        const scrollable = this.track.offsetHeight - window.innerHeight;
        const progress =
          scrollable > 0 ? Math.min(Math.max(-this.track.getBoundingClientRect().top / scrollable, 0), 1) : 0;
        const target = progress * this.duration;

        this.playhead += (target - this.playhead) * ScrollVideo.SMOOTHING;
        if (Math.abs(target - this.playhead) < 0.001) this.playhead = target;

        if (this.video.readyState >= 1 && Math.abs(this.video.currentTime - this.playhead) > ScrollVideo.SEEK_EPSILON) {
          this.video.currentTime = this.playhead;
        }

        this.updateTooltips(this.playhead);
        this.rafId = requestAnimationFrame(this.tick);
      }

      /* One tooltip at a time. Overlapping ranges are authorable and the schema
         can't prevent them, so the later start wins — it reads as a sequence
         advancing rather than two callouts fighting. */
      updateTooltips(time) {
        let winner = null;
        for (const cue of this.cues) {
          if (time >= cue.start && time < cue.end) {
            if (!winner || cue.start > winner.start) winner = cue;
          }
        }

        if (winner === this.activeCue) return;
        if (this.activeCue) this.activeCue.el.classList.remove('is-active');
        if (winner) winner.el.classList.add('is-active');
        this.activeCue = winner;
      }

      /* Selecting a tooltip block in the customizer should show it. Setting
         currentTime directly would be overwritten by the next tick, so scroll
         the page to the position that maps to the middle of its range. */
      handleBlockSelect(event) {
        if (!this.contains(event.target) || !this.duration) return;

        const cue = this.cues.find((candidate) => candidate.el === event.target);
        if (!cue) return;

        const midpoint = (cue.start + cue.end) / 2;
        const scrollable = this.track.offsetHeight - window.innerHeight;
        const top = this.track.offsetTop + (midpoint / this.duration) * scrollable;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  );
}
