<script>
  /**
   * ExplainerPanel - SALUTE acronym breakdown
   * Displays explanation of the SALUTE method fields
   */
  import { t } from '../lib/i18n.js'

  let { show = false } = $props()
</script>

{#if show}
  <div class="explainer-panel">
    <div class="container">
      <p>{$t('explainer.text')}</p>
      <ul>
        <li><strong>S</strong> - {$t('explainer.size')}</li>
        <li><strong>A</strong> - {$t('explainer.activity')}</li>
        <li><strong>L</strong> - {$t('explainer.location')}</li>
        <li><strong>U</strong> - {$t('explainer.unit')}</li>
        <li><strong>T</strong> - {$t('explainer.time')}</li>
        <li><strong>E</strong> - {$t('explainer.equipment')}</li>
      </ul>
    </div>
  </div>
{/if}

<style>
  .explainer-panel {
    background: var(--color-bg-alt);
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  .explainer-panel p {
    margin: 0 0 0.75rem 0;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: var(--color-text);
  }

  .explainer-panel ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.875rem;
    color: var(--color-text);
  }

  .explainer-panel li {
    margin-bottom: 0.25rem;
  }
</style>
