const SUPA_URL = 'https://kncnmqkpsajozkzzedls.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuY25tcWtwc2Fqb3prenplZGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyODEyOTQsImV4cCI6MjA5NTg1NzI5NH0.IbIwRGrxm8ZRWd6dj7YOqt9k3wx7dAsFGtK4SmJ4wKo'
const SUPA_TABLE = 'Project11'
const KEY = 'labalsa_prod'

const headers = {
  'apikey': SUPA_KEY,
  'Authorization': 'Bearer ' + SUPA_KEY,
  'Content-Type': 'application/json',
}

async function supaGet() {
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/${SUPA_TABLE}?id=eq.1`, { headers })
    const d = await r.json()
    return d && d[0] ? d[0].data : null
  } catch {
    return null
  }
}

async function supaSet(value) {
  try {
    const upd = await fetch(`${SUPA_URL}/rest/v1/${SUPA_TABLE}?id=eq.1`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({ data: value }),
    })
    const d = await upd.json()
    if (!d || !d.length) {
      await fetch(`${SUPA_URL}/rest/v1/${SUPA_TABLE}`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ id: 1, data: value }),
      })
    }
    return true
  } catch {
    return false
  }
}

export const storage = {
  get: async (k) => {
    const d = await supaGet()
    return d && d[k] !== undefined ? { key: k, value: typeof d[k] === 'string' ? d[k] : JSON.stringify(d[k]) } : null
  },
  set: async (k, v) => {
    const d = (await supaGet()) || {}
    d[k] = v
    await supaSet(d)
    return { key: k, value: v }
  },
  delete: async (k) => {
    const d = (await supaGet()) || {}
    delete d[k]
    await supaSet(d)
    return { key: k, deleted: true }
  },
  list: async (p) => {
    const d = (await supaGet()) || {}
    const keys = Object.keys(d).filter(k => !p || k.startsWith(p))
    return { keys }
  },
}

export async function loadDB(DFLT) {
  try {
    const r = await storage.get(KEY)
    if (r && r.value) {
      const p = JSON.parse(r.value)
      return {
        ...DFLT, ...p,
        reservas: p.reservas || [],
        consultas: p.consultas || [],
        guias: p.guias || [],
        convocatorias: p.convocatorias || [],
        solicitudes: p.solicitudes || [],
      }
    }
    await saveDB(DFLT)
    return DFLT
  } catch {
    await saveDB(DFLT)
    return DFLT
  }
}

export async function saveDB(db) {
  try {
    await storage.set(KEY, JSON.stringify(db))
  } catch {}
}
