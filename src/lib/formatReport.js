/**
 * formatReport.js - Generates SALUTE report text
 */

import { formatForReport as formatDateTimeForReport } from './datetime.js'

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Truncates text to a maximum length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function truncate(text, maxLength = 500) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}


/**
 * Formats a SALUTE field value (preset + details)
 * @param {object} field - { preset, details } or { presets, details }
 * @returns {string}
 */
function formatFieldValue(field) {
  if (!field) return 'Unknown'

  let value = ''

  // Handle array of presets (for equipment)
  if (Array.isArray(field.presets)) {
    value = field.presets.length > 0 ? field.presets.join(', ') : ''
  } else if (field.preset) {
    value = field.preset
  }

  const details = field.details?.trim()

  if (value && details) {
    return `${escapeHtml(value)}\n    ${escapeHtml(truncate(details))}`
  } else if (value) {
    return escapeHtml(value)
  } else if (details) {
    return escapeHtml(truncate(details))
  }

  return 'Not specified'
}

/**
 * Formats the location field (new format with mode)
 * @param {object} locationField - { mode, value, hasValue }
 * @returns {string}
 */
function formatLocation(locationField) {
  if (!locationField || !locationField.hasValue) return 'Not specified'

  return escapeHtml(truncate(locationField.value))
}

/**
 * Formats the time field
 * @param {object} timeField - { value: Date, relative: string }
 * @returns {string}
 */
function formatTime(timeField) {
  if (!timeField || !timeField.value) return 'Unknown'
  return formatDateTimeForReport(timeField.value)
}


/**
 * Generates a complete SALUTE report
 * @param {object} data - SALUTE data object
 * @returns {string}
 */
export function formatReport(data) {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timeStr = now.toTimeString().slice(0, 5)

  const report = `═══ SIGHTING REPORT ═══
Report generated: ${dateStr} ${timeStr}

SIZE: ${formatFieldValue(data.size)}
ACTIVITY: ${formatFieldValue(data.activity)}
LOCATION: ${formatLocation(data.location)}
UNIFORMS: ${formatFieldValue(data.unit)}
TIME OBSERVED: ${formatTime(data.time)}
EQUIPMENT: ${formatFieldValue(data.equipment)}

═══════════════════════`

  return report
}

/**
 * Formats report for clipboard (alias for formatReport)
 * @param {object} data - SALUTE data object
 * @returns {string}
 */
export function formatForClipboard(data) {
  return formatReport(data)
}
