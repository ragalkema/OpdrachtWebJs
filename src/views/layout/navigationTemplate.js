export function renderNavigation() {
  return `
    <header class="topbar">
      <nav class="page-nav" aria-label="Hoofdnavigatie">
        <button type="button" class="nav-button is-active" data-page-target="simulator">
          Simulator
        </button>
        <button type="button" class="nav-button" data-page-target="color-test">
          Kleurentest
        </button>
      </nav>
    </header>
  `;
}
