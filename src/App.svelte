<script>
  /**
   * Report Sighting - Main App
   * Offline-first sighting report generator
   */

  import SaluteForm from './components/SaluteForm.svelte'
  import InstallPrompt from './components/InstallPrompt.svelte'
  import LanguageSwitcher from './components/LanguageSwitcher.svelte'
  import ThemeToggle from './components/ThemeToggle.svelte'
  import ExplainerPanel from './components/ExplainerPanel.svelte'
  import { t } from './lib/i18n.js'

  // State
  let showExplainer = $state(false)

  // Register service worker and reload when a new version activates
  $effect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              window.location.reload()
            }
          })
        })
      })
      .catch((err) => console.log('SW registration failed:', err))
  })
</script>

<div id="app">
  <InstallPrompt />

  <header class="app-header">
    <div class="container">
      <h1>{$t('app.title')}</h1>
    </div>
  </header>

  <hr class="header-rule" />

  <div class="utility-toolbar">
    <div class="container toolbar-content">
      <button
        type="button"
        class="btn-link"
        onclick={() => showExplainer = !showExplainer}
        aria-expanded={showExplainer}
      >
        {$t('explainer.button')}
      </button>

      <div class="toolbar-right">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </div>
  </div>

  <ExplainerPanel show={showExplainer} />

  <main>
    <div class="container">
      <SaluteForm />
    </div>
  </main>
</div>

<style>
  .app-header {
    padding: 1.25rem 0 1rem;
  }

  .app-header h1 {
    margin: 0;
    font-size: 1.5rem;
    text-align: center;
    color: var(--color-text);
  }

  .header-rule {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 0;
  }

  .utility-toolbar {
    padding: 0.75rem 0;
    margin-bottom: 0.5rem;
  }

  .toolbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-link {
    padding: 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 500;
    border: none;
    background: transparent;
    color: var(--color-link, var(--color-primary));
    text-decoration: underline;
    cursor: pointer;
    transition: opacity 0.15s ease;
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .btn-link:hover {
    opacity: 0.8;
  }
</style>
