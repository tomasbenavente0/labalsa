import { useRef, useState } from 'react'
import { useStore } from '../store'
import { fdate, uid } from '../utils'
import { sendEmails } from '../services/email'

export default function Payment() {
  const { carrito, cTotal, ctx, setCtx, db, sv, clearCart, setDB } = useStore(s => s)
  const [paying, setPaying] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const payMethodRef = useRef(null)
  const checkRef     = useRef(null)
  const total = cTotal()

  const HOY = (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()
  const fdt = d => d.toISOString().slice(0, 10)

  const confirm = async () => {
    const method = document.querySelector('input[name="pm"]:checked')?.value
    if (!method) { alert('Selecciona un método de pago'); return }
    if (!checkRef.current?.checked) { alert('Debes confirmar el pago.'); return }
    setPaying(true)
    const resId  = 'LB-' + Date.now().toString(36).toUpperCase()
    const noches = carrito.find(i => i.tipo === 'noche')?.noches || 1
    const fecha  = carrito.find(i => i.fecha)?.fecha || fdt(HOY)
    const reserva = {
      id: resId, presId: carrito[0]?.presId || '', presNombre: carrito[0]?.presNombre || '',
      nombre: ctx.nombre, tel: ctx.tel, email: ctx.email || '', nota: ctx.nota || '',
      fecha, noches, monto: total, estado: 'confirmada',
      pago: method === 'transfer' ? 'pendiente_transferencia' : 'pendiente_efectivo',
      items: [...carrito],
    }
    setDB(old => ({ ...old, reservas: [...old.reservas, reserva] }))
    try { await sendEmails(reserva, carrito) } catch {}
    setCtx({ resId, items: [...carrito] })
    clearCart()
    sv('ok')
  }

  return (
    <div className="scr">
      <h2>Pago</h2>
      <div className="alert alert-warn"><i className="ti ti-alert-triangle" /> <b>Debes pagar antes de que se confirme la reserva.</b></div>
      <div className="card">
        <p className="st" style={{ marginTop: 0 }}>Método de pago</p>
        <label className="ckb" style={{ padding: '8px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
          <input type="radio" name="pm" value="transfer" onChange={e => setShowTransfer(e.target.checked)} />
          <i className="ti ti-building-bank" /> Transferencia bancaria
        </label>
        <label className="ckb" style={{ padding: '8px 0' }}>
          <input type="radio" name="pm" value="efectivo" onChange={() => setShowTransfer(false)} />
          <i className="ti ti-cash" /> Efectivo (antes del servicio)
        </label>
      </div>
      {showTransfer && (
        <div className="alert alert-info">
          Transfiere a: <b>Tomás Benavente V.</b><br />
          RUT: _______________<br />
          Banco: _______________<br />
          Envía comprobante al <b>+56 9 61 504 690</b>
        </div>
      )}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 500 }}>Total</span>
        <span style={{ fontSize: 18, fontWeight: 500 }}>${total.toLocaleString('es-CL')}</span>
      </div>
      <div className="card">
        <p className="st" style={{ marginTop: 0 }}>Confirmación</p>
        <label className="ckb">
          <input type="checkbox" ref={checkRef} /> Declaro que he pagado o me comprometo a pagar antes del servicio.
        </label>
      </div>
      <button className="btn p w" style={{ background: '#3B6D11', borderColor: '#3B6D11' }} disabled={paying} onClick={confirm}>
        <i className="ti ti-lock" /> {paying ? 'Confirmando...' : `Confirmar reserva $${total.toLocaleString('es-CL')}`}
      </button>
    </div>
  )
}
