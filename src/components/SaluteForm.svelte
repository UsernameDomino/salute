<script>
  /**
   * SaluteForm - Main form component integrating all SALUTE fields
   */

  import FieldSection from './FieldSection.svelte'
  import LocationSection from './LocationSection.svelte'
  import TimePicker from './TimePicker.svelte'
  import PhotoCapture from './PhotoCapture.svelte'
  import ReportOutput from './ReportOutput.svelte'
  import { formatReport } from '../lib/formatReport.js'
  import { t } from '../lib/i18n.js'

  // Form state - time starts with no value (required field)
  let formData = $state({
    size: { preset: '', details: '' },
    activity: { preset: '', details: '' },
    location: { mode: 'address', value: '', hasValue: false },
    unit: { presets: [], details: '' },  // multiSelect
    time: { value: null, relative: '' },
    equipment: { presets: [], details: '' }
  })

  let photos = $state([])

  let showReport = $state(false)
  let reportText = $state('')
  let formKey = $state(0) // Used to force re-render on clear
  let showValidationError = $state(false)

  // Undo state
  let previousFormData = $state(null)
  let showUndo = $state(false)
  let undoTimeoutId = $state(null)

  // Field configurations - use translation keys
  const sizeKeys = ['small', 'medium', 'large', 'xlarge', 'xxlarge']
  const activityKeys = ['checkpoint', 'patrol', 'stationary', 'moving', 'raid']
  const unitKeys = ['camouflage', 'plain_clothes', 'police_style', 'mixed']  // removed 'unknown'
  const equipmentKeys = ['small_arms', 'long_guns', 'heavy_weapons', 'riot_gear']

  // Derived translated presets (reactive to locale changes)
  let sizePresets = $derived(sizeKeys.map(k => $t(`presets.size.${k}`)))
  let activityPresets = $derived(activityKeys.map(k => $t(`presets.activity.${k}`)))
  let unitPresets = $derived(unitKeys.map(k => $t(`presets.unit.${k}`)))
  let equipmentPresets = $derived(equipmentKeys.map(k => $t(`presets.equipment.${k}`)))

  // Required field validation
  function hasValue(field) {
    if (!field) return false
    if (field.preset) return true
    if (field.presets && field.presets.length > 0) return true
    if (field.details && field.details.trim()) return true
    return false
  }

  let isFormValid = $derived(
    hasValue(formData.size) &&
    hasValue(formData.activity) &&
    formData.location.hasValue &&
    formData.time.value !== null &&
    photos.length > 0
  )

  // Track missing required fields for feedback
  let missingFieldNames = $derived(() => {
    const missing = []
    if (!hasValue(formData.size)) missing.push($t('fields.size'))
    if (!hasValue(formData.activity)) missing.push($t('fields.activity'))
    if (!formData.location.hasValue) missing.push($t('fields.location'))
    if (!formData.time.value) missing.push($t('fields.time'))
    if (photos.length === 0) missing.push($t('fields.photos'))
    return missing
  })

  // Hide validation error when form becomes valid
  $effect(() => {
    if (isFormValid && showValidationError) {
      showValidationError = false
    }
  })

  /**
   * Generate the SALUTE report
   */
  function handleGenerate() {
    if (!isFormValid) {
      showValidationError = true
      return
    }
    showValidationError = false
    reportText = formatReport(formData, photos.length)
    showReport = true
  }

  /**
   * Clear all form fields
   */
  function handleClear() {
    // Store current data for undo
    previousFormData = JSON.parse(JSON.stringify(formData))

    formData = {
      size: { preset: '', details: '' },
      activity: { preset: '', details: '' },
      location: { mode: 'address', value: '', hasValue: false },
      unit: { presets: [], details: '' },
      time: { value: null, relative: '' },
      equipment: { presets: [], details: '' }
    }
    photos = []
    showReport = false
    reportText = ''
    formKey++ // Force re-render of child components

    // Show undo toast
    showUndo = true

    // Clear any existing timeout
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId)
    }

    // Auto-hide after 5 seconds
    undoTimeoutId = setTimeout(() => {
      showUndo = false
      previousFormData = null
    }, 5000)
  }

  /**
   * Restore previous form data
   */
  function handleUndo() {
    if (previousFormData) {
      // Restore time as Date object
      if (previousFormData.time && previousFormData.time.value) {
        previousFormData.time.value = new Date(previousFormData.time.value)
      }
      formData = previousFormData
      previousFormData = null
      showUndo = false
      formKey++ // Force re-render to show restored data

      if (undoTimeoutId) {
        clearTimeout(undoTimeoutId)
        undoTimeoutId = null
      }
    }
  }

  /**
   * Go back to form from report view
   */
  function handleBack() {
    showReport = false
  }
</script>

<div class="salute-form">
  {#if !showReport}
    {#key formKey}
    <div class="main-content">
      <FieldSection
        letter="S"
        title={$t('fields.size')}
        presets={sizePresets}
        placeholder={$t('placeholders.size')}
        required={true}
        initialValue={formData.size}
        outputLabel={$t('report.size')}
        onchange={(value) => formData.size = value}
      />

      <FieldSection
        letter="A"
        title={$t('fields.activity')}
        presets={activityPresets}
        placeholder={$t('placeholders.activity')}
        required={true}
        initialValue={formData.activity}
        outputLabel={$t('report.activity')}
        onchange={(value) => formData.activity = value}
      />

      <LocationSection
        required={true}
        onchange={(value) => formData.location = value}
      />

      <FieldSection
        letter="U"
        title={$t('fields.unit')}
        presets={unitPresets}
        placeholder={$t('placeholders.unit')}
        multiSelect={true}
        initialValue={formData.unit}
        outputLabel={$t('report.unit')}
        onchange={(value) => formData.unit = value}
      />

      <TimePicker
        required={true}
        onchange={(value) => formData.time = value}
      />

      <FieldSection
        letter="E"
        title={$t('fields.equipment')}
        presets={equipmentPresets}
        placeholder={$t('placeholders.equipment')}
        multiSelect={true}
        initialValue={formData.equipment}
        outputLabel={$t('report.equipment')}
        onchange={(value) => formData.equipment = value}
      />

      <PhotoCapture
        {photos}
        required={true}
        onchange={(value) => photos = value}
      />
    </div>
    {/key}

    {#if showUndo}
      <div class="undo-toast" role="status" aria-live="polite">
        <span>{$t('messages.cleared')}</span>
        <button
          type="button"
          class="btn-undo"
          onclick={handleUndo}
          aria-label={$t('buttons.undo')}
        >
          {$t('buttons.undo')}
        </button>
      </div>
    {/if}

    {#if showValidationError}
      <div
        class="validation-error"
        role="alert"
        onclick={() => showValidationError = false}
      >
        <span>{$t('messages.required_fields')}: {missingFieldNames().join(', ')}</span>
      </div>
    {/if}

    <div class="fixed-footer">
      <div class="container footer-content">
        <div class="footer-buttons">
          <button
            type="button"
            class="btn-clear"
            onclick={handleClear}
            aria-label={$t('buttons.clear')}
          >
            {$t('buttons.clear')}
          </button>
          <button
            type="button"
            class="btn-primary btn-lg btn-generate"
            class:btn-disabled={!isFormValid}
            onclick={handleGenerate}
            aria-label={$t('buttons.generate')}
          >
            {$t('buttons.generate')}
          </button>
          <div class="spacer"></div>
        </div>
      </div>
    </div>
  {:else}
    <div class="report-view">
      <button
        type="button"
        class="btn-secondary mb-md"
        onclick={handleBack}
      >
        {$t('buttons.back')}
      </button>

      <ReportOutput report={reportText} {photos} />
    </div>
  {/if}
</div>

<style>
  .salute-form {
    padding: 0 1rem;
  }

  .report-view {
    padding: 1rem 0;
  }

  .footer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .footer-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  .btn-generate {
    flex: 0 0 auto;
  }

  .btn-generate.btn-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-clear {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-radius: 0.5rem;
    background: transparent;
    color: var(--color-text-muted, #666666);
    cursor: pointer;
    transition: all 0.15s ease;
    min-height: 48px;
  }

  .btn-clear:hover {
    color: var(--color-text, #1a1a1a);
    background: var(--color-bg-alt, #f5f5f5);
  }

  .spacer {
    width: 60px; /* Balance the Clear button on the other side */
  }

  .validation-error {
    position: fixed;
    bottom: 90px;
    left: 1rem;
    right: 1rem;
    padding: 1rem 1.25rem;
    cursor: pointer;
    background: var(--color-error, #dc3545);
    color: white;
    border-radius: 0.5rem;
    font-size: 1.125rem;
    font-weight: 500;
    line-height: 1.4;
    z-index: 100;
    animation: slideUpError 0.2s ease-out;
    text-align: center;
    max-width: 480px;
    margin: 0 auto;
  }

  @keyframes slideUpError {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .undo-toast {
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--color-bg, #ffffff);
    border: 1px solid var(--color-border, #dddddd);
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    animation: slideUp 0.2s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .undo-toast span {
    color: var(--color-text, #1a1a1a);
    font-size: 0.875rem;
  }

  .btn-undo {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    border: none;
    border-radius: 0.375rem;
    background: var(--color-primary, #1a1a2e);
    color: white;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .btn-undo:hover {
    background: var(--color-primary-hover, #2d2d4a);
  }
</style>
