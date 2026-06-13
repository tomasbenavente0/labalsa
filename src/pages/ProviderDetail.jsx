import { useStore } from '../store'
import { TIPOS } from '../constants'
import { fmtDias, fmtPersonas } from '../utils'

export default function ProviderDetail() {
  const { db, ctx, sv, gp, gs, calcP } = useStore(s => s)
  const p = gp(ctx.presId)
  if (!p) return null

  const pkgs = (p.paquetes || []).filter(x => x.activo)

  return (
    <div className="scr">
      <button className="btn sm" onClick={() => sv('browse')} style={{ marginBottom: 10 }}>
        <i className="ti ti-arrow-left" /> Volver
      </button>

      {p.foto_url
        ? <img src={p.foto_url} style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 'var(--border-radius-lg)', marginBottom: 10 }} alt="" loading="lazy" />
        : <div style={{ width: '100%', height: 80, borderRadius: 'var(--border-radius-lg)', background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, border: '0.5px dashed var(--color-border-secondary)', color: 'var(--color-text-tertiary)', fontSize: 12, gap: 6 }}>
            <i className="ti ti-photo" /> Sin foto
          </div>
      }

      <div className="card">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="av-c" style={{ background: p.color, color: p.textColor, width: 48, height: 48, fontSize: 18 }}>{p.nombre[0]}</div>
          <div>
            <h2 style={{ margin: '0 0 4px' }}>{p.nombre}</h2>
            <p>{p.descripcion}</p>
          </div>
        </div>
      </div>

      {pkgs.length > 0 && (
        <>
          <p className="st">Paquetes</p>
          {pkgs.map(pkg => {
            const base  = pkg.items.reduce((a, it) => { const s = gs(p.id, it.servId); return a + (s ? calcP(s, it.cantidad).total : 0) }, 0)
            const final = Math.round(base * (1 - pkg.descuento / 100))
            return (
              <div key={pkg.id} className="card" style={{ cursor: 'pointer' }} onClick={() => sv('serv', { presId: p.id, pkgId: pkg.id })}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h3 style={{ margin: 0 }}>{pkg.nombre}</h3>
                  {pkg.descuento > 0 && <span className="bx pu">{pkg.descuento}% off</span>}
                </div>
                <p style={{ marginBottom: 6 }}>{pkg.descripcion}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>{pkg.items.map(it => <span key={it.servId} className="chip">{it.cantidad}× {gs(p.id, it.servId)?.nombre || '?'}</span>)}</div>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>${final.toLocaleString('es-CL')}</span>
                </div>
              </div>
            )
          })}
        </>
      )}

      <p className="st">Servicios</p>
      {p.servicios.filter(s => s.activo).map(s => {
        const pr = calcP(s)
        return (
          <div key={s.id} className="card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden', marginBottom: 10 }}
            onClick={() => sv('serv', { presId: p.id, servId: s.id })}>
            {s.foto_url && <img src={s.foto_url} style={{ width: '100%', height: 110, objectFit: 'cover' }} alt={s.nombre} loading="lazy" />}
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <h3 style={{ margin: 0, flex: 1 }}>{s.nombre}</h3>
                <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 8 }}>${pr.total.toLocaleString('es-CL')}</span>
              </div>
              <div className="card-meta">
                <span><i className="ti ti-clock" /> {fmtDias(s)}{s.duracion ? ' · ' + s.duracion : ''}</span>
                <span><i className="ti ti-users" /> {fmtPersonas(s)}</span>
                {s.ubicacion && <span><i className="ti ti-map-pin" /> {s.ubicacion}</span>}
              </div>
              <p style={{ marginBottom: 8 }}>{s.descripcion}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="bx bl"><i className={`ti ${TIPOS[s.tipo]?.icon || 'ti-tag'}`} /> {TIPOS[s.tipo]?.label || s.tipo}</span>
                <div style={{ display: 'flex', gap: 5 }}>
                  {s.certificado && <span className="badge-cert"><i className="ti ti-certificate" /> Certificado</span>}
                  {s.lnt         && <span className="badge-lnt"><i className="ti ti-leaf" /> LNT</span>}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
