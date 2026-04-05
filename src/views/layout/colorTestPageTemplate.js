export function renderColorTestPage() {
  return `
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
  `;
}
