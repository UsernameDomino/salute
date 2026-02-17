import { describe, it, expect, beforeEach, vi } from 'vitest'
import { formatReport, formatForClipboard } from './formatReport.js'

describe('formatReport', () => {
  // Sample complete data
  const completeData = {
    size: { preset: '6-10', details: 'approximately 8' },
    activity: { preset: 'Checkpoint', details: 'Stopping vehicles on main road' },
    location: { mode: 'address', value: 'Near central market, main intersection', hasValue: true },
    unit: { preset: 'Camouflage', details: 'No visible insignia' },
    time: { value: new Date('2026-02-04T14:25:00'), relative: '5 min ago' },
    equipment: { presets: ['Long guns', 'Vehicles'], details: 'Pickup trucks, rifles' }
  }

  describe('Report formatting', () => {
    it('formats complete SALUTE data into readable message', () => {
      const report = formatReport(completeData)

      expect(report).toContain('SIGHTING REPORT')
      expect(report).toContain('SIZE')
      expect(report).toContain('ACTIVITY')
      expect(report).toContain('LOCATION')
      expect(report).toContain('UNIFORMS')
      expect(report).toContain('TIME')
      expect(report).toContain('EQUIPMENT')
    })

    it('handles missing optional fields gracefully', () => {
      const minimalData = {
        size: { preset: '1-2', details: '' },
        activity: { preset: 'Patrol', details: '' },
        location: { mode: 'address', value: 'Downtown area', hasValue: true },
        unit: { preset: 'Unknown', details: '' },
        time: { value: new Date(), relative: 'Now' },
        equipment: { presets: [], details: '' }
      }

      const report = formatReport(minimalData)

      expect(report).toContain('SIZE: 1-2')
      expect(report).toContain('ACTIVITY: Patrol')
      expect(report).toContain('LOCATION')
      expect(report).not.toContain('undefined')
      expect(report).not.toContain('null')
    })

    it('includes report generation timestamp', () => {
      const report = formatReport(completeData)

      // Should have a "Report generated:" line with date
      expect(report).toMatch(/Report generated: \d{4}-\d{2}-\d{2}/)
    })
  })

  describe('Location formatting', () => {
    it('includes location description when provided', () => {
      const report = formatReport(completeData)

      expect(report).toContain('Near central market, main intersection')
    })

    it('handles empty location gracefully', () => {
      const dataWithoutLocation = {
        ...completeData,
        location: { mode: 'address', value: '', hasValue: false }
      }

      const report = formatReport(dataWithoutLocation)

      expect(report).toContain('LOCATION')
      expect(report).not.toContain('undefined')
    })
  })

  describe('Edge cases', () => {
    it('escapes special characters in user input', () => {
      const dataWithSpecialChars = {
        ...completeData,
        activity: { preset: 'Other', details: 'Test <script>alert("xss")</script>' }
      }

      const report = formatReport(dataWithSpecialChars)

      // Should not contain raw HTML tags
      expect(report).not.toContain('<script>')
    })

    it('handles empty/whitespace-only fields', () => {
      const dataWithWhitespace = {
        size: { preset: '', details: '   ' },
        activity: { preset: 'Patrol', details: '' },
        location: { mode: 'address', value: '', hasValue: false },
        unit: { preset: '', details: '' },
        time: { value: new Date(), relative: 'Now' },
        equipment: { presets: [], details: '' }
      }

      const report = formatReport(dataWithWhitespace)

      // Should still produce valid output
      expect(report).toContain('SIGHTING REPORT')
      expect(report).toContain('SIZE')
    })

    it('truncates extremely long inputs gracefully', () => {
      const longText = 'A'.repeat(1000)
      const dataWithLongInput = {
        ...completeData,
        activity: { preset: 'Other', details: longText }
      }

      const report = formatReport(dataWithLongInput)

      // Should truncate or handle gracefully (not crash)
      expect(report.length).toBeLessThan(3000)
    })
  })
})

describe('formatForClipboard', () => {
  it('generates plain text suitable for copying', () => {
    const data = {
      size: { preset: '3-5', details: '' },
      activity: { preset: 'Checkpoint', details: '' },
      location: { mode: 'address', value: 'Main street', hasValue: true },
      unit: { preset: 'Unknown', details: '' },
      time: { value: new Date(), relative: 'Now' },
      equipment: { presets: [], details: '' }
    }

    const text = formatForClipboard(data)

    expect(typeof text).toBe('string')
    expect(text.length).toBeGreaterThan(0)
  })
})
