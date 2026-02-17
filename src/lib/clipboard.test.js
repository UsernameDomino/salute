import { describe, it, expect, beforeEach, vi } from 'vitest'
import { copyToClipboard } from './clipboard.js'

describe('clipboard', () => {
  describe('copyToClipboard', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('copies text using navigator.clipboard when available', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        clipboard: { writeText: writeTextMock }
      })

      const result = await copyToClipboard('test text')

      expect(writeTextMock).toHaveBeenCalledWith('test text')
      expect(result.success).toBe(true)
    })

    it('falls back to execCommand when clipboard API unavailable', async () => {
      // No clipboard API
      vi.stubGlobal('navigator', {})
      
      // Mock document.execCommand
      const execCommandMock = vi.fn().mockReturnValue(true)
      vi.stubGlobal('document', {
        ...document,
        execCommand: execCommandMock,
        createElement: document.createElement.bind(document),
        body: document.body
      })

      const result = await copyToClipboard('test text')

      expect(result.success).toBe(true)
    })

    it('returns success/failure status', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        clipboard: { writeText: writeTextMock }
      })

      const result = await copyToClipboard('test')

      expect(result).toHaveProperty('success')
      expect(typeof result.success).toBe('boolean')
    })

    it('handles copy failure gracefully', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Copy failed'))
      vi.stubGlobal('navigator', {
        clipboard: { writeText: writeTextMock }
      })

      const result = await copyToClipboard('test text')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('handles empty string', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        clipboard: { writeText: writeTextMock }
      })

      const result = await copyToClipboard('')

      expect(result.success).toBe(true)
    })

    it('handles special characters', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        clipboard: { writeText: writeTextMock }
      })

      const textWithSpecialChars = 'Test: <>&"\' Special chars!'
      const result = await copyToClipboard(textWithSpecialChars)

      expect(writeTextMock).toHaveBeenCalledWith(textWithSpecialChars)
      expect(result.success).toBe(true)
    })
  })
})
