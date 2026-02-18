/**
 * i18n - Internationalization module with inline translations
 * Supports English and Spanish
 */
import { writable, derived, get as storeGet } from 'svelte/store'

/**
 * All translations - inline for minimal bundle size
 */
export const translations = {
  en: {
    // App
    app: {
      title: 'Report Sighting'
    },

    // Field labels
    fields: {
      size: 'Size (how many)',
      activity: 'Activity',
      location: 'Location',
      unit: 'Uniform',
      time: 'Time Observed',
      equipment: 'Equipment',
      photos: 'Photos'
    },

    // Presets by field
    presets: {
      size: {
        small: '1-2',
        medium: '3-5',
        large: '6-10',
        xlarge: '10-20',
        xxlarge: '20+'
      },
      activity: {
        checkpoint: 'Checkpoint',
        patrol: 'Patrol',
        stationary: 'Stationary',
        moving: 'Moving',
        raid: 'Raid'
      },
      location: {
        street: 'Street',
        intersection: 'Intersection',
        building: 'Building',
        park: 'Park',
        other: 'Other'
      },
      unit: {
        camouflage: 'Camouflage',
        plain_clothes: 'Plain clothes',
        police_style: 'Police-style',
        mixed: 'Mixed',
        unknown: 'Unknown'
      },
      equipment: {
        small_arms: 'Small arms',
        long_guns: 'Long guns',
        heavy_weapons: 'Heavy weapons',
        riot_gear: 'Riot gear'
      }
    },

    // Time-related
    time: {
      now: 'Now',
      minutes_ago: '{n} min ago',
      hour_ago: '1 hr ago',
      manual: 'Manual',
      custom: 'Custom time',
      just_now: 'Just now',
      '5_min': '5 min ago',
      '15_min': '15 min ago',
      '30_min': '30 min ago',
      '1_hour': '1 hour ago',
      other: 'Other time',
      date_label: 'Date',
      time_label: 'Time'
    },

    // Buttons
    buttons: {
      generate: 'Generate Report',
      clear: 'Clear',
      copy: 'Copy Report',
      share: 'Share',
      back: '← Back to Form',
      undo: 'Undo',
      add_photo: '+ Add Photo',
      remove_photo: 'Remove',
      share_text: 'Share Report Text',
      share_photos: 'Share Photos',
      copy_text: 'Copy text'
    },

    // Placeholders
    placeholders: {
      size: 'What else? e.g., some in vehicles...',
      activity: 'What else? e.g., stopping cars, checking IDs...',
      location: 'e.g., near the school, corner of 5th...',
      unit: 'What else? e.g., red armbands, covered faces...',
      equipment: 'What else? e.g., pickup trucks, body armor...',
      time: 'HH:MM'
    },

    // Messages
    messages: {
      copied: 'Copied to clipboard!',
      copy_failed: 'Failed to copy',
      cleared: 'Form cleared',
      undo_available: 'Undo',
      required_fields: 'Please fill in required fields',
      photos_count: '{n} of 5 photos',
      max_photos: 'Maximum 5 photos reached'
    },

    // Install prompt
    install: {
      banner: 'Save SALUTE for offline use',
      button: 'Save',
      ios_instructions: 'Tap the share button, then "Add to Home Screen"',
      dismiss: 'Dismiss'
    },

    // Report labels
    report: {
      title: 'SALUTE Report',
      size: 'SIZE',
      activity: 'ACTIVITY',
      location: 'LOCATION',
      unit: 'UNIFORMS',
      time: 'TIME',
      equipment: 'EQUIPMENT',
      photos: 'PHOTOS',
      photos_attached: '{n} attached'
    },

    // Explainer
    explainer: {
      button: 'What is this?',
      text: 'This app helps you quickly create and share structured sighting reports. Fill in the fields below, tap Generate, then copy and share your report. SALUTE is a standardized format for clear, complete observations:',
      size: 'Size - How many people?',
      activity: 'Activity - What are they doing?',
      location: 'Location - Where are they?',
      unit: 'Unit/Uniform - What are they wearing?',
      time: 'Time - When did you observe this?',
      equipment: 'Equipment - What gear do they have?'
    },

    // Location modes
    location_modes: {
      address: 'Address',
      intersection: 'Intersection',
      gps: 'Find my location',
      other: 'Other'
    },

    // Location labels
    location_labels: {
      street1: 'Street 1',
      street2: 'Street 2',
      address_placeholder: 'e.g., 123 Main St, Apt 4',
      intersection_placeholder: 'Enter street name',
      other_placeholder: 'e.g., near the park entrance, behind the church',
      and: 'and'
    },

    // GPS
    gps: {
      privacy_title: 'Location Privacy',
      privacy_message: 'Your location is determined by your device and only included in the report text you copy. Nothing is sent to any server.',
      confirm: 'Get My Location',
      cancel: 'Cancel',
      getting_location: 'Getting location...',
      location_found: 'Location found',
      // Error states with help text
      insecure: 'Location requires HTTPS',
      insecure_help: 'Geolocation only works on secure (HTTPS) connections.',
      denied: 'Location permission denied',
      denied_help: 'Check your browser and device location settings.',
      unavailable: 'Could not determine location',
      unavailable_help: 'Your device couldn\'t get a GPS signal. Try moving to an open area.',
      timeout: 'Location request timed out',
      timeout_help: 'Try again, preferably outdoors with clear sky.',
      error: 'Could not get location',
      error_help: 'An unknown error occurred. Please try again.'
    },

  },

  es: {
    // App
    app: {
      title: 'Reportar Sospecha'
    },

    // Field labels
    fields: {
      size: 'Cantidad (cuántos)',
      activity: 'Actividad',
      location: 'Ubicación',
      unit: 'Uniforme',
      time: 'Hora Observada',
      equipment: 'Equipo',
      photos: 'Fotos'
    },

    // Presets by field
    presets: {
      size: {
        small: '1-2',
        medium: '3-5',
        large: '6-10',
        xlarge: '10-20',
        xxlarge: '20+'
      },
      activity: {
        checkpoint: 'Puesto de control',
        patrol: 'Patrulla',
        stationary: 'Estacionario',
        moving: 'En movimiento',
        raid: 'Redada'
      },
      location: {
        street: 'Calle',
        intersection: 'Intersección',
        building: 'Edificio',
        park: 'Parque',
        other: 'Otro'
      },
      unit: {
        camouflage: 'Camuflaje',
        plain_clothes: 'Ropa civil',
        police_style: 'Estilo policial',
        mixed: 'Mixto',
        unknown: 'Desconocido'
      },
      equipment: {
        small_arms: 'Armas cortas',
        long_guns: 'Armas largas',
        heavy_weapons: 'Armas pesadas',
        riot_gear: 'Equipo antidisturbios'
      }
    },

    // Time-related
    time: {
      now: 'Ahora',
      minutes_ago: 'hace {n} min',
      hour_ago: 'hace 1 hr',
      manual: 'Manual',
      custom: 'Hora personalizada',
      just_now: 'Ahora mismo',
      '5_min': 'Hace 5 min',
      '15_min': 'Hace 15 min',
      '30_min': 'Hace 30 min',
      '1_hour': 'Hace 1 hora',
      other: 'Otra hora',
      date_label: 'Fecha',
      time_label: 'Hora'
    },

    // Buttons
    buttons: {
      generate: 'Generar Informe',
      clear: 'Limpiar',
      copy: 'Copiar Informe',
      share: 'Compartir',
      back: '← Volver al Formulario',
      undo: 'Deshacer',
      add_photo: '+ Agregar Foto',
      remove_photo: 'Eliminar',
      share_text: 'Compartir Texto',
      share_photos: 'Compartir Fotos',
      copy_text: 'Copiar texto'
    },

    // Placeholders
    placeholders: {
      size: '¿Qué más? ej., algunos en vehículos...',
      activity: '¿Qué más? ej., deteniendo autos, revisando IDs...',
      location: 'ej., cerca de la escuela, esquina de 5ta...',
      unit: '¿Qué más? ej., brazaletes rojos, caras cubiertas...',
      equipment: '¿Qué más? ej., camionetas, chalecos antibalas...',
      time: 'HH:MM'
    },

    // Messages
    messages: {
      copied: '¡Copiado al portapapeles!',
      copy_failed: 'Error al copiar',
      cleared: 'Formulario limpiado',
      undo_available: 'Deshacer',
      required_fields: 'Por favor complete los campos requeridos',
      photos_count: '{n} de 5 fotos',
      max_photos: 'Máximo 5 fotos alcanzado'
    },

    // Install prompt
    install: {
      banner: 'Guardar SALUTE para uso sin conexión',
      button: 'Guardar',
      ios_instructions: 'Toca el botón compartir, luego "Añadir a pantalla de inicio"',
      dismiss: 'Cerrar'
    },

    // Report labels
    report: {
      title: 'Informe SALUTE',
      size: 'TAMAÑO',
      activity: 'ACTIVIDAD',
      location: 'UBICACIÓN',
      unit: 'UNIFORMES',
      time: 'HORA',
      equipment: 'EQUIPO',
      photos: 'FOTOS',
      photos_attached: '{n} adjunta(s)'
    },

    // Explainer
    explainer: {
      button: '¿Qué es esto?',
      text: 'Esta aplicación te ayuda a crear y compartir informes de avistamiento estructurados rápidamente. Completa los campos, toca Generar, luego copia o comparte tu informe. SALUTE es un formato estandarizado para observaciones claras y completas:',
      size: 'Size - ¿Cuántas personas?',
      activity: 'Activity - ¿Qué están haciendo?',
      location: 'Location - ¿Dónde están?',
      unit: 'Unit/Uniform - ¿Qué llevan puesto?',
      time: 'Time - ¿Cuándo observaste esto?',
      equipment: 'Equipment - ¿Qué equipo tienen?'
    },

    // Location modes
    location_modes: {
      address: 'Dirección',
      intersection: 'Intersección',
      gps: 'Mi ubicación',
      other: 'Otro'
    },

    // Location labels
    location_labels: {
      street1: 'Calle 1',
      street2: 'Calle 2',
      address_placeholder: 'ej., Calle Principal 123, Depto 4',
      intersection_placeholder: 'Ingrese nombre de calle',
      other_placeholder: 'ej., cerca de la entrada del parque, detrás de la iglesia',
      and: 'y'
    },

    // GPS
    gps: {
      privacy_title: 'Privacidad de ubicación',
      privacy_message: 'Tu ubicación es determinada por tu dispositivo y solo se incluye en el texto del informe que copies. No se envía a ningún servidor.',
      confirm: 'Obtener mi ubicación',
      cancel: 'Cancelar',
      getting_location: 'Obteniendo ubicación...',
      location_found: 'Ubicación encontrada',
      // Error states with help text
      insecure: 'La ubicación requiere HTTPS',
      insecure_help: 'La geolocalización solo funciona en conexiones seguras (HTTPS).',
      denied: 'Permiso de ubicación denegado',
      denied_help: 'Revisa la configuración de ubicación de tu navegador y dispositivo.',
      unavailable: 'No se pudo determinar la ubicación',
      unavailable_help: 'Tu dispositivo no pudo obtener señal GPS. Intenta moverte a un área abierta.',
      timeout: 'La solicitud de ubicación agotó el tiempo',
      timeout_help: 'Intenta de nuevo, preferiblemente al aire libre con cielo despejado.',
      error: 'No se pudo obtener la ubicación',
      error_help: 'Ocurrió un error desconocido. Por favor intenta de nuevo.'
    },

  }
}

/**
 * Current locale store
 */
export const locale = writable('en')

/**
 * Set the current locale
 * @param {string} newLocale - 'en' or 'es'
 */
export function setLocale(newLocale) {
  if (translations[newLocale]) {
    locale.set(newLocale)
  }
}

/**
 * Get the current locale value
 * @returns {string} Current locale
 */
export function getLocale() {
  return storeGet(locale)
}

/**
 * Get a nested value from an object using dot notation
 * @param {object} obj - The object to traverse
 * @param {string} path - Dot-separated path (e.g., 'fields.size')
 * @returns {*} The value at the path, or undefined
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

/**
 * Interpolate variables in a string
 * @param {string} str - String with {name} placeholders
 * @param {object} values - Object with values to interpolate
 * @returns {string} Interpolated string
 */
function interpolate(str, values = {}) {
  if (!values || typeof str !== 'string') return str

  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match
  })
}

/**
 * Derived store that provides the translation function
 * Usage: $t('fields.size') or $t('time.minutes_ago', { n: 5 })
 */
export const t = derived(locale, ($locale) => {
  /**
   * Translate a key
   * @param {string} key - Dot-separated translation key
   * @param {object} values - Optional interpolation values
   * @returns {string} Translated string or the key if not found
   */
  return (key, values) => {
    const translation = getNestedValue(translations[$locale], key)

    if (translation === undefined) {
      return key
    }

    return interpolate(translation, values)
  }
})
