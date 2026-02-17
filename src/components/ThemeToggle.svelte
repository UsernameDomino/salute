<script>
  /**
   * ThemeToggle - Toggle between light and dark mode
   * Uses emoji icons and persists to localStorage
   * Tapping anywhere on the pill toggles the theme
   */
  import PillToggle from './ui/PillToggle.svelte'

  // Initialize from localStorage or system preference
  function getInitialTheme() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored) {
        return stored === 'dark'
      }
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  }

  let isDark = $state(getInitialTheme())

  // Apply theme class to document
  $effect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  })

  function toggle() {
    isDark = !isDark
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }
</script>

<PillToggle
  selected={isDark ? 'right' : 'left'}
  onToggle={toggle}
  leftLabel="☀️"
  rightLabel="🌙"
  ariaLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
/>
