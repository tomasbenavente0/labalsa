import emailjs from '@emailjs/browser'

export const EMAILJS_PUBLIC_KEY  = '1z55-Z_VGGMmP5R3o'
export const EMAILJS_SERVICE_ID  = 'service_51wzam4'
export const EMAILJS_TEMPLATE_ID = 'template_xyg5zyt'
export const EMAIL_TOMAS         = 'tomas.benavente0@gmail.com'
export const EMAIL_FERMINA       = ''

export function initEmail() {
  if (EMAILJS_PUBLIC_KEY) emailjs.init(EMAILJS_PUBLIC_KEY)
}

export function needsSetup() {
  return !EMAILJS_PUBLIC_KEY || !EMAIL_TOMAS
}

import { fdd } from '../utils'

export async function sendEmails(reserva, items) {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) return
  const resumen = items.map(i =>
    `• ${i.nombre}${i.noches > 1 ? ' (' + i.noches + ' noches)' : ''}: $${i.total.toLocaleString('es-CL')}`
  ).join('\n')
  const params = {
    codigo: reserva.id,
    cliente_nombre: reserva.nombre,
    cliente_tel: reserva.tel,
    cliente_email: reserva.email || 'No indicado',
    fecha: fdd(reserva.fecha),
    noches: reserva.noches || 1,
    prestador: reserva.presNombre,
    resumen,
    total: '$' + reserva.monto.toLocaleString('es-CL'),
    pago: reserva.pago,
    nota: reserva.nota || '—',
    email_tomas: EMAIL_TOMAS,
    email_fermina: EMAIL_FERMINA,
    to_email: reserva.email || EMAIL_TOMAS,
  }
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
  } catch (e) {
    console.warn('Email error:', e)
  }
}
