window.CompanyReveal = {
  create({ isCompany, getReduced }) {
    let current = null;
    function cancel() {
      if (!current) return;
      const previous = current;
      current = null;
      previous.observer?.disconnect();
      previous.animations.forEach(animation => animation.cancel());
      previous.layer.remove();
      previous.picture.classList.remove('company-arriving');
    }
    function pause() { current?.animations.forEach(animation => animation.pause()); }
    function sync() {
      if (!current) return;
      if (!isCompany() || !current.picture.isConnected) { cancel(); return; }
      if (document.hidden || document.querySelector('dialog[open]')) pause();
      else current.animations.forEach(animation => { if (animation.playState === 'paused') animation.play(); });
    }
    function play() {
      cancel();
      const picture = document.querySelector('[data-finale="company"]');
      if (!picture || !isCompany()) return;
      const layer = document.createElement('div');
      layer.className = 'company-reveal-light';
      layer.setAttribute('aria-hidden', 'true');
      picture.append(layer);
      picture.classList.add('company-arriving');
      const effect = current = { picture, layer, animations: [], observer: null };
      function begin() {
        if (current !== effect || picture.dataset.tableau === 'loading') return;
        effect.observer?.disconnect();
        const reduced = getReduced();
        const duration = reduced ? 800 : 3000;
        // Reveal the approved painting as one piece, opening the view onto the workshop.
        const arrival = picture.animate(reduced ? [{ opacity: .1 }, { opacity: 1 }] : [
          { opacity: .15, transform: 'scale(1.035)', clipPath: 'inset(4% 12% 4% 12%)', filter: 'brightness(1.1)' },
          { opacity: 1, transform: 'scale(1.015)', clipPath: 'inset(1% 4% 1% 4%)', filter: 'brightness(1.04)', offset: .55 },
          { opacity: 1, transform: 'scale(1)', clipPath: 'inset(0% 0% 0% 0%)', filter: 'brightness(1)' }
        ], { duration, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'both' });
        effect.animations.push(arrival);
        picture.classList.remove('company-arriving');
        if (!reduced) {
          const ray = document.createElement('span');
          ray.className = 'company-sunray';
          layer.append(ray);
          effect.animations.push(ray.animate([
            { opacity: 0, transform: 'translateX(-45%)' },
            { opacity: .6, transform: 'translateX(-10%)', offset: .4 },
            { opacity: 0, transform: 'translateX(45%)' }
          ], { duration: 2800, easing: 'ease-in-out', fill: 'both' }));
        }
        arrival.finished.then(() => { if (current === effect) cancel(); }).catch(() => {});
        sync();
      }
      effect.observer = new MutationObserver(begin);
      effect.observer.observe(picture, { attributes: true, attributeFilter: ['data-tableau'] });
      begin();
    }
    return { play, sync, pause, cancel };
  }
};
