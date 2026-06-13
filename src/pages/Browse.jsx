import { useState } from 'react'
import { useStore } from '../store'
import { CATEGORIAS, TIPOS } from '../constants'

export default function Browse() {
  const { db, sv, ctx, setCtx } = useStore(s => s)
  const filtroCat = ctx.filtroCat || ''
  const filtroSub = ctx.filtroSub || ''
  const activos   = db.prestadores.filter(x => x.activo)

  const filtrados = activos.filter(p => {
    if (!filtroCat) return true
    return p.servicios.some(s => {
      const catMatch = (s.categorias || []).includes(filtroCat) || (s.tipo === filtroCat)
      if (!filtroSub) return catMatch
      return catMatch && (s.subcategorias || []).includes(filtroSub)
    }) || ((p.oficios || []).some(o => o.toLowerCase().includes(filtroCat)))
  })

  const catActual = CATEGORIAS[filtroCat]

  return (
    <div>
      <div className="hero-band">
        <h1>La Balsa</h1>
        <p>Turismo rural · Región del Maule</p>
        <div className="search-bar">
          <select value={filtroCat} onChange={e => setCtx({ filtroCat: e.target.value, filtroSub: '' })}>
            <option value="">Todos los servicios</option>
            {Object.entries(CATEGORIAS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button className="btn-search"><i className="ti ti-search" /> Buscar</button>
        </div>
        {catActual && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            <SubBtn active={!filtroSub} onClick={() => setCtx({ filtroSub: '' })}>Todos</SubBtn>
            {catActual.subs.map(sub => (
              <SubBtn key={sub} active={filtroSub === sub} onClick={() => setCtx({ filtroSub: sub })}>{sub}</SubBtn>
            ))}
          </div>
        )}
      </div>

      <div className="scr">
        {filtrados.length === 0 && (
          <p style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-tertiary)' }}>Sin resultados para ese filtro</p>
        )}
        {filtrados.map(p => {
          const servActivos = p.servicios.filter(s => s.activo)
          return (
            <div key={p.id} className="card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden', marginBottom: 10 }}
              onClick={() => sv('pres', { presId: p.id })}>
              {p.foto_url
                ? <img src={p.foto_url} style={{ width: '100%', height: 130, objectFit: 'cover' }} alt={p.nombre} loading="lazy" />
                : <div style={{ width: '100%', height: 70, background: `linear-gradient(135deg,${p.color},${p.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ti ti-tree" style={{ fontSize: 28, color: p.textColor, opacity: .5 }} />
                  </div>
              }
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <h3 style={{ margin: 0, fontSize: 15 }}>{p.nombre}</h3>
                  <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{servActivos.length} servicio{servActivos.length !== 1 ? 's' : ''}</span>
                </div>
                <p style={{ marginBottom: 8 }}>{p.descripcion}</p>
                <div className="card-meta">
                  {servActivos.slice(0, 3).map(s => (
                    <span key={s.id}><i className={`ti ${TIPOS[s.tipo]?.icon || 'ti-tag'}`} /> {s.nombre}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {p.certificado && <span className="badge-cert"><i className="ti ti-certificate" /> Guía Certificado</span>}
                  {p.lnt        && <span className="badge-lnt"><i className="ti ti-leaf" /> No Deje Rastro</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SubBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
      border: `1.5px solid ${active ? '#D4A017' : 'rgba(255,255,255,.3)'}`,
      background: active ? '#D4A017' : 'transparent',
      color: active ? '#1a2e1a' : 'rgba(255,255,255,.8)',
      fontFamily: 'var(--font-sans)', fontWeight: active ? 700 : 400,
    }}>{children}</button>
  )
}
