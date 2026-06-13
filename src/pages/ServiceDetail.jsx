import { useStore } from '../store'
import { TIPOS } from '../constants'
import { fmtDias, fmtPersonas, fdd } from '../utils'

export default function ServiceDetail() {
  const { ctx, sv, gp, gs, calcP, db } = useStore(s => s)
  const p = gp(ctx.presId)
  if (!p) return null

  // Package view
  if (ctx.pkgId) {
    const pkg   = (p.paquetes || []).find(x => x.id === ctx.pkgId)
    if (!pkg) return null
    const base  = pkg.items.reduce((a, it) => { const s = gs(p.id, it.servId); return a + (s ? calcP(s, it.cantidad).total : 0) }, 0)
    const final = Math.round(base * (1 - pkg.descuento / 100))
    return (
      <div className="scr">
        <button className="btn sm" onClick={() => sv('pres', { presId: p.id })} style={{ marginBottom: 10 }}><i className="ti ti-arrow-left" /> Volver</button>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ margin: 0 }}>{pkg.nombre}</h2>
            {pkg.descuento > 0 && <span className="bx pu">{pkg.descuento}% off</span>}
          </div>
          <p>{pkg.descripcion}</p>
          <hr className="sep" />
          {pkg.items.map(it => {
            const s = gs(p.id, it.servId)
            return s ? <div key={it.servId} className="row"><span>{it.cantidad}× {s.nombre}</span><span>${calcP(s, it.cantidad).total.toLocaleString('es-CL')}</span></div> : null
          })}
          <div className="price-box">
            {pkg.descuento > 0 && <>
              <div className="price-row"><span>Subtotal</span><span>${base.toLocaleString('es-CL')}</span></div>
              <div className="price-row"><span>Descuento {pkg.descuento}%</span><span>-${(base - final).toLocaleString('es-CL')}</span></div>
            </>}
            <div className="price-total"><span>Total</span><span>${final.toLocaleString('es-CL')}</span></div>
          </div>
        </div>
        <button className="btn p w" onClick={() => sv('servadd', { presId: p.id, pkgId: pkg.id, fecha: '' })}>
          Seleccionar fecha y reservar
        </button>
      </div>
    )
  }

  // Service view
  const s  = gs(ctx.presId, ctx.servId)
  if (!s) return null
  const pr = calcP(s)
  const guiaP = s.guia_prestadorId ? gp(s.guia_prestadorId) : null

  return (
    <div className="scr">
      <button className="btn sm" onClick={() => sv('pres', { presId: p.id })} style={{ marginBottom: 10 }}><i className="ti ti-arrow-left" /> Volver</button>

      {s.foto_url && <img src={s.foto_url} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 'var(--border-radius-lg)', marginBottom: 10 }} alt="" loading="lazy" />}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <h2 style={{ margin: '0 0 2px' }}>{s.nombre}</h2>
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{p.nombre}</span>
          </div>
          <span className="bx bl">{TIPOS[s.tipo]?.label || ''}</span>
        </div>
        <p style={{ marginBottom: 8 }}>{s.descripcion}</p>
        {s.desc_larga && <p style={{ marginBottom: 8 }}>{s.desc_larga}</p>}
        <div className="price-box">
          <div className="price-total">
            <span>Precio</span>
            <span>${pr.total.toLocaleString('es-CL')} /{s.unidad}</span>
          </div>
        </div>
      </div>

      {(s.capacidad || s.duracion || s.horario || s.ubicacion || s.anticipacion) && (
        <div className="card">
          <p className="st" style={{ marginTop: 0 }}>Detalles</p>
          {s.capacidad    && <div className="info-row"><i className="ti ti-users" /><span>{s.capacidad}</span></div>}
          {s.duracion     && <div className="info-row"><i className="ti ti-clock" /><span>{s.duracion}</span></div>}
          {s.horario      && <div className="info-row"><i className="ti ti-calendar" /><span>{s.horario}</span></div>}
          {s.ubicacion    && <div className="info-row"><i className="ti ti-map-pin" /><span>{s.ubicacion}</span></div>}
          {s.anticipacion && <div className="info-row"><i className="ti ti-clock-hour-4" /><span>Reservar con {s.anticipacion} de anticipación</span></div>}
        </div>
      )}

      {(s.incluye || s.no_incluye) && (
        <div className="card">
          {s.incluye && <>
            <p className="st" style={{ marginTop: 0 }}>Incluye</p>
            {s.incluye.split(',').map((x, i) => <div key={i} className="info-row"><i className="ti ti-check" style={{ color: '#3B6D11' }} /><span>{x.trim()}</span></div>)}
          </>}
          {s.no_incluye && <>
            <p className="st">No incluye</p>
            {s.no_incluye.split(',').map((x, i) => <div key={i} className="info-row"><i className="ti ti-x" style={{ color: '#A32D2D' }} /><span>{x.trim()}</span></div>)}
          </>}
        </div>
      )}

      {(s.requisitos || s.politica || s.notas) && (
        <div className="card">
          {s.requisitos && <><p className="st" style={{ marginTop: 0 }}>Requisitos</p><p>{s.requisitos}</p></>}
          {s.politica   && <><p className="st">Cancelación</p><p>{s.politica}</p></>}
          {s.notas      && <><p className="st">Notas</p><p>{s.notas}</p></>}
        </div>
      )}

      {guiaP && (
        <div className="alert alert-info" style={{ marginBottom: 8 }}>
          <i className="ti ti-user-check" /> Este servicio incluye guía: <b>{guiaP.nombre}</b> · {(guiaP.oficios || []).join(', ')}
        </div>
      )}

      {s.duracion_dias > 1 && (
        <div className="alert alert-warn" style={{ marginBottom: 8 }}>
          <i className="ti ti-calendar-event" /> Este servicio dura <b>{s.duracion_dias} días</b> — el calendario bloqueará esas fechas automáticamente.
        </div>
      )}

      <button className="btn p w" onClick={() => sv('servadd', { presId: p.id, servId: s.id, q: 1, noches: 1, per: 1, fecha: '' })}>
        Seleccionar fecha y reservar
      </button>
    </div>
  )
}
