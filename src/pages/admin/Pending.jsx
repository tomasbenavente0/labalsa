import { useState } from 'react'
import { useStore } from '../../store'
import { fdd } from '../../utils'

export default function Pending() {
  const { db, gp, gs, aprobarGuia, cerrarConv, aprobarSolicitud, rechazarSolicitud, showToast } = useStore(s => s)
  const [tab, setTab] = useState('convocatorias')

  const convAbiertas = (db.convocatorias||[]).filter(c=>c.estado!=='cerrada')
  const soles        = (db.solicitudes||[]).filter(s=>s.estado==='pendiente')
  const guiasSocios  = db.prestadores.filter(p=>p.activo&&(p.oficios||[]).some(o=>['Guía','Arriero','Conductor','Transporte'].includes(o)))

  return (
    <>
      <h2>Pendientes</h2>
      <div className="tog" style={{marginBottom:10}}>
        <button className={tab==='convocatorias'?'on':''} onClick={()=>setTab('convocatorias')}>Convocatorias {convAbiertas.length>0&&`(${convAbiertas.length})`}</button>
        <button className={tab==='solicitudes'?'on':''} onClick={()=>setTab('solicitudes')}>Solicitudes {soles.length>0&&`(${soles.length})`}</button>
      </div>

      {tab === 'convocatorias' && (
        convAbiertas.length === 0
          ? <p style={{textAlign:'center',padding:16,color:'var(--color-text-tertiary)'}}>Sin convocatorias activas</p>
          : convAbiertas.map(c => {
            const postulantes = c.postulaciones || []
            return (
              <div key={c.id} className="card" style={{border:'1.5px solid #D4A017'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <span style={{fontSize:13,fontWeight:700,color:'#D4A017'}}><i className="ti ti-broadcast" /> {c.servNombre}</span>
                    <p style={{fontSize:12,marginTop:2}}>{fdd(c.fecha)}{c.rol?` · Rol: ${c.rol}`:''}</p>
                    {c.notas && <p style={{fontSize:11,color:'var(--color-text-secondary)',marginTop:2}}>{c.notas}</p>}
                  </div>
                  <span className="bx am">{postulantes.length} postulaciones</span>
                </div>
                {postulantes.length > 0
                  ? <>
                    <p className="st" style={{marginTop:0}}>Postulantes</p>
                    {postulantes.map(pid => {
                      const g = db.prestadores.find(x=>x.id===pid)
                      return g ? (
                        <div key={pid} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #dff0df'}}>
                          <span style={{fontSize:13,fontWeight:500}}>{g.nombre}</span>
                          <button className="btn ok sm" onClick={()=>aprobarGuia(c.id,g.id)}><i className="ti ti-check" /> Aprobar</button>
                        </div>
                      ) : null
                    })}
                  </>
                  : <>
                    <p style={{fontSize:12,color:'var(--color-text-tertiary)',marginBottom:8}}>Esperando postulaciones de socios con rol {c.rol||'requerido'}...</p>
                    <p className="st" style={{marginTop:0}}>Socios disponibles para convocar</p>
                    {guiasSocios.filter(gs2=>c.rol?(gs2.oficios||[]).includes(c.rol):true).map(gs2=>(
                      <div key={gs2.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 0'}}>
                        <span style={{fontSize:13}}>{gs2.nombre} · {(gs2.oficios||[]).join(', ')}</span>
                        <button className="btn sm"><i className="ti ti-send" /> Notificar</button>
                      </div>
                    ))}
                  </>
                }
                <button className="btn dr w" style={{marginTop:8}} onClick={()=>cerrarConv(c.id)}><i className="ti ti-x" /> Cerrar convocatoria</button>
              </div>
            )
          })
      )}

      {tab === 'solicitudes' && (
        soles.length === 0
          ? <p style={{textAlign:'center',padding:16,color:'var(--color-text-tertiary)'}}>Sin solicitudes pendientes</p>
          : soles.map(sol => {
            const p = gp(sol.pId)
            const s = gs(sol.pId, sol.sId)
            return (
              <div key={sol.id} className="card" style={{border:'1.5px solid #D4A017'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <span style={{fontSize:13,fontWeight:600}}>{p?.nombre||'—'} — {s?.nombre||'—'}</span>
                    <p style={{fontSize:12,marginTop:2}}>Campo: <b>{sol.campo}</b></p>
                    <p style={{fontSize:12}}>Actual: ${Number(sol.valorActual).toLocaleString('es-CL')} → Nuevo: ${Number(sol.valorNuevo).toLocaleString('es-CL')}</p>
                  </div>
                  <span className="bx am">Pendiente</span>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn ok" style={{flex:1}} onClick={()=>aprobarSolicitud(sol.id)}><i className="ti ti-check" /> Aprobar</button>
                  <button className="btn dr" style={{flex:1}} onClick={()=>rechazarSolicitud(sol.id)}><i className="ti ti-x" /> Rechazar</button>
                </div>
              </div>
            )
          })
      )}
    </>
  )
}
