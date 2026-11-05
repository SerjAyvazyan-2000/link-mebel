(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Шапка и плавающая панель ---------- */
  var header = $('#header'), bar = $('#mobileBar');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('scrolled', y > 20);
    if (bar) bar.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var burger = $('#burger'), menu = $('#mobileMenu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* ---------- Hero: подсветка сама меняет режимы ---------- */
  var heroImgs = $$('#heroFrame img'), heroMode = $('#heroMode'), hi = 0;
  function setHero(i) {
    heroImgs.forEach(function (img, k) { img.classList.toggle('on', k === i); });
    root.style.setProperty('--glow', heroImgs[i].dataset.glow);
    heroMode.textContent = heroImgs[i].dataset.name;
  }
  if (heroImgs.length && !reduce) {
    setInterval(function () { hi = (hi + 1) % heroImgs.length; setHero(hi); }, 3200);
  }

  /* ---------- Переключатель подсветки в кейсе ---------- */
  var stage = $('#switchStage'), stageImgs = $$('#switchStage img'), stageName = $('#stageName');
  var caseSec = $('.case-light'), sws = $$('.sw'), stageIndex = 0, userTouched = false;
  function setStage(i) {
    stageIndex = i;
    stageImgs.forEach(function (img, k) { img.classList.toggle('on', k === i); });
    sws.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    caseSec.style.setProperty('--glow', sws[i].dataset.glow);
    stageName.textContent = sws[i].dataset.name;
  }
  sws.forEach(function (b, k) { b.addEventListener('click', function () { userTouched = true; setStage(k); }); });
  setStage(0);
  // Когда раздел появляется на экране — один раз «щёлкаем» подсветку, чтобы показать фишку
  if ('IntersectionObserver' in window && !reduce) {
    var demoIo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          demoIo.disconnect();
          var seq = [1, 2, 3], n = 0;
          var t = setInterval(function () {
            if (userTouched || n >= seq.length) { clearInterval(t); return; }
            setStage(seq[n++]);
          }, 1400);
        }
      });
    }, { threshold: .5 });
    demoIo.observe(stage);
  }

  /* ---------- Появление при скролле ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
  // страховка: всё должно быть видно, даже если наблюдатель не сработал
  setTimeout(function () {
    reveals.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add('in');
    });
  }, 1200);

  /* ---------- Счётчик 181 ---------- */
  var counter = $('#counter');
  if (counter && 'IntersectionObserver' in window && !reduce) {
    var to = +counter.dataset.to;
    var cio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      cio.disconnect();
      var t0 = performance.now(), dur = 1800;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur), v = 1 - Math.pow(1 - p, 4);
        counter.textContent = Math.round(to * v);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: .6 });
    cio.observe(counter);
  }

  /* ---------- Линия этапов ---------- */
  var stepsLine = $('#stepsLine'), steps = $$('.step');
  if (stepsLine) {
    var sio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      sio.disconnect();
      steps.forEach(function (s, i) {
        setTimeout(function () {
          s.classList.add('done');
          stepsLine.style.setProperty('--prog', Math.round(((i + .5) / steps.length) * 100) + '%');
          if (i === steps.length - 1) stepsLine.style.setProperty('--prog', '100%');
        }, reduce ? 0 : 300 + i * 380);
      });
    }, { threshold: .35 });
    sio.observe(stepsLine);
  }

  /* ---------- Свечение карточек за курсором ---------- */
  $$('.svc').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Лента фото спальни ---------- */
  var rail = $('#rail');
  if (rail) {
    var step = function () { var f = rail.querySelector('figure'); return f ? f.getBoundingClientRect().width + 16 : 300; };
    $('#railPrev').addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: 'smooth' }); });
    $('#railNext').addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: 'smooth' }); });
    var down = false, sx = 0, sl = 0, moved = 0;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft; rail.classList.add('drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      moved = Math.abs(e.clientX - sx);
      rail.scrollLeft = sl - (e.clientX - sx);
    });
    window.addEventListener('pointerup', function () { down = false; rail.classList.remove('drag'); });
    rail.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  /* ---------- Лайтбокс ---------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), list = [], li = 0, lastFocus = null;
  function openLB(items, i) {
    list = items; li = i; lastFocus = document.activeElement;
    showLB(); lb.classList.add('open'); document.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }
  function showLB() {
    var it = list[li];
    lbImg.src = it.src; lbImg.alt = it.alt;
    lbCap.textContent = (li + 1) + ' / ' + list.length + ' · ' + it.alt;
  }
  function closeLB() { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  function moveLB(d) { li = (li + d + list.length) % list.length; showLB(); }
  $('#lbClose').addEventListener('click', closeLB);
  $('#lbPrev').addEventListener('click', function () { moveLB(-1); });
  $('#lbNext').addEventListener('click', function () { moveLB(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.id === 'lbStage') closeLB(); });
  var tx = 0;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { var d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) moveLB(d < 0 ? 1 : -1); });
  document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('open')) {
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowLeft') moveLB(-1);
      if (e.key === 'ArrowRight') moveLB(1);
    }
    if (e.key === 'Escape') { closeDoc(); setMenu(false); }
  });
  function toItems(imgs) { return imgs.map(function (im) { return { src: im.getAttribute('src'), alt: im.alt }; }); }

  // Галерея (с учётом фильтра)
  var gItems = $$('.g-item');
  gItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var visible = gItems.filter(function (b) { return !b.hidden; });
      openLB(toItems(visible.map(function (b) { return b.querySelector('img'); })), visible.indexOf(btn));
    });
  });
  // Спальня
  var bedFigs = $$('#rail figure');
  bedFigs.forEach(function (f, i) {
    f.addEventListener('click', function () { openLB(toItems(bedFigs.map(function (x) { return x.querySelector('img'); })), i); });
  });
  // Детали
  var dets = $$('.detail[data-lb]');
  dets.forEach(function (d, i) {
    var go = function () { openLB(toItems(dets.map(function (x) { return x.querySelector('img'); })), i); };
    d.addEventListener('click', go);
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  // Сцена с подсветкой
  function openStage() { openLB(toItems(stageImgs), stageIndex); }
  stage.addEventListener('click', openStage);
  stage.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStage(); } });

  /* ---------- Фильтр галереи ---------- */
  $$('.gf').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.gf').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var f = b.dataset.f;
      gItems.forEach(function (it) { it.hidden = !(f === 'all' || it.dataset.cat.split(' ').indexOf(f) > -1); });
    });
  });

  /* ---------- Предвыбор типа мебели ---------- */
  $$('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.dataset.pick;
      $$('#chips input').forEach(function (c) { if (c.value === v) c.checked = true; });
    });
  });

  /* ---------- Маска телефона ---------- */
  var phone = $('#fPhone');
  function formatPhone(v) {
    var d = v.replace(/\D/g, '');
    if (d.charAt(0) === '8') d = '7' + d.slice(1);
    if (d.charAt(0) !== '7') d = '7' + d;
    d = d.slice(0, 11);
    var out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    return out;
  }
  phone.addEventListener('input', function () { phone.value = phone.value ? formatPhone(phone.value) : ''; });
  phone.addEventListener('focus', function () { if (!phone.value) phone.value = '+7 ('; });
  phone.addEventListener('blur', function () { if (phone.value.replace(/\D/g, '').length <= 1) phone.value = ''; });

  /* ---------- Отправка формы ---------- */
  var form = $('#leadForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, name = $('#fName');
    $('#fNameMsg').textContent = ''; $('#fPhoneMsg').textContent = '';
    name.classList.remove('err'); phone.classList.remove('err');
    if (name.value.trim().length < 2) { ok = false; name.classList.add('err'); $('#fNameMsg').textContent = 'Напишите, как к вам обращаться'; }
    if (phone.value.replace(/\D/g, '').length !== 11) { ok = false; phone.classList.add('err'); $('#fPhoneMsg').textContent = 'Введите номер полностью: +7 и 10 цифр'; }
    if (!$('#fConsent').checked) { ok = false; $('#fPhoneMsg').textContent = 'Отметьте согласие на обработку данных'; }
    if (!ok) return;
    // Здесь подключается отправка заявки (Telegram-бот, почта или CRM)
    $('#fSubmit').hidden = true;
    $('#formSuccess').hidden = false;
  });

  /* ---------- Копирование номера ---------- */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var txt = b.dataset.copy, orig = b.textContent;
      var done = function () { b.textContent = 'Скопировано'; setTimeout(function () { b.textContent = orig; }, 1800); };
      try {
        navigator.clipboard.writeText(txt).then(done, function () { b.textContent = txt; });
      } catch (err) { b.textContent = txt; }
    });
  });

  /* ---------- Документы ---------- */
  var docModal = $('#docModal'), docBody = $('#docBody'), docTitle = $('#docTitle'), docLast = null;
  var titles = { policy: 'Политика конфиденциальности', terms: 'Пользовательское соглашение', cookies: 'Использование файлов cookie' };
  function openDoc(k) {
    var tpl = document.getElementById('doc-' + k);
    if (!tpl) return;
    docLast = document.activeElement;
    docTitle.textContent = titles[k];
    docBody.innerHTML = tpl.innerHTML;
    docBody.scrollTop = 0;
    docModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('#docClose').focus();
  }
  function closeDoc() {
    if (!docModal.classList.contains('open')) return;
    docModal.classList.remove('open');
    if (!lb.classList.contains('open')) document.body.style.overflow = '';
    if (docLast) docLast.focus();
  }
  $$('[data-doc]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); openDoc(b.dataset.doc); }); });
  $('#docClose').addEventListener('click', closeDoc);
  docModal.addEventListener('click', function (e) { if (e.target === docModal) closeDoc(); });

  /* ---------- Cookie ---------- */
  var cookie = $('#cookie'), KEY = 'linkmebel-cookie';
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (err) {}
  if (!saved) setTimeout(function () { cookie.classList.add('show'); }, 1500);
  function setCookie(v) {
    try { localStorage.setItem(KEY, v); } catch (err) {}
    cookie.classList.remove('show');
  }
  $('#cookieOk').addEventListener('click', function () { setCookie('all'); });
  $('#cookieNo').addEventListener('click', function () { setCookie('necessary'); });

  /* ---------- Год в подвале ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
