import { useStore } from '../../store'
import Summary from './Summary'
import Flow from './Flow'
import Pending from './Pending'
import AdminFinances from './AdminFinances'
import Tracking from './Tracking'

const TABS = ['resumen','flujo','pendientes','seguimiento','finanzas']
const LABELS = { resumen:'Reservas', flujo:'Servicios', pendientes:'Pendientes', seguimiento:'Seguimiento', finanzas:'Finanzas' }

export default function Admin() {
  const { db, ctx, setCtx } = useStore(s => s)
  const adminTab = ctx.adminTab || 'resumen'
  const pendientes = [
    ...(db.convocatorias||[]).filter(c=>c.estado==='abierta'),
    ...(db.solicitudes||[]).filter(s=>s.estado==='pendiente'),
    ...(db.consultas||[]).filter(c=>c.estado==='pendiente'),
  ].length

  const tabBar = (
    <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:12 }}>
      {TABS.map(t => (
        <button key={t} className={`tab ${adminTab===t?'on':''}`} style={{fontSize:11}}
          onClick={() => setCtx({ adminTab: t })}>
          {LABELS[t]}{t==='pendientes'&&pendientes>0?` (${pendientes})`:''}
        </button>
      ))}
    </div>
  )

  const emailOk = true

  return (
    <div className="scr">
      {tabBar}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <h2 style={{ margin:0 }}>Administración</h2>
        <button className="btn sm" onClick={() => useStore.setState({ adminOk: false })}>Salir</button>
      </div>
      {emailOk
        ? <div className="alert alert-ok"><i className="ti ti-mail" /> Correos automáticos activos</div>
        : <div className="alert alert-warn"><i className="ti ti-mail-off" /> Correos no configurados</div>
      }

      {adminTab === 'resumen'     && <Summary />}
      {adminTab === 'flujo'       && <Flow />}
      {adminTab === 'pendientes'  && <Pending />}
      {adminTab === 'seguimiento' && <Tracking />}
      {adminTab === 'finanzas'    && <AdminFinances />}
    </div>
  )
}
