<script>
  /**
   * PillToggle - Generic two-option toggle component
   * Reusable pill-shaped toggle with sliding indicator
   */

  let {
    selected = 'left',
    onToggle = () => {},
    leftLabel = '',
    rightLabel = '',
    ariaLabel = 'Toggle'
  } = $props()
</script>

<button
  type="button"
  class="pill-toggle"
  onclick={() => onToggle()}
  aria-label={ariaLabel}
>
  <span class="slider" class:right={selected === 'right'}></span>
  <span class="option" class:selected={selected === 'left'}>{leftLabel}</span>
  <span class="option" class:selected={selected === 'right'}>{rightLabel}</span>
</button>

<style>
  .pill-toggle {
    position: relative;
    display: flex;
    padding: 0.33rem;
    background: var(--color-bg-alt);
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .pill-toggle:hover {
    background: var(--color-border);
  }

  .slider {
    position: absolute;
    top: 0.33rem;
    left: 0.33rem;
    width: calc(50% - 0.33rem);
    height: calc(100% - 0.66rem);
    background: var(--color-primary);
    border-radius: 9999px;
    transition: transform 0.2s ease;
  }

  .slider.right {
    transform: translateX(100%);
  }

  .option {
    position: relative;
    z-index: 1;
    padding: 0.62rem;
    font-size: 0.8125rem;
    font-weight: 600;
    border-radius: 9999px;
    color: var(--color-text-muted);
    transition: color 0.15s ease;
    min-height: 28px;
    min-width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .option:last-child {
    margin-left: 0.15rem;
  }

  .option.selected {
    color: white;
  }
</style>
