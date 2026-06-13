import { useStore } from '../store'
import { TIPOS } from '../constants'
import { fdd, addDays } from '../utils'
import Calendar from '../components/Calendar'

export default function ServiceAdd() {
  const store = useStore(s => s)
  const { ctx, sv, setCtx, gp, gs, calcP, addCartWithOpcs } = store
  const p = gp(ctx.presId)
  const s = gs(ctx.presId, ctx.servId)
  if (!p || !s) return null

  const T = TIPOS[s.tipo] || {}
  const noches = ctx.noches || 1
  const per    = ctx.per    || 1
  const q      = ctx.q      || 1
  const sel    = ctx.fecha  || ''
  const qty = s.tipo === 'noche' ? noches : T.rp ? per : T.rq ? q : 1
  const pr  = calcP(s, qty, sel, per)

  const opcs       = (s.servicios_opcionales || []).filter(o => o.activo && o.nombre)
  const opcsSelIds = ctx.opcsSelIds || {}
  const opcsTotal  = opcs.filter(o => opcsSelIds[o.nombre]).reduce((a, o) => a + o.precio, 0)

  const horarios    = s.horarios || []
  const horarioSel  = ctx.horarioSel || ''

  const minD = s.min_dias || s.duracion_dias || 1
  const maxD = s.max_dias || s.duracion_dias || 1
  const showPer = T.rp || s.precio_tipo === 'por_persona' || s.min_personas > 1

  const canAdd = !T.rf || !!sel

  return (
    <div className="scr">
      <button className="btn sm" onClick={() => sv('serv', { presId: p.id, servId: s.id })} style={{ marginBottom: 10 }}>
        <i className="ti ti-arrow-left" /> Volver
      </button>

      <div className="card">
        <h3 style={{ marginBottom: 4 }}>{s.nombre}</h3>
        <p style={{ marginBottom: 10 }}>{s.descripcion}</p>

        {/* Date picker */}
        {T.rf && (
          <>
            <span className="lbl">Fecha{s.tipo === 'noche' ? ' de entrada' : ''}</span>
            <Calendar presId={p.id} selFecha={sel} noches={noches} mode="serv"
              onDayClick={ds => setCtx({ fecha: ds })} />
          </>
        )}

        {/* Nights / days */}
        {(s.tipo === 'noche' || maxD > 1) && (
          <div style={{ marginTop: 10 }}>
            <span className="lbl">{minD === maxD ? `Duración: ${minD} ${s.tipo === 'noche' ? 'noches' : 'días'}` : `Número de ${s.tipo === 'noche' ? 'noches' : 'días'}`}</span>
            {(minD !== maxD || s.tipo === 'noche') && (
              <div className="qc">
                <button className="qb" onClick={() => setCtx({ noches: Math.max(1, noches - 1) })}>−</button>
                <span className="qn">{noches}</span>
                <button className="qb" onClick={() => setCtx({ noches: noches + 1 })}>+</button>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{s.tipo === 'noche' ? 'noches' : 'días'}</span>
              </div>
            )}
            {noches > 1 && sel && (
              <div className="alert alert-info" style={{ marginTop: 6 }}>
                <i className="ti ti-calendar-event" /> <b>{fdd(sel)}</b> al <b>{fdd(addDays(sel, noches - 1))}</b>
              </div>
            )}
          </div>
        )}

        {/* People */}
        {showPer && (
          <div style={{ marginTop: 6 }}>
            <span className="lbl">Personas {s.min_personas > 1 ? `(mín. ${s.min_personas})` : ''} {s.max_personas ? `(máx. ${s.max_personas})` : ''}</span>
            <div className="qc">
              <button className="qb" onClick={() => setCtx({ per: Math.max(1, per - 1) })}>−</button>
              <span className="qn">{per}</span>
              <button className="qb" onClick={() => setCtx({ per: per + 1 })}>+</button>
            </div>
            {per < (s.min_personas || 1) && <div style={{ color: '#e74c3c', fontSize: 11 }}>Mínimo {s.min_personas} personas</div>}
            {per > (s.max_personas || 999) && <div style={{ color: '#e74c3c', fontSize: 11 }}>Máximo {s.max_personas} personas</div>}
          </div>
        )}

        {/* Quantity */}
        {T.rq && s.tipo !== 'noche' && (
          <>
            <span className="lbl">Cantidad</span>
            <div className="qc">
              <button className="qb" onClick={() => setCtx({ q: Math.max(1, q - 1) })}>−</button>
              <span className="qn">{q}</span>
              <button className="qb" onClick={() => setCtx({ q: q + 1 })}>+</button>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{s.unidad}</span>
            </div>
          </>
        )}

        {/* Horarios */}
        {horarios.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <span className="lbl">Elige horario de inicio</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {horarios.map(h => (
                <button key={h} onClick={() => setCtx({ horarioSel: h })} style={{
                  padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  border: `1.5px solid ${horarioSel === h ? '#1B4332' : 'var(--color-border-secondary)'}`,
                  background: horarioSel === h ? '#1B4332' : 'transparent',
                  color: horarioSel === h ? '#fff' : 'var(--color-text-primary)',
                }}>{h} hrs</button>
              ))}
            </div>
          </div>
        )}

        {/* Opcionales */}
        {opcs.length > 0 && (
          <>
            <p className="st">Servicios opcionales</p>
            {opcs.map(o => (
              <label key={o.nombre} className="ckb" style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={!!opcsSelIds[o.nombre]}
                    onChange={e => setCtx({ opcsSelIds: { ...opcsSelIds, [o.nombre]: e.target.checked } })} />
                  <span>{o.nombre}</span>
                </div>
                <span style={{ fontWeight: 500 }}>+ ${o.precio.toLocaleString('es-CL')}</span>
              </label>
            ))}
          </>
        )}

        <hr className="sep" />
        <div className="price-box">
          <div className="price-total">
            <span>Total</span>
            <span>${(pr.total + opcsTotal).toLocaleString('es-CL')}</span>
          </div>
          {opcsTotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>
              <span>Opcionales incluidos</span><span>+ ${opcsTotal.toLocaleString('es-CL')}</span>
            </div>
          )}
        </div>
        <button className="btn p w" disabled={!canAdd} onClick={addCartWithOpcs}>
          Agregar al carrito <i className="ti ti-shopping-cart-plus" />
        </button>
      </div>
    </div>
  )
}
