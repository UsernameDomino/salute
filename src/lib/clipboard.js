/**
 * clipboard.js - Clipboard utilities with fallback for older browsers
 */

/**
 * Copies text to clipboard using modern API with fallback
 * @param {string} text - Text to copy
 * @returns {Promise<object>} - { success: boolean, error?: string }
 */
export async function copyToClipboard(text) {
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return { success: true }
    } catch (err) {
      // Fall through to fallback
      return { success: false, error: err.message }
    }
  }

  // Fallback for older browsers using execCommand
  try {
    const result = fallbackCopyToClipboard(text)
    return { success: result }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

/**
 * Fallback copy method using execCommand (deprecated but widely supported)
 * @param {string} text - Text to copy
 * @returns {boolean} - Success status
 */
function fallbackCopyToClipboard(text) {
  // Create a temporary textarea element
  const textArea = document.createElement('textarea')
  textArea.value = text

  // Prevent scrolling to bottom of page
  textArea.style.position = 'fixed'
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.width = '2em'
  textArea.style.height = '2em'
  textArea.style.padding = '0'
  textArea.style.border = 'none'
  textArea.style.outline = 'none'
  textArea.style.boxShadow = 'none'
  textArea.style.background = 'transparent'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  let success = false
  try {
    success = document.execCommand('copy')
  } catch (err) {
    success = false
  }

  document.body.removeChild(textArea)
  return success
}

/**
 * Checks if Web Share API is available
 * @returns {boolean}
 */
export function canShare() {
  return typeof navigator.share === 'function'
}

/**
 * Shares text using Web Share API
 * @param {string} text - Text to share
 * @param {string} title - Share dialog title
 * @returns {Promise<object>} - { success: boolean, error?: string }
 */
export async function shareText(text, title = 'SALUTE Report') {
  if (!canShare()) {
    return { success: false, error: 'Web Share API not supported' }
  }

  try {
    await navigator.share({
      title,
      text
    })
    return { success: true }
  } catch (err) {
    // User cancelled or error
    if (err.name === 'AbortError') {
      return { success: false, error: 'Share cancelled' }
    }
    return { success: false, error: err.message }
  }
}

/**
 * Checks if file sharing is supported via Web Share API
 * @param {File[]} files - Files to check shareability for
 * @returns {boolean}
 */
export function canShareFiles(files) {
  if (!canShare() || !navigator.canShare) return false
  try {
    return navigator.canShare({ files })
  } catch {
    return false
  }
}

/**
 * Shares text and files together using Web Share API.
 * Bundles the report text as a .txt file so apps like Signal that
 * drop the text field when files are present still deliver it.
 * @param {string} text - Report text
 * @param {File[]} files - Photo files to share
 * @param {string} title - Share dialog title
 * @returns {Promise<object>} - { success: boolean, error?: string }
 */
export async function shareWithFiles(text, files, title = 'SALUTE Report') {
  if (!canShare()) {
    return { success: false, error: 'Web Share API not supported' }
  }

  const reportFile = new File([text], 'SALUTE-Report.txt', { type: 'text/plain' })
  const allFiles = [reportFile, ...files]

  const shareData = { title }

  if (canShareFiles(allFiles)) {
    shareData.files = allFiles
  } else {
    shareData.text = text
  }

  try {
    await navigator.share(shareData)
    return { success: true }
  } catch (err) {
    if (err.name === 'AbortError') {
      return { success: false, error: 'Share cancelled' }
    }
    return { success: false, error: err.message }
  }
}
