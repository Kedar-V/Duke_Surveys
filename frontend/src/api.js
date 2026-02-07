const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function readJson(r) {
  const text = await r.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response ${r.status}: ${text}`);
  }
}

export async function createSession() {
  const r = await fetch(`${API_BASE}/sessions`, { method: "POST" });
  if (!r.ok) throw new Error(`POST /sessions ${r.status}`);
  return readJson(r);
}

export async function getInstance(sessionId, instanceId) {
  const safe = encodeURIComponent(instanceId);
  const r = await fetch(`${API_BASE}/sessions/${sessionId}/instances/${safe}`);
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`GET instance ${r.status}: ${t}`);
  }
  return readJson(r);
}

export async function submitInstance(sessionId, instanceId, answers) {
  const safe = encodeURIComponent(instanceId);
  const r = await fetch(`${API_BASE}/sessions/${sessionId}/instances/${safe}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`POST instance answers ${r.status}: ${t}`);
  }
  return readJson(r);
}

export async function submitClientIntake(payload) {
  const r = await fetch(`${API_BASE}/client-intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`POST /client-intake ${r.status}: ${t}`);
  }
  return readJson(r);
}
