// Site motion: Lenis smooth scroll synced to GSAP ScrollTrigger (per the Lenis
// README), hero line reveal, river draw, scroll reveals and magnetic buttons.
// Everything is skipped when the visitor prefers reduced motion, and nothing
// is hidden by CSS, so the page reads fine with JavaScript off.
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page anchors scroll through Lenis so they ease like everything else.
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const target = a.hash.length > 1 && document.querySelector(a.hash);
    if (target)
      a.addEventListener('click', (e) => {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -96 });
      });
  });

  const header = document.querySelector('.site-header');
  if (header)
    ScrollTrigger.create({
      start: 24,
      onToggle: (self) => header.classList.toggle('is-stuck', self.isActive),
    });

  // Pages on the Growth layout opt into the full set below.
  if (document.body.dataset.motion === 'full') {
    const h1 = document.querySelector('[data-split]');
    if (h1)
      document.fonts.ready.then(() =>
        SplitText.create(h1, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.1,
              stagger: 0.09,
              ease: 'power4.out',
            }),
        }),
      );
    gsap.from('[data-rise]', {
      y: 26,
      opacity: 0,
      duration: 0.9,
      stagger: 0.1,
      delay: 0.35,
      ease: 'power3.out',
      clearProps: 'all',
    });

    const river = document.querySelector('.river-visual');
    if (river) {
      gsap.from(river.querySelectorAll('.river-path'), {
        drawSVG: 0,
        duration: 2.2,
        stagger: 0.12,
        delay: 0.2,
        ease: 'power2.inOut',
      });
      gsap.from(river.querySelectorAll('.river-label, .river-art circle'), {
        scale: 0.8,
        opacity: 0,
        duration: 0.7,
        stagger: 0.18,
        delay: 1.1,
        ease: 'back.out(1.7)',
        transformOrigin: 'center',
        clearProps: 'all',
      });
      gsap.to(river, {
        y: -48,
        ease: 'none',
        scrollTrigger: {
          trigger: river,
          start: 'top 60%',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // Reveal below-the-fold content as it scrolls in. Elements inside another
    // target are left alone so a section head and its heading do not both run.
    const all = gsap.utils.toArray(
      'main > :not(:first-child) :is(h2, .section-head, .steps > article, .rv-card, .faq, .split > *, .feature-panel, .trade-card, .button-row, .urgency > *, .home-testimonial, .client-trust-heading, .resource-card, .tier, .metric-cell, .outcome-item, .case-feature > *, .prose, .closing > *)',
    );
    const fold = window.innerHeight * 0.9;
    const targets = all.filter(
      (el) =>
        el.getBoundingClientRect().top > fold &&
        !all.some((o) => o !== el && o.contains(el)),
    );
    gsap.set(targets, { opacity: 0, y: 30 });
    ScrollTrigger.batch(targets, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          overwrite: true,
          clearProps: 'transform',
        }),
    });

    // Buttons lean toward the pointer on desktop.
    if (window.matchMedia('(pointer: fine)').matches)
      document.querySelectorAll('.button').forEach((b) => {
        const x = gsap.quickTo(b, 'x', { duration: 0.45, ease: 'power3' });
        const y = gsap.quickTo(b, 'y', { duration: 0.45, ease: 'power3' });
        b.addEventListener('mousemove', (e) => {
          const r = b.getBoundingClientRect();
          x((e.clientX - r.left - r.width / 2) * 0.16);
          y((e.clientY - r.top - r.height / 2) * 0.22);
        });
        b.addEventListener('mouseleave', () => {
          x(0);
          y(0);
        });
      });
  }
}
