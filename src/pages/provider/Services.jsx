import { useState } from 'react'
import { useStore } from '../../store'
import { TIPOS, CATEGORIAS, OFICIOS } from '../../constants'
import { uid } from '../../utils'

export default function Services({ presId }) {
  const { db, gp, gs, calcP, togServ, setDB, solicitarCambio, showToast } = useStore(s => s)
  const p = gp(presId)
  const [editId,   setEditId]   = useState(null)
  const [showNew,  setShowNew]  = useState(false)
  const [newServ,  setNewServ]  = useState({ nombre:'', descripcion:'', precio_base:0, precio_alta:0, unidad:'unidad', tipo:'noche', duracion_dias:1 })

  const saveNew = () => {
    if (!newServ.nombre || !newServ.precio_base) { alert('Nombre y precio son obligatorios'); return }
    setDB(old => ({
      ...old, prestadores: old.prestadores.map(pr => pr.id !== presId ? pr : {
        ...pr, servicios: [...pr.servicios, {
          id: 's' + uid(), ...newServ, desc_larga:'', foto_url:'', galeria:[],
          iva:false, activo:true, certificado:false, lnt:false,
          guia_prestadorId:'', conductor_id:'', conductor_desc:'',
          costos_fijos:[], servicios_opcionales:[], horarios:[],
          categorias:[], subcategorias:[], rel:[],
          precio_tipo:'fijo', min_personas:1, max_personas:10,
          min_dias: newServ.duracion_dias, max_dias: newServ.duracion_dias,
          capacidad:'', duracion:'', horario:'', ubicacion:'',
          anticipacion:'', incluye:'', no_incluye:'', requisitos:'', politica:'', notas:'',
        }]
      })
    }))
    setShowNew(false)
    setNewServ({ nombre:'', descripcion:'', precio_base:0, precio_alta:0, unidad:'unidad', tipo:'noche', duracion_dias:1 })
  }

  if (!p) return null

  return (
    <>
      {p.servicios.map(s => {
        const editing = editId === s.id
        const pr = calcP(s)
        const dias = s.duracion_dias || 1
        const maxP = s.max_personas || 1
        const g    = s.guia_prestadorId ? (db.guias || []).find(x => x.id === s.guia_prestadorId) : null
        const gC   = g ? (g.tarifa_tipo === 'dia' ? g.tarifa * dias : g.tarifa * maxP * dias) : 0
        const cfTotal = Array.isArray(s.costos_fijos) ? s.costos_fijos.reduce((a,cf)=>{const base=cf.precio_unit*(cf.cantidad||1);return a+(cf.por_dia?base*dias:base);},0) : 0
        const ganancia = s.precio_base * (s.precio_tipo === 'por_persona' ? maxP : 1) - gC - cfTotal

        return (
          <div key={s.id} className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
              <h3 style={{ margin:0, flex:1 }}>
                {s.nombre}
                {!s.activo && <span className="bx am" style={{ marginLeft:6 }}>oculto</span>}
              </h3>
              <div style={{ display:'flex', gap:4, flexShrink:0, marginLeft:6 }}>
                <button className="btn sm" onClick={() => setEditId(editing ? null : s.id)}>
                  {editing ? <><i className="ti ti-x" /></> : <><i className="ti ti-pencil" /> Editar</>}
                </button>
                <button className={`btn sm ${s.activo ? 'dr' : 'ok'}`} onClick={() => togServ(presId, s.id)}>
                  {s.activo ? 'Ocultar' : 'Activar'}
                </button>
              </div>
            </div>

            {!editing && (
              <div style={{ background:'#0d2b1a', borderRadius:12, padding:'8px 10px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                  <span style={{ color:'rgba(255,255,255,.5)' }}>Tu precio</span>
                  <span style={{ color:'#fff', fontWeight:600 }}>${s.precio_base.toLocaleString('es-CL')} {s.precio_tipo==='por_persona'?'/ persona':'fijo'}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                  <span style={{ color:'rgba(255,255,255,.5)' }}>+ Plataforma ({db.config.comision}%)</span>
                  <span style={{ color:'#D4A017' }}>${Math.round(s.precio_base*db.config.comision/100).toLocaleString('es-CL')}</span>
                </div>
                {g && <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                  <span style={{ color:'rgba(255,255,255,.5)' }}>Guía: {g.nombre}</span>
                  <span style={{ color:'#e74c3c' }}>-${gC.toLocaleString('es-CL')}</span>
                </div>}
                {cfTotal > 0 && <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                  <span style={{ color:'rgba(255,255,255,.5)' }}>Costos fijos</span>
                  <span style={{ color:'#9b59b6' }}>-${cfTotal.toLocaleString('es-CL')}</span>
                </div>}
                <div style={{ borderTop:'1px solid rgba(255,255,255,.15)', paddingTop:4, display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:700 }}>
                  <span style={{ color:'rgba(255,255,255,.7)' }}>Cliente paga</span>
                  <span style={{ color:'#D4A017' }}>${pr.total.toLocaleString('es-CL')}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginTop:3 }}>
                  <span style={{ color:'rgba(255,255,255,.4)' }}>Tu ganancia ({maxP} pers.)</span>
                  <span style={{ color: ganancia>0?'#52b788':'#e74c3c', fontWeight:600 }}>${ganancia.toLocaleString('es-CL')}</span>
                </div>
              </div>
            )}

            {editing && <EditServForm presId={presId} s={s} onClose={() => setEditId(null)} />}
          </div>
        )
      })}

      <button className="btn ok w" onClick={() => setShowNew(!showNew)}>
        <i className="ti ti-plus" /> Agregar servicio
      </button>

      {showNew && (
        <div className="card" style={{ marginTop:8 }}>
          <h3>Nuevo servicio</h3>
          <span className="lbl">Nombre *</span>
          <input value={newServ.nombre} onChange={e => setNewServ(x=>({...x,nombre:e.target.value}))} placeholder="Nombre" />
          <span className="lbl">Descripción *</span>
          <input value={newServ.descripcion} onChange={e => setNewServ(x=>({...x,descripcion:e.target.value}))} placeholder="Descripción" />
          <div className="g2">
            <div><span className="lbl">Precio normal *</span><input type="number" value={newServ.precio_base||''} onChange={e => setNewServ(x=>({...x,precio_base:+e.target.value}))} placeholder="0" /></div>
            <div><span className="lbl">Precio alta (0=igual)</span><input type="number" value={newServ.precio_alta||''} onChange={e => setNewServ(x=>({...x,precio_alta:+e.target.value}))} placeholder="0" /></div>
          </div>
          <div className="g2">
            <div><span className="lbl">Unidad</span><input value={newServ.unidad} onChange={e => setNewServ(x=>({...x,unidad:e.target.value}))} placeholder="noche, unidad..." /></div>
            <div><span className="lbl">Tipo</span>
              <select value={newServ.tipo} onChange={e => setNewServ(x=>({...x,tipo:e.target.value}))}>
                {Object.entries(TIPOS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <button className="btn ok" style={{flex:1}} onClick={saveNew}>Crear</button>
            <button className="btn" style={{flex:1}} onClick={()=>setShowNew(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  )
}

function EditServForm({ presId, s, onClose }) {
  const { db, setDB, showToast } = useStore(st => st)
  const [form, setForm] = useState({
    nombre: s.nombre, descripcion: s.descripcion, desc_larga: s.desc_larga||'',
    precio_base: s.precio_base, precio_alta: s.precio_alta||0,
    unidad: s.unidad, tipo: s.tipo, iva: s.iva||false, certificado: s.certificado||false, lnt: s.lnt||false,
    foto_url: s.foto_url||'', galeria: (s.galeria||[]).join('\n'),
    duracion_dias: s.duracion_dias||1, min_dias: s.min_dias||1, max_dias: s.max_dias||1,
    precio_tipo: s.precio_tipo||'fijo', min_personas: s.min_personas||1, max_personas: s.max_personas||10,
    guia_prestadorId: s.guia_prestadorId||'', conductor_id: s.conductor_id||'',
    conductor_desc: s.conductor_desc||'',
    duracion: s.duracion||'', horario: s.horario||'', ubicacion: s.ubicacion||'',
    anticipacion: s.anticipacion||'', incluye: s.incluye||'', no_incluye: s.no_incluye||'',
    requisitos: s.requisitos||'', politica: s.politica||'', notas: s.notas||'',
    categorias: s.categorias||[], subcategorias: s.subcategorias||[],
  })
  const f = k => e => setForm(x=>({...x,[k]: e.target.type==='checkbox'?e.target.checked:e.target.value}))

  const save = () => {
    const gal = form.galeria.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,4)
    setDB(old => ({
      ...old, prestadores: old.prestadores.map(p => p.id !== presId ? p : {
        ...p, servicios: p.servicios.map(sv => sv.id !== s.id ? sv : {
          ...sv, ...form, galeria: gal,
          precio_base: +form.precio_base, precio_alta: +form.precio_alta,
          duracion_dias: +form.duracion_dias, min_dias: +form.min_dias, max_dias: +form.max_dias,
          min_personas: +form.min_personas, max_personas: +form.max_personas,
        })
      })
    }))
    showToast('✓ Guardado')
    onClose()
  }

  const allGuias = [...(db.guias||[]), ...db.prestadores.filter(p=>p.id!==presId&&(p.oficios||[]).some(o=>['Guía','Arriero','Conductor'].includes(o)))]
    .filter((v,i,a)=>a.findIndex(x=>x.id===v.id)===i)

  return (
    <>
      <hr className="sep" />
      <p className="st" style={{marginTop:0}}>Precio</p>
      <div className="g2">
        <div><span className="lbl">Precio base</span><input type="number" value={form.precio_base} onChange={f('precio_base')} /></div>
        <div><span className="lbl">Precio alta (0=igual)</span><input type="number" value={form.precio_alta} onChange={f('precio_alta')} /></div>
      </div>
      <p className="st">Información</p>
      <span className="lbl">Nombre</span><input value={form.nombre} onChange={f('nombre')} />
      <span className="lbl">Descripción corta</span><input value={form.descripcion} onChange={f('descripcion')} />
      <span className="lbl">Descripción larga</span><textarea rows={2} style={{resize:'none'}} value={form.desc_larga} onChange={f('desc_larga')} />
      <div className="g2">
        <div><span className="lbl">Unidad</span><input value={form.unidad} onChange={f('unidad')} /></div>
        <div><span className="lbl">Tipo</span>
          <select value={form.tipo} onChange={f('tipo')}>
            {Object.entries(TIPOS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>
      <label className="ckb"><input type="checkbox" checked={form.iva} onChange={f('iva')} /> Aplicar IVA (19%)</label>
      <label className="ckb"><input type="checkbox" checked={form.certificado} onChange={f('certificado')} /> Guía Certificado</label>
      <label className="ckb"><input type="checkbox" checked={form.lnt} onChange={f('lnt')} /> No Deje Rastro (LNT)</label>
      <p className="st">Fotos (URL)</p>
      <span className="lbl">Foto principal</span><input value={form.foto_url} onChange={f('foto_url')} placeholder="https://..." />
      <span className="lbl">Galería (una URL por línea)</span><textarea rows={3} style={{resize:'none'}} value={form.galeria} onChange={f('galeria')} />
      <p className="st">Detalles</p>
      <div className="g2">
        <div><span className="lbl">Días mínimo</span><input type="number" min={1} value={form.min_dias} onChange={f('min_dias')} /></div>
        <div><span className="lbl">Días máximo</span><input type="number" min={1} value={form.max_dias} onChange={f('max_dias')} /></div>
      </div>
      <div className="g2">
        <div><span className="lbl">Días por defecto</span><input type="number" min={1} value={form.duracion_dias} onChange={f('duracion_dias')} /></div>
        <div><span className="lbl">Modelo de precio</span>
          <select value={form.precio_tipo} onChange={f('precio_tipo')}>
            <option value="fijo">Precio fijo (grupo completo)</option>
            <option value="por_persona">Precio por persona</option>
          </select>
        </div>
      </div>
      <div className="g2">
        <div><span className="lbl">Mín. personas</span><input type="number" min={1} value={form.min_personas} onChange={f('min_personas')} /></div>
        <div><span className="lbl">Máx. personas</span><input type="number" min={1} value={form.max_personas} onChange={f('max_personas')} /></div>
      </div>
      <p className="st">Categorías</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
        {Object.entries(CATEGORIAS).map(([k,v])=>(
          <label key={k} className="ckb" style={{fontSize:12}}>
            <input type="checkbox" checked={form.categorias.includes(k)}
              onChange={e => setForm(x=>({...x, categorias: e.target.checked ? [...x.categorias,k] : x.categorias.filter(c=>c!==k)}))} />
            <i className={`ti ${v.icon}`} /> {v.label}
          </label>
        ))}
      </div>
      <span className="lbl">Guía requerido</span>
      <select value={form.guia_prestadorId} onChange={f('guia_prestadorId')}>
        <option value="">— Sin guía —</option>
        {allGuias.map(g=><option key={g.id} value={g.id}>{g.nombre} · {(g.oficios||[]).join(', ')}{g.tarifa?` · $${g.tarifa}/${g.tarifa_tipo==='hora'?'hr':'día'}`:''}</option>)}
      </select>
      <span className="lbl">Conductor (opcional)</span>
      <select value={form.conductor_id} onChange={f('conductor_id')}>
        <option value="">— Sin conductor —</option>
        {allGuias.map(g=><option key={g.id} value={g.id}>{g.nombre} · {(g.oficios||[]).join(', ')}</option>)}
      </select>
      <p className="st">Información adicional</p>
      <div className="g2">
        <div><span className="lbl">Duración (texto)</span><input value={form.duracion} onChange={f('duracion')} /></div>
        <div><span className="lbl">Horario</span><input value={form.horario} onChange={f('horario')} /></div>
      </div>
      <div className="g2">
        <div><span className="lbl">Anticipación</span><input value={form.anticipacion} onChange={f('anticipacion')} /></div>
        <div><span className="lbl">Ubicación</span><input value={form.ubicacion} onChange={f('ubicacion')} /></div>
      </div>
      <p className="st">Incluye / No incluye</p>
      <span className="lbl">Incluye (comas)</span><input value={form.incluye} onChange={f('incluye')} />
      <span className="lbl">No incluye (comas)</span><input value={form.no_incluye} onChange={f('no_incluye')} />
      <p className="st">Políticas</p>
      <span className="lbl">Requisitos</span><textarea rows={2} style={{resize:'none'}} value={form.requisitos} onChange={f('requisitos')} />
      <span className="lbl">Cancelación</span><textarea rows={2} style={{resize:'none'}} value={form.politica} onChange={f('politica')} />
      <span className="lbl">Notas</span><textarea rows={2} style={{resize:'none'}} value={form.notas} onChange={f('notas')} />
      <div style={{ display:'flex', gap:8, marginTop:10 }}>
        <button className="btn ok" style={{flex:1}} onClick={save}><i className="ti ti-check" /> Guardar</button>
        <button className="btn"    style={{flex:1}} onClick={onClose}>Cancelar</button>
      </div>
    </>
  )
}
