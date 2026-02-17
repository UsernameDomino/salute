<script>
  /**
   * FieldSection - A SALUTE field with presets and text input
   */

  import PresetButton from './PresetButton.svelte'

  let {
    letter = '',
    title = '',
    presets = [],
    placeholder = 'Enter details...',
    multiSelect = false,
    required = false,
    initialValue = null,
    outputLabel = '',
    onchange = () => {}
  } = $props()

  let textareaEl = $state(null)

  // Initialize state from initialValue if provided
  function getInitialPresets() {
    if (!initialValue) return []
    if (multiSelect && initialValue.presets) return initialValue.presets
    if (!multiSelect && initialValue.preset) return [initialValue.preset]
    return []
  }

  function getInitialDetails() {
    return initialValue?.details || ''
  }

  // State
  let selectedPresets = $state(getInitialPresets())
  let details = $state(getInitialDetails())

  // Computed: is field completed (has any value)
  let isCompleted = $derived(selectedPresets.length > 0 || details.trim().length > 0)

  // Computed: preview text for output hint
  let previewText = $derived(() => {
    const parts = []
    if (selectedPresets.length > 0) {
      parts.push(selectedPresets.join(', '))
    }
    if (details.trim()) {
      parts.push(details.trim())
    }
    return parts.join(' ')
  })

  /**
   * Handle preset button click
   */
  function handlePresetClick(preset) {
    if (multiSelect) {
      // Toggle in array
      if (selectedPresets.includes(preset)) {
        selectedPresets = selectedPresets.filter(p => p !== preset)
      } else {
        selectedPresets = [...selectedPresets, preset]
      }
    } else {
      // Single select - toggle or switch
      if (selectedPresets.includes(preset)) {
        selectedPresets = []
      } else {
        selectedPresets = [preset]
      }
    }

    emitChange()
  }

  /**
   * Handle text input change with auto-resize
   */
  function handleInput(event) {
    details = event.target.value
    autoResize(event.target)
    emitChange()
  }

  /**
   * Auto-resize textarea based on content
   */
  function autoResize(el) {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  /**
   * Emit change event with current values
   */
  function emitChange() {
    const value = multiSelect
      ? { presets: selectedPresets, details }
      : { preset: selectedPresets[0] || '', details }

    onchange(value)
  }
</script>

<div class="field-section">
  <div class="field-label">
    {#if isCompleted}
      <span class="field-check">✓</span>
    {/if}
    <span class="field-letter">{letter}</span>
    <span class="field-title">{title}{#if required}<span class="required-indicator">*</span>{/if}</span>
  </div>

  <div class="field-presets">
    {#each presets as preset}
      <PresetButton
        label={preset}
        selected={selectedPresets.includes(preset)}
        onclick={() => handlePresetClick(preset)}
      />
    {/each}
  </div>

  <div class="field-input">
    <textarea
      rows="2"
      {placeholder}
      value={details}
      oninput={handleInput}
      bind:this={textareaEl}
    ></textarea>
  </div>

  {#if isCompleted && outputLabel}
    <div class="output-preview">
      {outputLabel}: {previewText()}
    </div>
  {/if}
</div>

<style>
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

  .field-input textarea {
    min-height: 48px;
    resize: none;
    overflow: hidden;
  }

  .output-preview {
    font-size: 0.85rem;
    color: var(--color-text-muted, #6c757d);
    font-family: monospace;
    padding: 0.5rem 0;
    word-break: break-word;
    white-space: pre-wrap;
  }
</style>
