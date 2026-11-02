window.PuzzleEffects = {
  create({ getPhase, getReduced }) {
    let current = null;
    function cancel() {
      if (!current) return;
      const old = current;
      current = null;
      old.animations.forEach(animation => animation.cancel());
      old.layer.remove();
    }
    function pause() { current?.animations.forEach(animation => animation.pause()); }
    function sync() {
      if (!current) return;
      if (getPhase() !== current.phase) { cancel(); return; }
      if (document.hidden || document.querySelector('dialog[open]')) pause();
      else current.animations.forEach(animation => { if (animation.playState === 'paused') animation.play(); });
    }
    function capture(kind) {
      const source = document.querySelector(kind === 'door' ? '#journey-art .journey-picture' : `[data-paper="${kind}"]`);
      return source && !source.hidden ? source.cloneNode(true) : null;
    }
    function play(kind, snapshot, awakened = false) {
      cancel();
      const picture = document.querySelector('#journey-art .journey-picture');
      if (!picture || !snapshot) return;
      const reduced = getReduced();
      const layer = document.createElement('div');
      layer.className = `puzzle-effect puzzle-effect-${kind}`;
      layer.setAttribute('aria-hidden', 'true');
      picture.append(layer);
      const effect = current = { layer, phase: getPhase(), animations: [] };
      function animate(element, frames, duration, delay = 0) {
        const animation = element.animate(frames, { duration, delay, fill: 'both', easing: 'ease-in-out' });
        effect.animations.push(animation);
        return animation;
      }
      snapshot.removeAttribute('role');
      snapshot.removeAttribute('aria-label');
      snapshot.querySelectorAll('[data-door-digit]').forEach(el => el.removeAttribute('data-door-digit'));
      snapshot.removeAttribute('data-paper');
      snapshot.hidden = false;
      layer.append(snapshot);
      let end;
      if (kind === 'door') {
        snapshot.classList.add('unlock-snapshot');
        const lock = snapshot.querySelector('.door-lock');
        if (lock) animate(lock, [{ filter: 'brightness(1)' }, { filter: 'brightness(1.8)', offset: .5 }, { filter: 'brightness(1.15)' }], reduced ? 400 : 800);
        end = animate(snapshot, [{ opacity: 1 }, { opacity: 0 }], reduced ? 650 : 1300, reduced ? 0 : 650);
        if (!reduced) {
          const light = document.createElement('span');
          light.className = 'door-unlock-light';
          layer.append(light);
          animate(light, [{ opacity: 0, transform: 'scaleX(.05)' }, { opacity: .9, transform: 'scaleX(.6)', offset: .3 }, { opacity: .75, transform: 'scaleX(8)', offset: .65 }, { opacity: 0, transform: 'scaleX(14)' }], 2100);
        }
      } else {
        snapshot.classList.add('dissolving-paper');
        end = animate(snapshot, reduced ? [{ opacity: 1 }, { opacity: 0 }] : [
          { opacity: 1, clipPath: 'inset(0 0 0 0)', filter: 'brightness(1)' },
          { opacity: 1, clipPath: 'inset(0 0 12% 0)', filter: 'brightness(1.6)', offset: .3 },
          { opacity: 0, clipPath: 'inset(0 0 100% 0)', filter: 'brightness(2)' }
        ], reduced ? 650 : 1500);
        if (!reduced) {
          for (let i = 0; i < 24; i++) {
            const spark = document.createElement('i');
            spark.className = 'paper-spark';
            spark.style.left = (kind === 'orange' ? 38 : 51) + (i % 6) * 2 + '%';
            spark.style.top = 48 - Math.floor(i / 6) * 3 + '%';
            spark.style.background = kind === 'orange' ? '#ffe3a0' : '#ffdfed';
            layer.append(spark);
            animate(spark, [{ opacity: 0, transform: 'translate(0,0) scale(.4)' }, { opacity: 1, offset: .2 }, { opacity: 0, transform: `translate(${(i % 5 - 2) * 13}px,${-30 - i % 4 * 12}px) scale(.2)` }], 1200, 250 + Math.floor(i / 6) * 180);
          }
        }
        if (awakened) {
          const glow = document.createElement('span');
          glow.className = 'oven-awakening-light';
          layer.append(glow);
          end = animate(glow, [{ opacity: 0 }, { opacity: .9, offset: .55 }, { opacity: 0 }], reduced ? 650 : 1600, reduced ? 0 : 1000);
        } else if (!reduced) {
          // Keep the last drifting particles until their animation finishes.
          end = effect.animations.at(-1);
        }
      }
      end.finished.then(() => { if (current === effect) cancel(); }).catch(() => {});
      sync();
    }
    return { capture, play, sync, pause, cancel };
  }
};
