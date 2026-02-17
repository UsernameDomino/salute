<script>
  /**
   * ReportOutput - Display formatted report with copy/share actions
   */

  import { copyToClipboard, canShare, shareText } from '../lib/clipboard.js'
  import { t } from '../lib/i18n.js'

  let { report = '' } = $props()

  // State
  let copyStatus = $state('') // '', 'success', 'error'
  let shareAvailable = $state(false)

  // Check share availability on mount
  $effect(() => {
    shareAvailable = canShare()
  })

  /**
   * Copy report to clipboard
   */
  async function handleCopy() {
    copyStatus = ''
    const result = await copyToClipboard(report)

    if (result.success) {
      copyStatus = 'success'
      // Clear status after 3 seconds
      setTimeout(() => {
        copyStatus = ''
      }, 3000)
    } else {
      copyStatus = 'error'
    }
  }

  /**
   * Share report using Web Share API
   */
  async function handleShare() {
    await shareText(report, 'SALUTE Report')
  }
</script>

<div class="report-output-container">
  <div class="report-output">
    {report}
  </div>

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
        class="btn-secondary btn-lg"
        onclick={handleShare}
        aria-label={$t('buttons.share')}
      >
        📤 {$t('buttons.share')}
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

</style>
