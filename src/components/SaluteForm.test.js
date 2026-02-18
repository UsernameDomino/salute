import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/svelte'
import SaluteForm from './SaluteForm.svelte'

function createMockPhoto(name = 'test.jpg') {
  return new File(['pixel'], name, { type: 'image/jpeg' })
}

async function addPhoto(container) {
  const fileInput = container.querySelector('input[type="file"]')
  const photo = createMockPhoto()
  Object.defineProperty(fileInput, 'files', { value: [photo], configurable: true })
  await fireEvent.change(fileInput)
}

describe('SaluteForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Mock geolocation
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn()
      }
    })
  })

  describe('Form structure', () => {
    it('renders all 6 SALUTE fields in order', () => {
      const { container } = render(SaluteForm)
      const mainContent = container.querySelector('.main-content')

      expect(within(mainContent).getByText('S')).toBeInTheDocument()
      expect(within(mainContent).getByText('A')).toBeInTheDocument()
      expect(within(mainContent).getByText('L')).toBeInTheDocument()
      expect(within(mainContent).getByText('U')).toBeInTheDocument()
      expect(within(mainContent).getByText('T')).toBeInTheDocument()
      expect(within(mainContent).getByText('E')).toBeInTheDocument()
    })

    it('renders generate report button', () => {
      render(SaluteForm)

      expect(screen.getByRole('button', { name: /generate|report/i })).toBeInTheDocument()
    })

    it('renders clear button', () => {
      render(SaluteForm)

      expect(screen.getByRole('button', { name: /clear|reset/i })).toBeInTheDocument()
    })
  })

  describe('Form interaction', () => {
    it('updates Size field correctly', async () => {
      render(SaluteForm)

      const sizeBtn = screen.getByRole('button', { name: '6-10' })
      await fireEvent.click(sizeBtn)

      expect(sizeBtn).toHaveAttribute('aria-pressed', 'true')
    })

    it('updates Activity field correctly', async () => {
      render(SaluteForm)

      const activityBtn = screen.getByRole('button', { name: 'Checkpoint' })
      await fireEvent.click(activityBtn)

      expect(activityBtn).toHaveAttribute('aria-pressed', 'true')
    })

    it('renders location mode buttons', () => {
      render(SaluteForm)

      // Location field should have mode buttons
      expect(screen.getByRole('button', { name: 'Address' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Intersection' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Find my location' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Other' })).toBeInTheDocument()
    })

    it('updates Location field mode selection', async () => {
      render(SaluteForm)

      const intersectionBtn = screen.getByRole('button', { name: 'Intersection' })
      await fireEvent.click(intersectionBtn)

      expect(intersectionBtn).toHaveClass('selected')
    })
  })

  describe('Actions', () => {
    it('generates report when all required fields are filled', async () => {
      vi.stubGlobal('navigator', {
        geolocation: { getCurrentPosition: vi.fn() },
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
        share: undefined,
        canShare: undefined
      })

      const { container } = render(SaluteForm)

      await fireEvent.click(screen.getByRole('button', { name: '3-5' }))
      await fireEvent.click(screen.getByRole('button', { name: 'Patrol' }))

      const addressInput = screen.getByPlaceholderText(/123 Main St/i)
      await fireEvent.input(addressInput, { target: { value: 'Downtown plaza' } })

      await fireEvent.click(screen.getByRole('button', { name: 'Just now' }))

      await addPhoto(container)

      const generateBtn = screen.getByRole('button', { name: /generate|report/i })
      await fireEvent.click(generateBtn)

      await waitFor(() => {
        expect(screen.getByText(/SIGHTING REPORT/)).toBeInTheDocument()
      })
    })

    it('shows validation error when Generate clicked with missing required fields', async () => {
      render(SaluteForm)

      // Only fill Size - missing Activity, Location, Time
      await fireEvent.click(screen.getByRole('button', { name: '3-5' }))

      // Click generate
      const generateBtn = screen.getByRole('button', { name: /generate|report/i })
      await fireEvent.click(generateBtn)

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/required fields/i)).toBeInTheDocument()
      })
    })

    it('does not show validation error when all required fields are filled', async () => {
      vi.stubGlobal('navigator', {
        geolocation: { getCurrentPosition: vi.fn() },
        share: undefined,
        canShare: undefined
      })

      const { container } = render(SaluteForm)

      await fireEvent.click(screen.getByRole('button', { name: '3-5' }))
      await fireEvent.click(screen.getByRole('button', { name: 'Patrol' }))

      const addressInput = screen.getByPlaceholderText(/123 Main St/i)
      await fireEvent.input(addressInput, { target: { value: 'Test location' } })

      await fireEvent.click(screen.getByRole('button', { name: 'Just now' }))

      await addPhoto(container)

      const generateBtn = screen.getByRole('button', { name: /generate|report/i })
      await fireEvent.click(generateBtn)

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        expect(screen.getByText(/SIGHTING REPORT/)).toBeInTheDocument()
      })
    })

    it('validation error lists missing field names including Photos', async () => {
      render(SaluteForm)

      const generateBtn = screen.getByRole('button', { name: /generate|report/i })
      await fireEvent.click(generateBtn)

      await waitFor(() => {
        const alert = screen.getByRole('alert')
        expect(alert).toBeInTheDocument()
        expect(alert.textContent).toMatch(/size/i)
        expect(alert.textContent).toMatch(/activity/i)
        expect(alert.textContent).toMatch(/location/i)
        expect(alert.textContent).toMatch(/time/i)
        expect(alert.textContent).toMatch(/photos/i)
      })
    })

    it('renders Riot gear preset in Equipment field', () => {
      render(SaluteForm)

      expect(screen.getByRole('button', { name: 'Riot gear' })).toBeInTheDocument()
    })

    it('shows required indicators on Size, Activity, Location, Time, and Photos fields', () => {
      render(SaluteForm)

      const asterisks = screen.getAllByText('*')
      expect(asterisks.length).toBe(5)
    })

    it('clears all fields on clear button click', async () => {
      render(SaluteForm)

      // Fill a field
      let sizeBtn = screen.getByRole('button', { name: '6-10' })
      await fireEvent.click(sizeBtn)
      expect(sizeBtn).toHaveAttribute('aria-pressed', 'true')

      // Clear
      const clearBtn = screen.getByRole('button', { name: /clear|reset/i })
      await fireEvent.click(clearBtn)

      // Re-query the button after clear (components are re-rendered)
      await waitFor(() => {
        sizeBtn = screen.getByRole('button', { name: '6-10' })
        expect(sizeBtn).toHaveAttribute('aria-pressed', 'false')
      })
    })
  })

  describe('Undo functionality', () => {
    it('shows undo toast after clearing form', async () => {
      render(SaluteForm)

      // Fill a field
      const sizeBtn = screen.getByRole('button', { name: '6-10' })
      await fireEvent.click(sizeBtn)

      // Clear
      const clearBtn = screen.getByRole('button', { name: /clear|reset/i })
      await fireEvent.click(clearBtn)

      // Should show undo toast
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument()
      })
    })

    it('restores data when undo is clicked', async () => {
      render(SaluteForm)

      // Fill a field
      let sizeBtn = screen.getByRole('button', { name: '6-10' })
      await fireEvent.click(sizeBtn)
      expect(sizeBtn).toHaveAttribute('aria-pressed', 'true')

      // Clear
      const clearBtn = screen.getByRole('button', { name: /clear|reset/i })
      await fireEvent.click(clearBtn)

      // Click undo
      await waitFor(async () => {
        const undoBtn = screen.getByRole('button', { name: /undo/i })
        await fireEvent.click(undoBtn)
      })

      // Data should be restored
      await waitFor(() => {
        sizeBtn = screen.getByRole('button', { name: '6-10' })
        expect(sizeBtn).toHaveAttribute('aria-pressed', 'true')
      })
    })

    it('hides undo toast after timeout', async () => {
      vi.useFakeTimers()
      render(SaluteForm)

      // Fill and clear
      const sizeBtn = screen.getByRole('button', { name: '6-10' })
      await fireEvent.click(sizeBtn)
      const clearBtn = screen.getByRole('button', { name: /clear|reset/i })
      await fireEvent.click(clearBtn)

      // Undo should be visible
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument()
      })

      // Advance time past the timeout (5 seconds)
      vi.advanceTimersByTime(5100)

      // Undo should be hidden
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /undo/i })).not.toBeInTheDocument()
      })

      vi.useRealTimers()
    })
  })
})
