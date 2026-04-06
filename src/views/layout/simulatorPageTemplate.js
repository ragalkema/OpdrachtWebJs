function renderWeatherPanel() {
  return `
    <div class="panel weather-panel">
      <div class="weather-intro">
        <h2>Weerregels</h2>
      </div>

      <form class="weather-form weather-inline-form" data-js="weather-form">
        <label>
          Stad
          <input type="text" name="city" value="Amsterdam" required />
        </label>
        <button type="submit" class="secondary-button">Weer ophalen</button>
      </form>

      <div class="weather-cards">
        <article class="weather-card">
          <span>Locatie</span>
          <strong data-js="weather-location">Nog niet geladen</strong>
        </article>
        <article class="weather-card">
          <span>Status</span>
          <strong data-js="weather-condition">Onbekend</strong>
        </article>
        <article class="weather-card">
          <span>Temperatuur</span>
          <strong data-js="weather-temperature">-</strong>
        </article>
        <article class="weather-card">
          <span>Mengtijd factor</span>
          <strong data-js="weather-multiplier">1.00x</strong>
        </article>
      </div>
    </div>
  `;
}

function renderPotsPanel() {
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Potten</h2>
        <button type="button" class="secondary-button" data-js="create-pot">
          + Pot
        </button>
      </div>
      <div class="pot-list drop-zone" data-js="pot-list"></div>
    </section>
  `;
}

function renderHallsPanel() {
  return `
    <section class="panel">
      <div class="section-heading">
        <h2>Menghallen</h2>
        <div class="toggle-group" role="tablist" aria-label="Menghallen">
          <button type="button" class="toggle-button is-active" data-hall-target="hall-1">
            Hal 1
          </button>
          <button type="button" class="toggle-button" data-hall-target="hall-2">
            Hal 2
          </button>
        </div>
      </div>

      <form class="hall-toolbar hall-form" data-js="machine-form">
        <label>
          Machinesnelheid
          <input type="number" name="speed" min="1" max="5" value="1" required />
        </label>
        <label>
          Minimale machinetijd (ms)
          <input type="number" name="baseDuration" min="100" step="100" value="1000" required />
        </label>
        <button type="submit" class="secondary-button">+ Machine</button>
      </form>

      <div class="hall-stage" data-js="hall-stage"></div>
    </section>
  `;
}

export function renderSimulatorPage() {
  return `
    <section class="page is-active" data-page="simulator">
      ${renderWeatherPanel()}

      <div class="workspace-grid">
        ${renderPotsPanel()}
        ${renderHallsPanel()}
      </div>
    </section>
  `;
}
