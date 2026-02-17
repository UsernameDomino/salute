<script>
  /**
   * PresetButton - A large, accessible button for SALUTE field presets
   */
  
  let { label = '', selected = false, onclick = () => {} } = $props()
</script>

<button
  type="button"
  class="btn-preset"
  class:selected
  aria-pressed={selected}
  onclick={onclick}
>
  {label}
</button>

<style>
  /* Component-specific styles - base styles in app.css */
</style>
