// ── i18n engine ──
(function() {
  var SUPPORTED = ['en', 'fr', 'es'];
  var DEFAULT = 'en';

  function detectLang() {
    var params = new URLSearchParams(window.location.search);
    var paramLang = params.get('lang');
    if (paramLang && SUPPORTED.indexOf(paramLang) !== -1) {
      localStorage.setItem('slotwise-lang', paramLang);
      params.delete('lang');
      var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      history.replaceState(null, '', clean);
      return paramLang;
    }
    var stored = localStorage.getItem('slotwise-lang');
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    var browserLang = (navigator.language || 'en').split('-')[0];
    if (SUPPORTED.indexOf(browserLang) !== -1) return browserLang;
    return DEFAULT;
  }

  function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (translations[key] !== undefined) el.innerHTML = translations[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (translations[key] !== undefined) el.placeholder = translations[key];
    });
    document.querySelectorAll('[data-i18n-content]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-content');
      if (translations[key] !== undefined) el.setAttribute('content', translations[key]);
    });
    document.documentElement.lang = window.slotwiseLang;
    var titleKey = document.documentElement.getAttribute('data-i18n-title');
    if (titleKey && translations[titleKey]) document.title = translations[titleKey];
  }

  var lang = detectLang();
  window.slotwiseLang = lang;

  // Rewrite legal page links for non-English
  if (lang !== DEFAULT) {
    document.querySelectorAll('a[href="/privacy.html"]').forEach(function(a) {
      a.href = '/' + lang + '/privacy.html';
    });
    document.querySelectorAll('a[href="/terms.html"]').forEach(function(a) {
      a.href = '/' + lang + '/terms.html';
    });
  }

  // Update language picker display
  var pickerBtn = document.querySelector('.lang-current');
  if (pickerBtn) pickerBtn.textContent = lang.toUpperCase() + ' ▾';

  // Highlight active language in dropdown
  document.querySelectorAll('.lang-option').forEach(function(opt) {
    if (opt.getAttribute('data-lang') === lang) opt.style.fontWeight = '700';
  });

  // Load translations (skip fetch for English — it's the HTML default)
  if (lang !== DEFAULT) {
    fetch('/lang/' + lang + '.json')
      .then(function(r) { return r.json(); })
      .then(applyTranslations)
      .catch(function() { /* Silently fall back to English */ });
  }
})();

// ── Language picker toggle ──
(function() {
  var picker = document.getElementById('langPicker');
  if (!picker) return;
  var btn = picker.querySelector('.lang-current');
  var dropdown = picker.querySelector('.lang-dropdown');
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', function() { dropdown.classList.remove('open'); });
  dropdown.querySelectorAll('.lang-option').forEach(function(opt) {
    opt.addEventListener('click', function(e) {
      e.preventDefault();
      var lang = opt.getAttribute('data-lang');
      localStorage.setItem('slotwise-lang', lang);
      window.location.reload();
    });
  });
})();

// ── Mobile nav toggle ──
(function() {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  var overlay = document.getElementById('navOverlay');
  if (!toggle || !links || !overlay) return;
  function close() { toggle.classList.remove('open'); links.classList.remove('open'); overlay.classList.remove('open'); }
  toggle.addEventListener('click', function() {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', close);
  links.querySelectorAll('a').forEach(function(a) { a.addEventListener('click', close); });
})();

// ── Config ──
var SLOTWISE_WA_NUMBER = '34684482597';
var SLOTWISE_TG_USERNAME = 'slotwise_bot';

// ── Acquisition ref tracking ──
(function() {
  var params = new URLSearchParams(window.location.search);
  var ref = (params.get('ref') || '').toLowerCase().trim();
  if (ref && /^[a-z0-9_-]{1,32}$/.test(ref)) {
    sessionStorage.setItem('slotwise-ref', ref);
  }
})();

function getRef() {
  var ref = sessionStorage.getItem('slotwise-ref');
  return (ref && /^[a-z0-9_-]{1,32}$/.test(ref)) ? ref : null;
}

// ── WhatsApp click-to-chat ──
function getWhatsAppLink() {
  var lang = window.slotwiseLang || (navigator.language || 'en').split('-')[0];
  var messages = {
    es: '¡Hola! Quiero probar Slotwise 👋',
    ca: 'Hola! Vull provar el Slotwise 👋',
    fr: 'Bonjour! Je veux essayer Slotwise 👋',
    de: 'Hallo! Ich möchte Slotwise ausprobieren 👋',
    pt: 'Olá! Quero experimentar o Slotwise 👋',
    it: 'Ciao! Voglio provare Slotwise 👋',
    en: 'Hi! I want to try Slotwise 👋'
  };
  var msg = messages[lang] || messages['en'];
  var ref = getRef();
  if (ref) msg += ' ref:' + ref;
  return 'https://wa.me/' + SLOTWISE_WA_NUMBER + '?text=' + encodeURIComponent(msg);
}

// ── Telegram deep link ──
function getTelegramLink() {
  var ref = getRef();
  var url = 'https://t.me/' + SLOTWISE_TG_USERNAME;
  if (ref) url += '?start=' + ref;
  return url;
}
