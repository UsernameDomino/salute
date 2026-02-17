import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte'
import ReportOutput from './ReportOutput.svelte'

describe('ReportOutput', () => {
  const sampleReport = `═══ SIGHTING REPORT ═══
Report generated: 2026-02-04 14:30

SIZE: 6-10 personnel
ACTIVITY: Checkpoint
    Stopping vehicles
LOCATION:
    GPS: 12.345678, -45.678901
    Desc: Near market
UNIFORMS: Camouflage
TIME OBSERVED: 14:25 (5 min ago)
EQUIPMENT: Long guns

═══════════════════════`

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('displays formatted report preview', () => {
      render(ReportOutput, { props: { report: sampleReport } })

      expect(screen.getByText(/SIGHTING REPORT/)).toBeInTheDocument()
    })

    it('shows copy button', () => {
      render(ReportOutput, { props: { report: sampleReport } })

      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    })

    it('shows share button when Web Share available', () => {
      vi.stubGlobal('navigator', { share: vi.fn() })

      render(ReportOutput, { props: { report: sampleReport } })

      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
    })

    it('hides share button when Web Share unavailable', () => {
      vi.stubGlobal('navigator', {})

      render(ReportOutput, { props: { report: sampleReport } })

      expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument()
    })
  })

  describe('Copy functionality', () => {
    it('copies report to clipboard on button click', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        clipboard: { writeText: writeTextMock }
      })

      render(ReportOutput, { props: { report: sampleReport } })

      const copyBtn = screen.getByRole('button', { name: /copy/i })
      await fireEvent.click(copyBtn)

      expect(writeTextMock).toHaveBeenCalledWith(sampleReport)
    })

    it('shows success feedback after copy', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        clipboard: { writeText: writeTextMock }
      })

      render(ReportOutput, { props: { report: sampleReport } })

      const copyBtn = screen.getByRole('button', { name: /copy/i })
      await fireEvent.click(copyBtn)

      await waitFor(() => {
        // Check for feedback div (specifically the one with success class)
        const feedback = document.querySelector('.feedback-success')
        expect(feedback).toBeInTheDocument()
      })
    })

    it('shows error feedback if copy fails', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Copy failed'))
      vi.stubGlobal('navigator', {
        clipboard: { writeText: writeTextMock }
      })

      render(ReportOutput, { props: { report: sampleReport } })

      const copyBtn = screen.getByRole('button', { name: /copy/i })
      await fireEvent.click(copyBtn)

      await waitFor(() => {
        // Check for feedback div (specifically the one with error class)
        const feedback = document.querySelector('.feedback-error')
        expect(feedback).toBeInTheDocument()
      })
    })
  })

  describe('Share functionality', () => {
    it('opens native share dialog with report text', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', { share: shareMock })

      render(ReportOutput, { props: { report: sampleReport } })

      const shareBtn = screen.getByRole('button', { name: /share/i })
      await fireEvent.click(shareBtn)

      expect(shareMock).toHaveBeenCalledWith(
        expect.objectContaining({ text: sampleReport })
      )
    })
  })
})
