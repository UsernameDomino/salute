import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import PhotoCapture from './PhotoCapture.svelte'

describe('PhotoCapture', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders the Add Photo button', () => {
      render(PhotoCapture, { props: { photos: [], onchange: vi.fn() } })

      expect(screen.getByRole('button', { name: /add photo/i })).toBeInTheDocument()
    })

    it('renders the Photos field title', () => {
      render(PhotoCapture, { props: { photos: [], onchange: vi.fn() } })

      expect(screen.getByText('Photos')).toBeInTheDocument()
    })

    it('always shows the photo counter even with 0 photos', () => {
      render(PhotoCapture, { props: { photos: [], onchange: vi.fn() } })

      expect(screen.getByText('0 of 5 photos')).toBeInTheDocument()
    })

    it('shows required asterisk when required prop is true', () => {
      render(PhotoCapture, { props: { photos: [], onchange: vi.fn(), required: true } })

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('does not show required asterisk when required prop is false', () => {
      render(PhotoCapture, { props: { photos: [], onchange: vi.fn(), required: false } })

      expect(screen.queryByText('*')).not.toBeInTheDocument()
    })
  })

  describe('Photo limit', () => {
    it('disables Add Photo button when at 5 photos', () => {
      const fivePhotos = Array.from({ length: 5 }, (_, i) =>
        new File([''], `photo${i}.jpg`, { type: 'image/jpeg' })
      )
      render(PhotoCapture, { props: { photos: fivePhotos, onchange: vi.fn() } })

      expect(screen.getByRole('button', { name: /add photo/i })).toBeDisabled()
    })

    it('shows max photos message when at limit', () => {
      const fivePhotos = Array.from({ length: 5 }, (_, i) =>
        new File([''], `photo${i}.jpg`, { type: 'image/jpeg' })
      )
      render(PhotoCapture, { props: { photos: fivePhotos, onchange: vi.fn() } })

      expect(screen.getByText(/maximum 5 photos/i)).toBeInTheDocument()
    })

    it('shows correct count with 3 photos', () => {
      const threePhotos = Array.from({ length: 3 }, (_, i) =>
        new File([''], `photo${i}.jpg`, { type: 'image/jpeg' })
      )
      render(PhotoCapture, { props: { photos: threePhotos, onchange: vi.fn() } })

      expect(screen.getByText('3 of 5 photos')).toBeInTheDocument()
    })

    it('enables Add Photo button when under limit', () => {
      const twoPhotos = Array.from({ length: 2 }, (_, i) =>
        new File([''], `photo${i}.jpg`, { type: 'image/jpeg' })
      )
      render(PhotoCapture, { props: { photos: twoPhotos, onchange: vi.fn() } })

      expect(screen.getByRole('button', { name: /add photo/i })).not.toBeDisabled()
    })
  })

  describe('Completion indicator', () => {
    it('shows checkmark when photos are present', () => {
      const onePhoto = [new File([''], 'photo.jpg', { type: 'image/jpeg' })]
      const { container } = render(PhotoCapture, { props: { photos: onePhoto, onchange: vi.fn() } })

      expect(container.querySelector('.field-check')).toBeInTheDocument()
    })

    it('does not show checkmark when no photos', () => {
      const { container } = render(PhotoCapture, { props: { photos: [], onchange: vi.fn() } })

      expect(container.querySelector('.field-check')).not.toBeInTheDocument()
    })
  })
})
