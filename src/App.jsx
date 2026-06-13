import { useEffect } from 'react'
import { useStore } from './store'
import { needsSetup, initEmail } from './services/email'

import Nav          from './components/Nav'
import Toast        from './components/Toast'
import Setup        from './components/Setup'

import Browse         from './pages/Browse'
import ProviderDetail from './pages/ProviderDetail'
import ServiceDetail  from './pages/ServiceDetail'
import ServiceAdd     from './pages/ServiceAdd'
import Cart           from './pages/Cart'
import Checkout       from './pages/Checkout'
import Payment        from './pages/Payment'
import Confirmation   from './pages/Confirmation'
import Inquiry        from './pages/Inquiry'
import PinLogin       from './pages/PinLogin'
import Panel          from './pages/provider/Panel'
import Admin          from './pages/admin/Admin'

export default function App() {
  const { view, skipSetup, adminOk, presId, initDB } = useStore(s => s)

  useEffect(() => {
    initEmail()
    initDB()
  }, [])

  if (needsSetup() && !skipSetup) return <Setup />

  const renderView = () => {
    switch (view) {
      case 'browse':    return <Browse />
      case 'pres':      return <ProviderDetail />
      case 'serv':      return <ServiceDetail />
      case 'servadd':   return <ServiceAdd />
      case 'cart':      return <Cart />
      case 'check':     return <Checkout />
      case 'pay':       return <Payment />
      case 'ok':        return <Confirmation />
      case 'consultar': return <Inquiry />
      case 'prestador': return presId ? <Panel /> : <PinLogin tipo="prestador" />
      case 'admin':     return adminOk ? <Admin /> : <PinLogin tipo="admin" />
      default:          return <Browse />
    }
  }

  return (
    <>
      <Nav />
      {renderView()}
      <Toast />
    </>
  )
}
