import { useStore } from '../../store'
import { fdd } from '../../utils'
import Availability from './Availability'
import Services from './Services'
import Finances from './Finances'

export default function Panel() {
  const { db, presId, panelTab, ctx, gp, respConsulta } = useStore(s => s)
  const setPanelTab = (t) => useStore.setState({ panelTab: t, ctx: {} })
  const p = gp(presId)
  if (!p) return null

  const mis       = db.reservas.filter(r => r.presId === p.id && r.estado !== 'cancelada')
  const consultas = (db.consultas || []).filter(c => c.presId === p.id && c.estado === 'pendiente')

  const tabs = ['disponibilidad', 'servicios', 'reservas', 'consultas', 'finanzas']

  return (
    <div className="scr">
      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="g3" style={{ flex: 1, marginRight: 8 }}>
          <div className="stat"><div className="sl">Reservas</div><div className="sv">{mis.length}</div></div>
          <div className="stat"><div className="sl">Ingresos est.</div><div className="sv">${Math.round(mis.reduce((a,r)=>a+r.monto,0)/1000)}K</div></div>
          <div className="stat"><div className="sl">Consultas</div><div className="sv">{consultas.length}</div></div>
        </div>
        <button className="btn sm" onClick={() => useStore.setState({ presId: null })}>Salir</button>
      </div>

      {/* Tab bar */}
      <div className="tog">
        {tabs.map(t => (
          <button key={t} className={panelTab === t ? 'on' : ''} onClick={() => setPanelTab(t)}>
            {t === 'consultas' ? <>Consultas {consultas.length > 0 && <span style={{ background: '#E24B4A', color: 'white', fontSize: 9, padding: '1px 5px', borderRadius: 8 }}>{consultas.length}</span>}</> : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {panelTab === 'disponibilidad' && <Availability presId={presId} />}
      {panelTab === 'servicios'      && <Services presId={presId} />}
      {panelTab === 'reservas'       && <ReservasTab mis={mis} />}
      {panelTab === 'consultas'      && <ConsultasTab consultas={consultas} presId={presId} />}
      {panelTab === 'finanzas'       && <Finances presId={presId} />}
    </div>
  )
}

function ReservasTab({ mis }) {
  const prox = mis.filter(r => r.fecha >= new Date().toISOString().slice(0,10)).slice(0, 10)
  if (!prox.length) return <p style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-secondary)' }}>Sin reservas próximas</p>
  return prox.map(r => (
    <div key={r.id} className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{r.nombre}</span>
          <p style={{ fontSize: 12 }}>{fdd(r.fecha)}{r.noches > 1 ? ` · ${r.noches} noches` : ''}{r.nota ? ' · ' + r.nota : ''}</p>
          <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{r.tel}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className={`bx ${r.pago === 'pagado' ? 'gn' : 'am'}`}>{r.pago}</span>
          <p style={{ fontSize: 12, fontWeight: 500, marginTop: 3 }}>${r.monto.toLocaleString('es-CL')}</p>
        </div>
      </div>
    </div>
  ))
}

function ConsultasTab({ consultas, presId }) {
  const respConsulta = useStore(s => s.respConsulta)
  if (!consultas.length) return <p style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-secondary)' }}>Sin consultas pendientes</p>
  return consultas.map(c => (
    <div key={c.id} className="consulta-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{c.nombre}</span>
          <p style={{ fontSize: 12 }}><i className="ti ti-calendar" /> {fdd(c.fecha)} · <i className="ti ti-phone" /> {c.tel}</p>
          {c.msg && <p style={{ fontSize: 12, marginTop: 4 }}>"{c.msg}"</p>}
        </div>
        <span className="bx am">Pendiente</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn ok" style={{ flex: 1 }} onClick={() => respConsulta(c.id, 'aceptar')}><i className="ti ti-check" /> Aceptar</button>
        <button className="btn dr" style={{ flex: 1 }} onClick={() => respConsulta(c.id, 'rechazar')}><i className="ti ti-x" /> Rechazar</button>
      </div>
    </div>
  ))
}
