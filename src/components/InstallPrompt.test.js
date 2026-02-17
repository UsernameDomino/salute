import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import InstallPrompt from './InstallPrompt.svelte'

describe('InstallPrompt', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Reset any global state
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0'
    })
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
  })

  describe('Browser detection', () => {
    it('shows install button when not in standalone mode', () => {
      vi.stubGlobal('matchMedia', vi.fn((query) => ({
        matches: false // Not standalone
      })))

      render(InstallPrompt)
      
      expect(screen.getByRole('button', { name: /install|add|save/i })).toBeInTheDocument()
    })
  })

  describe('Safari iOS flow', () => {
    it('shows "Add to Home Screen" button on Safari iOS', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      })
      vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))

      render(InstallPrompt)
      
      expect(screen.getByRole('button', { name: /install|add|home|save/i })).toBeInTheDocument()
    })

    it('opens instruction modal on click for Safari iOS', async () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      })
      vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))

      render(InstallPrompt)
      
      const installBtn = screen.getByRole('button', { name: /install|add|home|save/i })
      await fireEvent.click(installBtn)
      
      // Should show instructions
      expect(screen.getByText(/share/i)).toBeInTheDocument()
    })
  })

  describe('Already installed', () => {
    it('hides install UI when in standalone mode', () => {
      vi.stubGlobal('matchMedia', vi.fn((query) => ({
        matches: query === '(display-mode: standalone)'
      })))

      render(InstallPrompt)
      
      expect(screen.queryByRole('button', { name: /install|add|save/i })).not.toBeInTheDocument()
    })
  })

  describe('Dismissible banner', () => {
    beforeEach(() => {
      // Clear sessionStorage before each test
      vi.stubGlobal('sessionStorage', {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn()
      })
    })

    it('shows dismiss button on install banner', () => {
      vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))

      render(InstallPrompt)
      
      expect(screen.getByRole('button', { name: /dismiss|close/i })).toBeInTheDocument()
    })

    it('hides banner when dismiss button clicked', async () => {
      vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))

      render(InstallPrompt)
      
      const dismissBtn = screen.getByRole('button', { name: /dismiss|close/i })
      await fireEvent.click(dismissBtn)
      
      // Banner should be hidden
      expect(screen.queryByRole('button', { name: /install|add|save/i })).not.toBeInTheDocument()
    })

    it('remembers dismissal in sessionStorage', async () => {
      const setItemMock = vi.fn()
      vi.stubGlobal('sessionStorage', {
        getItem: vi.fn(() => null),
        setItem: setItemMock,
        removeItem: vi.fn()
      })
      vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))

      render(InstallPrompt)
      
      const dismissBtn = screen.getByRole('button', { name: /dismiss|close/i })
      await fireEvent.click(dismissBtn)
      
      expect(setItemMock).toHaveBeenCalledWith('salute-install-dismissed', 'true')
    })

    it('stays hidden if previously dismissed', () => {
      vi.stubGlobal('sessionStorage', {
        getItem: vi.fn(() => 'true'),
        setItem: vi.fn(),
        removeItem: vi.fn()
      })
      vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))

      render(InstallPrompt)
      
      // Banner should not be visible
      expect(screen.queryByRole('button', { name: /install|add|save/i })).not.toBeInTheDocument()
    })
  })
})
