import { useStore } from '../store'

export default function Nav() {
  const sv       = useStore(s => s.sv)
  const view     = useStore(s => s.view)
  const cCount   = useStore(s => s.cCount)
  const count    = cCount()
  const isCustomer = ['browse','pres','serv','servadd','cart','check','pay','ok','consultar'].includes(view)

  return (
    <nav className="nav">
      <button className="nbrand" onClick={() => sv('browse')}>
        <i className="ti ti-tree" /> La Balsa
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div className="ntabs">
          <button className={`tab ${isCustomer ? 'on' : ''}`} onClick={() => sv('browse')}>Reservar</button>
          <button className={`tab ${view === 'prestador' ? 'on' : ''}`} onClick={() => sv('prestador')}>Prestador</button>
          <button className={`tab ${view === 'admin' ? 'on' : ''}`} onClick={() => sv('admin')}>Admin</button>
        </div>
        <button className="cbtn" onClick={() => sv('cart')}>
          <i className="ti ti-shopping-cart" />
          {count > 0 && <span className="cbadge">{count}</span>}
        </button>
      </div>
    </nav>
  )
}
