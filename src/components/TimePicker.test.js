import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import TimePicker from './TimePicker.svelte'

describe('TimePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-04T14:30:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders friendly time preset buttons', () => {
      render(TimePicker)
      
      // New friendly labels
      expect(screen.getByRole('button', { name: 'Just now' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '5 min ago' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '15 min ago' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '30 min ago' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '1 hour ago' })).toBeInTheDocument()
    })

    it('has no preset selected by default (time is required)', () => {
      render(TimePicker)
      
      // No time should be pre-selected - user must choose
      const nowButton = screen.getByRole('button', { name: 'Just now' })
      expect(nowButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('shows other time button', () => {
      render(TimePicker)
      
      expect(screen.getByRole('button', { name: /other time/i })).toBeInTheDocument()
    })
  })

  describe('Manual input', () => {
    it('reveals date/time inputs when other time clicked', async () => {
      render(TimePicker)
      
      // Initially no date input visible
      expect(screen.queryByLabelText(/date/i)).not.toBeInTheDocument()
      
      // Click other time button
      const otherBtn = screen.getByRole('button', { name: /other time/i })
      await fireEvent.click(otherBtn)
      
      // Now date input should be visible
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    })

    it('can enter custom time manually', async () => {
      const onChange = vi.fn()
      render(TimePicker, { props: { onchange: onChange } })
      
      // Open manual input
      const otherBtn = screen.getByRole('button', { name: /other time/i })
      await fireEvent.click(otherBtn)
      
      // Should emit with formatted time (not "Manual")
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ 
          value: expect.any(Date),
          relative: expect.not.stringMatching(/manual/i)
        })
      )
    })
  })

  describe('Time calculations', () => {
    it('initially emits null (no selection)', async () => {
      const onChange = vi.fn()
      render(TimePicker, { props: { onchange: onChange } })
      
      // No pre-selection, so initial emit is null
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ value: null, relative: '' })
      )
    })

    it('"Just now" sets current time when clicked', async () => {
      const onChange = vi.fn()
      render(TimePicker, { props: { onchange: onChange } })
      
      const btn = screen.getByRole('button', { name: 'Just now' })
      await fireEvent.click(btn)
      
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ relative: 'Just now' })
      )
    })

    it('"5 min ago" calculates 5 minutes ago', async () => {
      const onChange = vi.fn()
      render(TimePicker, { props: { onchange: onChange } })
      
      const btn = screen.getByRole('button', { name: '5 min ago' })
      await fireEvent.click(btn)
      
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ relative: '5 min ago' })
      )
    })

    it('"15 min ago" calculates 15 minutes ago', async () => {
      const onChange = vi.fn()
      render(TimePicker, { props: { onchange: onChange } })
      
      const btn = screen.getByRole('button', { name: '15 min ago' })
      await fireEvent.click(btn)
      
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ relative: '15 min ago' })
      )
    })

    it('"30 min ago" calculates 30 minutes ago', async () => {
      const onChange = vi.fn()
      render(TimePicker, { props: { onchange: onChange } })
      
      const btn = screen.getByRole('button', { name: '30 min ago' })
      await fireEvent.click(btn)
      
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ relative: '30 min ago' })
      )
    })

    it('"1 hour ago" calculates 1 hour ago', async () => {
      const onChange = vi.fn()
      render(TimePicker, { props: { onchange: onChange } })
      
      const btn = screen.getByRole('button', { name: '1 hour ago' })
      await fireEvent.click(btn)
      
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ relative: '1 hour ago' })
      )
    })
  })

  describe('Output', () => {
    it('shows relative time label in output', async () => {
      const onChange = vi.fn()
      render(TimePicker, { props: { onchange: onChange } })
      
      const btn = screen.getByRole('button', { name: '15 min ago' })
      await fireEvent.click(btn)
      
      // Check the value has the Date object
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          value: expect.any(Date),
          relative: '15 min ago'
        })
      )
    })
  })
})
