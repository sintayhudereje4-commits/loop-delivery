/* Loop Delivery - Telegram Mini App bridge */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return;

    document.documentElement.classList.add('tg-mini-app');
    document.body.classList.add('tg-mini-app');

    try {
      tg.ready();
      tg.expand();
      if (typeof tg.disableVerticalSwipes === 'function') {
        try { tg.disableVerticalSwipes(); } catch (e) {}
      }
    } catch (e) {}

    // Theme colors from Telegram
    try {
      var tp = tg.themeParams || {};
      if (tp.bg_color) {
        document.documentElement.style.setProperty('--tg-bg', tp.bg_color);
      }
      if (tp.button_color) {
        document.documentElement.style.setProperty('--tg-button', tp.button_color);
      }
      if (tg.setHeaderColor) tg.setHeaderColor('secondary_bg_color');
      if (tg.setBackgroundColor && tp.bg_color) tg.setBackgroundColor(tp.bg_color);
    } catch (e) {}

    // Main button optional (not forced)
    try {
      if (tg.MainButton) {
        tg.MainButton.hide();
      }
    } catch (e) {}

    // Handshake with server
    var initData = tg.initData || '';
    if (!initData) return;

    var csrf = (document.querySelector('meta[name="csrf-token"]') || {}).content || '';
    fetch('/api/telegram/webapp-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf
      },
      credentials: 'same-origin',
      body: JSON.stringify({ initData: initData })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (!data || !data.success) return;
        window.__loopTg = data;
        document.dispatchEvent(new CustomEvent('loop:telegram-ready', { detail: data }));
        // Soft banner
        var bar = document.getElementById('tgMiniBanner');
        if (bar) {
          bar.hidden = false;
          var name = data.first_name || data.telegram_username || '';
          var msgAm = name
            ? ('Telegram · ሰላም ' + name + (data.logged_in ? ' — ገብተዋል' : ' — ይግቡ ወይም ይመዝገቡ'))
            : 'Telegram Mini App';
          var msgEn = name
            ? ('Telegram · Hi ' + name + (data.logged_in ? ' — signed in' : ' — please log in or register'))
            : 'Telegram Mini App';
          var lang = (document.documentElement.lang || 'am').toLowerCase();
          bar.textContent = lang.indexOf('am') === 0 ? msgAm : msgEn;
        }
      })
      .catch(function () {});
  });
})();
