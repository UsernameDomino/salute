<script>
  /**
   * TimePicker - Time selection with presets and manual date/time input
   * Time is a required field with no default value
   */
  import { t } from '../lib/i18n.js'
  import { formatDate, formatTime12, parseDateTime, formatForReport } from '../lib/datetime.js'

  let { onchange = () => {}, required = false } = $props()

  // Preset definitions with translation keys
  const presetDefs = [
    { key: 'just_now', offset: 0 },
    { key: '5_min', offset: -5 },
    { key: '15_min', offset: -15 },
    { key: '30_min', offset: -30 },
    { key: '1_hour', offset: -60 },
  ]

  // State - no default selection (required field)
  let selectedPresetKey = $state('')
  let showManualInput = $state(false)

  // Manual input state - empty by default
  let manualDate = $state('')
  let manualTime = $state('')
  let manualPeriod = $state('AM')

  // Track if field has a value
  let hasValue = $derived(selectedPresetKey !== '' || (showManualInput && manualDate && manualTime))

  // Computed: preview text for output hint
  let previewText = $derived(() => {
    if (selectedPresetKey) {
      const preset = presetDefs.find(p => p.key === selectedPresetKey)
      const now = new Date()
      const value = new Date(now.getTime() + preset.offset * 60000)
      return formatForReport(value)
    } else if (showManualInput && manualDate && manualTime) {
      const value = parseDateTime(manualDate, manualTime, manualPeriod)
      return formatForReport(value)
    }
    return ''
  })

  // Emit change when value changes
  $effect(() => {
    if (hasValue) {
      emitChange()
    } else {
      // Emit null/empty when no value
      onchange({ value: null, relative: '' })
    }
  })


  /**
   * Handle preset button click
   */
  function handlePresetClick(preset) {
    selectedPresetKey = preset.key
    showManualInput = false
  }

  /**
   * Show manual input
   */
  function openManualInput() {
    showManualInput = true
    selectedPresetKey = ''
    // Set current date/time as starting point
    const now = new Date()
    manualDate = formatDate(now)
    manualTime = formatTime12(now)
    manualPeriod = now.getHours() >= 12 ? 'PM' : 'AM'
  }

  /**
   * Handle manual input changes
   */
  function handleManualChange() {
    selectedPresetKey = ''
  }

  /**
   * Validate and format time input on blur
   * Ensures hours are 1-12 and minutes are 0-59
   */
  function validateAndFormatTime() {
    if (!manualTime) return
    
    // Try to parse the time
    const match = manualTime.match(/^(\d{1,2}):?(\d{0,2})$/)
    if (match) {
      let hours = parseInt(match[1], 10) || 0
      let minutes = parseInt(match[2], 10) || 0
      
      // Clamp hours to 1-12
      if (hours === 0) hours = 12
      else if (hours > 12) hours = 12
      
      // Clamp minutes to 0-59
      minutes = Math.max(0, Math.min(59, minutes))
      
      manualTime = `${hours}:${minutes.toString().padStart(2, '0')}`
    } else {
      // Invalid format - reset to a valid default
      manualTime = '12:00'
    }
    
    handleManualChange()
  }

  /**
   * Emit change event
   */
  function emitChange() {
    let value, relative

    if (selectedPresetKey) {
      // Using a preset
      const preset = presetDefs.find(p => p.key === selectedPresetKey)
      const now = new Date()
      value = new Date(now.getTime() + preset.offset * 60000)
      relative = $t(`time.${selectedPresetKey}`)
    } else if (showManualInput && manualDate && manualTime) {
      // Manual entry - show the formatted time
      value = parseDateTime(manualDate, manualTime, manualPeriod)
      relative = formatForReport(value)
    } else {
      return // No value to emit
    }

    onchange({ value, relative })
  }
</script>

<div class="field-section time-picker">
  <div class="field-label">
    {#if hasValue}
      <span class="field-check">✓</span>
    {/if}
    <span class="field-letter">T</span>
    <span class="field-title">{$t('fields.time')}{#if required}<span class="required-indicator">*</span>{/if}</span>
  </div>

  <!-- Preset buttons -->
  <div class="field-presets time-presets">
    {#each presetDefs as preset}
      <button
        type="button"
        class="btn-preset"
        class:selected={selectedPresetKey === preset.key}
        aria-pressed={selectedPresetKey === preset.key}
        onclick={() => handlePresetClick(preset)}
      >
        {$t(`time.${preset.key}`)}
      </button>
    {/each}

    <button
      type="button"
      class="btn-preset"
      class:selected={showManualInput}
      aria-pressed={showManualInput}
      onclick={openManualInput}
    >
      {$t('time.other')}
    </button>
  </div>

  <!-- Manual date/time input -->
  {#if showManualInput}
    <div class="manual-input-group">
      <div class="input-row">
        <label class="input-label">
          <span class="label-text">{$t('time.date_label')}</span>
          <input
            type="date"
            bind:value={manualDate}
            oninput={handleManualChange}
          />
        </label>
      </div>
      <div class="input-row time-row">
        <label class="input-label time-input">
          <span class="label-text">{$t('time.time_label')}</span>
          <input
            type="text"
            bind:value={manualTime}
            oninput={handleManualChange}
            onblur={validateAndFormatTime}
            placeholder="12:00"
            pattern="[0-9][0-9]?:[0-9][0-9]"
            inputmode="numeric"
          />
        </label>
        <div class="period-toggle-wrapper">
          <span class="label-text">&nbsp;</span>
          <div class="period-toggle">
            <button
              type="button"
              class="period-btn"
              class:selected={manualPeriod === 'AM'}
              onclick={() => { manualPeriod = 'AM'; handleManualChange(); }}
            >
              AM
            </button>
            <button
              type="button"
              class="period-btn"
              class:selected={manualPeriod === 'PM'}
              onclick={() => { manualPeriod = 'PM'; handleManualChange(); }}
            >
              PM
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if hasValue}
    <div class="output-preview">
      {$t('report.time')}: {previewText()}
    </div>
  {/if}
</div>

<style>
  .time-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .field-label {
    position: relative;
  }

  .field-check {
    position: absolute;
    left: -28px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-success, #28a745);
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 1;
  }

  .required-indicator {
    color: var(--color-error, #dc3545);
    margin-left: 0.25rem;
  }

  .manual-input-group {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
  }

  .time-row {
    align-items: flex-end;
  }

  .input-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .time-input {
    flex: 0 0 auto;
    width: 100px;
  }

  .label-text {
    font-size: 0.75rem;
    color: var(--color-text-muted, #666666);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .period-toggle-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .period-toggle {
    display: flex;
    padding: 0.25rem;
    background: var(--color-bg-alt, #f5f5f5);
    border-radius: 0.5rem;
    height: 48px;
    align-items: center;
  }

  .period-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    border: none;
    border-radius: 0.375rem;
    background: transparent;
    color: var(--color-text-muted, #666666);
    cursor: pointer;
    transition: all 0.15s ease;
    min-height: 36px;
    min-width: 44px;
  }

  .period-btn:hover {
    color: var(--color-text, #1a1a1a);
  }

  .period-btn.selected {
    background: var(--color-primary, #1a1a2e);
    color: white;
  }

  .output-preview {
    font-size: 0.85rem;
    color: var(--color-text-muted, #6c757d);
    font-family: monospace;
    padding: 0.5rem 0;
    word-break: break-word;
  }
</style>
