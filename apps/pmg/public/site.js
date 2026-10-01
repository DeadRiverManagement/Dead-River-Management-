(function(){
  "use strict";
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var header = document.getElementById('header');
  var onScroll = function(){ header.classList.toggle('scrolled', window.scrollY > 20); };
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  var toggle = function(force){
    var open = force !== undefined ? force : !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', function(){ toggle(); });
  menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ toggle(false); }); });

  var reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }
  setTimeout(function(){ document.querySelectorAll('.reveal:not(.in)').forEach(function(el){ el.classList.add('in'); }); }, 2500);

  document.querySelectorAll('.qa>button').forEach(function(btn){
    btn.addEventListener('click', function(){
      var qa = btn.parentElement;
      var a = qa.querySelector('.a');
      var open = qa.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      a.style.maxHeight = open ? a.scrollHeight + 'px' : 0;
    });
  });

})();
