/**
 * Tests for LanguageSwitcher component
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import LanguageSwitcher from './LanguageSwitcher.svelte'
import { setLocale, getLocale } from '../lib/i18n.js'

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    // Reset to English before each test
    setLocale('en')
  })

  it('renders language toggle button', () => {
    render(LanguageSwitcher)

    // Should have a single toggle button
    expect(screen.getByRole('button')).toBeInTheDocument()
    // Should show both language options as spans
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('ES')).toBeInTheDocument()
  })

  it('shows English as active by default', () => {
    render(LanguageSwitcher)

    const enOption = screen.getByText('EN')
    expect(enOption).toHaveClass('selected')
  })

  it('switches to Spanish when toggle button is clicked', async () => {
    render(LanguageSwitcher)

    const toggleButton = screen.getByRole('button')
    await fireEvent.click(toggleButton)

    expect(getLocale()).toBe('es')
    const esOption = screen.getByText('ES')
    expect(esOption).toHaveClass('selected')
  })

  it('switches back to English when clicked again', async () => {
    setLocale('es')
    render(LanguageSwitcher)

    const toggleButton = screen.getByRole('button')
    await fireEvent.click(toggleButton)

    expect(getLocale()).toBe('en')
    const enOption = screen.getByText('EN')
    expect(enOption).toHaveClass('selected')
  })

  it('has accessible aria-label', () => {
    render(LanguageSwitcher)

    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toHaveAttribute('aria-label')
  })

  it('visually indicates the active language', () => {
    render(LanguageSwitcher)

    const enOption = screen.getByText('EN')
    const esOption = screen.getByText('ES')

    // English should be active (selected class)
    expect(enOption).toHaveClass('selected')
    expect(esOption).not.toHaveClass('selected')
  })
})
