import { useState } from 'react'
import { useStore } from '../../store'
import { fdd } from '../../utils'
import { CCOLORS, OFICIOS } from '../../constants'

export default function Summary() {
  const { db, gp, mkP, mkC, setDB, setCtx, changePin, exportData, importData, showToast } = useStore(s => s)
  const [sec, setSec]       = useState({})
  const [addPres, setAddPres] = useState(false)
  const [newPres, setNewPres] = useState({ nombre:'', descripcion:'', foto_url:'', pin:'', oficios:[], colIdx:0 })
  const [editPresId, setEditPresId] = useState(null)
  const [editPres, setEditPres] = useState({})
  const [comision, setComision] = useState(db.config.comision)
  const [iva, setIva]       = useState(db.config.iva)
  const [altaMeses, setAltaMeses] = useState((db.config.alta_meses||[12,1,2]).join(','))
  const [pins, setPins] = useState({})
  const [pinMsg, setPinMsg] = useState('')

  const res   = db.reservas
  const total = res.filter(r=>r.estado!=='cancelada').reduce((a,r)=>a+r.monto,0)

  const saveConfig = () => {
    useStore.getState().saveConfig(
      parseInt(comision)||10, iva,
      altaMeses.split(',').map(x=>parseInt(x.trim())).filter(x=>!isNaN(x))
    )
    showToast('✓ Configuración guardada')
  }

  const doCambioPin = (id) => {
    const v = pins[id]||''
    const ok = changePin(id, v)
    if (!ok) { setPinMsg('El PIN debe tener al menos 4 dígitos'); return }
    setPins(x=>({...x,[id]:''}))
    setPinMsg(`✓ PIN ${id==='admin'?'de administrador':db.prestadores.find(p=>p.id===id)?.nombre||''} cambiado`)
    setTimeout(()=>setPinMsg(''),3000)
  }

  const savePres = () => {
    const { nombre, descripcion, foto_url, pin, oficios, colIdx } = newPres
    if (!nombre || !pin) { alert('Nombre y PIN son obligatorios'); return }
    if (pin.length < 4)  { alert('El PIN debe tener al menos 4 dígitos'); return }
    const c = CCOLORS[colIdx||0]
    setDB(old => ({ ...old, prestadores: [...old.prestadores, {
      id: 'p'+Date.now().toString(36), nombre, descripcion: descripcion||'', foto_url: foto_url||'', pin,
      color: c[0], textColor: c[1], activo: true, certificado: false, lnt: false,
      oficios, servicios: [], paquetes: [], mode: 'mark', available: [], blocked: [],
    }]}))
    setAddPres(false)
    setNewPres({ nombre:'', descripcion:'', foto_url:'', pin:'', oficios:[], colIdx:0 })
  }

  const startEditPres = (p) => { setEditPresId(p.id); setEditPres({ descripcion: p.descripcion||'', foto_url: p.foto_url||'', oficios: [...(p.oficios||[])] }) }
  const doEditPres = (id) => { useStore.getState().saveEditPres(id, editPres.descripcion, editPres.foto_url, editPres.oficios); setEditPresId(null) }

  return (
    <>
      {/* Stats */}
      <div className="g3" style={{ marginBottom:10 }}>
        <div className="stat"><div className="sl">Reservas</div><div className="sv">{res.filter(r=>r.estado!=='cancelada').length}</div></div>
        <div className="stat"><div className="sl">Ingresos brutos</div><div className="sv">${Math.round(total/1000)}K</div></div>
        <div className="stat"><div className="sl">Prestadores</div><div className="sv">{db.prestadores.filter(x=>x.activo).length}</div></div>
      </div>

      {/* Config */}
      <div className="card">
        <h3>Configuración de precios</h3>
        <div className="g2">
          <div><span className="lbl">Mi comisión (%)</span><input type="number" value={comision} min={0} max={50} onChange={e=>setComision(e.target.value)} /></div>
          <div><span className="lbl">Meses temporada alta</span><input value={altaMeses} onChange={e=>setAltaMeses(e.target.value)} /></div>
        </div>
        <label className="ckb"><input type="checkbox" checked={iva} onChange={e=>setIva(e.target.checked)} /> IVA global (19%)</label>
        <button className="btn ok sm" onClick={saveConfig} style={{ marginTop:6 }}>Guardar</button>
      </div>

      {/* PINs */}
      <div className="card">
        <div className="acc-hdr" onClick={() => setSec(x=>({...x,pins:!x.pins}))}>
          <h3 style={{margin:0,display:'flex',alignItems:'center',gap:6}}><i className="ti ti-key" /> Gestión de PINs</h3>
          <i className={`ti ti-chevron-${sec.pins?'up':'down'}`} style={{color:'var(--color-text-tertiary)'}} />
        </div>
        {sec.pins && (
          <div className="acc-body">
            {db.prestadores.map(p => (
              <div key={p.id} className="row">
                <div style={{display:'flex',gap:8,alignItems:'center',flex:1}}>
                  <div className="av-c" style={{background:p.color,color:p.textColor,width:28,height:28,fontSize:11}}>{p.nombre[0]}</div>
                  <span style={{fontSize:13}}>{p.nombre}</span>
                </div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <input type="password" value={pins[p.id]||''} onChange={e=>setPins(x=>({...x,[p.id]:e.target.value}))}
                    placeholder="Nuevo PIN" maxLength={6} autoComplete="off" style={{width:110,margin:0}} />
                  <button className="btn sm ok" onClick={()=>doCambioPin(p.id)}>Cambiar</button>
                </div>
              </div>
            ))}
            <div className="row">
              <div style={{display:'flex',gap:8,alignItems:'center',flex:1}}>
                <i className="ti ti-shield" style={{fontSize:16}} /><span style={{fontSize:13}}>Admin</span>
              </div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <input type="password" value={pins['admin']||''} onChange={e=>setPins(x=>({...x,admin:e.target.value}))}
                  placeholder="Nuevo PIN" maxLength={6} autoComplete="off" style={{width:110,margin:0}} />
                <button className="btn sm ok" onClick={()=>doCambioPin('admin')}>Cambiar</button>
              </div>
            </div>
            {pinMsg && <div style={{fontSize:12,marginTop:6,color:'#3B6D11'}}>{pinMsg}</div>}
          </div>
        )}
      </div>

      {/* Prestadores */}
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <h3 style={{margin:0}}>Prestadores</h3>
          <button className="btn sm ok" onClick={()=>setAddPres(!addPres)}><i className="ti ti-plus" /> Agregar</button>
        </div>
        {db.prestadores.map(p => (
          <div key={p.id} className="row">
            <div style={{display:'flex',gap:8,alignItems:'center',flex:1}}>
              <div className="av-c" style={{background:p.color,color:p.textColor,width:32,height:32,fontSize:12}}>{p.nombre[0]}</div>
              <div>
                <span style={{fontSize:13,fontWeight:500}}>{p.nombre}</span>
                <p style={{fontSize:11,color:'var(--color-text-tertiary)'}}>{p.servicios.length} servicios</p>
                <div style={{display:'flex',gap:3,flexWrap:'wrap',marginTop:3}}>
                  {(p.oficios||[]).map(o=><span key={o} className="chip" style={{fontSize:10,padding:'1px 6px'}}>{o}</span>)}
                </div>
                {editPresId === p.id && (
                  <div style={{marginTop:8}}>
                    <span className="lbl">Descripción</span><textarea rows={2} style={{resize:'none'}} value={editPres.descripcion} onChange={e=>setEditPres(x=>({...x,descripcion:e.target.value}))} />
                    <span className="lbl">URL foto</span><input value={editPres.foto_url} onChange={e=>setEditPres(x=>({...x,foto_url:e.target.value}))} />
                    <span className="lbl">Oficios</span>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:4}}>
                      {OFICIOS.map(o=>(
                        <label key={o} className="ckb" style={{fontSize:12}}>
                          <input type="checkbox" checked={editPres.oficios.includes(o)}
                            onChange={e=>setEditPres(x=>({...x,oficios:e.target.checked?[...x.oficios,o]:x.oficios.filter(a=>a!==o)}))} /> {o}
                        </label>
                      ))}
                    </div>
                    <button className="btn ok" style={{marginTop:8,width:'100%'}} onClick={()=>doEditPres(p.id)}>Guardar</button>
                  </div>
                )}
              </div>
            </div>
            <div style={{display:'flex',gap:4,flexDirection:'column',alignItems:'flex-end'}}>
              <button className="btn sm" onClick={()=>editPresId===p.id?setEditPresId(null):startEditPres(p)}><i className="ti ti-pencil" /></button>
              <button className={`btn sm ${p.activo?'dr':'ok'}`} onClick={()=>useStore.getState().togPres(p.id)}>{p.activo?'Desac.':'Activar'}</button>
            </div>
          </div>
        ))}
        {addPres && (
          <>
            <hr className="sep" />
            <span className="lbl">Nombre *</span><input value={newPres.nombre} onChange={e=>setNewPres(x=>({...x,nombre:e.target.value}))} placeholder="Nombre" />
            <span className="lbl">Descripción</span><textarea rows={2} style={{resize:'none'}} value={newPres.descripcion} onChange={e=>setNewPres(x=>({...x,descripcion:e.target.value}))} />
            <span className="lbl">URL foto</span><input value={newPres.foto_url} onChange={e=>setNewPres(x=>({...x,foto_url:e.target.value}))} placeholder="https://..." />
            <span className="lbl">PIN *</span><input type="password" value={newPres.pin} maxLength={6} autoComplete="off" onChange={e=>setNewPres(x=>({...x,pin:e.target.value}))} placeholder="4–6 dígitos" />
            <span className="lbl">Oficios</span>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
              {OFICIOS.map(o=>(
                <label key={o} className="ckb" style={{fontSize:12}}>
                  <input type="checkbox" checked={newPres.oficios.includes(o)}
                    onChange={e=>setNewPres(x=>({...x,oficios:e.target.checked?[...x.oficios,o]:x.oficios.filter(a=>a!==o)}))} /> {o}
                </label>
              ))}
            </div>
            <span className="lbl">Color</span>
            <div style={{display:'flex',gap:6,marginBottom:8}}>
              {CCOLORS.map((c,i)=>(
                <div key={i} onClick={()=>setNewPres(x=>({...x,colIdx:i}))}
                  style={{width:26,height:26,borderRadius:'50%',background:c[0],border:`2px solid ${newPres.colIdx===i?c[1]:'transparent'}`,cursor:'pointer'}} />
              ))}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn ok" style={{flex:1}} onClick={savePres}>Guardar</button>
              <button className="btn" style={{flex:1}} onClick={()=>setAddPres(false)}>Cancelar</button>
            </div>
          </>
        )}
      </div>

      {/* Recent reservations */}
      <div className="card">
        <h3 style={{marginBottom:8}}>Reservas recientes</h3>
        {res.length === 0
          ? <p style={{textAlign:'center',padding:12,color:'var(--color-text-secondary)'}}>Sin reservas aún</p>
          : res.slice().reverse().slice(0,10).map(r => (
            <div key={r.id} className="row">
              <div>
                <span style={{fontSize:13,fontWeight:500}}>{r.nombre}</span>
                <p style={{fontSize:12}}>{r.presNombre} · {fdd(r.fecha)}{r.noches>1?` · ${r.noches} noches`:''}</p>
                <p style={{fontSize:11,color:'var(--color-text-tertiary)'}}>{r.tel}</p>
              </div>
              <div style={{textAlign:'right',display:'flex',flexDirection:'column',gap:3,alignItems:'flex-end'}}>
                <span className={`bx ${r.pago==='pagado'?'gn':'am'}`}>{r.pago}</span>
                <span style={{fontSize:12,fontWeight:500}}>${r.monto.toLocaleString('es-CL')}</span>
                {r.pago!=='pagado'&&r.estado!=='cancelada'&&<button className="btn sm ok" onClick={()=>mkP(r.id)}>Pagado</button>}
                {r.estado!=='cancelada'&&<button className="btn sm dr" onClick={()=>mkC(r.id)}>Cancelar</button>}
              </div>
            </div>
          ))
        }
      </div>

      {/* Export / Import */}
      <div className="card">
        <h3>Exportar / Importar</h3>
        <div className="g2">
          <button className="btn ok" onClick={exportData}><i className="ti ti-upload" /> Exportar .json</button>
          <button className="btn" onClick={()=>document.getElementById('ii').click()}><i className="ti ti-download" /> Importar</button>
        </div>
        <input type="file" id="ii" accept=".json" style={{display:'none'}} onChange={e=>e.target.files[0]&&importData(e.target.files[0])} />
      </div>
    </>
  )
}
