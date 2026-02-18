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

  function createMockPhotos(count = 1) {
    return Array.from({ length: count }, (_, i) =>
      new File(['pixel'], `photo${i}.jpg`, { type: 'image/jpeg' })
    )
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('displays formatted report preview', () => {
      render(ReportOutput, { props: { report: sampleReport } })

      expect(screen.getByText(/SIGHTING REPORT/)).toBeInTheDocument()
    })
  })

  describe('Mode A: No Web Share API (copy only)', () => {
    it('shows only Copy Report button when Web Share unavailable', () => {
      vi.stubGlobal('navigator', {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
      })

      render(ReportOutput, { props: { report: sampleReport } })

      expect(screen.getByRole('button', { name: /copy report/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument()
    })

    it('copies report to clipboard on button click', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        clipboard: { writeText: writeTextMock }
      })

      render(ReportOutput, { props: { report: sampleReport } })

      const copyBtn = screen.getByRole('button', { name: /copy report/i })
      await fireEvent.click(copyBtn)

      expect(writeTextMock).toHaveBeenCalledWith(sampleReport)
    })

    it('shows success feedback after copy', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        clipboard: { writeText: writeTextMock }
      })

      render(ReportOutput, { props: { report: sampleReport } })

      const copyBtn = screen.getByRole('button', { name: /copy report/i })
      await fireEvent.click(copyBtn)

      await waitFor(() => {
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

      const copyBtn = screen.getByRole('button', { name: /copy report/i })
      await fireEvent.click(copyBtn)

      await waitFor(() => {
        const feedback = document.querySelector('.feedback-error')
        expect(feedback).toBeInTheDocument()
      })
    })
  })

  describe('Mode B: Web Share available, no photos', () => {
    it('shows single Share button and small Copy button', () => {
      vi.stubGlobal('navigator', {
        share: vi.fn(),
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
      })

      render(ReportOutput, { props: { report: sampleReport, photos: [] } })

      expect(screen.getByRole('button', { name: /^share$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /copy text/i })).toBeInTheDocument()
    })

    it('calls shareText when Share button is clicked', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        share: shareMock,
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
      })

      render(ReportOutput, { props: { report: sampleReport, photos: [] } })

      const shareBtn = screen.getByRole('button', { name: /^share$/i })
      await fireEvent.click(shareBtn)

      expect(shareMock).toHaveBeenCalledWith(
        expect.objectContaining({ text: sampleReport })
      )
    })
  })

  describe('Mode B: Web Share available, with photos (two-step)', () => {
    it('shows Step 1 share text and Step 2 share photos buttons', () => {
      vi.stubGlobal('navigator', {
        share: vi.fn(),
        canShare: vi.fn().mockReturnValue(true),
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
      })

      const photos = createMockPhotos(2)
      render(ReportOutput, { props: { report: sampleReport, photos } })

      expect(screen.getByRole('button', { name: /share report text/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /share photos/i })).toBeInTheDocument()
    })

    it('Step 2 share photos button is disabled before Step 1', () => {
      vi.stubGlobal('navigator', {
        share: vi.fn(),
        canShare: vi.fn().mockReturnValue(true),
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
      })

      const photos = createMockPhotos(2)
      render(ReportOutput, { props: { report: sampleReport, photos } })

      const sharePhotosBtn = screen.getByRole('button', { name: /share photos/i })
      expect(sharePhotosBtn).toBeDisabled()
    })

    it('Step 2 becomes enabled after Step 1 is completed', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        share: shareMock,
        canShare: vi.fn().mockReturnValue(true),
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
      })

      const photos = createMockPhotos(2)
      render(ReportOutput, { props: { report: sampleReport, photos } })

      const shareTextBtn = screen.getByRole('button', { name: /share report text/i })
      await fireEvent.click(shareTextBtn)

      await waitFor(() => {
        const sharePhotosBtn = screen.getByRole('button', { name: /share photos/i })
        expect(sharePhotosBtn).not.toBeDisabled()
      })
    })

    it('shows small Copy text button alongside Step 1', () => {
      vi.stubGlobal('navigator', {
        share: vi.fn(),
        canShare: vi.fn().mockReturnValue(true),
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
      })

      const photos = createMockPhotos(1)
      render(ReportOutput, { props: { report: sampleReport, photos } })

      expect(screen.getByRole('button', { name: /copy text/i })).toBeInTheDocument()
    })

    it('Step 1 share text calls navigator.share with report text', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        share: shareMock,
        canShare: vi.fn().mockReturnValue(true),
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
      })

      const photos = createMockPhotos(1)
      render(ReportOutput, { props: { report: sampleReport, photos } })

      const shareTextBtn = screen.getByRole('button', { name: /share report text/i })
      await fireEvent.click(shareTextBtn)

      expect(shareMock).toHaveBeenCalledWith(
        expect.objectContaining({ text: sampleReport })
      )
    })

    it('shows checkmark on Step 1 after completing it', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined)
      vi.stubGlobal('navigator', {
        share: shareMock,
        canShare: vi.fn().mockReturnValue(true),
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) }
      })

      const photos = createMockPhotos(1)
      const { container } = render(ReportOutput, { props: { report: sampleReport, photos } })

      const shareTextBtn = screen.getByRole('button', { name: /share report text/i })
      await fireEvent.click(shareTextBtn)

      await waitFor(() => {
        const step1 = container.querySelector('.share-step-1')
        expect(step1.textContent).toContain('✓')
      })
    })
  })
})
