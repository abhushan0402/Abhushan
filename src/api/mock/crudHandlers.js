function matchesSearch(row, term, fields) {
  const needle = term.toLowerCase();
  return fields.some((field) => String(row[field] ?? "").toLowerCase().includes(needle));
}

export class MockApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function createCrudHandlers(getAll, saveAll, searchFields = []) {
  function list(params = {}) {
    const { page = 1, pageSize = 10, search, sortBy, sortDir = "asc", ...filters } = params;
    let rows = getAll();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === "all") return;
      rows = rows.filter((row) => String(row[key]) === String(value));
    });

    if (search && searchFields.length) {
      rows = rows.filter((row) => matchesSearch(row, String(search), searchFields));
    }

    if (sortBy) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (typeof av === "number" && typeof bv === "number") {
          return sortDir === "asc" ? av - bv : bv - av;
        }
        return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const data = rows.slice(start, start + pageSize);
    return { data, total, page, pageSize };
  }

  function get(id) {
    const row = getAll().find((r) => r.id === id);
    if (!row) throw new MockApiError(404, `Resource ${id} not found`);
    return row;
  }

  function create(payload, idPrefix = "id") {
    const rows = getAll();
    const id = payload.id ?? `${idPrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const row = { ...payload, id };
    saveAll([row, ...rows]);
    return row;
  }

  function update(id, payload) {
    const rows = getAll();
    const index = rows.findIndex((r) => r.id === id);
    if (index === -1) throw new MockApiError(404, `Resource ${id} not found`);
    const updated = { ...rows[index], ...payload, id };
    const next = [...rows];
    next[index] = updated;
    saveAll(next);
    return updated;
  }

  function remove(id) {
    const rows = getAll();
    if (!rows.some((r) => r.id === id)) throw new MockApiError(404, `Resource ${id} not found`);
    saveAll(rows.filter((r) => r.id !== id));
  }

  return { list, get, create, update, remove };
}
