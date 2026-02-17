/**
 * Tests for i18n module
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { locale, t, setLocale, getLocale, translations } from './i18n.js'
import { get } from 'svelte/store'

describe('i18n module', () => {
  beforeEach(() => {
    // Reset to default locale before each test
    setLocale('en')
  })

  describe('locale store', () => {
    it('defaults to English', () => {
      expect(get(locale)).toBe('en')
    })

    it('can be set to Spanish', () => {
      setLocale('es')
      expect(get(locale)).toBe('es')
    })

    it('getLocale returns current locale', () => {
      expect(getLocale()).toBe('en')
      setLocale('es')
      expect(getLocale()).toBe('es')
    })
  })

  describe('translations object', () => {
    it('has English translations', () => {
      expect(translations.en).toBeDefined()
    })

    it('has Spanish translations', () => {
      expect(translations.es).toBeDefined()
    })

    it('has matching keys in both languages', () => {
      const enKeys = Object.keys(translations.en)
      const esKeys = Object.keys(translations.es)
      expect(enKeys.sort()).toEqual(esKeys.sort())
    })
  })

  describe('t() translation function', () => {
    it('returns English text by default', () => {
      const translate = get(t)
      expect(translate('fields.size')).toBe('Size (how many)')
    })

    it('returns Spanish text when locale is es', () => {
      setLocale('es')
      const translate = get(t)
      expect(translate('fields.size')).toBe('Cantidad (cuántos)')
    })

    it('supports nested keys with dot notation', () => {
      const translate = get(t)
      expect(translate('presets.size.small')).toBe('1-2')
    })

    it('returns the key if translation not found', () => {
      const translate = get(t)
      expect(translate('nonexistent.key')).toBe('nonexistent.key')
    })

    it('supports interpolation with {name} syntax', () => {
      const translate = get(t)
      // e.g., "5 min ago" could be "{n} min ago" with n=5
      expect(translate('time.minutes_ago', { n: 5 })).toBe('5 min ago')
    })

    it('handles missing interpolation values gracefully', () => {
      const translate = get(t)
      expect(translate('time.minutes_ago')).toBe('{n} min ago')
    })
  })

  describe('field labels', () => {
    it('translates Size field', () => {
      const translate = get(t)
      expect(translate('fields.size')).toBe('Size (how many)')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('fields.size')).toBe('Cantidad (cuántos)')
    })

    it('translates Activity field', () => {
      const translate = get(t)
      expect(translate('fields.activity')).toBe('Activity')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('fields.activity')).toBe('Actividad')
    })

    it('translates Location field', () => {
      const translate = get(t)
      expect(translate('fields.location')).toBe('Location')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('fields.location')).toBe('Ubicación')
    })

    it('translates Unit field', () => {
      const translate = get(t)
      expect(translate('fields.unit')).toBe('Uniform')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('fields.unit')).toBe('Uniforme')
    })

    it('translates Time field', () => {
      const translate = get(t)
      expect(translate('fields.time')).toBe('Time Observed')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('fields.time')).toBe('Hora Observada')
    })

    it('translates Equipment field', () => {
      const translate = get(t)
      expect(translate('fields.equipment')).toBe('Equipment')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('fields.equipment')).toBe('Equipo')
    })
  })

  describe('button labels', () => {
    it('translates Generate Report button', () => {
      const translate = get(t)
      expect(translate('buttons.generate')).toBe('Generate Report')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('buttons.generate')).toBe('Generar Informe')
    })

    it('translates Clear button', () => {
      const translate = get(t)
      expect(translate('buttons.clear')).toBe('Clear')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('buttons.clear')).toBe('Limpiar')
    })

    it('translates Copy button', () => {
      const translate = get(t)
      expect(translate('buttons.copy')).toBe('Copy Report')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('buttons.copy')).toBe('Copiar Informe')
    })

    it('translates Share button', () => {
      const translate = get(t)
      expect(translate('buttons.share')).toBe('Share')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('buttons.share')).toBe('Compartir')
    })

    it('translates Back button', () => {
      const translate = get(t)
      expect(translate('buttons.back')).toBe('← Back to Form')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('buttons.back')).toBe('← Volver al Formulario')
    })
  })

  describe('time presets', () => {
    it('translates Now preset', () => {
      const translate = get(t)
      expect(translate('time.now')).toBe('Now')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('time.now')).toBe('Ahora')
    })

    it('translates relative time labels', () => {
      const translate = get(t)
      expect(translate('time.minutes_ago', { n: 5 })).toBe('5 min ago')
      expect(translate('time.minutes_ago', { n: 15 })).toBe('15 min ago')
      expect(translate('time.hour_ago')).toBe('1 hr ago')
      
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('time.minutes_ago', { n: 5 })).toBe('hace 5 min')
      expect(translateEs('time.hour_ago')).toBe('hace 1 hr')
    })
  })

  describe('messages', () => {
    it('translates copied success message', () => {
      const translate = get(t)
      expect(translate('messages.copied')).toBe('Copied to clipboard!')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('messages.copied')).toBe('¡Copiado al portapapeles!')
    })

    it('translates copy failed message', () => {
      const translate = get(t)
      expect(translate('messages.copy_failed')).toBe('Failed to copy')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('messages.copy_failed')).toBe('Error al copiar')
    })
  })

  describe('install prompt', () => {
    it('translates install banner text', () => {
      const translate = get(t)
      expect(translate('install.banner')).toBe('Save SALUTE for offline use')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('install.banner')).toBe('Guardar SALUTE para uso sin conexión')
    })

    it('translates install button', () => {
      const translate = get(t)
      expect(translate('install.button')).toBe('Save')
      setLocale('es')
      const translateEs = get(t)
      expect(translateEs('install.button')).toBe('Guardar')
    })
  })
})
