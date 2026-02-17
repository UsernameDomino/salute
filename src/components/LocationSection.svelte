<script>
  /**
   * LocationSection - Location input with multiple modes
   * Modes: Address, Intersection, GPS (Find my location), Other
   */
  import { t } from '../lib/i18n.js'

  let { required = false, onchange = () => {} } = $props()

  // Mode state
  let mode = $state('address') // 'address' | 'intersection' | 'gps' | 'other'

  // Input values for each mode
  let addressValue = $state('')
  let street1Value = $state('')
  let street2Value = $state('')
  let otherValue = $state('')

  // GPS state
  let gpsCoords = $state(null) // { lat, lng }
  let gpsStatus = $state('') // 'getting' | 'found' | 'error' | 'denied' | ''
  let showGpsDialog = $state(false)

  // Computed: is location valid (has content)
  let hasValue = $derived(() => {
    switch (mode) {
      case 'address':
        return addressValue.trim().length > 0
      case 'intersection':
        return street1Value.trim().length > 0 && street2Value.trim().length > 0
      case 'gps':
        return gpsCoords !== null
      case 'other':
        return otherValue.trim().length > 0
      default:
        return false
    }
  })

  // Emit changes when value changes
  $effect(() => {
    emitChange()
  })

  /**
   * Get the formatted location value for the report
   */
  function getFormattedValue() {
    switch (mode) {
      case 'address':
        return addressValue.trim()
      case 'intersection':
        if (street1Value.trim() && street2Value.trim()) {
          return `${street1Value.trim()} ${$t('location_labels.and')} ${street2Value.trim()}`
        }
        return ''
      case 'gps':
        if (gpsCoords) {
          const { lat, lng } = gpsCoords
          const coordStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`
          return `${coordStr} (${mapsUrl})`
        }
        return ''
      case 'other':
        return otherValue.trim()
      default:
        return ''
    }
  }

  /**
   * Emit change event
   */
  function emitChange() {
    const value = getFormattedValue()
    onchange({
      mode,
      value,
      hasValue: hasValue()
    })
  }

  /**
   * Switch mode
   */
  function setMode(newMode) {
    if (newMode === 'gps' && mode !== 'gps') {
      // Show privacy dialog before getting location
      showGpsDialog = true
    } else {
      mode = newMode
    }
  }

  /**
   * Handle GPS privacy dialog confirm
   */
  function handleGpsConfirm() {
    showGpsDialog = false
    mode = 'gps'
    getLocation()
  }

  /**
   * Handle GPS privacy dialog cancel
   */
  function handleGpsCancel() {
    showGpsDialog = false
  }

  /**
   * Check if we're in a secure context (HTTPS or localhost)
   */
  function isSecureContext() {
    return location.protocol === 'https:' ||
           location.hostname === 'localhost' ||
           location.hostname === '127.0.0.1'
  }

  /**
   * Get user's GPS location
   */
  function getLocation() {
    // Check for secure context first (required for geolocation)
    if (!isSecureContext()) {
      gpsStatus = 'insecure'
      return
    }

    if (!navigator.geolocation) {
      gpsStatus = 'error'
      return
    }

    gpsStatus = 'getting'

    navigator.geolocation.getCurrentPosition(
      (position) => {
        gpsCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        gpsStatus = 'found'
      },
      (error) => {
        // Handle distinct error codes
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            gpsStatus = 'denied'
            break
          case 2: // POSITION_UNAVAILABLE
            gpsStatus = 'unavailable'
            break
          case 3: // TIMEOUT
            gpsStatus = 'timeout'
            break
          default:
            gpsStatus = 'error'
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  /**
   * Auto-resize textarea
   */
  function autoResize(event) {
    const el = event.target
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }
</script>

<div class="field-section location-section">
  <div class="field-label">
    {#if hasValue()}
      <span class="field-check">✓</span>
    {/if}
    <span class="field-letter">L</span>
    <span class="field-title">{$t('fields.location')}{#if required}<span class="required-indicator">*</span>{/if}</span>
  </div>

  <!-- Mode selector buttons -->
  <div class="mode-buttons">
    <button
      type="button"
      class="btn-preset"
      class:selected={mode === 'address'}
      onclick={() => setMode('address')}
    >
      {$t('location_modes.address')}
    </button>
    <button
      type="button"
      class="btn-preset"
      class:selected={mode === 'intersection'}
      onclick={() => setMode('intersection')}
    >
      {$t('location_modes.intersection')}
    </button>
    <button
      type="button"
      class="btn-preset"
      class:selected={mode === 'gps'}
      onclick={() => setMode('gps')}
    >
      {$t('location_modes.gps')}
    </button>
    <button
      type="button"
      class="btn-preset"
      class:selected={mode === 'other'}
      onclick={() => setMode('other')}
    >
      {$t('location_modes.other')}
    </button>
  </div>

  <!-- Mode-specific inputs -->
  <div class="mode-input">
    {#if mode === 'address'}
      <textarea
        rows="1"
        placeholder={$t('location_labels.address_placeholder')}
        bind:value={addressValue}
        oninput={autoResize}
      ></textarea>
    {:else if mode === 'intersection'}
      <div class="intersection-inputs">
        <input
          type="text"
          placeholder={$t('location_labels.intersection_placeholder')}
          bind:value={street1Value}
        />
        <span class="intersection-and">{$t('location_labels.and')}</span>
        <input
          type="text"
          placeholder={$t('location_labels.intersection_placeholder')}
          bind:value={street2Value}
        />
      </div>
    {:else if mode === 'gps'}
      <div class="gps-display">
        {#if gpsStatus === 'getting'}
          <div class="gps-status">
            <span class="loading-spinner"></span>
            {$t('gps.getting_location')}
          </div>
        {:else if gpsStatus === 'found' && gpsCoords}
          <div class="gps-result">
            <div class="gps-coords">
              {gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}
            </div>
            <a
              href="https://maps.google.com/?q={gpsCoords.lat},{gpsCoords.lng}"
              target="_blank"
              rel="noopener noreferrer"
              class="gps-link"
            >
              View on Google Maps ↗
            </a>
          </div>
        {:else if gpsStatus === 'insecure'}
          <div class="gps-error-block">
            <div class="gps-error">{$t('gps.insecure')}</div>
            <div class="gps-error-help">{$t('gps.insecure_help')}</div>
          </div>
        {:else if gpsStatus === 'denied'}
          <div class="gps-error-block">
            <div class="gps-error">{$t('gps.denied')}</div>
            <div class="gps-error-help">{$t('gps.denied_help')}</div>
          </div>
          <button type="button" class="btn-retry" onclick={getLocation}>
            Try again
          </button>
        {:else if gpsStatus === 'unavailable'}
          <div class="gps-error-block">
            <div class="gps-error">{$t('gps.unavailable')}</div>
            <div class="gps-error-help">{$t('gps.unavailable_help')}</div>
          </div>
          <button type="button" class="btn-retry" onclick={getLocation}>
            Try again
          </button>
        {:else if gpsStatus === 'timeout'}
          <div class="gps-error-block">
            <div class="gps-error">{$t('gps.timeout')}</div>
            <div class="gps-error-help">{$t('gps.timeout_help')}</div>
          </div>
          <button type="button" class="btn-retry" onclick={getLocation}>
            Try again
          </button>
        {:else if gpsStatus === 'error'}
          <div class="gps-error-block">
            <div class="gps-error">{$t('gps.error')}</div>
            <div class="gps-error-help">{$t('gps.error_help')}</div>
          </div>
          <button type="button" class="btn-retry" onclick={getLocation}>
            Try again
          </button>
        {:else}
          <button type="button" class="btn-gps" onclick={getLocation}>
            {$t('gps.confirm')}
          </button>
        {/if}
      </div>
    {:else if mode === 'other'}
      <textarea
        rows="2"
        placeholder={$t('location_labels.other_placeholder')}
        bind:value={otherValue}
        oninput={autoResize}
      ></textarea>
    {/if}
  </div>

  {#if hasValue()}
    <div class="output-preview">
      LOCATION: {getFormattedValue()}
    </div>
  {/if}
</div>

<!-- GPS Privacy Dialog -->
{#if showGpsDialog}
  <div class="dialog-backdrop" onclick={handleGpsCancel}>
    <div class="dialog" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
      <h3>{$t('gps.privacy_title')}</h3>
      <p>{$t('gps.privacy_message')}</p>
      <div class="dialog-buttons">
        <button type="button" class="btn-secondary" onclick={handleGpsCancel}>
          {$t('gps.cancel')}
        </button>
        <button type="button" class="btn-primary" onclick={handleGpsConfirm}>
          {$t('gps.confirm')}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .field-label {
    position: relative;
  }

  .field-check {
    position: absolute;
    left: -28px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-success, #1e7b34);
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 1;
  }

  .required-indicator {
    color: var(--color-error, #dc3545);
    margin-left: 0.25rem;
  }

  .mode-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .mode-input {
    margin-top: 0.5rem;
  }

  .mode-input textarea,
  .mode-input input {
    width: 100%;
    min-height: 48px;
    resize: none;
    overflow: hidden;
  }

  .intersection-inputs {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .intersection-and {
    text-align: center;
    color: var(--color-text-muted, #666666);
    font-size: 0.875rem;
    padding: 0.25rem 0;
  }

  .gps-display {
    padding: 1rem;
    background: var(--color-bg-alt, #f5f5f5);
    border-radius: 0.5rem;
    text-align: center;
  }

  .gps-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--color-text-muted, #666666);
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-border, #dddddd);
    border-top-color: var(--color-primary, #1a1a2e);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .gps-result {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .gps-coords {
    font-family: monospace;
    font-size: 0.9375rem;
    color: var(--color-text, #1a1a1a);
  }

  .gps-link {
    color: var(--color-link, var(--color-primary));
    font-size: 0.875rem;
  }

  .gps-error-block {
    margin-bottom: 0.75rem;
  }

  .gps-error {
    color: var(--color-error, #dc3545);
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .gps-error-help {
    color: var(--color-text-muted, #666666);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .btn-gps,
  .btn-retry {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    border-radius: 0.5rem;
    background: var(--color-primary, #1a1a2e);
    color: white;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .btn-gps:hover,
  .btn-retry:hover {
    background: var(--color-primary-hover, #2d2d4a);
  }

  /* Dialog */
  .dialog-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 200;
  }

  .dialog {
    background: var(--color-bg, #ffffff);
    border-radius: 0.75rem;
    padding: 1.5rem;
    max-width: 400px;
    width: 100%;
    color: var(--color-text, #1a1a1a);
  }

  .dialog h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.125rem;
  }

  .dialog p {
    margin: 0 0 1.25rem 0;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: var(--color-text-muted, #666666);
  }

  .dialog-buttons {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .dialog-buttons button {
    padding: 0.625rem 1rem;
    font-size: 0.9375rem;
    min-height: 44px;
  }

  .output-preview {
    font-size: 0.85rem;
    color: var(--color-text-muted, #6c757d);
    font-family: monospace;
    padding: 0.5rem 0;
    word-break: break-word;
  }
</style>
