import { useStore } from '../store'
import { fdd } from '../utils'

export default function Cart() {
  const { carrito, cTotal, cCount, rmCart, sv } = useStore(s => s)
  const total = cTotal()
  const count = cCount()

  if (!count) return (
    <div className="scr" style={{ textAlign: 'center', padding: '40px 0' }}>
      <i className="ti ti-shopping-cart" style={{ fontSize: 36, color: 'var(--color-text-secondary)' }} />
      <h2 style={{ margin: '12px 0 6px' }}>Carrito vacío</h2>
      <button className="btn p w" onClick={() => sv('browse')} style={{ maxWidth: 180, display: 'block', margin: '12px auto' }}>Ver servicios</button>
    </div>
  )

  return (
    <div className="scr">
      <h2>Carrito</h2>
      {carrito.map((it, i) => (
        <div key={it.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 2px' }}>{it.nombre}</h3>
              <p style={{ fontSize: 12 }}>
                {it.presNombre}
                {it.fecha ? ' · ' + fdd(it.fecha) : ''}
                {it.noches > 1 ? ` · ${it.noches} noches` : ''}
                {it.q > 1 ? ` · ${it.q} uds` : ''}
                {it.opcionales?.length ? ' · ' + it.opcionales.map(o => o.nombre).join(', ') : ''}
              </p>
              {it.esAlta && <span className="bx rj" style={{ fontSize: 10 }}><i className="ti ti-sun" /> alta</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>${it.total.toLocaleString('es-CL')}</span>
              <button className="btn sm dr" onClick={() => rmCart(i)}><i className="ti ti-x" /></button>
            </div>
          </div>
        </div>
      ))}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 500 }}>Total</span>
        <span style={{ fontSize: 18, fontWeight: 500 }}>${total.toLocaleString('es-CL')}</span>
      </div>
      <button className="btn p w" onClick={() => sv('check')}>Ir al checkout</button>
      <button className="btn w" onClick={() => sv('browse')}>Seguir agregando</button>
    </div>
  )
}
