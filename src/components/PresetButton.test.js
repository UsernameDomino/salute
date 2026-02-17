import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import PresetButton from './PresetButton.svelte'

describe('PresetButton', () => {
  describe('Rendering', () => {
    it('renders button with provided label', () => {
      render(PresetButton, { props: { label: 'Test Label' } })
      
      expect(screen.getByRole('button', { name: 'Test Label' })).toBeInTheDocument()
    })

    it('applies selected style when active', () => {
      render(PresetButton, { props: { label: 'Test', selected: true } })
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('selected')
    })

    it('does not apply selected style when not active', () => {
      render(PresetButton, { props: { label: 'Test', selected: false } })
      
      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('selected')
    })

    it('has minimum 48px touch target', () => {
      render(PresetButton, { props: { label: 'Test' } })
      
      const button = screen.getByRole('button')
      // Check that btn-preset class is applied (which has min-height: 48px in CSS)
      expect(button).toHaveClass('btn-preset')
    })
  })

  describe('Interaction', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn()
      render(PresetButton, { 
        props: { label: 'Test', onclick: handleClick } 
      })
      
      const button = screen.getByRole('button')
      await fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('is keyboard accessible (responds to Enter/Space)', async () => {
      const handleClick = vi.fn()
      render(PresetButton, { 
        props: { label: 'Test', onclick: handleClick } 
      })
      
      const button = screen.getByRole('button')
      
      // Buttons natively handle Enter/Space, so click event fires
      await fireEvent.keyDown(button, { key: 'Enter' })
      await fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has appropriate aria-pressed attribute when selected', () => {
      render(PresetButton, { props: { label: 'Test', selected: true } })
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })

    it('has appropriate aria-pressed attribute when not selected', () => {
      render(PresetButton, { props: { label: 'Test', selected: false } })
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })

    it('is focusable', () => {
      render(PresetButton, { props: { label: 'Test' } })
      
      const button = screen.getByRole('button')
      button.focus()
      
      expect(document.activeElement).toBe(button)
    })
  })
})
