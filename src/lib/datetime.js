/**
 * datetime.js - Date and time formatting utilities
 * Central location for all date/time operations
 */

/**
 * Format Date to YYYY-MM-DD string for date input
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format Date to HH:MM string (12-hour format, no period)
 * @param {Date} date
 * @returns {string}
 */
export function formatTime12(date) {
  let hours = date.getHours()
  hours = hours % 12 || 12  // Convert to 12-hour format
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Parse date and time inputs to Date object
 * @param {string} dateString - YYYY-MM-DD format
 * @param {string} timeString - HH:MM format
 * @param {string} period - 'AM' or 'PM'
 * @returns {Date|null}
 */
export function parseDateTime(dateString, timeString, period) {
  if (!dateString || !timeString) return null

  const [year, month, day] = dateString.split('-').map(Number)
  const [hours, minutes] = timeString.split(':').map(Number)

  // Convert to 24-hour
  let hours24 = hours || 0
  if (period === 'PM' && hours !== 12) {
    hours24 = hours + 12
  } else if (period === 'AM' && hours === 12) {
    hours24 = 0
  }

  const date = new Date(year, month - 1, day, hours24, minutes || 0, 0, 0)
  return date
}

/**
 * Format a Date object for display in the report
 * M/D/YYYY H:MM AM/PM format
 * @param {Date} date
 * @returns {string}
 */
export function formatForReport(date) {
  if (!date) return ''

  const month = date.getMonth() + 1
  const day = date.getDate()
  const year = date.getFullYear()
  let hours = date.getHours()
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}/${day}/${year} ${hours}:${minutes} ${period}`
}
