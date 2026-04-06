export function renderSidebar() {
  return `
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
  `;
}
