(() => {
  const KEY = "ibc360_favoritos_v1";

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(value) ? [...new Set(value.map(String))] : [];
    } catch (_) {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(KEY, JSON.stringify([...new Set(items.map(String))]));
    window.dispatchEvent(new CustomEvent("ibc360:favoritos", { detail: { ids: read() } }));
  }

  const api = {
    all: read,
    has(id) {
      return read().includes(String(id));
    },
    count() {
      return read().length;
    },
    toggle(id) {
      const target = String(id);
      const current = read();
      const saved = current.includes(target);
      write(saved ? current.filter(item => item !== target) : [...current, target]);
      return !saved;
    },
    clear() {
      write([]);
    }
  };

  window.IBC360_FAVORITOS = api;
})();
