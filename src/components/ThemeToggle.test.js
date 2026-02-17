import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte'
import ThemeToggle from './ThemeToggle.svelte'

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
    }
    vi.stubGlobal('localStorage', localStorageMock)

    // Mock matchMedia
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
    }))

    // Reset document class
    document.documentElement.classList.remove('dark')
  })

  describe('Rendering', () => {
    it('renders theme toggle button', () => {
      render(ThemeToggle)

      // Should have a single toggle button
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders sun and moon emoji icons', () => {
      render(ThemeToggle)

      expect(screen.getByText('☀️')).toBeInTheDocument()
      expect(screen.getByText('🌙')).toBeInTheDocument()
    })

    it('has aria-label for theme toggle', () => {
      render(ThemeToggle)

      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toHaveAttribute('aria-label')
    })

    it('shows light mode as selected by default', () => {
      render(ThemeToggle)

      // Slider should not have 'right' class (indicating light/sun is selected)
      const slider = document.querySelector('.slider')
      expect(slider).not.toHaveClass('right')
    })
  })

  describe('Theme Switching', () => {
    it('toggles theme when clicked', async () => {
      render(ThemeToggle)

      const toggleButton = screen.getByRole('button')
      await fireEvent.click(toggleButton)

      // localStorage should be updated
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')

      // Wait for Svelte's reactive update - slider should move right
      await waitFor(() => {
        const slider = document.querySelector('.slider')
        expect(slider).toHaveClass('right')
      })
    })

    it('toggles back to light mode when clicked again', async () => {
      render(ThemeToggle)

      const toggleButton = screen.getByRole('button')
      await fireEvent.click(toggleButton) // to dark

      // First verify dark mode
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')

      await fireEvent.click(toggleButton) // back to light

      // Second click should set light
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')

      // Slider should move back left
      await waitFor(() => {
        const slider = document.querySelector('.slider')
        expect(slider).not.toHaveClass('right')
      })
    })
  })
})
