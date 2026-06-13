import { useStore } from '../store'
import { MES, DSW } from '../constants'
import { fdate, pd } from '../utils'

export default function Calendar({ presId, selFecha, noches = 1, mode = 'serv', onDayClick }) {
  const { cal, chgC, dayStatus, isBk, ctx, applyMsel, clearMsel, setCtx, sv, gp } = useStore(s => s)
  const p = gp(presId)
  const HOY = (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()

  const mes = cal
  const fd1 = (new Date(mes.getFullYear(), mes.getMonth(), 1).getDay() + 6) % 7
  const dm  = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()

  const isInRange = (ds, startDs, noches) => {
    const d = pd(ds), s = pd(startDs)
    const end = new Date(s); end.setDate(end.getDate() + (noches - 1))
    return d >= s && d <= end
  }

  const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return fdate(d) }

  const handleDayClick = (ds) => {
    const status = dayStatus(p, ds)
    if (status === 'past' || status === 'booked' || status === 'blocked') return
    if (status === 'unknown') {
      setCtx({ consultaFecha: ds, consultaPresId: presId })
      sv('consultar')
      return
    }
    const { isRangeSelectable } = useStore.getState()
    if (!isRangeSelectable(p, ds, noches)) {
      alert(`No hay ${noches} noches seguidas disponibles desde esta fecha.`)
      return
    }
    onDayClick && onDayClick(ds)
  }

  const { isAlta } = useStore.getState()
  const days = []
  for (let i = 0; i < fd1; i++) days.push(<div key={`e${i}`} />)
  for (let d = 1; d <= dm; d++) {
    const ds = fdate(new Date(mes.getFullYear(), mes.getMonth(), d))
    const s  = dayStatus(p, ds)
    const alta = isAlta(ds)
    let cls = 'dy'
    if (s === 'past')    cls += ' pas'
    else if (s === 'booked')   cls += ' bk'
    else if (s === 'blocked')  cls += ' blc'
    else if (selFecha && ds === selFecha)                                    cls += ' sel'
    else if (selFecha && noches > 1 && isInRange(ds, selFecha, noches) && ds !== selFecha) cls += ' sel-range'
    else if (s === 'available') cls += alta ? ' alta' : ' av'
    else                        cls += ' consulta'

    days.push(
      <div key={ds} className={cls} onClick={() => handleDayClick(ds)}>{d}</div>
    )
  }

  const msel = ctx.msel || []

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <button className="btn sm" onClick={() => chgC(-1)}><i className="ti ti-chevron-left" /></button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500 }}>
          {MES[mes.getMonth()]} {mes.getFullYear()}
        </span>
        <button className="btn sm" onClick={() => chgC(1)}><i className="ti ti-chevron-right" /></button>
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
        <span className="chip" style={{ background: '#EAF3DE' }}>Disponible</span>
        <span className="chip" style={{ background: '#FAEEDA' }}>Ocupado</span>
        <span className="chip" style={{ background: '#FCEBEB' }}>Bloqueado</span>
        <span className="chip">Sin confirmar</span>
      </div>
      <div className="cal">
        {DSW.map(d => <div key={d} className="ch">{d}</div>)}
        {days}
      </div>
    </div>
  )
}

export function ProviderCalendar({ presId }) {
  const { pCal, chgPC, dayStatus, isBk, ctx, setCtx, applyMsel, clearMsel, showToast, selD2 } = useStore(s => s)
  const { gp } = useStore.getState()
  const p = gp(presId)
  const HOY = (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()

  const mes = pCal
  const fd1 = (new Date(mes.getFullYear(), mes.getMonth(), 1).getDay() + 6) % 7
  const dm  = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()
  const msel = ctx.msel || []

  const days = []
  for (let i = 0; i < fd1; i++) days.push(<div key={`e${i}`} />)
  for (let d = 1; d <= dm; d++) {
    const ds = fdate(new Date(mes.getFullYear(), mes.getMonth(), d))
    const past = pd(ds) < HOY
    const bk   = useStore.getState().isBk(p.id, ds)
    let cls = 'dy'
    if (past) cls += ' pas'
    else if (bk) cls += ' bk'
    else if (p.blocked.includes(ds)) cls += ' blc'
    else if (p.available.includes(ds)) cls += ' av'
    else cls += ' consulta'
    if (!past && !bk && msel.includes(ds)) cls += ' msel'

    days.push(
      <div key={ds} className={cls} onClick={() => !past && !bk && selD2(ds)}>{d}</div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
        <span className="chip" style={{ background: '#EAF3DE' }}>Verde=disponible</span>
        <span className="chip">Gris=sin confirmar</span>
        <span className="chip" style={{ background: '#FCEBEB' }}>Rojo=bloqueado</span>
        <span className="chip" style={{ background: '#FAEEDA' }}>Amarillo=reservado</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <button className="btn sm" onClick={() => chgPC(-1)}><i className="ti ti-chevron-left" /></button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500 }}>
          {MES[mes.getMonth()]} {mes.getFullYear()}
        </span>
        <button className="btn sm" onClick={() => chgPC(1)}><i className="ti ti-chevron-right" /></button>
      </div>
      <div className="cal">
        {DSW.map(d => <div key={d} className="ch">{d}</div>)}
        {days}
      </div>
      {msel.length > 0 && (
        <div className="card" style={{ marginTop: 10 }}>
          <p style={{ fontSize: 13, marginBottom: 8 }}>
            <b>{msel.length} día{msel.length > 1 ? 's' : ''} seleccionado{msel.length > 1 ? 's' : ''}</b>
          </p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <button className="btn ok" style={{ flex: 1 }} onClick={() => applyMsel('av')}><i className="ti ti-check" /> Disponible</button>
            <button className="btn"    style={{ flex: 1 }} onClick={() => applyMsel('nc')}><i className="ti ti-minus" /> Sin confirmar</button>
            <button className="btn dr" style={{ flex: 1 }} onClick={() => applyMsel('bl')}><i className="ti ti-x" /> Bloqueado</button>
          </div>
          <button className="btn w" style={{ marginTop: 0 }} onClick={clearMsel}>Cancelar selección</button>
        </div>
      )}
    </div>
  )
}
