/* Homepage: the missed-call demo. Nav, reveals and steps are handled site-wide in Base.astro. */
(function(){
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var E = 'cubic-bezier(.22,1,.36,1)';
  var demo = document.getElementById('demo');
  if (!demo) return;
  var timeEl = document.getElementById('demoTime');
  var msgs = Array.prototype.slice.call(document.querySelectorAll('#msgs .msg'));
  if (rm) { demo.style.opacity='1'; demo.style.transform='none'; msgs.forEach(function(m){ m.classList.add('show'); }); if (timeEl) timeEl.textContent = '0:41'; return; }

  demo.style.transition = 'opacity .8s ease 380ms, transform 1s '+E+' 380ms';
  setTimeout(function(){ demo.style.opacity='1'; demo.style.transform='none'; }, 40);

  /* demo conversation: plays on load, rests, then replays quietly */
  var typing = document.createElement('div'); typing.className='msg ai typing-wrap'; typing.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';
  var msgsBox = document.getElementById('msgs');
  var clock = 0, clockTimer, timers = [];
  function tick(){ clock++; timeEl.textContent = '0:' + (clock<10?'0':'') + clock; if(clock>=41) clearInterval(clockTimer); }
  function play(){
    var t = 0; clock = 0; timeEl.textContent = '0:00';
    msgs.forEach(function(m,i){
      var isAI = m.classList.contains('ai');
      t += (i===0 ? 900 : (isAI ? 1250 : 950));
      if (isAI){ timers.push(setTimeout(function(){ msgsBox.insertBefore(typing, m); typing.classList.add('show'); }, t - 900)); }
      timers.push(setTimeout(function(){
        if (isAI){ typing.classList.remove('show'); if(typing.parentNode) typing.parentNode.removeChild(typing); }
        m.classList.add('show');
        if (i===0){ clockTimer = setInterval(tick, 190); }
        if (i===msgs.length-1){ clearInterval(clockTimer); timeEl.textContent='0:41'; timers.push(setTimeout(reset, 9000)); }
      }, t));
    });
  }
  function reset(){ msgs.forEach(function(m){ m.classList.remove('show'); }); timers.push(setTimeout(play, 700)); }
  play();
  document.addEventListener('visibilitychange', function(){ if(document.hidden){ timers.forEach(clearTimeout); clearInterval(clockTimer); } else { timers = []; msgs.forEach(function(m){ m.classList.remove('show'); }); play(); } });

  /* demo tilt: follows the pointer, settles back */
  var stage = document.getElementById('demoStage');
  if (stage && window.matchMedia('(hover:hover)').matches){
    stage.addEventListener('mousemove', function(e){
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      demo.classList.add('tilt');
      demo.style.transform = 'rotateX(' + (-y*6).toFixed(2) + 'deg) rotateY(' + (x*8).toFixed(2) + 'deg) translateZ(0)';
    });
    stage.addEventListener('mouseleave', function(){ demo.style.transition = 'transform .8s '+E; demo.style.transform = 'none'; setTimeout(function(){ demo.classList.remove('tilt'); demo.style.transition=''; }, 800); });
  }
})();
