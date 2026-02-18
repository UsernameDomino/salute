<script>
  /**
   * PhotoCapture - Capture or select photos to attach to a SALUTE report.
   * Uses a single native file input and stores File objects in memory.
   */

  import { t } from '../lib/i18n.js'

  const MAX_PHOTOS = 5

  let { photos = [], required = false, onchange = () => {} } = $props()

  let fileInput = $state(null)
  let thumbnailUrls = $state([])

  let atLimit = $derived(photos.length >= MAX_PHOTOS)

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
    <span class="field-title">{$t('fields.photos')}{#if required}<span class="required-indicator">*</span>{/if}</span>
  </div>

  <div class="photo-grid-area">
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

    <button
      type="button"
      class="photo-add-btn"
      class:at-limit={atLimit}
      onclick={() => fileInput?.click()}
      disabled={atLimit}
      aria-label={$t('buttons.add_photo')}
    >
      <span class="photo-add-icon">+</span>
      <span class="photo-add-label">{$t('buttons.add_photo')}</span>
    </button>
  </div>

  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    multiple
    class="sr-only"
    onchange={handleCapture}
  />

  <div class="photo-count">
    {$t('messages.photos_count', { n: photos.length })}
  </div>

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

  .required-indicator {
    color: var(--color-error, #dc3545);
    margin-left: 0.25rem;
  }

  .photo-grid-area {
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

  .photo-add-btn {
    aspect-ratio: 1;
    border-radius: var(--radius-md, 8px);
    border: 2px dashed var(--color-border, #dddddd);
    background: var(--color-bg-alt, #f5f5f5);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.5rem;
    transition: border-color 0.15s ease, background-color 0.15s ease;
    min-height: auto;
    min-width: auto;
  }

  .photo-add-btn:hover {
    border-color: var(--color-primary, #1a1a2e);
    background: var(--color-bg, #ffffff);
  }

  .photo-add-icon {
    font-size: 1.5rem;
    font-weight: 300;
    line-height: 1;
    color: var(--color-text-muted, #666666);
  }

  .photo-add-label {
    font-size: 0.7rem;
    color: var(--color-text-muted, #666666);
    text-align: center;
  }

  .photo-count {
    font-size: 0.85rem;
    color: var(--color-text-muted, #666666);
    margin-top: 0.375rem;
  }

  .photo-limit-note {
    font-size: 0.8rem;
    color: var(--color-warning, #ffc107);
    margin-top: 0.25rem;
  }
</style>
