import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import FieldSection from './FieldSection.svelte'

describe('FieldSection', () => {
  const defaultProps = {
    letter: 'S',
    title: 'Size',
    presets: ['1-2', '3-5', '6-10', '10-20', '20+'],
    placeholder: 'Enter details...'
  }

  describe('Rendering', () => {
    it('renders field label with SALUTE letter highlighted', () => {
      render(FieldSection, { props: defaultProps })

      expect(screen.getByText('S')).toHaveClass('field-letter')
      expect(screen.getByText('Size')).toBeInTheDocument()
    })

    it('renders all preset buttons', () => {
      render(FieldSection, { props: defaultProps })

      defaultProps.presets.forEach(preset => {
        expect(screen.getByRole('button', { name: preset })).toBeInTheDocument()
      })
    })

    it('renders optional text input', () => {
      render(FieldSection, { props: defaultProps })

      expect(screen.getByPlaceholderText('Enter details...')).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('selects preset on button click', async () => {
      const onChange = vi.fn()
      render(FieldSection, {
        props: { ...defaultProps, onchange: onChange }
      })

      const button = screen.getByRole('button', { name: '3-5' })
      await fireEvent.click(button)

      expect(button).toHaveAttribute('aria-pressed', 'true')
      expect(onChange).toHaveBeenCalled()
    })

    it('deselects preset when clicking again', async () => {
      const onChange = vi.fn()
      render(FieldSection, {
        props: { ...defaultProps, onchange: onChange }
      })

      const button = screen.getByRole('button', { name: '3-5' })
      await fireEvent.click(button) // Select
      await fireEvent.click(button) // Deselect

      expect(button).toHaveAttribute('aria-pressed', 'false')
    })

    it('updates text input value', async () => {
      const onChange = vi.fn()
      render(FieldSection, {
        props: { ...defaultProps, onchange: onChange }
      })

      const input = screen.getByPlaceholderText('Enter details...')
      await fireEvent.input(input, { target: { value: 'test details' } })

      expect(input).toHaveValue('test details')
      expect(onChange).toHaveBeenCalled()
    })

    it('allows both preset and text simultaneously', async () => {
      const onChange = vi.fn()
      render(FieldSection, {
        props: { ...defaultProps, onchange: onChange }
      })

      // Select a preset
      const button = screen.getByRole('button', { name: '6-10' })
      await fireEvent.click(button)

      // Enter text
      const input = screen.getByPlaceholderText('Enter details...')
      await fireEvent.input(input, { target: { value: 'additional info' } })

      // Both should be set
      expect(button).toHaveAttribute('aria-pressed', 'true')
      expect(input).toHaveValue('additional info')
    })

    it('calls onChange with combined value', async () => {
      const onChange = vi.fn()
      render(FieldSection, {
        props: { ...defaultProps, onchange: onChange }
      })

      const button = screen.getByRole('button', { name: '6-10' })
      await fireEvent.click(button)

      // Check the onChange was called with the selected preset
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ preset: '6-10' })
      )
    })
  })

  describe('Validation', () => {
    it('shows checkmark when field has value', async () => {
      render(FieldSection, { props: defaultProps })

      // Initially no checkmark
      expect(screen.queryByText('✓')).not.toBeInTheDocument()

      // After selecting a preset
      const button = screen.getByRole('button', { name: '3-5' })
      await fireEvent.click(button)

      // Now checkmark should be visible
      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('checkmark is positioned absolutely (does not affect header alignment)', async () => {
      render(FieldSection, { props: defaultProps })

      // Select a preset to show checkmark
      const button = screen.getByRole('button', { name: '3-5' })
      await fireEvent.click(button)

      // Checkmark should have absolute positioning class
      const checkmark = screen.getByText('✓')
      expect(checkmark).toHaveClass('field-check')
    })
  })

  describe('Required indicator', () => {
    it('shows asterisk when required prop is true', () => {
      render(FieldSection, {
        props: { ...defaultProps, required: true }
      })

      expect(screen.getByText('*')).toBeInTheDocument()
      expect(screen.getByText('*')).toHaveClass('required-indicator')
    })

    it('does not show asterisk when required prop is false or missing', () => {
      render(FieldSection, { props: defaultProps })

      expect(screen.queryByText('*')).not.toBeInTheDocument()
    })
  })

  describe('Textarea functionality', () => {
    it('renders a textarea instead of input for multiline support', () => {
      render(FieldSection, { props: defaultProps })

      const textarea = screen.getByPlaceholderText('Enter details...')
      expect(textarea.tagName.toLowerCase()).toBe('textarea')
    })
  })

  describe('Multi-select mode', () => {
    it('allows multiple presets when multiSelect is true', async () => {
      render(FieldSection, {
        props: {
          ...defaultProps,
          letter: 'E',
          title: 'Equipment',
          presets: ['Small arms', 'Long guns', 'Vehicles'],
          multiSelect: true
        }
      })

      const btn1 = screen.getByRole('button', { name: 'Small arms' })
      const btn2 = screen.getByRole('button', { name: 'Vehicles' })

      await fireEvent.click(btn1)
      await fireEvent.click(btn2)

      expect(btn1).toHaveAttribute('aria-pressed', 'true')
      expect(btn2).toHaveAttribute('aria-pressed', 'true')
    })
  })
})
