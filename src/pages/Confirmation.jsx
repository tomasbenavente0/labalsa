import { useStore } from '../store'
import { fdd } from '../utils'

export default function Confirmation() {
  const { ctx, sv } = useStore(s => s)
  return (
    <div className="scr" style={{ textAlign: 'center', padding: '24px 0' }}>
      <i className="ti ti-circle-check" style={{ fontSize: 44, color: '#3B6D11' }} />
      <h2 style={{ margin: '12px 0 6px' }}>¡Reserva confirmada!</h2>
      <p>Recibirás confirmación{ctx.email ? ' a ' + ctx.email : ''}.</p>
      <p style={{ marginTop: 4 }}>Contactaremos al <b>{ctx.tel}</b> para verificar el pago.</p>
      <div className="card" style={{ textAlign: 'left', marginTop: 16 }}>
        {(ctx.items || []).map((it, i) => (
          <div key={i} className="row">
            <span>{it.nombre}{it.noches > 1 ? ` (${it.noches} noches)` : ''}</span>
            <span style={{ fontWeight: 500 }}>${it.total.toLocaleString('es-CL')}</span>
          </div>
        ))}
        <div className="row" style={{ border: 'none' }}>
          <span style={{ fontWeight: 500 }}>Código</span>
          <span style={{ fontWeight: 500 }}>{ctx.resId || ''}</span>
        </div>
      </div>
      <button className="btn p w" style={{ maxWidth: 200, display: 'block', margin: '8px auto' }} onClick={() => sv('browse')}>
        Nueva reserva
      </button>
    </div>
  )
}
