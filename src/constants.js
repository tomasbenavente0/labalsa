export const MES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
export const DSW = ['Lu','Ma','Mi','Ju','Vi','Sa','Do']

export const TIPOS = {
  noche:    { label: 'Cabaña / noche',       icon: 'ti-home-2', rf: true,  rp: false, rq: true  },
  tour:     { label: 'Experiencia / persona', icon: 'ti-users',  rf: true,  rp: true,  rq: false },
  producto: { label: 'Producto / unidad',     icon: 'ti-package',rf: false, rp: false, rq: true  },
  servicio: { label: 'Servicio precio fijo',  icon: 'ti-tool',   rf: false, rp: false, rq: false },
}

export const CCOLORS = [
  ['#E6F1FB','#0C447C'],
  ['#EAF3DE','#3B6D11'],
  ['#FAEEDA','#633806'],
  ['#EEEDFE','#3C3489'],
  ['#FAECE7','#993C1D'],
]

export const OFICIOS = ['Guía','Arriero','Hospedaje','Alimentación','Transporte','Artesanía','Conductor','Otro']

export const CATEGORIAS = {
  turismo:   { label: 'Turismo',         icon: 'ti-compass',  subs: ['Cabalgata','Travesía','Senderismo','Camping','Observación de fauna','Pesca'] },
  alimentos: { label: 'Alimentos',       icon: 'ti-salad',    subs: ['Pan artesanal','Mermeladas','Quesos','Miel','Hierbas medicinales','Huerta'] },
  hospedaje: { label: 'Hospedaje',       icon: 'ti-home-2',   subs: ['Cabaña','Camping','Arriendo de habitación'] },
  transporte:{ label: 'Transporte',      icon: 'ti-car',      subs: ['Traslado desde ciudad','Transfer aeropuerto','Transporte grupal'] },
  cultura:   { label: 'Cultura',         icon: 'ti-music',    subs: ['Taller artesanal','Música campesina','Historia local','Telar'] },
  salud:     { label: 'Salud y Bienestar',icon: 'ti-heart',   subs: ['Masoterapia','Yoga','Meditación','Plantas medicinales'] },
}

export const ETIQUETAS = [
  { id: 'autorrealizacion', label: 'Autorrealización',   color: '#6c63ff', text: '#fff' },
  { id: 'creatividad',      label: 'Creatividad',        color: '#2d9cdb', text: '#fff' },
  { id: 'inteligencia',     label: 'Inteligencia',       color: '#56ccf2', text: '#1a2e1a' },
  { id: 'educacion',        label: 'Educación',          color: '#1B4332', text: '#fff' },
  { id: 'ecologia',         label: 'Ecología',           color: '#52b788', text: '#fff' },
  { id: 'comunidad',        label: 'Comunidad',          color: '#e67e22', text: '#fff' },
  { id: 'alimentos',        label: 'Alimentos y Salud',  color: '#e74c3c', text: '#fff' },
  { id: 'seguridad',        label: 'Seguridad',          color: '#1a1a1a', text: '#fff' },
]

export const DFLT = {
  config: { comision: 10, iva: false, alta_meses: [12, 1, 2] },
  prestadores: [
    {
      id: 'fermina', nombre: 'Fermina',
      descripcion: 'Hospedaje rural a orillas del río. Ambiente familiar y tranquilo.',
      foto_url: '', pin: '1234', color: '#E6F1FB', textColor: '#0C447C', activo: true,
      servicios: [
        {
          id: 'f1', nombre: 'Cabaña rural',
          descripcion: 'Cabaña a orillas del río. Consultar disponibilidad de desayuno.',
          desc_larga: '', foto_url: '', galeria: [], precio_base: 50000, precio_alta: 60000,
          unidad: 'cabaña/noche', tipo: 'noche', iva: false, activo: true,
          capacidad: '4 personas máx.', duracion: 'Noche completa',
          horario: 'Check-in 15:00 / Check-out 11:00', ubicacion: 'La Balsa, Región del Maule',
          anticipacion: '1 día', incluye: 'Ropa de cama, Toallas, Leña, Acceso al río',
          no_incluye: 'Alimentación (consultar), Traslados', requisitos: '',
          politica: 'Cancelación gratuita hasta 48 hrs antes.', notas: 'Mascotas pequeñas consultar.',
          rel: ['f2'], duracion_dias: 1, min_dias: 1, max_dias: 1,
          precio_tipo: 'fijo', min_personas: 1, max_personas: 4,
          guia_prestadorId: '', conductor_id: '', conductor_desc: '',
          costos_fijos: [], servicios_opcionales: [], horarios: [],
          categorias: ['hospedaje'], subcategorias: ['Cabaña'],
          certificado: false, lnt: false,
        },
        {
          id: 'f2', nombre: 'Pan amasado',
          descripcion: 'Pan casero horneado al día, 500g aprox.',
          desc_larga: '', foto_url: '', galeria: [], precio_base: 2500, precio_alta: 0,
          unidad: 'unidad (500g)', tipo: 'producto', iva: false, activo: true,
          capacidad: '', duracion: '', horario: 'Desde las 08:00 hrs', ubicacion: '',
          anticipacion: '1 día', incluye: '', no_incluye: '',
          requisitos: 'Pedir con anticipación.', politica: '', notas: '', rel: [],
          duracion_dias: 1, min_dias: 1, max_dias: 1, precio_tipo: 'fijo',
          min_personas: 1, max_personas: 10,
          guia_prestadorId: '', conductor_id: '', conductor_desc: '',
          costos_fijos: [], servicios_opcionales: [], horarios: [],
          categorias: ['alimentos'], subcategorias: [],
          certificado: false, lnt: false,
        }
      ],
      paquetes: [], mode: 'mark', available: [], blocked: [],
    }
  ],
  reservas: [], consultas: [], guias: [], convocatorias: [], solicitudes: [],
}
