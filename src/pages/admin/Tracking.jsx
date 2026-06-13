import { useStore } from '../../store'
import { ETIQUETAS } from '../../constants'
import { fdd } from '../../utils'

const CAMPOS = [
  { key:'ofrece',  label:'Qué ofrece',              icon:'ti-package', desc:'Servicios, productos o conocimientos que aporta hoy' },
  { key:'aporta',  label:'Qué aporta a la comunidad', icon:'ti-heart',   desc:'Valor cultural, territorial, identitario' },
  { key:'quiere',  label:'Qué quiere',               icon:'ti-star',    desc:'Aspiraciones y metas' },
  { key:'podria',  label:'Podría',                   icon:'ti-bulb',    desc:'Opciones potenciales y sus beneficios' },
  { key:'labalsa', label:'La Balsa aporta',          icon:'ti-tree',    desc:'Lo que el proyecto le da o puede darle' },
]

export default function Tracking() {
  const { db, ctx, setCtx, toggleEtSeg, saveSeguimientoTexto } = useStore(s => s)
  const prestSel = ctx.seguimientoPrest || db.prestadores[0]?.id || ''
  const pSel     = db.prestadores.find(x => x.id === prestSel)

  const today = new Date().toISOString().slice(0,10)
  const proximas = db.reservas.filter(r=>r.estado!=='cancelada'&&r.fecha>=today).sort((a,b)=>a.fecha.localeCompare(b.fecha))
  const sinGuia  = proximas.filter(r=>r.items&&r.items.some(it=>{const s=useStore.getState().gs(it.presId,it.servId);return s&&s.guia_prestadorId&&!r.guiaAsignado;}))

  return (
    <>
      {sinGuia.length > 0 && (
        <div className="alert alert-warn"><i className="ti ti-alert-triangle" /> <b>{sinGuia.length} servicio{sinGuia.length>1?'s':''} sin guía asignado</b></div>
      )}
      <h2>Seguimiento por prestador</h2>
      <div className="card">
        <select value={prestSel} onChange={e=>setCtx({seguimientoPrest:e.target.value})} style={{marginBottom:12}}>
          {db.prestadores.filter(p=>p.activo).map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        {pSel ? CAMPOS.map(c => {
          const seg   = pSel.seguimiento || {}
          const etSel = seg[c.key] || []
          const txt   = seg[c.key+'_txt'] || ''
          return (
            <div key={c.key} style={{marginBottom:14,paddingBottom:14,borderBottom:'0.5px solid var(--color-border-tertiary)'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                <i className={`ti ${c.icon}`} style={{fontSize:15,color:'var(--color-text-secondary)'}} />
                <span style={{fontSize:13,fontWeight:500}}>{c.label}</span>
              </div>
              <p style={{fontSize:12,color:'var(--color-text-tertiary)',marginBottom:6}}>{c.desc}</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:5}}>
                {ETIQUETAS.map(e => {
                  const sel = etSel.includes(e.id)
                  return (
                    <span key={e.id} onClick={() => toggleEtSeg(pSel.id, c.key, e.id)} style={{
                      cursor:'pointer',fontSize:11,fontWeight:500,padding:'3px 10px',borderRadius:20,
                      background: sel?e.color:'var(--color-background-secondary)',
                      color: sel?e.text:'var(--color-text-secondary)',
                      border: `1.5px solid ${sel?e.color:'var(--color-border-secondary)'}`,
                    }}>{e.label}</span>
                  )
                })}
              </div>
              <textarea rows={2} style={{resize:'none',marginTop:8,fontSize:13}} defaultValue={txt}
                placeholder="Notas..." onBlur={e=>saveSeguimientoTexto(pSel.id,c.key,e.target.value)} />
            </div>
          )
        }) : <p style={{fontSize:13,color:'var(--color-text-tertiary)'}}>Selecciona un prestador</p>}
      </div>

      <h2>Próximos viajes</h2>
      {proximas.length === 0
        ? <p style={{textAlign:'center',padding:12,color:'var(--color-text-tertiary)'}}>Sin viajes programados</p>
        : proximas.slice(0,6).map(r => {
          const guiaAsig = r.guiaAsignado ? db.guias.find(g=>g.id===r.guiaAsignado) : null
          return (
            <div key={r.id} className="card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <span style={{fontSize:13,fontWeight:500}}>{r.nombre}</span>
                  <p style={{fontSize:12}}>{r.presNombre} · {fdd(r.fecha)}</p>
                  {guiaAsig
                    ? <span className="bx gn" style={{fontSize:11}}>Guía: {guiaAsig.nombre}</span>
                    : <span className="bx am" style={{fontSize:11}}>Sin guía</span>
                  }
                </div>
                <span className={`bx ${r.pago==='pagado'?'gn':'am'}`}>{r.pago}</span>
              </div>
            </div>
          )
        })
      }
    </>
  )
}
