<script>
  /**
   * ReportOutput - Display formatted report with copy/share actions.
   * Three modes:
   *   A) No Web Share → single "Copy Report" CTA
   *   B) Web Share, no photos → "Share" + small "Copy text"
   *   C) Web Share, with photos → two-step: Share Text → Share Photos
   */

  import { copyToClipboard, canShare, shareText, shareWithFiles, canShareFiles } from '../lib/clipboard.js'
  import { t } from '../lib/i18n.js'

  let { report = '', photos = [] } = $props()

  let copyStatus = $state('')
  let shareAvailable = $state(false)
  let fileShareAvailable = $state(false)
  let shareStep = $state(0)
  let thumbnailUrls = $state([])

  $effect(() => {
    shareAvailable = canShare()
  })

  $effect(() => {
    fileShareAvailable = photos.length > 0 && canShareFiles(photos)
  })

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

  let hasPhotos = $derived(photos.length > 0)
  let twoStepMode = $derived(shareAvailable && hasPhotos)

  async function handleCopy() {
    copyStatus = ''
    const result = await copyToClipboard(report)

    if (result.success) {
      copyStatus = 'success'
      setTimeout(() => { copyStatus = '' }, 3000)
    } else {
      copyStatus = 'error'
    }
  }

  async function handleShareText() {
    await shareText(report, 'SALUTE Report')
    shareStep = 1
  }

  async function handleSharePhotos() {
    if (shareStep < 1) return
    await shareWithFiles('', photos, 'SALUTE Report')
    shareStep = 2
  }

  async function handleSingleShare() {
    await shareText(report, 'SALUTE Report')
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
    </div>
  {/if}

  <div class="report-actions">
    {#if !shareAvailable}
      <!-- Mode A: Copy only -->
      <button
        type="button"
        class="btn-primary btn-lg action-full"
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

    {:else if !hasPhotos}
      <!-- Mode B: Share (single) + small copy -->
      <div class="share-row">
        <button
          type="button"
          class="btn-primary btn-lg action-main"
          onclick={handleSingleShare}
          aria-label={$t('buttons.share')}
        >
          📤 {$t('buttons.share')}
        </button>
        <button
          type="button"
          class="btn-link action-sub"
          onclick={handleCopy}
          aria-label={$t('buttons.copy_text')}
        >
          {$t('buttons.copy_text')}
        </button>
      </div>

    {:else}
      <!-- Mode C: Two-step share -->
      <div class="share-step share-step-1">
        <span class="step-label">Step 1</span>
        <div class="share-row">
          <button
            type="button"
            class="btn-primary btn-lg action-main"
            class:step-done={shareStep >= 1}
            onclick={handleShareText}
            aria-label={$t('buttons.share_text')}
          >
            {#if shareStep >= 1}✓{/if} 📤 {$t('buttons.share_text')}
          </button>
          <button
            type="button"
            class="btn-link action-sub"
            onclick={handleCopy}
            aria-label={$t('buttons.copy_text')}
          >
            {$t('buttons.copy_text')}
          </button>
        </div>
      </div>

      <div class="share-step share-step-2">
        <span class="step-label">Step 2</span>
        <div class="share-row">
          <button
            type="button"
            class="btn-primary btn-lg action-main"
            class:step-done={shareStep >= 2}
            disabled={shareStep < 1}
            onclick={handleSharePhotos}
            aria-label="{$t('buttons.share_photos')} ({photos.length})"
          >
            {#if shareStep >= 2}✓{/if} 📷 {$t('buttons.share_photos')} ({photos.length})
          </button>
        </div>
      </div>
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
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .action-full {
    width: 100%;
  }

  .share-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .action-main {
    flex: 1;
  }

  .action-sub {
    flex: 0 0 auto;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    color: var(--color-text-muted, #666666);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    white-space: nowrap;
    min-height: auto;
    min-width: auto;
  }

  .action-sub:hover {
    color: var(--color-text, #1a1a1a);
  }

  .share-step {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .step-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted, #666666);
  }

  .step-done {
    opacity: 0.7;
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
</style>
