<script>
  /**
   * PhotoCapture - Capture or select photos to attach to a SALUTE report.
   * Uses native file inputs (camera + gallery) and stores File objects in memory.
   */

  import { t } from '../lib/i18n.js'

  const MAX_PHOTOS = 5

  let { photos = [], onchange = () => {} } = $props()

  let cameraInput = $state(null)
  let galleryInput = $state(null)
  let thumbnailUrls = $state([])

  let atLimit = $derived(photos.length >= MAX_PHOTOS)

  // Rebuild thumbnail URLs whenever photos array changes
  $effect(() => {
    const newUrls = photos.map(file =>
      typeof URL !== 'undefined' && URL.createObjectURL
        ? URL.createObjectURL(file)
        : ''
    )
    thumbnailUrls = newUrls

    return () => {
      newUrls.forEach(url => {
        if (url && typeof URL !== 'undefined' && URL.revokeObjectURL) {
          URL.revokeObjectURL(url)
        }
      })
    }
  })

  function addFiles(fileList) {
    if (!fileList || fileList.length === 0) return

    const remaining = MAX_PHOTOS - photos.length
    const newFiles = Array.from(fileList).slice(0, remaining)
    if (newFiles.length === 0) return

    const updated = [...photos, ...newFiles]
    onchange(updated)
  }

  function handleCapture(event) {
    addFiles(event.target.files)
    event.target.value = ''
  }

  function removePhoto(index) {
    const url = thumbnailUrls[index]
    if (url && typeof URL !== 'undefined' && URL.revokeObjectURL) {
      URL.revokeObjectURL(url)
    }
    const updated = photos.filter((_, i) => i !== index)
    onchange(updated)
  }
</script>

<div class="field-section">
  <div class="field-label">
    {#if photos.length > 0}
      <span class="field-check">✓</span>
    {/if}
    <span class="field-letter photo-letter">📷</span>
    <span class="field-title">{$t('fields.photos')}</span>
  </div>

  <div class="photo-buttons">
    <button
      type="button"
      class="btn-preset"
      disabled={atLimit}
      onclick={() => cameraInput?.click()}
    >
      📸 {$t('buttons.take_photo')}
    </button>
    <button
      type="button"
      class="btn-preset"
      disabled={atLimit}
      onclick={() => galleryInput?.click()}
    >
      🖼️ {$t('buttons.choose_photo')}
    </button>
  </div>

  <!-- Hidden file inputs -->
  <input
    bind:this={cameraInput}
    type="file"
    accept="image/*"
    capture="environment"
    class="sr-only"
    onchange={handleCapture}
  />
  <input
    bind:this={galleryInput}
    type="file"
    accept="image/*"
    multiple
    class="sr-only"
    onchange={handleCapture}
  />

  {#if photos.length > 0}
    <div class="photo-grid">
      {#each thumbnailUrls as url, i}
        <div class="photo-thumb">
          <img src={url} alt="Photo {i + 1}" />
          <button
            type="button"
            class="photo-remove"
            onclick={() => removePhoto(i)}
            aria-label="{$t('buttons.remove_photo')} {i + 1}"
          >
            ✕
          </button>
        </div>
      {/each}
    </div>

    <div class="photo-count">
      {$t('messages.photos_count', { n: photos.length })}
    </div>
  {/if}

  {#if atLimit}
    <div class="photo-limit-note">
      {$t('messages.max_photos')}
    </div>
  {/if}
</div>

<style>
  .photo-letter {
    font-size: 1.25rem;
    background: none;
    color: inherit;
    width: auto;
    height: auto;
  }

  .photo-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .photo-buttons button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .photo-thumb {
    position: relative;
    aspect-ratio: 1;
    border-radius: var(--radius-md, 8px);
    overflow: hidden;
    border: 2px solid var(--color-border, #dddddd);
  }

  .photo-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .photo-remove {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 0.75rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .photo-count {
    font-size: 0.85rem;
    color: var(--color-text-muted, #666666);
    margin-top: 0.25rem;
  }

  .photo-limit-note {
    font-size: 0.8rem;
    color: var(--color-warning, #ffc107);
    margin-top: 0.25rem;
  }
</style>
