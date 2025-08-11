function buildQuery(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : "";
}

async function readError(res) {
  const text = await res.text().catch(() => "");
  try {
    const json = text ? JSON.parse(text) : null;
    return (json && (json.message || json.error)) || text || res.statusText;
  } catch {
    return text || res.statusText;
  }
}

async function request(url, { method = "GET", body, headers } = {}) {
  const opts = { method, headers: headers || {} };
  if (body !== undefined) {
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
    opts.headers = { "Content-Type": "application/json", ...opts.headers };
  }

  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await readError(res));

  if (res.status === 204) return null;
  const contentLength = res.headers.get("content-length");
  if (contentLength === "0") return null;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

/* Resources */
export async function getResources() {
  return request("/api/resources");
}
export async function getResourceById(id) {
  return request(`/api/resources/${id}`);
}
export async function createResource(resource) {
  return request("/api/resources", { method: "POST", body: resource });
}
export async function updateResource(id, resource) {
  return request(`/api/resources/${id}`, { method: "PUT", body: resource });
}
export async function deleteResource(id) {
  await request(`/api/resources/${id}`, { method: "DELETE" });
  return null;
}
export async function archiveResource(id) {
  await request(`/api/resources/${id}/archive`, { method: "POST" });
  return null;
}
export async function unarchiveResource(id) {
  await request(`/api/resources/${id}/unarchive`, { method: "POST" });
  return null;
}
export async function getArchivedResources() {
  return request("/api/resources/archived");
}

/* Units */
export async function getUnits() {
  return request("/api/units");
}
export async function getUnitById(id) {
  return request(`/api/units/${id}`);
}
export async function createUnit(unit) {
  return request("/api/units", { method: "POST", body: unit });
}
export async function updateUnit(id, unit) {
  return request(`/api/units/${id}`, { method: "PUT", body: unit });
}
export async function deleteUnit(id) {
  await request(`/api/units/${id}`, { method: "DELETE" });
  return null;
}
export async function archiveUnit(id) {
  await request(`/api/units/${id}/archive`, { method: "POST" });
  return null;
}
export async function unarchiveUnit(id) {
  await request(`/api/units/${id}/unarchive`, { method: "POST" });
  return null;
}
export async function getAllUnits() {
  return getUnits();
}
export async function getArchivedUnits() {
  return request("/api/units/archived");
}

/* Receipts */
export async function getReceipts(params = {}) {
  return request(`/api/receipts${buildQuery(params)}`);
}
export async function getReceiptById(id) {
  return request(`/api/receipts/${id}`);
}
export async function createReceipt(receipt) {
  return request("/api/receipts", { method: "POST", body: receipt });
}
export async function updateReceipt(id, receipt) {
  return request(`/api/receipts/${id}`, { method: "PUT", body: receipt });
}
export async function deleteReceipt(id) {
  await request(`/api/receipts/${id}`, { method: "DELETE" });
  return null;
}

/* Clients */
export async function getClients(archived = false) {
  return request(`/api/clients${buildQuery({ archived })}`);
}
export async function getClientById(id) {
  return request(`/api/clients/${id}`);
}
export async function createClient(client) {
  return request("/api/clients", { method: "POST", body: client });
}
export async function updateClient(id, client) {
  return request(`/api/clients/${id}`, { method: "PUT", body: client });
}
export async function deleteClient(id) {
  await request(`/api/clients/${id}`, { method: "DELETE" });
  return null;
}
export async function archiveClient(id) {
  return request(`/api/clients/${id}/archive`, { method: "POST" });
}
export async function unarchiveClient(id) {
  return request(`/api/clients/${id}/unarchive`, { method: "POST" });
}

/* Shipments */
export async function getShipments(params = {}) {
  return request(`/api/shipments${buildQuery(params)}`);
}
export async function getShipmentById(id) {
  return request(`/api/shipments/${id}`);
}
export async function createShipment(payload) {
  return request("/api/shipments", { method: "POST", body: payload });
}
export async function updateShipment(id, payload) {
  await request(`/api/shipments/${id}`, { method: "PUT", body: payload });
  return null;
}
export async function deleteShipment(id) {
  await request(`/api/shipments/${id}`, { method: "DELETE" });
  return null;
}
export async function signShipment(id) {
  await request(`/api/shipments/${id}/sign`, { method: "POST" });
  return null;
}
export async function revokeShipment(id) {
  await request(`/api/shipments/${id}/revoke`, { method: "POST" });
  return null;
}

/* Stock / Balances */
export async function getAvailable(resourceId, unitId) {
  return request(`/api/stock/available${buildQuery({ resourceId, unitId })}`);
}
export async function getAvailability() {
  return request("/api/shipments/availability");
}
export async function getBalances({ resourceId, unitId } = {}) {
  return request(`/api/balances${buildQuery({ resourceId, unitId })}`);
}
