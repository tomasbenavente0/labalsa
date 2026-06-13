import { useStore } from '../store'

export default function Setup() {
  const setSkipSetup = () => useStore.setState({ skipSetup: true })

  return (
    <div className="setup-overlay">
      <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
        <i className="ti ti-settings" style={{ fontSize: 36, color: 'var(--color-text-secondary)' }} />
        <h2 style={{ margin: '10px 0 4px' }}>Configuración inicial</h2>
        <p>Configura el correo automático en 5 minutos.</p>
      </div>

      <div className="setup-step">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
          <span className="setup-num">1</span>
          <div>
            <h3 style={{ margin: '0 0 4px' }}>Crear cuenta en EmailJS</h3>
            <p>Entra a <b>emailjs.com</b> → Sign Up gratis → conecta tu Gmail.</p>
          </div>
        </div>
        <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="btn p w" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Abrir emailjs.com →</a>
      </div>

      <div className="setup-step">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
          <span className="setup-num">2</span>
          <div>
            <h3 style={{ margin: '0 0 4px' }}>Crear template de email</h3>
            <p>EmailJS → Email Templates → Create New. Contenido:</p>
          </div>
        </div>
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-secondary)', borderRadius: 6, padding: 10, fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', marginBottom: 8 }}>
{`Nueva reserva La Balsa

Código: {{codigo}}
Cliente: {{cliente_nombre}}
Teléfono: {{cliente_tel}}
Fecha: {{fecha}} ({{noches}} noche/s)
Prestador: {{prestador}}
Total: {{total}}
Pago: {{pago}}
Nota: {{nota}}

Detalle:
{{resumen}}`}
        </div>
        <p style={{ fontSize: 12 }}>Campo <b>To Email</b>: <code>{'{{to_email}}'}</code></p>
      </div>

      <div className="setup-step">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
          <span className="setup-num">3</span>
          <div>
            <h3 style={{ margin: '0 0 4px' }}>Pegar claves en el código</h3>
            <p>Edita <code>src/services/email.js</code> y rellena las 4 variables.</p>
          </div>
        </div>
      </div>

      <div className="setup-step">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
          <span className="setup-num">4</span>
          <div>
            <h3 style={{ margin: '0 0 4px' }}>Publicar en Netlify</h3>
            <p>Corre <code>npm run build</code> y arrastra la carpeta <code>dist/</code> a Netlify Drop.</p>
          </div>
        </div>
        <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="btn p w" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Abrir Netlify Drop →</a>
      </div>

      <button className="btn w" style={{ marginTop: 4 }} onClick={() => useStore.setState({ skipSetup: true })}>
        <i className="ti ti-arrow-right" /> Continuar sin correo por ahora
      </button>
    </div>
  )
}
