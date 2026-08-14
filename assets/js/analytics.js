(() => {
  const cfg = window.CONECTA_CONFIG?.analytics || {};
  if (cfg.enabled === false) return;
  const VISITOR_KEY = 'ibc360_visitor_v1';
  const LOCAL_KEY = 'ibc360_analytics_local_v1';
  const SESSION_KEY = 'ibc360_session_v1';
  const randomId = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
  const getPersistent = (storage, key, prefix) => {
    let value = storage.getItem(key);
    if (!value) { value = randomId(prefix); storage.setItem(key, value); }
    return value;
  };
  const visitorId = getPersistent(localStorage, VISITOR_KEY, 'v');
  const sessionId = getPersistent(sessionStorage, SESSION_KEY, 's');
  const clean = value => String(value ?? '').slice(0, 180);
  const pageType = document.body?.dataset?.courseId ? 'course' : (document.body?.dataset?.pageType || (location.pathname.endsWith('/') || /index\.html$/.test(location.pathname) ? 'home' : 'page'));

  function saveLocal(payload) {
    try {
      const store = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{"events":[],"counts":{}}');
      store.events = Array.isArray(store.events) ? store.events : [];
      store.counts = store.counts && typeof store.counts === 'object' ? store.counts : {};
      store.events.push(payload);
      if (store.events.length > 500) store.events = store.events.slice(-500);
      store.counts[payload.event] = (store.counts[payload.event] || 0) + 1;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
    } catch (_) {}
  }

  async function send(payload) {
    saveLocal(payload);
    if (cfg.mode !== 'apps_script' || !cfg.endpointUrl) return;
    try {
      await fetch(cfg.endpointUrl, {
        method: 'POST', mode: 'no-cors', keepalive: true,
        headers: {'Content-Type': 'text/plain;charset=utf-8'},
        body: JSON.stringify(payload)
      });
    } catch (_) {}
  }

  function track(event, data={}) {
    const courseId = document.body?.dataset?.courseId || '';
    const payload = {
      ts: new Date().toISOString(),
      event: clean(event),
      page: clean(location.pathname.split('/').pop() || 'index.html'),
      page_type: pageType,
      visitor_id: visitorId,
      session_id: sessionId,
      course_id: clean(data.course_id || courseId),
      course_name: clean(data.course_name || ''),
      turno: clean(data.turno || ''),
      meta: data.meta && typeof data.meta === 'object' ? data.meta : {}
    };
    send(payload);
  }

  window.IBC360_ANALYTICS = { track, visitorId, sessionId };

  document.addEventListener('DOMContentLoaded', () => {
    track('page_view');
  });
  document.addEventListener('click', event => {
    const portal = event.target.closest('[data-portal-link], #inscription');
    if (portal) track('portal_click');
    const whats = event.target.closest('[data-whatsapp-group]');
    if (whats) track('whatsapp_click');
  });
})();
