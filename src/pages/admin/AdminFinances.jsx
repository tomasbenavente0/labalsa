import { useStore } from '../../store'
import { vanTir } from '../../utils'

export default function AdminFinances() {
  const { db, calcGuiaCosto, calcConductorCosto, calcCostoFijo, calcP } = useStore(s => s)
  const res = db.reservas.filter(r=>r.estado!=='cancelada')
  const totalBruto = res.reduce((a,r)=>a+r.monto,0)
  const totalCom   = Math.round(totalBruto*db.config.comision/100)
  const vt = vanTir(totalCom, 300000, 10, 3)

  return (
    <>
      <div style={{background:'#0d2b1a',borderRadius:20,padding:16,marginBottom:12}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Resumen financiero de La Balsa</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:10}}>
          <Box label="Ingresos brutos"     value={`$${Math.round(totalBruto/1000)}K`} color="#fff" />
          <Box label="Comisión La Balsa"   value={`$${Math.round(totalCom/1000)}K`}  color="#D4A017" />
          <Box label="Socios activos"      value={db.prestadores.filter(p=>p.activo).length} color="#52b788" />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          <Box label="VAN 3 años" value={`$${Math.round(vt.van/1000)}K`}  color={vt.van>0?'#52b788':'#e74c3c'} small />
          <Box label="TIR"        value={`${vt.tir}%`}                    color="#D4A017" small />
          <Box label="Inversión"  value="$300K"                           color="#fff" small />
        </div>
      </div>

      {db.prestadores.filter(p=>p.activo).map(p => {
        const pRes   = res.filter(r=>r.presId===p.id)
        const pBruto = pRes.reduce((a,r)=>a+r.monto,0)
        const pCom   = Math.round(pBruto*db.config.comision/100)
        const pGuia  = pRes.reduce((a,r)=>a+calcGuiaCosto(r),0)
        const pCond  = pRes.reduce((a,r)=>a+calcConductorCosto(r),0)
        const pCFijo = pRes.reduce((a,r)=>a+calcCostoFijo(r),0)
        const pNeto  = pBruto-pCom-pGuia-pCond-pCFijo

        return (
          <div key={p.id} className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:p.color,color:p.textColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:500}}>{p.nombre[0]}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{p.nombre}</div>
                  <div style={{fontSize:11,color:'var(--color-text-tertiary)'}}>{(p.oficios||[]).join(', ')||'Sin oficio'}</div>
                </div>
              </div>
              <span style={{fontSize:12,fontWeight:500}}>{pRes.length} reservas</span>
            </div>

            {p.servicios.filter(s=>s.activo).map(s => {
              const dias  = s.duracion_dias||1, maxP = s.max_personas||1
              const g     = s.guia_prestadorId ? (db.guias||[]).find(x=>x.id===s.guia_prestadorId) : null
              const cfTotal = Array.isArray(s.costos_fijos)?s.costos_fijos.reduce((a,cf)=>{const base=cf.precio_unit*(cf.cantidad||1);return a+(cf.por_dia?base*dias:base);},0):0
              const gCosto  = g?(g.tarifa_tipo==='dia'?g.tarifa*dias:g.tarifa*maxP*dias):0
              const ingreso = s.precio_tipo==='por_persona'?s.precio_base*maxP*(1-db.config.comision/100):s.precio_base*(1-db.config.comision/100)
              const ganancia= Math.round(ingreso-gCosto-cfTotal)
              const pe = (()=>{for(let pp=1;pp<=maxP;pp++){const ing2=s.precio_tipo==='por_persona'?s.precio_base*pp*(1-db.config.comision/100):s.precio_base*(1-db.config.comision/100);if(ing2>=cfTotal+gCosto)return pp;}return null})()
              return (
                <div key={s.id} style={{border:'0.5px solid var(--color-border-tertiary)',borderRadius:10,padding:'8px 10px',marginBottom:6}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                    <span style={{fontSize:13,fontWeight:500}}>{s.nombre}</span>
                    <span style={{fontSize:12,fontWeight:500,color:ganancia>0?'#3B6D11':'#A32D2D'}}>${ganancia.toLocaleString('es-CL')}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:3}}>
                    {[
                      {label:'Precio/p', v:`$${(s.precio_base/1000).toFixed(0)}K`, bg:'#f0f7f0', c:'#1B4332'},
                      {label:'Plataforma', v:`$${Math.round(s.precio_base*db.config.comision/100/1000).toFixed(0)}K`, bg:'#fff3cd', c:'#D4A017'},
                      {label:'Guía', v:gCosto?`$${(gCosto/1000).toFixed(0)}K`:'—', bg:'#fee', c:'#e74c3c'},
                      {label:'C.Fijos', v:cfTotal?`$${(cfTotal/1000).toFixed(0)}K`:'—', bg:'#f3e8ff', c:'#9b59b6'},
                      {label:'P.Eq.', v:pe?`${pe}p`:'—', bg:'#d4edda', c:'#1B4332'},
                    ].map(x=>(
                      <div key={x.label} style={{background:x.bg,borderRadius:7,padding:5,textAlign:'center'}}>
                        <div style={{fontSize:9,color:'#666'}}>{x.label}</div>
                        <div style={{fontSize:11,fontWeight:500,color:x.c}}>{x.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {pBruto > 0 && (
              <div style={{borderTop:'0.5px solid var(--color-border-tertiary)',paddingTop:8,marginTop:4,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4}}>
                {[{label:'Bruto',v:`$${Math.round(pBruto/1000)}K`},{label:'Plataforma',v:`$${Math.round(pCom/1000)}K`,c:'#D4A017'},{label:'Guía+CF',v:`$${Math.round((pGuia+pCond+pCFijo)/1000)}K`,c:'#e74c3c'},{label:'Neto',v:`$${Math.round(pNeto/1000)}K`,c:'#3B6D11'}].map(x=>(
                  <div key={x.label} style={{textAlign:'center'}}>
                    <div style={{fontSize:9,color:x.c||'var(--color-text-tertiary)'}}>{x.label}</div>
                    <div style={{fontSize:12,fontWeight:500,color:x.c||'inherit'}}>{x.v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

function Box({ label, value, color, small }) {
  return (
    <div style={{background:'rgba(255,255,255,.07)',borderRadius:12,padding:small?10:12,textAlign:'center'}}>
      <div style={{fontSize:small?9:10,color:'rgba(255,255,255,.5)'}}>{label}</div>
      <div style={{fontSize:small?14:17,fontWeight:500,color}}>{value}</div>
    </div>
  )
}
