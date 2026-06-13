import { useStore } from '../../store'
import { fdd } from '../../utils'

export default function Finances({ presId }) {
  const { db, gp, calcGuiaCosto, calcConductorCosto, calcCostoFijo } = useStore(s => s)
  const p = gp(presId)
  if (!p) return null

  const mis = db.reservas.filter(r => r.presId === p.id && r.estado !== 'cancelada')
  const totalBruto = mis.reduce((a,r) => a + r.monto, 0)
  const totalCom   = Math.round(totalBruto * db.config.comision / 100)
  const recibido   = totalBruto - totalCom
  const totalGuia  = mis.reduce((a,r) => a + calcGuiaCosto(r), 0)
  const totalCond  = mis.reduce((a,r) => a + calcConductorCosto(r), 0)
  const totalCFijo = mis.reduce((a,r) => a + calcCostoFijo(r), 0)
  const gananciaReal = recibido - totalGuia - totalCond - totalCFijo

  return (
    <>
      <div style={{ background:'#0d2b1a', borderRadius:16, padding:16, marginBottom:12 }}>
        <h3 style={{ color:'#D4A017', marginBottom:12 }}><i className="ti ti-coins" /> Mis Finanzas</h3>
        <div className="g2" style={{ gap:8, marginBottom:8 }}>
          <div style={{ background:'rgba(255,255,255,.07)', borderRadius:12, padding:10 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.6)' }}>Ingreso recibido</div>
            <div style={{ fontSize:17, fontWeight:700, color:'#fff' }}>${recibido.toLocaleString('es-CL')}</div>
          </div>
          <div style={{ background:'rgba(82,183,136,.2)', borderRadius:12, padding:10 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.6)' }}>Ganancia real</div>
            <div style={{ fontSize:17, fontWeight:700, color:'#52b788' }}>${gananciaReal.toLocaleString('es-CL')}</div>
          </div>
        </div>
        <div className="g3" style={{ gap:6 }}>
          <div style={{ background:'rgba(255,255,255,.05)', borderRadius:10, padding:8, textAlign:'center' }}>
            <div style={{ fontSize:9, color:'rgba(255,255,255,.5)' }}>Guía</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#e74c3c' }}>-${totalGuia.toLocaleString('es-CL')}</div>
          </div>
          <div style={{ background:'rgba(255,255,255,.05)', borderRadius:10, padding:8, textAlign:'center' }}>
            <div style={{ fontSize:9, color:'rgba(255,255,255,.5)' }}>Conductor</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#e67e22' }}>-${totalCond.toLocaleString('es-CL')}</div>
          </div>
          <div style={{ background:'rgba(255,255,255,.05)', borderRadius:10, padding:8, textAlign:'center' }}>
            <div style={{ fontSize:9, color:'rgba(255,255,255,.5)' }}>Costos fijos</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#9b59b6' }}>-${totalCFijo.toLocaleString('es-CL')}</div>
          </div>
        </div>
      </div>

      {mis.length === 0
        ? <p style={{ textAlign:'center', padding:12, color:'var(--color-text-tertiary)' }}>Sin servicios prestados aún</p>
        : mis.map(r => {
          const rCom      = Math.round(r.monto * db.config.comision / 100)
          const rRecibido = r.monto - rCom
          const rGuia     = calcGuiaCosto(r)
          const rCond     = calcConductorCosto(r)
          const rCFijo    = calcCostoFijo(r)
          const rGanancia = rRecibido - rGuia - rCond - rCFijo
          return (
            <div key={r.id} className="card">
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <div>
                  <span style={{ fontSize:13, fontWeight:600 }}>{r.nombre}</span>
                  <p style={{ fontSize:11 }}>{fdd(r.fecha)}</p>
                </div>
                <span className={`bx ${r.pago==='pagado'?'gn':'am'}`}>{r.pago}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:6 }}>
                <div style={{ background:'#f0f7f0', borderRadius:10, padding:8 }}>
                  <div style={{ fontSize:10, color:'#3d5a3d' }}>Recibido de plataforma</div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1B4332' }}>${rRecibido.toLocaleString('es-CL')}</div>
                </div>
                <div style={{ background:'#d4edda', borderRadius:10, padding:8 }}>
                  <div style={{ fontSize:10, color:'#1B4332' }}>Ganancia real</div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1B4332' }}>${rGanancia.toLocaleString('es-CL')}</div>
                </div>
              </div>
              <div style={{ fontSize:11, color:'var(--color-text-secondary)' }}>
                {rGuia > 0 ? `Guía: -$${rGuia.toLocaleString('es-CL')} ` : ''}
                {rCond > 0 ? `Conductor: -$${rCond.toLocaleString('es-CL')} ` : ''}
                {rCFijo > 0 ? `C.Fijo: -$${rCFijo.toLocaleString('es-CL')}` : ''}
                {rGuia === 0 && rCond === 0 && rCFijo === 0 ? 'Sin costos registrados' : ''}
              </div>
            </div>
          )
        })
      }
    </>
  )
}
