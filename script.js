// Header scroll state
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  menuToggle.textContent = mainNav.classList.contains('open') ? '✕' : '☰';
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.textContent = '☰';
}));

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal, .reveal-stagger, .steps');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible', 'in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
revealEls.forEach(el => io.observe(el));

// Count-up stats
const counters = document.querySelectorAll('.count-up');
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      let cur = 0;
      const step = Math.max(1, Math.round(target / 40));
      const timer = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(timer); }
        el.textContent = cur;
      }, 30);
      counterIO.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => counterIO.observe(c));

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-a');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(open => {
      open.classList.remove('open');
      open.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// Testimonial shots carousel (coverflow + fullscreen modal)
(function initShots(){
  const stage = document.getElementById('shotsStage');
  if (!stage) return;
  const items = Array.from(stage.querySelectorAll('.shot'));
  const dotsWrap = document.getElementById('shotsDots');
  const total = items.length;
  let current = 0;
  let autoplayId = null;

  items.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Ir para testemunho ${i + 1}`);
    dot.addEventListener('click', () => { goTo(i); restartAutoplay(); });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.querySelectorAll('button'));

  function layout(){
    const narrow = window.innerWidth <= 700;
    const spacing = narrow ? 108 : 168;
    items.forEach((item, i) => {
      let offset = i - current;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      const abs = Math.abs(offset);
      const scale = abs === 0 ? 1 : abs === 1 ? .78 : abs === 2 ? .6 : .45;
      const opacity = abs === 0 ? 1 : abs === 1 ? .6 : abs === 2 ? .3 : 0;
      item.style.zIndex = 10 - abs;
      item.style.opacity = opacity;
      item.style.pointerEvents = abs > 2 ? 'none' : 'auto';
      item.style.transform = `translate(-50%,-50%) translateX(${offset * spacing}px) scale(${scale})`;
      item.classList.toggle('is-active', offset === 0);
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function goTo(i){
    current = ((i % total) + total) % total;
    layout();
    if (modal.classList.contains('open')) showModal(current);
  }
  function next(){ goTo(current + 1); }
  function prev(){ goTo(current - 1); }

  items.forEach((item, i) => item.addEventListener('click', () => {
    goTo(i);
    showModal(i);
  }));
  document.getElementById('shotsPrev').addEventListener('click', () => { prev(); restartAutoplay(); });
  document.getElementById('shotsNext').addEventListener('click', () => { next(); restartAutoplay(); });

  function startAutoplay(){ autoplayId = setInterval(next, 3200); }
  function stopAutoplay(){ clearInterval(autoplayId); }
  function restartAutoplay(){ stopAutoplay(); startAutoplay(); }
  stage.addEventListener('mouseenter', stopAutoplay);
  stage.addEventListener('mouseleave', startAutoplay);

  // Modal em ecrã inteiro — continua a rodar o carrossel automaticamente
  const modal = document.getElementById('shotModal');
  const modalImg = document.getElementById('shotModalImg');
  const modalCount = document.getElementById('shotModalCount');
  function showModal(i){
    const src = items[i].querySelector('img').getAttribute('src');
    modalImg.setAttribute('src', src);
    modalCount.textContent = `${i + 1} / ${total}`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    restartAutoplay();
  }
  document.getElementById('shotModalClose').addEventListener('click', closeModal);
  document.getElementById('shotModalPrev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('shotModalNext').addEventListener('click', () => goTo(current + 1));
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft') goTo(current - 1);
  });

  window.addEventListener('resize', layout, { passive:true });
  layout();
  startAutoplay();
})();

// Send every purchase action to checkout.
document.querySelectorAll('[data-checkout]').forEach(button => {
  button.addEventListener('click', () => {
    location.href = 'https://chavedireta.cursosmoz.shop/checkout';
  });
});
