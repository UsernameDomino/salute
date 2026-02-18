<script>
  /**
   * ReportOutput - Display formatted report with copy/share actions
   */

  import { copyToClipboard, canShare, shareText, shareWithFiles, canShareFiles } from '../lib/clipboard.js'
  import { t } from '../lib/i18n.js'

  let { report = '', photos = [] } = $props()

  // State
  let copyStatus = $state('') // '', 'success', 'error'
  let shareAvailable = $state(false)
  let fileShareAvailable = $state(false)
  let thumbnailUrls = $state([])

  // Check share availability on mount
  $effect(() => {
    shareAvailable = canShare()
  })

  // Check file share support when photos change
  $effect(() => {
    fileShareAvailable = photos.length > 0 && canShareFiles(photos)
  })

  // Build thumbnail URLs for display
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

  async function handleCopy() {
    copyStatus = ''
    const result = await copyToClipboard(report)

    if (result.success) {
      copyStatus = 'success'
      setTimeout(() => {
        copyStatus = ''
      }, 3000)
    } else {
      copyStatus = 'error'
    }
  }

  async function handleShare() {
    if (photos.length > 0) {
      await shareWithFiles(report, photos, 'SALUTE Report')
    } else {
      await shareText(report, 'SALUTE Report')
    }
  }
</script>

<div class="report-output-container">
  <div class="report-output">
    {report}
  </div>

  {#if thumbnailUrls.length > 0}
    <div class="report-photos">
      <div class="report-photo-grid">
        {#each thumbnailUrls as url, i}
          <div class="report-photo-thumb">
            <img src={url} alt="Photo {i + 1}" />
          </div>
        {/each}
      </div>
      {#if shareAvailable}
        <div class="photo-share-note">
          {$t('messages.photos_share_note')}
        </div>
      {/if}
    </div>
  {/if}

  <div class="report-actions">
    <button
      type="button"
      class="btn-primary btn-lg"
      onclick={handleCopy}
      aria-label={$t('buttons.copy')}
    >
      {#if copyStatus === 'success'}
        ✓ {$t('messages.copied')}
      {:else if copyStatus === 'error'}
        {$t('messages.copy_failed')}
      {:else}
        📋 {$t('buttons.copy')}
      {/if}
    </button>

    {#if shareAvailable}
      <button
        type="button"
        class="{photos.length > 0 ? 'btn-primary' : 'btn-secondary'} btn-lg"
        onclick={handleShare}
        aria-label={$t('buttons.share')}
      >
        📤 {$t('buttons.share')}{#if photos.length > 0} + 📷 {photos.length}{/if}
      </button>
    {/if}
  </div>

  {#if copyStatus === 'success'}
    <div class="feedback feedback-success">
      {$t('messages.copied')}
    </div>
  {:else if copyStatus === 'error'}
    <div class="feedback feedback-error">
      {$t('messages.copy_failed')}
    </div>
  {/if}
</div>

<style>
  .report-output-container {
    margin-top: 1rem;
  }

  .report-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .report-actions button {
    flex: 1;
  }

  .report-photos {
    margin-top: 0.75rem;
  }

  .report-photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
    gap: 0.5rem;
  }

  .report-photo-thumb {
    aspect-ratio: 1;
    border-radius: var(--radius-md, 8px);
    overflow: hidden;
    border: 2px solid var(--color-border, #dddddd);
  }

  .report-photo-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .photo-share-note {
    font-size: 0.8rem;
    color: var(--color-text-muted, #666666);
    margin-top: 0.375rem;
    font-style: italic;
  }
</style>
