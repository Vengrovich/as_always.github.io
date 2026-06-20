/* =========================================================
   VR-Психолог — interactions
   ========================================================= */
(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Header scroll state ---------------- */
  var header = document.querySelector('.site-header');
  function onScroll(){
    if(!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------------- Mobile nav toggle ---------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if(navToggle && nav){
    navToggle.addEventListener('click', function(){
      var open = nav.classList.toggle('nav--open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ nav.classList.remove('nav--open'); });
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry, i){
        if(entry.isIntersecting){
          setTimeout(function(){ entry.target.classList.add('is-visible'); }, (entry.target.dataset.revealDelay || 0));
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.14, rootMargin:'0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------------- FAQ accordion ---------------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function(item){
    var btn = item.querySelector('.faq-q');
    var answer = item.querySelector('.faq-a');
    btn.addEventListener('click', function(){
      var isOpen = item.classList.contains('is-open');
      faqItems.forEach(function(other){
        other.classList.remove('is-open');
        other.querySelector('.faq-a').style.maxHeight = null;
        other.querySelector('.faq-q').setAttribute('aria-expanded','false');
      });
      if(!isOpen){
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded','true');
      }
    });
  });

  /* ---------------- Request cards: tap-to-reveal on touch ---------------- */
  var requestCards = document.querySelectorAll('.request-card');
  requestCards.forEach(function(card){
    card.addEventListener('click', function(){
      requestCards.forEach(function(c){ if(c!==card) c.classList.remove('is-active'); });
      card.classList.toggle('is-active');
    });
  });

  /* ---------------- Logo carousel: duplicate content for seamless loop ---------------- */
  var track = document.querySelector('.logo-track');
  if(track){
    track.innerHTML += track.innerHTML;
  }

  /* =========================================================
     Drawers (Записаться / Получить демо) + Consent modal
     ========================================================= */
  var overlay = document.getElementById('drawer-overlay');
  var drawers = {
    booking: document.getElementById('drawer-booking'),
    demo: document.getElementById('drawer-demo')
  };
  var consentModal = document.getElementById('consent-modal');
  var lastFocused = null;
  var activeDrawer = null;

  function openDrawer(key){
    var drawer = drawers[key];
    if(!drawer) return;
    lastFocused = document.activeElement;
    activeDrawer = drawer;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden','false');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var firstField = drawer.querySelector('input,button');
    if(firstField) setTimeout(function(){ firstField.focus(); }, 350);
  }

  function closeDrawers(){
    Object.keys(drawers).forEach(function(k){
      drawers[k].classList.remove('is-open');
      drawers[k].setAttribute('aria-hidden','true');
    });
    overlay.classList.remove('is-open');
    activeDrawer = null;
    if(!consentModal.classList.contains('is-open')){
      document.body.style.overflow = '';
    }
    if(lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-open-drawer]').forEach(function(btn){
    btn.addEventListener('click', function(){
      openDrawer(btn.getAttribute('data-open-drawer'));
    });
  });
  document.querySelectorAll('[data-close-drawer]').forEach(function(btn){
    btn.addEventListener('click', closeDrawers);
  });
  overlay.addEventListener('click', function(){
    if(consentModal.classList.contains('is-open')){ closeConsent(); }
    else { closeDrawers(); }
  });

  /* ---- Consent modal ---- */
  function openConsent(){
    consentModal.classList.add('is-open');
    consentModal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeConsent(){
    consentModal.classList.remove('is-open');
    consentModal.setAttribute('aria-hidden','true');
    if(!activeDrawer){ document.body.style.overflow = ''; }
  }
  document.querySelectorAll('[data-open-consent]').forEach(function(btn){
    btn.addEventListener('click', openConsent);
  });
  document.querySelectorAll('[data-close-consent]').forEach(function(btn){
    btn.addEventListener('click', closeConsent);
  });

  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    if(consentModal.classList.contains('is-open')){ closeConsent(); }
    else if(activeDrawer){ closeDrawers(); }
  });

  /* ---- Drawer forms: validation + submit ---- */
  document.querySelectorAll('[data-drawer-form]').forEach(function(form){
    var errorEl = form.querySelector('[data-drawer-error]');
    var statusEl = form.querySelector('.drawer-status');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = form.querySelector('input[name="name"]');
      var phone = form.querySelector('input[name="phone"]');
      var consent = form.querySelector('input[name="consent"]');
      errorEl.textContent = '';

      if(!name.value.trim() || !phone.value.trim()){
        errorEl.textContent = 'Заполните имя и телефон.';
        return;
      }
      if(!consent.checked){
        errorEl.textContent = 'Необходимо согласие на обработку персональных данных.';
        return;
      }
      statusEl.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
      form.reset();
      setTimeout(function(){
        closeDrawers();
        statusEl.textContent = '';
      }, 1600);
    });
  });

  /* ---- Demo video placeholder play button ---- */
  document.querySelectorAll('[data-play-video]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var caption = btn.parentElement.querySelector('.drawer-video-caption');
      if(caption) caption.textContent = '[ placeholder · здесь будет воспроизводиться видео о демо-версии ]';
    });
  });

  /* ---------------- Form ---------------- */
  var form = document.getElementById('demo-form');
  var status = document.querySelector('.form-status');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(status){
        status.textContent = 'Спасибо! Заявка отправлена — мы свяжемся с вами в ближайшее время.';
      }
      form.reset();
    });
  }

  /* ---------------- Smooth anchor scroll offset for fixed header ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    link.addEventListener('click', function(e){
      var id = link.getAttribute('href');
      if(id.length < 2) return;
      var target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      var headerEl = document.querySelector('.site-header');
      var offset = (headerEl ? headerEl.offsetHeight : 80) + 16;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(top,0), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* =========================================================
     Starry-night inspired canvas: slow swirling particles
     ========================================================= */
  var canvas = document.getElementById('starfield');
  if(canvas && !reduceMotion){
    var ctx = canvas.getContext('2d');
    var w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var stars = [];
    var swirls = [];
    var STAR_COUNT = 140;

    function resize(){
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }

    function initStars(){
      stars = [];
      for(var i=0;i<STAR_COUNT;i++){
        stars.push({
          x: Math.random()*w,
          y: Math.random()*h,
          r: Math.random()*1.6 + 0.4,
          baseAlpha: Math.random()*0.6 + 0.2,
          twSpeed: Math.random()*0.02 + 0.005,
          twOffset: Math.random()*Math.PI*2,
          drift: (Math.random()-0.5)*0.06
        });
      }
      swirls = [];
      var swirlCount = 3;
      for(var s=0;s<swirlCount;s++){
        swirls.push({
          cx: w*(0.2 + 0.6*Math.random()),
          cy: h*(0.2 + 0.6*Math.random()),
          radius: 80 + Math.random()*140,
          angle: Math.random()*Math.PI*2,
          speed: 0.0015 + Math.random()*0.0015,
          hue: s % 2 === 0 ? '45,212,191' : '244,185,66'
        });
      }
    }

    var t = 0;
    function frame(){
      t += 1;
      ctx.clearRect(0,0,w,h);

      // swirl glow trails
      swirls.forEach(function(sw){
        sw.angle += sw.speed;
        var x = sw.cx + Math.cos(sw.angle)*sw.radius;
        var y = sw.cy + Math.sin(sw.angle)*sw.radius*0.6;
        var grad = ctx.createRadialGradient(x,y,0,x,y,sw.radius*1.4);
        grad.addColorStop(0, 'rgba('+sw.hue+',0.10)');
        grad.addColorStop(1, 'rgba('+sw.hue+',0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x,y, sw.radius*1.4, 0, Math.PI*2);
        ctx.fill();
      });

      // stars
      stars.forEach(function(st){
        var alpha = st.baseAlpha + Math.sin(t*st.twSpeed + st.twOffset)*0.25;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(248,250,252,'+Math.max(0,alpha)+')';
        ctx.arc(st.x, st.y, st.r, 0, Math.PI*2);
        ctx.fill();
        st.y += st.drift;
        if(st.y < -4) st.y = h+4;
        if(st.y > h+4) st.y = -4;
      });

      requestAnimationFrame(frame);
    }

    resize();
    initStars();
    window.addEventListener('resize', function(){
      resize();
      initStars();
    });
    requestAnimationFrame(frame);
  }

})();
