<script>
  /**
   * InstallPrompt - PWA install button with browser-specific flow
   */
  import { t } from '../lib/i18n.js'
  
  // State
  let deferredPrompt = $state(null)
  let showInstructions = $state(false)
  let isStandalone = $state(false)
  let isIOS = $state(false)
  let isDismissed = $state(false)
  
  // Check environment on mount
  $effect(() => {
    // Check if already installed
    if (typeof window !== 'undefined' && window.matchMedia) {
      isStandalone = window.matchMedia('(display-mode: standalone)').matches
    }
    
    // Check if iOS Safari
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent
      isIOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window)
    }
    
    // Check if user dismissed the banner this session
    if (typeof sessionStorage !== 'undefined') {
      isDismissed = sessionStorage.getItem('salute-install-dismissed') === 'true'
    }
    
    // Listen for Chrome/Edge install prompt
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        deferredPrompt = e
      })
    }
  })
  
  /**
   * Handle install button click
   */
  async function handleInstall() {
    if (deferredPrompt) {
      // Chrome/Edge - trigger native prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        deferredPrompt = null
      }
    } else {
      // iOS/Other - show instructions
      showInstructions = true
    }
  }
  
  /**
   * Close instruction modal
   */
  function closeInstructions() {
    showInstructions = false
  }
  
  /**
   * Dismiss the install banner for this session
   */
  function dismissBanner() {
    isDismissed = true
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('salute-install-dismissed', 'true')
    }
  }
</script>

{#if !isStandalone && !isDismissed}
  <div class="install-banner">
    <span class="install-banner-text">
      {$t('install.banner')}
    </span>
    <div class="install-banner-actions">
      <button
        type="button"
        class="btn-secondary"
        onclick={handleInstall}
        aria-label={$t('install.button')}
      >
        {$t('install.button')}
      </button>
      <button
        type="button"
        class="btn-dismiss"
        onclick={dismissBanner}
        aria-label={$t('install.dismiss')}
      >
        ✕
      </button>
    </div>
  </div>
{/if}

{#if showInstructions}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-backdrop" onclick={closeInstructions} role="dialog" aria-modal="true">
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h2>{$t('install.banner')}</h2>
        <button
          type="button"
          class="btn-icon"
          onclick={closeInstructions}
          aria-label={$t('install.dismiss')}
        >
          ✕
        </button>
      </div>
      
      {#if isIOS}
        <div class="install-instructions">
          <p>{$t('install.ios_instructions')}</p>
        </div>
      {:else}
        <div class="install-instructions">
          <p><strong>To install:</strong></p>
          <ol>
            <li>Open browser menu (⋮)</li>
            <li>Select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></li>
            <li>Follow the prompts to install</li>
          </ol>
        </div>
      {/if}
      
      <button
        type="button"
        class="btn-primary btn-block mt-md"
        onclick={closeInstructions}
      >
        OK
      </button>
    </div>
  </div>
{/if}

<style>
  .install-banner-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  
  .btn-dismiss {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 0.375rem;
    background: transparent;
    color: var(--color-text-muted, #a0a0b0);
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.15s ease;
  }
  
  .btn-dismiss:hover {
    background: var(--color-surface, #2d2d44);
    color: var(--color-text, #ffffff);
  }
  
  .install-instructions ol {
    padding-left: 1.5rem;
    margin: 1rem 0;
  }
  
  .install-instructions li {
    margin-bottom: 0.5rem;
  }
</style>
