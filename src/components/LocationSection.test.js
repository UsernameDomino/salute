import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte'
import LocationSection from './LocationSection.svelte'

describe('LocationSection', () => {
  let originalLocation
  let originalGeolocation

  beforeEach(() => {
    // Store originals
    originalLocation = window.location
    originalGeolocation = navigator.geolocation

    // Default to secure context (https)
    delete window.location
    window.location = {
      protocol: 'https:',
      hostname: 'example.com'
    }
  })

  afterEach(() => {
    // Restore originals
    window.location = originalLocation
    if (originalGeolocation) {
      navigator.geolocation = originalGeolocation
    }
    vi.restoreAllMocks()
  })

  describe('Mode Selection', () => {
    it('renders all mode buttons', () => {
      render(LocationSection)

      expect(screen.getByRole('button', { name: /address/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /intersection/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /find my location/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /other/i })).toBeInTheDocument()
    })

    it('starts in address mode by default', () => {
      render(LocationSection)

      const addressBtn = screen.getByRole('button', { name: /address/i })
      expect(addressBtn).toHaveClass('selected')
    })

    it('shows address input by default', () => {
      render(LocationSection)

      expect(screen.getByPlaceholderText(/123 main st/i)).toBeInTheDocument()
    })

    it('switches to intersection mode when clicked', async () => {
      render(LocationSection)

      await fireEvent.click(screen.getByRole('button', { name: /intersection/i }))

      // Should show two street inputs
      const inputs = screen.getAllByPlaceholderText(/enter street name/i)
      expect(inputs).toHaveLength(2)
    })

    it('switches to other mode when clicked', async () => {
      render(LocationSection)

      await fireEvent.click(screen.getByRole('button', { name: /other/i }))

      expect(screen.getByPlaceholderText(/near the park/i)).toBeInTheDocument()
    })
  })

  describe('GPS Mode - Secure Context Detection', () => {
    it('shows privacy dialog when GPS mode is selected', async () => {
      render(LocationSection)

      await fireEvent.click(screen.getByRole('button', { name: /find my location/i }))

      // Privacy dialog should appear
      expect(screen.getByText(/location privacy/i)).toBeInTheDocument()
    })

    it('detects insecure context (http with non-localhost)', async () => {
      // Set up insecure context
      window.location = {
        protocol: 'http:',
        hostname: '192.168.1.100'
      }

      // Mock geolocation to ensure we're testing the secure context check
      navigator.geolocation = {
        getCurrentPosition: vi.fn()
      }

      render(LocationSection)

      // Click GPS mode
      await fireEvent.click(screen.getByRole('button', { name: /find my location/i }))

      // Confirm privacy dialog
      await fireEvent.click(screen.getByRole('button', { name: /get my location/i }))

      // Should show insecure context error
      await waitFor(() => {
        expect(screen.getByText(/requires https/i)).toBeInTheDocument()
      })

      // Should NOT have called geolocation
      expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled()
    })

    it('allows geolocation on localhost (http)', async () => {
      window.location = {
        protocol: 'http:',
        hostname: 'localhost'
      }

      const mockGetCurrentPosition = vi.fn((success) => {
        success({ coords: { latitude: 40.7128, longitude: -74.0060 } })
      })
      navigator.geolocation = {
        getCurrentPosition: mockGetCurrentPosition
      }

      render(LocationSection)

      await fireEvent.click(screen.getByRole('button', { name: /find my location/i }))
      await fireEvent.click(screen.getByRole('button', { name: /get my location/i }))

      await waitFor(() => {
        expect(mockGetCurrentPosition).toHaveBeenCalled()
      })
    })

    it('allows geolocation on 127.0.0.1 (http)', async () => {
      window.location = {
        protocol: 'http:',
        hostname: '127.0.0.1'
      }

      const mockGetCurrentPosition = vi.fn((success) => {
        success({ coords: { latitude: 40.7128, longitude: -74.0060 } })
      })
      navigator.geolocation = {
        getCurrentPosition: mockGetCurrentPosition
      }

      render(LocationSection)

      await fireEvent.click(screen.getByRole('button', { name: /find my location/i }))
      await fireEvent.click(screen.getByRole('button', { name: /get my location/i }))

      await waitFor(() => {
        expect(mockGetCurrentPosition).toHaveBeenCalled()
      })
    })

    it('allows geolocation on https (any hostname)', async () => {
      window.location = {
        protocol: 'https:',
        hostname: 'myapp.example.com'
      }

      const mockGetCurrentPosition = vi.fn((success) => {
        success({ coords: { latitude: 40.7128, longitude: -74.0060 } })
      })
      navigator.geolocation = {
        getCurrentPosition: mockGetCurrentPosition
      }

      render(LocationSection)

      await fireEvent.click(screen.getByRole('button', { name: /find my location/i }))
      await fireEvent.click(screen.getByRole('button', { name: /get my location/i }))

      await waitFor(() => {
        expect(mockGetCurrentPosition).toHaveBeenCalled()
      })
    })
  })

  describe('GPS Mode - Error Handling', () => {
    beforeEach(() => {
      // Ensure secure context for error handling tests
      window.location = {
        protocol: 'https:',
        hostname: 'example.com'
      }
    })

    it('shows permission denied error with help text', async () => {
      navigator.geolocation = {
        getCurrentPosition: vi.fn((success, error) => {
          error({ code: 1 }) // PERMISSION_DENIED
        })
      }

      render(LocationSection)

      await fireEvent.click(screen.getByRole('button', { name: /find my location/i }))
      await fireEvent.click(screen.getByRole('button', { name: /get my location/i }))

      await waitFor(() => {
        expect(screen.getByText(/permission denied/i)).toBeInTheDocument()
        expect(screen.getByText(/browser.*settings/i)).toBeInTheDocument()
      })
    })

    it('shows position unavailable error with help text', async () => {
      navigator.geolocation = {
        getCurrentPosition: vi.fn((success, error) => {
          error({ code: 2 }) // POSITION_UNAVAILABLE
        })
      }

      render(LocationSection)

      await fireEvent.click(screen.getByRole('button', { name: /find my location/i }))
      await fireEvent.click(screen.getByRole('button', { name: /get my location/i }))

      await waitFor(() => {
        expect(screen.getByText(/could not determine/i)).toBeInTheDocument()
        expect(screen.getByText(/gps signal/i)).toBeInTheDocument()
      })
    })

    it('shows timeout error with help text', async () => {
      navigator.geolocation = {
        getCurrentPosition: vi.fn((success, error) => {
          error({ code: 3 }) // TIMEOUT
        })
      }

      render(LocationSection)

      await fireEvent.click(screen.getByRole('button', { name: /find my location/i }))
      await fireEvent.click(screen.getByRole('button', { name: /get my location/i }))

      await waitFor(() => {
        expect(screen.getByText(/timed out/i)).toBeInTheDocument()
        expect(screen.getByText(/outdoors/i)).toBeInTheDocument()
      })
    })

    it('shows retry button on error', async () => {
      navigator.geolocation = {
        getCurrentPosition: vi.fn((success, error) => {
          error({ code: 1 })
        })
      }

      render(LocationSection)

      await fireEvent.click(screen.getByRole('button', { name: /find my location/i }))
      await fireEvent.click(screen.getByRole('button', { name: /get my location/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })
    })
  })

  describe('GPS Mode - Success', () => {
    it('displays coordinates when location is found', async () => {
      navigator.geolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({ coords: { latitude: 40.712800, longitude: -74.006000 } })
        })
      }

      render(LocationSection)

      await fireEvent.click(screen.getByRole('button', { name: /find my location/i }))
      await fireEvent.click(screen.getByRole('button', { name: /get my location/i }))

      await waitFor(() => {
        // Coordinates appear in both gps-coords and output-preview
        expect(screen.getAllByText(/40\.712800/).length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText(/-74\.006000/).length).toBeGreaterThanOrEqual(1)
      })
    })

    it('displays Google Maps link when location is found', async () => {
      navigator.geolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({ coords: { latitude: 40.7128, longitude: -74.006 } })
        })
      }

      render(LocationSection)

      await fireEvent.click(screen.getByRole('button', { name: /find my location/i }))
      await fireEvent.click(screen.getByRole('button', { name: /get my location/i }))

      await waitFor(() => {
        const link = screen.getByRole('link', { name: /google maps/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', expect.stringContaining('maps.google.com'))
      })
    })
  })

  describe('Value Emission', () => {
    it('emits address value when entered', async () => {
      const onchange = vi.fn()
      render(LocationSection, { props: { onchange } })

      const input = screen.getByPlaceholderText(/123 main st/i)
      await fireEvent.input(input, { target: { value: '456 Oak Street' } })

      expect(onchange).toHaveBeenCalledWith(expect.objectContaining({
        mode: 'address',
        value: '456 Oak Street',
        hasValue: true
      }))
    })

    it('emits GPS coordinates when location is found', async () => {
      navigator.geolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({ coords: { latitude: 40.7128, longitude: -74.006 } })
        })
      }

      const onchange = vi.fn()
      render(LocationSection, { props: { onchange } })

      await fireEvent.click(screen.getByRole('button', { name: /find my location/i }))
      await fireEvent.click(screen.getByRole('button', { name: /get my location/i }))

      await waitFor(() => {
        expect(onchange).toHaveBeenCalledWith(expect.objectContaining({
          mode: 'gps',
          hasValue: true
        }))
        // Value should contain coordinates and maps link
        const lastCall = onchange.mock.calls[onchange.mock.calls.length - 1][0]
        expect(lastCall.value).toContain('40.712800')
        expect(lastCall.value).toContain('maps.google.com')
      })
    })
  })
})
