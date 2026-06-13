import { useStore } from '../../store'

export default function Flow() {
  const { db, calcGuiaCosto, calcConductorCosto, calcCostoFijo, calcP } = useStore(s => s)
  const res = db.reservas.filter(r => r.estado !== 'cancelada')
  const totalBruto = res.reduce((a,r)=>a+r.monto,0)
  const totalCom   = Math.round(totalBruto*db.config.comision/100)
  const totalGuia  = res.reduce((a,r)=>a+calcGuiaCosto(r),0)
  const totalCond  = res.reduce((a,r)=>a+calcConductorCosto(r),0)
  const totalCFijo = res.reduce((a,r)=>a+calcCostoFijo(r),0)
  const netoTotal  = totalBruto-totalCom-totalGuia-totalCond-totalCFijo

  return (
    <>
      <div style={{background:'#0d2b1a',borderRadius:20,padding:16,marginBottom:12}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Resumen global — reservas confirmadas</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:8}}>
          <StatBox label="Bruto clientes" value={`$${Math.round(totalBruto/1000)}K`} />
          <StatBox label="Comisión La Balsa" value={`$${Math.round(totalCom/1000)}K`} color="#D4A017" />
          <StatBox label="Neto prestadores" value={`$${Math.round(netoTotal/1000)}K`} color="#52b788" />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
          <StatBox label="Guías" value={`$${Math.round(totalGuia/1000)}K`} color="#e74c3c" small />
          <StatBox label="Conductores" value={`$${Math.round(totalCond/1000)}K`} color="#e67e22" small />
          <StatBox label="Costos fijos" value={`$${Math.round(totalCFijo/1000)}K`} color="#9b59b6" small />
        </div>
      </div>

      {db.prestadores.filter(p=>p.activo).map(p => {
        const pRes   = res.filter(r => r.presId === p.id)
        const pBruto = pRes.reduce((a,r)=>a+r.monto,0)
        const pCom   = Math.round(pBruto*db.config.comision/100)
        const pGuia  = pRes.reduce((a,r)=>a+calcGuiaCosto(r),0)
        const pCond  = pRes.reduce((a,r)=>a+calcConductorCosto(r),0)
        const pCFijo = pRes.reduce((a,r)=>a+calcCostoFijo(r),0)
        const pNeto  = pBruto-pCom-pGuia-pCond-pCFijo

        return (
          <div key={p.id} className="card">
            <div style={{background:'#1B4332',borderRadius:12,padding:'10px 14px',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:14,fontWeight:500,color:'#fff'}}>{p.nombre}</span>
              <div style={{display:'flex',gap:6}}>
                <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'rgba(212,160,23,.25)',color:'#D4A017'}}>{pRes.length} reservas</span>
                <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'rgba(82,183,136,.25)',color:'#52b788'}}>Neto ${Math.round(pNeto/1000)}K</span>
              </div>
            </div>

            <div style={{fontSize:11,fontWeight:500,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--color-text-tertiary)',marginBottom:8}}>Servicios activos</div>

            {p.servicios.filter(s=>s.activo).map(s => {
              const precioCliente = calcP(s).total
              const g = s.guia_prestadorId ? (db.guias||[]).find(x=>x.id===s.guia_prestadorId) : null
              const d = s.duracion_dias||1
              const gCost = g ? (g.tarifa_tipo==='dia'?g.tarifa*d:g.tarifa*8*d) : 0
              const cfTotal = Array.isArray(s.costos_fijos) ? s.costos_fijos.reduce((a,cf)=>{const base=cf.precio_unit*(cf.cantidad||1);return a+(cf.por_dia?base*d:base);},0) : 0
              const gananciaPot = s.precio_base - gCost - cfTotal

              return (
                <div key={s.id} style={{border:'0.5px solid var(--color-border-tertiary)',borderRadius:12,padding:'10px 12px',marginBottom:6}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div>
                      <span style={{fontSize:13,fontWeight:500}}>{s.nombre}</span>
                      <div style={{fontSize:11,color:'var(--color-text-tertiary)',marginTop:2}}>{s.duracion_dias>1?`${s.duracion_dias} días · `:''}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:12,color:'var(--color-text-secondary)'}}>Cliente paga</div>
                      <div style={{fontSize:15,fontWeight:500}}>${precioCliente.toLocaleString('es-CL')}</div>
                    </div>
                  </div>
                  <FlowGrid vals={[
                    {label:'Bruto', v:`$${s.precio_base.toLocaleString('es-CL')}`, bg:'#f0f7f0', c:'#1B4332'},
                    {label:'Plataforma', v:`$${Math.round(s.precio_base*db.config.comision/100).toLocaleString('es-CL')}`, bg:'#fff3cd', c:'#D4A017'},
                    {label:'Guía', v:gCost?`-$${gCost.toLocaleString('es-CL')}`:'—', bg:'#fee', c:'#e74c3c'},
                    {label:'C.Fijos', v:cfTotal?`-$${cfTotal.toLocaleString('es-CL')}`:'—', bg:'#f3e8ff', c:'#9b59b6'},
                    {label:'Neto prest.', v:`$${gananciaPot.toLocaleString('es-CL')}`, bg:'#d4edda', c:'#1B4332'},
                  ]} />
                </div>
              )
            })}

            {pBruto > 0 && (
              <div style={{marginTop:10,borderTop:'0.5px solid var(--color-border-tertiary)',paddingTop:10}}>
                <div style={{fontSize:11,fontWeight:500,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--color-text-tertiary)',marginBottom:6}}>Flujo de caja real</div>
                <FlowGrid vals={[
                  {label:'Bruto', v:`$${pBruto.toLocaleString('es-CL')}`, bg:'#f0f7f0', c:'#1B4332'},
                  {label:'Plataforma', v:`$${pCom.toLocaleString('es-CL')}`, bg:'#fff3cd', c:'#D4A017'},
                  {label:'Guía', v:`$${pGuia.toLocaleString('es-CL')}`, bg:'#fee', c:'#e74c3c'},
                  {label:'Conductor', v:`$${pCond.toLocaleString('es-CL')}`, bg:'#fdf0e0', c:'#e67e22'},
                  {label:'C.Fijos', v:`$${pCFijo.toLocaleString('es-CL')}`, bg:'#f3e8ff', c:'#9b59b6'},
                  {label:'Neto', v:`$${pNeto.toLocaleString('es-CL')}`, bg:'#d4edda', c:'#1B4332'},
                ]} />
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

function StatBox({ label, value, color = '#fff', small = false }) {
  return (
    <div style={{ background:'rgba(255,255,255,.07)', borderRadius:12, padding:small?8:10, textAlign:'center' }}>
      <div style={{ fontSize:small?9:10, color:'rgba(255,255,255,.5)' }}>{label}</div>
      <div style={{ fontSize:small?13:15, fontWeight:500, color }}>{value}</div>
    </div>
  )
}

function FlowGrid({ vals }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${vals.length},1fr)`, gap:3 }}>
      {vals.map(v => (
        <div key={v.label} style={{ background:v.bg, borderRadius:8, padding:'6px', textAlign:'center' }}>
          <div style={{ fontSize:9, color:'#666' }}>{v.label}</div>
          <div style={{ fontSize:11, fontWeight:500, color:v.c }}>{v.v}</div>
        </div>
      ))}
    </div>
  )
}
