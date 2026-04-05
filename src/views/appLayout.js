const APP_LAYOUT = `
  <div class="app-shell">
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

    <main class="layout">
      <aside class="sidebar panel">
        <section>
          <div class="section-heading">
            <h2>Ingredient maken</h2>
            <button type="button" class="ghost-button" data-js="generate-random-ingredient">
              Willekeurig
            </button>
          </div>

          <form class="stack ingredient-form" data-js="ingredient-form" novalidate>
            <label>
              Naam
              <input
                type="text"
                name="name"
                placeholder="Bijv. Lime Base"
                maxlength="30"
                required
              />
            </label>

            <div class="form-row ingredient-meta-row">
              <label>
                Min mengtijd (ms)
                <input type="number" name="mixTime" min="100" step="100" value="1000" required />
              </label>

              <label>
                Mengsnelheid
                <input type="number" name="mixSpeed" min="1" max="5" value="1" required />
              </label>
            </div>

            <div class="form-row">
              <label>
                Kleurmodus
                <select name="colorMode">
                  <option value="rgb">RGB</option>
                  <option value="hsl">HSL</option>
                </select>
              </label>

              <label>
                Structuur
                <select name="texture">
                  <option value="korrel">Korrel</option>
                  <option value="grove-korrel">Grove korrel</option>
                  <option value="glad">Glad</option>
                  <option value="slijmerig">Slijmerig</option>
                </select>
              </label>
            </div>

            <label>
              Kleurwaarde
              <input
                type="text"
                name="colorValue"
                value="rgb(120, 200, 80)"
                placeholder="rgb(120, 200, 80) of hsl(120 50% 50%)"
                required
              />
            </label>

            <button type="submit" class="primary-button">Ingredient toevoegen</button>
          </form>
        </section>

        <section>
          <div class="section-heading">
            <h2>Ingredienten</h2>
            <span class="counter" data-js="ingredient-count">0</span>
          </div>
          <div class="ingredient-list" data-js="ingredient-list"></div>
        </section>
      </aside>

      <section class="content">
        <section class="page is-active" data-page="simulator">
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

          <div class="workspace-grid">
            <section class="panel">
              <div class="section-heading">
                <h2>Potten</h2>
                <button type="button" class="secondary-button" data-js="create-pot">
                  + Pot
                </button>
              </div>
              <div class="pot-list drop-zone" data-js="pot-list"></div>
            </section>

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
          </div>
        </section>

        <section class="page" data-page="color-test">
          <div class="panel color-test-layout">
            <div class="color-test-sidebar">
              <div class="section-heading">
                <h2>Kleurentest</h2>
                <button type="button" class="ghost-button" data-js="reset-grid">
                  Reset grid
                </button>
              </div>

              <form class="stack" data-js="grid-form">
                <div class="form-row">
                  <label>
                    Kolommen
                    <input type="number" name="columns" min="1" max="12" value="6" required />
                  </label>
                  <label>
                    Rijen
                    <input type="number" name="rows" min="1" max="12" value="6" required />
                  </label>
                </div>

                <button type="submit" class="primary-button">Genereer grid</button>
              </form>

              <div class="palette-panel">
                <h3>Gemengde verf</h3>
                <div class="palette" data-js="palette-list"></div>
              </div>
            </div>

            <div class="color-test-canvas">
              <div class="grid-board" data-js="grid-board"></div>
            </div>
          </div>
        </section>
      </section>
    </main>
  </div>

  <dialog class="triadic-modal" data-js="triadic-modal">
    <form method="dialog" class="modal-card">
      <div class="section-heading">
        <h2>Triadic kleuradvies</h2>
        <button type="submit" class="ghost-button">Sluiten</button>
      </div>
      <div class="triadic-swatches" data-js="triadic-swatches"></div>
    </form>
  </dialog>
`;

export function renderAppLayout(documentRef) {
  const mountPoint = documentRef.querySelector('[data-js="app-root"]');
  mountPoint.innerHTML = APP_LAYOUT;
}
