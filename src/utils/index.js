import { MES } from '../constants'

const HOY = (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()

export const getToday = () => HOY

export const fdate = d => d.toISOString().slice(0, 10)
export const todayStr = () => fdate(HOY)

export const pd = s => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (s, n) => {
  const d = pd(s)
  d.setDate(d.getDate() + n)
  return fdate(d)
}

export const fdd = s => {
  const d = pd(s)
  return `${d.getDate()} de ${MES[d.getMonth()]} ${d.getFullYear()}`
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5)

export const maskPin = pin => '•'.repeat(pin.length)

export const validateTel = t => /^(\+?56\s?9[\s\-]?\d{4}[\s\-]?\d{4}|\d{9,11})$/.test(t.replace(/\s/g,''))

export const isInRange = (ds, startDs, noches) => {
  const d = pd(ds), s = pd(startDs)
  const end = new Date(s)
  end.setDate(end.getDate() + (noches - 1))
  return d >= s && d <= end
}

export function vanTir(flujoAnual, inversion, tasaDesc, anos) {
  tasaDesc = tasaDesc / 100
  let van = -inversion
  for (let i = 1; i <= anos; i++) van += flujoAnual / Math.pow(1 + tasaDesc, i)
  let tir = 0
  for (let r = 0; r <= 200; r++) {
    let vpn = -inversion
    for (let i = 1; i <= anos; i++) vpn += flujoAnual / Math.pow(1 + r/100, i)
    if (vpn <= 0) { tir = r; break }
  }
  return { van: Math.round(van), tir }
}

export const fmtPersonas = s => {
  const mn = s.min_personas || 1, mx = s.max_personas || 1
  return mn === mx ? mn + ' persona' + (mn > 1 ? 's' : '') : mn + '–' + mx + ' personas'
}

export const fmtDias = s => {
  const mn = s.min_dias || s.duracion_dias || 1, mx = s.max_dias || s.duracion_dias || 1
  return mn === mx ? mn + ' día' + (mn > 1 ? 's' : '') : mn + '–' + mx + ' días'
}
