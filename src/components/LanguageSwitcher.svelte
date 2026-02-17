<script>
  /**
   * LanguageSwitcher - Toggle between English and Spanish
   * Tapping anywhere on the pill toggles the language
   */
  import { locale, setLocale } from '../lib/i18n.js'
  import PillToggle from './ui/PillToggle.svelte'

  // Reactive current locale
  let currentLocale = $derived($locale)

  function toggle() {
    setLocale(currentLocale === 'en' ? 'es' : 'en')
  }
</script>

<PillToggle
  selected={currentLocale === 'en' ? 'left' : 'right'}
  onToggle={toggle}
  leftLabel="EN"
  rightLabel="ES"
  ariaLabel={currentLocale === 'en' ? 'Switch to Spanish' : 'Switch to English'}
/>
