/* The scene changes only after the white veil completely covers the viewport. */
window.OvenTransition = {
  create({ getPhase, reveal, getReduced }) {
    let effect = null;
    function cancel() {
      if (!effect) return;
      const previous = effect;
      effect = null;
      previous.animations.forEach(animation => animation.cancel());
      previous.layer.remove();
    }
    function pause() {
      effect?.animations.forEach(animation => animation.pause());
    }
    function finish() {
      if (getPhase() !== 'final-cooking') return;
      if (!effect) sync();
      if (effect?.stage === 'growing') effect.white.finish();
    }
    function sync() {
      if (getPhase() !== 'final-cooking' && !(getPhase() === 'final-result' && effect?.stage === 'revealing')) {
        cancel();
        return;
      }
      if (!effect) {
        const layer = document.createElement('div');
        layer.className = 'oven-transition';
        layer.setAttribute('aria-hidden', 'true');
        const glow = document.createElement('div');
        glow.className = 'oven-transition-glow';
        const white = document.createElement('div');
        white.className = 'oven-transition-white';
        layer.append(glow, white);
        document.body.append(layer);
        const glass = document.querySelector('.oven-glass')?.getBoundingClientRect();
        const x = glass ? glass.left + glass.width / 2 : innerWidth / 2;
        const y = glass ? glass.top + glass.height / 2 : innerHeight / 2;
        glow.style.left = x + 'px';
        glow.style.top = y + 'px';
        const size = Math.hypot(innerWidth, innerHeight) * 2;
        glow.style.width = glow.style.height = size + 'px';
        const reduced = getReduced();
        const duration = reduced ? 3000 : 4200;
        const bloom = glow.animate([
          { opacity: 0, transform: 'translate(-50%, -50%) scale(.015)' },
          { opacity: .9, transform: 'translate(-50%, -50%) scale(.08)', offset: .35 },
          { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
        ], { duration, easing: 'ease-in', fill: 'forwards' });
        if (reduced) glow.hidden = true;
        const veil = white.animate([
          { opacity: 0 }, { opacity: 0, offset: .45 }, { opacity: 1 }
        ], { duration, easing: 'ease-in-out', fill: 'forwards' });
        const current = effect = { layer, white: veil, animations: [bloom, veil], stage: 'growing' };
        veil.onfinish = () => {
          if (effect !== current || getPhase() !== 'final-cooking') return;
          if (document.hidden || document.querySelector('dialog[open]')) { pause(); return; }
          current.stage = 'revealing';
          // The filled animation holds pure white while render replaces the scene.
          reveal();
          glow.hidden = true;
          white.style.opacity = '1';
          current.animations.forEach(animation => animation.cancel());
          const fade = white.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: reduced ? 400 : 1100, easing: 'ease-out', fill: 'forwards'
          });
          current.animations = [fade];
          fade.onfinish = () => { if (effect === current) cancel(); };
          sync();
        };
      }
      if (document.hidden || document.querySelector('dialog[open]')) pause();
      else effect.animations.forEach(animation => { if (animation.playState === 'paused') animation.play(); });
    }
    return { sync, pause, cancel, finish };
  }
};
