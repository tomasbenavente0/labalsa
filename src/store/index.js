import { create } from 'zustand'
import { DFLT } from '../constants'
import { loadDB, saveDB } from '../services/supabase'
import { fdate, pd, isInRange, uid, addDays } from '../utils'

const HOY = (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()

export const useStore = create((set, get) => ({
  // ── Data state ────────────────────────────────────────────────────
  db: JSON.parse(JSON.stringify(DFLT)),
  dbLoaded: false,

  // ── UI state ──────────────────────────────────────────────────────
  view: 'browse',
  carrito: [],
  ctx: {},
  presId: null,
  adminOk: false,
  cal: new Date(HOY.getFullYear(), HOY.getMonth(), 1),
  pCal: new Date(HOY.getFullYear(), HOY.getMonth(), 1),
  panelTab: 'disponibilidad',
  sec: {},
  pinVisible: {},
  skipSetup: false,
  toastMsg: null,

  // ── DB helpers ────────────────────────────────────────────────────
  initDB: async () => {
    if (get().dbLoaded) return
    const loaded = await loadDB(DFLT)
    // sync prestadores with guia roles
    const db = { ...loaded }
    db.prestadores.forEach(p => {
      if ((p.oficios || []).some(o => ['Guía','Conductor','Arriero'].includes(o))) {
        const exists = (db.guias || []).find(g => g.id === p.id)
        if (!exists) {
          if (!db.guias) db.guias = []
          db.guias.push({ id: p.id, nombre: p.nombre, tel: p.tel || '', oficios: p.oficios || [], tarifa: 0, tarifa_tipo: 'dia', activo: true })
        }
      }
    })
    set({ db, dbLoaded: true })
  },

  saveDB: async () => {
    await saveDB(get().db)
  },

  setDB: (updater) => {
    set(state => ({ db: updater(state.db) }))
    get().saveDB()
  },

  // ── Navigation ────────────────────────────────────────────────────
  sv: (view, ctx = {}) => {
    set(state => ({
      view,
      ctx: Object.keys(ctx).length ? ctx : state.ctx,
    }))
  },

  setCtx: (patch) => set(state => ({ ctx: { ...state.ctx, ...patch } })),

  // ── Cart ──────────────────────────────────────────────────────────
  cTotal: () => get().carrito.reduce((a, i) => a + i.total, 0),
  cCount: () => get().carrito.length,

  rmCart: (i) => set(state => {
    const c = [...state.carrito]; c.splice(i, 1); return { carrito: c }
  }),

  clearCart: () => set({ carrito: [] }),

  // ── Toast ─────────────────────────────────────────────────────────
  showToast: (msg) => {
    set({ toastMsg: msg })
    setTimeout(() => set({ toastMsg: null }), 2000)
  },

  // ── Calendar navigation ───────────────────────────────────────────
  chgC:  (d) => set(s => ({ cal:  new Date(s.cal.getFullYear(),  s.cal.getMonth()  + d, 1) })),
  chgPC: (d) => set(s => ({ pCal: new Date(s.pCal.getFullYear(), s.pCal.getMonth() + d, 1) })),

  // ── Selectors ─────────────────────────────────────────────────────
  gp: (id) => get().db.prestadores.find(x => x.id === id),
  gs: (pId, sId) => {
    const p = get().db.prestadores.find(x => x.id === pId)
    return p && p.servicios.find(x => x.id === sId)
  },

  isAlta: (ds) => {
    if (!ds) return false
    const m = pd(ds).getMonth() + 1
    return (get().db.config.alta_meses || [12,1,2]).includes(m)
  },

  calcP: (s, q = 1, fecha = '', personas = 1) => {
    const { isAlta, db } = get()
    const precioUnit = fecha && isAlta(fecha) && s.precio_alta > 0 ? s.precio_alta : s.precio_base
    const base = s.precio_tipo === 'por_persona' ? (precioUnit * personas * q) : (precioUnit * q)
    const com = Math.round(base * db.config.comision / 100)
    const sinIva = base + com
    const iva = (s.iva || db.config.iva) ? Math.round(sinIva * 0.19) : 0
    return { base, com, sinIva, iva, total: sinIva + iva, esAlta: !!(fecha && isAlta(fecha) && s.precio_alta > 0) }
  },

  isBk: (pId, ds) => get().db.reservas.some(r => {
    if (r.presId !== pId || r.estado === 'cancelada') return false
    return isInRange(ds, r.fecha, r.noches || 1)
  }),

  dayStatus: (p, ds) => {
    const { isBk } = get()
    if (pd(ds) < HOY) return 'past'
    if (isBk(p.id, ds)) return 'booked'
    if (p.blocked.includes(ds)) return 'blocked'
    if (p.available.includes(ds)) return 'available'
    return 'unknown'
  },

  isRangeSelectable: (p, startDs, noches) => {
    const { isBk } = get()
    for (let i = 0; i < noches; i++) {
      const d = addDays(startDs, i)
      if (pd(d) < HOY || isBk(p.id, d) || p.blocked.includes(d)) return false
    }
    return true
  },

  calcGuiaCosto: (r) => {
    if (!r.items || !r.items.length) return 0
    let total = 0
    r.items.forEach(it => {
      const sv = it.servId ? get().gs(it.presId || r.presId, it.servId) : null
      if (sv && sv.guia_prestadorId) {
        const g = (get().db.guias || []).find(x => x.id === sv.guia_prestadorId)
        if (g) {
          const dias = it.noches || sv.duracion_dias || 1
          total += g.tarifa_tipo === 'dia' ? g.tarifa * dias : g.tarifa * 8 * dias
        }
      }
    })
    return total
  },

  calcConductorCosto: (r) => {
    if (!r.items || !r.items.length) return 0
    let total = 0
    r.items.forEach(it => {
      const sv = it.servId ? get().gs(it.presId || r.presId, it.servId) : null
      if (sv && sv.conductor_id) {
        const g = (get().db.guias || []).find(x => x.id === sv.conductor_id)
        if (g) {
          const dias = it.noches || sv.duracion_dias || 1
          total += g.tarifa_tipo === 'dia' ? g.tarifa * dias : g.tarifa * 8 * dias
        }
      }
    })
    return total
  },

  calcCostoFijo: (r) => {
    if (!r.items || !r.items.length) return 0
    return r.items.reduce((a, it) => {
      const sv = it.servId ? get().gs(it.presId || r.presId, it.servId) : null
      if (!sv) return a
      const dias = it.noches || sv.duracion_dias || 1
      const personas = it.per || 1
      if (Array.isArray(sv.costos_fijos)) {
        return a + sv.costos_fijos.reduce((b, cf) => {
          const base = cf.precio_unit * (cf.cantidad || 1)
          const t = cf.por_persona ? base * personas : base
          return b + (cf.por_dia ? t * dias : t)
        }, 0)
      }
      return a + (sv.costo_fijo || 0)
    }, 0)
  },

  // ── Multi-select calendar ─────────────────────────────────────────
  selD2: (ds) => set(state => {
    const msel = [...(state.ctx.msel || [])]
    const i = msel.indexOf(ds)
    if (i >= 0) msel.splice(i, 1); else msel.push(ds)
    return { ctx: { ...state.ctx, msel } }
  }),

  clearMsel: () => set(s => ({ ctx: { ...s.ctx, msel: [] } })),

  applyMsel: (ac) => {
    const { db, presId, ctx, showToast } = get()
    const p = db.prestadores.find(x => x.id === presId)
    if (!p) return
    const newDb = { ...db, prestadores: db.prestadores.map(pr => {
      if (pr.id !== presId) return pr
      const np = { ...pr, available: [...pr.available], blocked: [...pr.blocked] }
      ;(ctx.msel || []).forEach(ds => {
        if (ac === 'av') {
          const i = np.available.indexOf(ds)
          if (i >= 0) np.available.splice(i, 1)
          else { np.available.push(ds); const j = np.blocked.indexOf(ds); if (j >= 0) np.blocked.splice(j,1) }
        } else if (ac === 'bl') {
          const i = np.blocked.indexOf(ds)
          if (i >= 0) np.blocked.splice(i, 1)
          else { np.blocked.push(ds); const j = np.available.indexOf(ds); if (j >= 0) np.available.splice(j,1) }
        } else {
          const ia = np.available.indexOf(ds); if (ia >= 0) np.available.splice(ia,1)
          const ib = np.blocked.indexOf(ds);   if (ib >= 0) np.blocked.splice(ib,1)
        }
      })
      return np
    })}
    set({ db: newDb, ctx: { ...ctx, msel: [] } })
    get().saveDB()
    showToast('✓ Guardado')
  },

  // ── Add to cart ───────────────────────────────────────────────────
  addCartWithOpcs: () => {
    const { ctx, gs } = get()
    const s = gs(ctx.presId, ctx.servId)
    const opcs = (s?.servicios_opcionales || []).filter(o => o.activo && o.nombre)
    const opcsSelIds = ctx.opcsSelIds || {}
    const opcsSelArr = opcs.filter(o => opcsSelIds[o.nombre])
    get().addCart(opcsSelArr)
  },

  addCart: (opcsSelArr = []) => {
    const { db, ctx, carrito, calcP, gp, gs, isRangeSelectable, sv } = get()
    const p = gp(ctx.presId)
    const s = gs(ctx.presId, ctx.servId)
    const T = { noche:{rf:true,rp:false,rq:true}, tour:{rf:true,rp:true,rq:false}, produto:{rf:false,rp:false,rq:true}, servicio:{rf:false,rp:false,rq:false} }[s.tipo] || {}
    const noches = s.tipo === 'noche' ? (ctx.noches || 1) : (s.duracion_dias || 1)
    const per = ctx.per || 1, q = ctx.q || 1, fecha = ctx.fecha || ''
    const qty = s.tipo === 'noche' ? noches : T.rp ? per : T.rq ? q : 1
    const minP = s.min_personas || 1, maxP = s.max_personas || 999
    if (per < minP) { alert(`Este servicio requiere mínimo ${minP} persona${minP>1?'s':''}.`); return }
    if (per > maxP) { alert(`Este servicio permite máximo ${maxP} persona${maxP>1?'s':''}.`); return }
    const pr = calcP(s, qty, fecha, per)
    if (s.guia_prestadorId && fecha) {
      const guiaP = (db.guias || []).find(g => g.id === s.guia_prestadorId)
      if (guiaP) {
        const gPres = db.prestadores.find(p2 => p2.servicios && p2.servicios.some(sv2 => sv2.guia_prestadorId === guiaP.id))
        if (gPres && !isRangeSelectable(gPres, fecha, noches)) {
          alert(`El guía ${guiaP.nombre} no está disponible en esas fechas.`); return
        }
      }
    }
    const opcsTotal = opcsSelArr.reduce((a, o) => a + o.precio, 0)
    const newItem = {
      id: uid(), presId: p.id, presNombre: p.nombre, servId: s.id, nombre: s.nombre,
      tipo: s.tipo, q, noches, per, fecha, ...pr, total: pr.total + opcsTotal, opcionales: opcsSelArr,
    }
    const newCarrito = [...carrito, newItem]
    set({ carrito: newCarrito, ctx: { ...ctx, opcsSelArr: [], opcsSelIds: {} } })
    // related services
    if ((s.rel || []).length > 0) {
      const rs = s.rel.map(sid => gs(p.id, sid)).filter(Boolean)
      if (rs.length > 0 && confirm(`¿Agregar también: ${rs.map(x => x.nombre).join(', ')}?`)) {
        const extras = rs.map(rs2 => {
          const pr2 = calcP(rs2, 1, fecha)
          return { id: uid(), presId: p.id, presNombre: p.nombre, servId: rs2.id, nombre: rs2.nombre, tipo: rs2.tipo, q:1, noches:1, per:1, fecha, ...pr2 }
        })
        set(state => ({ carrito: [...state.carrito, ...extras] }))
      }
    }
    sv('cart')
  },

  addPkg: () => {
    const { ctx, gp, gs, calcP, carrito, sv, isAlta } = get()
    const p = gp(ctx.presId)
    const pkg = (p.paquetes || []).find(x => x.id === ctx.pkgId)
    const base = pkg.items.reduce((a, it) => {
      const s = gs(p.id, it.servId)
      return a + (s ? calcP(s, it.cantidad, ctx.fecha).total : 0)
    }, 0)
    const total = Math.round(base * (1 - pkg.descuento / 100))
    const newItem = {
      id: uid(), presId: p.id, presNombre: p.nombre, servId: pkg.id, nombre: pkg.nombre,
      tipo: 'pkg', q:1, noches:1, per:1, fecha: ctx.fecha,
      base: total, com:0, sinIva: total, iva:0, total, esAlta: isAlta(ctx.fecha),
    }
    set(state => ({ carrito: [...state.carrito, newItem] }))
    sv('cart')
  },

  // ── Provider panel actions ────────────────────────────────────────
  togServ: (pId, sId) => {
    get().setDB(db => ({
      ...db, prestadores: db.prestadores.map(p =>
        p.id !== pId ? p : { ...p, servicios: p.servicios.map(s => s.id !== sId ? s : { ...s, activo: !s.activo }) }
      )
    }))
  },

  togPres: (id) => {
    get().setDB(db => ({
      ...db, prestadores: db.prestadores.map(p => p.id !== id ? p : { ...p, activo: !p.activo })
    }))
  },

  mkP: (id) => {
    get().setDB(db => ({ ...db, reservas: db.reservas.map(r => r.id === id ? { ...r, pago: 'pagado' } : r) }))
  },

  mkC: (id) => {
    get().setDB(db => ({ ...db, reservas: db.reservas.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r) }))
  },

  respConsulta: (id, accion) => {
    get().setDB(db => {
      const c = (db.consultas || []).find(x => x.id === id)
      if (!c) return db
      const p = db.prestadores.find(x => x.id === c.presId)
      if (!p) return db
      return {
        ...db,
        consultas: db.consultas.map(x => x.id === id ? { ...x, estado: accion === 'aceptar' ? 'aceptada' : 'rechazada' } : x),
        prestadores: db.prestadores.map(pr => {
          if (pr.id !== c.presId) return pr
          if (accion === 'aceptar' && !pr.available.includes(c.fecha))
            return { ...pr, available: [...pr.available, c.fecha] }
          if (accion === 'rechazar' && !pr.blocked.includes(c.fecha))
            return { ...pr, blocked: [...pr.blocked, c.fecha] }
          return pr
        }),
      }
    })
  },

  aprobarSolicitud: (id) => {
    get().setDB(db => {
      const sol = (db.solicitudes || []).find(x => x.id === id)
      if (!sol) return db
      return {
        ...db,
        solicitudes: db.solicitudes.map(x => x.id === id ? { ...x, estado: 'aprobada' } : x),
        prestadores: db.prestadores.map(p => p.id !== sol.pId ? p : {
          ...p, servicios: p.servicios.map(s => s.id !== sol.sId ? s : {
            ...s, [sol.campo]: isNaN(sol.valorNuevo) ? sol.valorNuevo : +sol.valorNuevo
          })
        })
      }
    })
    get().showToast('✓ Cambio aplicado')
  },

  rechazarSolicitud: (id) => {
    get().setDB(db => ({ ...db, solicitudes: db.solicitudes.map(x => x.id === id ? { ...x, estado: 'rechazada' } : x) }))
  },

  aprobarGuia: (convId, guiaId) => {
    get().setDB(db => {
      const c = (db.convocatorias || []).find(x => x.id === convId)
      const r = c?.reservaId ? db.reservas.find(x => x.id === c.reservaId) : null
      return {
        ...db,
        convocatorias: db.convocatorias.map(x => x.id === convId ? { ...x, estado: 'cerrada', guiaAprobado: guiaId } : x),
        reservas: r ? db.reservas.map(x => x.id === r.id ? { ...x, guiaAsignado: guiaId } : x) : db.reservas,
      }
    })
    get().showToast('✓ Guía aprobado')
  },

  cerrarConv: (id) => {
    get().setDB(db => ({ ...db, convocatorias: db.convocatorias.map(x => x.id === id ? { ...x, estado: 'cerrada' } : x) }))
  },

  postularGuia: (convId, guiaId) => {
    get().setDB(db => ({
      ...db, convocatorias: db.convocatorias.map(x => {
        if (x.id !== convId) return x
        const posts = x.postulaciones || []
        if (posts.includes(guiaId)) return x
        return { ...x, postulaciones: [...posts, guiaId] }
      })
    }))
  },

  solicitarCambio: (pId, sId, campo, valorActual) => {
    const nuevo = prompt(`Nuevo valor para ${campo} (actual: ${valorActual})`)
    if (!nuevo) return
    get().setDB(db => ({
      ...db, solicitudes: [...(db.solicitudes || []), {
        id: 'sol' + uid(), pId, sId, campo, valorActual, valorNuevo: nuevo,
        estado: 'pendiente', createdAt: new Date().toISOString()
      }]
    }))
    get().showToast('✓ Solicitud enviada al admin')
  },

  saveConfig: (comision, iva, altaMeses) => {
    get().setDB(db => ({ ...db, config: { ...db.config, comision, iva, alta_meses: altaMeses } }))
  },

  changePin: (id, v) => {
    if (!v || v.length < 4) return false
    if (id === 'admin') {
      get().setDB(db => ({ ...db, config: { ...db.config, adminPin: v } }))
    } else {
      get().setDB(db => ({
        ...db, prestadores: db.prestadores.map(p => p.id === id ? { ...p, pin: v } : p)
      }))
    }
    return true
  },

  savePres: (nombre, descripcion, fotoUrl, pin, oficiosSel, colIdx) => {
    const CCOLORS_LOCAL = [['#E6F1FB','#0C447C'],['#EAF3DE','#3B6D11'],['#FAEEDA','#633806'],['#EEEDFE','#3C3489'],['#FAECE7','#993C1D']]
    const c = CCOLORS_LOCAL[colIdx || 0]
    get().setDB(db => ({
      ...db, prestadores: [...db.prestadores, {
        id: 'p' + uid(), nombre, descripcion: descripcion || '', foto_url: fotoUrl || '', pin,
        color: c[0], textColor: c[1], activo: true, certificado: false, lnt: false,
        oficios: oficiosSel, servicios: [], paquetes: [], mode: 'mark', available: [], blocked: [],
      }]
    }))
  },

  saveEditPres: (id, descripcion, fotoUrl, oficiosSel) => {
    get().setDB(db => ({
      ...db, prestadores: db.prestadores.map(p => p.id !== id ? p : { ...p, descripcion, foto_url: fotoUrl, oficios: oficiosSel })
    }))
    get().showToast('✓ Guardado')
  },

  exportData: () => {
    const data = JSON.stringify(get().db, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'labalsa_backup.json'; a.click()
    URL.revokeObjectURL(url)
  },

  importData: (file) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const p = JSON.parse(e.target.result)
        const newDb = { ...DFLT, ...p, reservas: p.reservas||[], consultas: p.consultas||[], guias: p.guias||[], convocatorias: p.convocatorias||[], solicitudes: p.solicitudes||[] }
        set({ db: newDb })
        get().saveDB()
        alert('Importado correctamente')
      } catch { alert('Error al importar') }
    }
    reader.readAsText(file)
  },

  toggleEtSeg: (pId, campo, etId) => {
    get().setDB(db => ({
      ...db, prestadores: db.prestadores.map(p => {
        if (p.id !== pId) return p
        const seg = { ...(p.seguimiento || {}) }
        const arr = [...(seg[campo] || [])]
        const i = arr.indexOf(etId)
        if (i >= 0) arr.splice(i,1); else arr.push(etId)
        return { ...p, seguimiento: { ...seg, [campo]: arr } }
      })
    }))
  },

  saveSeguimientoTexto: (pId, campo, val) => {
    get().setDB(db => ({
      ...db, prestadores: db.prestadores.map(p => {
        if (p.id !== pId) return p
        return { ...p, seguimiento: { ...(p.seguimiento||{}), [campo+'_txt']: val } }
      })
    }))
    get().showToast('✓ Guardado')
  },
}))
