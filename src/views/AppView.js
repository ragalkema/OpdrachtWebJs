export class AppView {
  constructor(documentRef) {
    this.document = documentRef;

    this.elements = {
      ingredientForm: this.document.querySelector('[data-js="ingredient-form"]'),
      ingredientList: this.document.querySelector('[data-js="ingredient-list"]'),
      ingredientCount: this.document.querySelector('[data-js="ingredient-count"]'),
      randomIngredientButton: this.document.querySelector('[data-js="generate-random-ingredient"]'),
      potButton: this.document.querySelector('[data-js="create-pot"]'),
      potList: this.document.querySelector('[data-js="pot-list"]'),
      machineForm: this.document.querySelector('[data-js="machine-form"]'),
      hallStage: this.document.querySelector('[data-js="hall-stage"]'),
      statusBanner: this.document.querySelector('[data-js="status-banner"]'),
      outputList: this.document.querySelector('[data-js="output-list"]'),
      pageButtons: [...this.document.querySelectorAll("[data-page-target]")],
      pages: [...this.document.querySelectorAll("[data-page]")],
      hallButtons: [...this.document.querySelectorAll("[data-hall-target]")],
      weatherForm: this.document.querySelector('[data-js="weather-form"]'),
      weatherLocation: this.document.querySelector('[data-js="weather-location"]'),
      weatherCondition: this.document.querySelector('[data-js="weather-condition"]'),
      weatherTemperature: this.document.querySelector('[data-js="weather-temperature"]'),
      weatherMultiplier: this.document.querySelector('[data-js="weather-multiplier"]'),
      gridForm: this.document.querySelector('[data-js="grid-form"]'),
      gridBoard: this.document.querySelector('[data-js="grid-board"]'),
      resetGridButton: this.document.querySelector('[data-js="reset-grid"]'),
      paletteList: this.document.querySelector('[data-js="palette-list"]'),
      selectedPaint: this.document.querySelector('[data-js="selected-paint"]'),
      triadicModal: this.document.querySelector('[data-js="triadic-modal"]'),
      triadicSwatches: this.document.querySelector('[data-js="triadic-swatches"]'),
    };
  }

  bindPageNavigation(handler) {
    this.elements.pageButtons.forEach((button) => {
      button.addEventListener("click", () => handler(button.dataset.pageTarget));
    });
  }

  bindHallNavigation(handler) {
    this.elements.hallButtons.forEach((button) => {
      button.addEventListener("click", () => handler(button.dataset.hallTarget));
    });
  }

  bindIngredientCreate(handler) {
    this.elements.ingredientForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handler(new FormData(this.elements.ingredientForm));
    });
  }

  bindRandomIngredient(handler) {
    this.elements.randomIngredientButton.addEventListener("click", handler);
  }

  bindPotCreate(handler) {
    this.elements.potButton.addEventListener("click", handler);
  }

  bindMachineCreate(handler) {
    this.elements.machineForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handler(new FormData(this.elements.machineForm));
    });
  }

  bindWeatherSearch(handler) {
    this.elements.weatherForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(this.elements.weatherForm);
      handler(formData.get("city")?.toString() ?? "");
    });
  }

  bindGridGenerate(handler) {
    this.elements.gridForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(this.elements.gridForm);
      handler({
        columns: Number(formData.get("columns")),
        rows: Number(formData.get("rows")),
      });
    });
  }

  bindGridReset(handler) {
    this.elements.resetGridButton.addEventListener("click", handler);
  }

  bindDragAndDrop({ onIngredientDrop, onPotDrop }) {
    this.document.addEventListener("dragstart", (event) => {
      const draggable = event.target.closest("[data-drag-type]");

      if (!draggable) {
        return;
      }

      event.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
          type: draggable.dataset.dragType,
          id: draggable.dataset.dragId,
        })
      );
      event.dataTransfer.effectAllowed = "move";
    });

    this.elements.potList.addEventListener("dragover", (event) => {
      if (event.target.closest("[data-pot-id]")) {
        event.preventDefault();
      }
    });

    this.elements.potList.addEventListener("drop", (event) => {
      const target = event.target.closest("[data-pot-id]");

      if (!target) {
        return;
      }

      const payload = this.readDragPayload(event);

      if (payload?.type === "ingredient") {
        event.preventDefault();
        onIngredientDrop({
          ingredientId: payload.id,
          potId: target.dataset.potId,
        });
      }
    });

    this.elements.hallStage.addEventListener("dragover", (event) => {
      if (event.target.closest("[data-machine-id]")) {
        event.preventDefault();
      }
    });

    this.elements.hallStage.addEventListener("drop", (event) => {
      const target = event.target.closest("[data-machine-id]");

      if (!target) {
        return;
      }

      const payload = this.readDragPayload(event);

      if (payload?.type === "pot") {
        event.preventDefault();
        onPotDrop({
          potId: payload.id,
          machineId: target.dataset.machineId,
        });
      }
    });
  }

  bindPaletteSelect(handler) {
    this.elements.paletteList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-palette-select]");

      if (button) {
        handler(button.dataset.paletteSelect);
      }
    });
  }

  bindPaletteAdvice(handler) {
    this.elements.paletteList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-palette-advice]");

      if (button) {
        handler(button.dataset.paletteAdvice);
      }
    });
  }

  bindGridCellClick(handler) {
    this.elements.gridBoard.addEventListener("click", (event) => {
      const cell = event.target.closest("[data-cell-index]");

      if (cell) {
        handler(Number(cell.dataset.cellIndex));
      }
    });
  }

  setActivePage(page) {
    this.elements.pageButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.pageTarget === page);
    });

    this.elements.pages.forEach((section) => {
      section.classList.toggle("is-active", section.dataset.page === page);
    });
  }

  renderIngredients(ingredients) {
    this.elements.ingredientCount.textContent = ingredients.length.toString();

    if (ingredients.length === 0) {
      this.elements.ingredientList.innerHTML =
        '<p class="empty-state">Geen losse ingredienten. Maak er een aan of wacht tot je nieuwe voorraad hebt.</p>';
      return;
    }

    this.elements.ingredientList.innerHTML = ingredients
      .map(
        (ingredient) => `
          <article class="ingredient-card" draggable="true" data-drag-type="ingredient" data-drag-id="${ingredient.id}">
            <div class="shape shape-${ingredient.shape} texture-${ingredient.texture}" style="--ingredient-color: ${ingredient.colorValue}"></div>
            <div>
              <h3>${ingredient.name}</h3>
              <p>${ingredient.mixTime} ms | snelheid ${ingredient.mixSpeed}</p>
              <p>${ingredient.texture} | ${ingredient.colorValue}</p>
            </div>
          </article>
        `
      )
      .join("");
  }

  renderPots(pots, ingredients, mixedPaints) {
    if (pots.length === 0) {
      this.elements.potList.innerHTML =
        '<p class="empty-state">Nog geen potten. Maak eerst een lege pot aan.</p>';
      return;
    }

    this.elements.potList.innerHTML = pots
      .map((pot, index) => {
        const potIngredients = pot.ingredientIds
          .map((id) => ingredients.find((ingredient) => ingredient.id === id))
          .filter(Boolean);
        const paint = mixedPaints.find((item) => item.id === pot.mixedPaintId);
        const isDraggable = potIngredients.length > 0 && pot.status === "ready";
        const dragAttributes = isDraggable
          ? `draggable="true" data-drag-type="pot" data-drag-id="${pot.id}"`
          : "";

        return `
          <article class="pot-card pot-card-${pot.status}" data-pot-id="${pot.id}" ${dragAttributes}>
            <div class="pot-visual ${pot.status === "mixed" ? "is-mixed" : ""}"></div>
            <div>
              <h3>Pot ${index + 1}</h3>
              <p>Status: ${this.getPotStatusLabel(pot.status)}</p>
              <p>Snelheid: ${potIngredients[0]?.mixSpeed ?? "-"}</p>
              <p>${potIngredients.length ? potIngredients.map((item) => item.name).join(", ") : "Nog leeg"}</p>
              ${paint ? `<p class="paint-badge" style="--badge-color: ${paint.colorValue}">${paint.name}</p>` : ""}
            </div>
          </article>
        `;
      })
      .join("");
  }

  renderHalls(halls, activeHallId, pots, ingredients, mixedPaints, weather) {
    const hall = halls.find((item) => item.id === activeHallId);
    const paintMap = new Map(mixedPaints.map((paint) => [paint.id, paint]));

    this.elements.hallButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.hallTarget === activeHallId);
    });

    if (!hall) {
      this.elements.hallStage.innerHTML = "";
      return;
    }

    const outputMarkup = hall.outputPotIds
      .map((potId) => {
        const pot = pots.find((item) => item.id === potId);
        const color = pot?.mixedPaintId
          ? paintMap.get(pot.mixedPaintId)?.colorValue ?? "rgb(220, 220, 220)"
          : "rgb(220, 220, 220)";

        return `
          <article class="output-pot">
            <div class="output-color" style="--output-color: ${color}"></div>
            <strong>Pot ${this.findPotNumber(pots, potId)}</strong>
            <span>Klaar</span>
          </article>
        `;
      })
      .join("");

    this.elements.hallStage.innerHTML = `
      <div class="hall-card">
        <div class="hall-header">
          <div class="hall-label">${hall.name}</div>
          <p class="hint">
            Weerfactor ${weather.mixMultiplier.toFixed(2)}x |
            ${weather.temperature.toFixed(1)} C |
            ${weather.condition}
          </p>
        </div>

        <div class="machine-lane">
          ${hall.machines
            .map((machine, index) => {
              const currentPot = machine.potId
                ? pots.find((pot) => pot.id === machine.potId)
                : null;
              const currentIngredients = currentPot
                ? currentPot.ingredientIds
                    .map((id) => ingredients.find((ingredient) => ingredient.id === id))
                    .filter(Boolean)
                : [];

              return `
                <article class="machine-card ${machine.active ? "is-active" : ""}" data-machine-id="${machine.id}">
                  <div class="machine-top">
                    <span>Machine ${index + 1}</span>
                    <strong>x${machine.speed}</strong>
                  </div>
                  <div class="machine-body">
                    <div class="spinner ${machine.active ? "is-running" : ""}"></div>
                    <div class="machine-drop">
                      ${machine.active ? `Pot ${this.findPotNumber(pots, machine.potId)}` : "Sleep pot hier"}
                    </div>
                  </div>
                  <p>Minimale machinetijd: ${machine.baseDuration} ms</p>
                  <p>${machine.active ? `Bezig met ${currentIngredients.length} ingredient(en)` : "Machine is vrij"}</p>
                </article>
              `;
            })
            .join("")}
        </div>

        <section class="hall-output">
          <h3>Output hal</h3>
          <div class="output-lane">
            ${outputMarkup || '<p class="empty-state">Nog geen potten klaar in deze hal.</p>'}
          </div>
        </section>
      </div>
    `;
  }

  renderPalette(items, selectedPaintId) {
    if (items.length === 0) {
      this.elements.paletteList.innerHTML =
        '<p class="empty-state">Nog geen gemengde verf. Meng eerst een pot.</p>';
      return;
    }

    this.elements.paletteList.innerHTML = items
      .map(
        (item) => `
          <article class="palette-card ${item.id === selectedPaintId ? "is-selected" : ""}">
            <button
              type="button"
              class="palette-preview-button"
              data-palette-advice="${item.id}"
              aria-label="Toon triadic advies voor ${item.name}"
            >
              <div class="palette-preview" style="--swatch-color: ${item.colorValue}"></div>
            </button>
            <div class="palette-copy">
              <span>${item.name}</span>
              <strong>${item.colorValue}</strong>
            </div>
            <div class="palette-actions">
              <button type="button" class="secondary-button" data-palette-select="${item.id}">
                Gebruik
              </button>
              <button type="button" class="ghost-button" data-palette-advice="${item.id}">
                Triadic
              </button>
            </div>
          </article>
        `
      )
      .join("");
  }

  renderSelectedPaint(paint) {
    this.elements.selectedPaint.textContent = paint
      ? `Geselecteerd: ${paint.name} (${paint.colorValue})`
      : "Geen verf geselecteerd";
  }

  renderWeather(weather) {
    this.elements.weatherLocation.textContent = weather.city;
    this.elements.weatherCondition.textContent = weather.condition;
    this.elements.weatherTemperature.textContent = `${weather.temperature.toFixed(1)} C`;
    this.elements.weatherMultiplier.textContent = `${weather.mixMultiplier.toFixed(2)}x`;
  }

  renderGrid(grid, mixedPaints) {
    const paintMap = new Map(mixedPaints.map((paint) => [paint.id, paint]));
    this.elements.gridBoard.style.setProperty("--grid-columns", grid.columns);
    this.elements.gridBoard.innerHTML = grid.cells
      .map((paintId, index) => {
        const paint = paintId ? paintMap.get(paintId) : null;
        const label = paint ? `${paint.name} - ${paint.colorValue}` : "Leeg kleurvak";

        return `
          <button
            type="button"
            class="grid-cell ${paint ? "is-filled" : ""}"
            data-cell-index="${index}"
            style="--cell-color: ${paint?.colorValue ?? "rgba(255, 255, 255, 0.9)"}"
            aria-label="${label}"
            title="${label}"
          ></button>
        `;
      })
      .join("");
  }

  showStatus(message, tone = "info") {
    this.elements.statusBanner.className = `status-banner is-${tone}`;
    this.elements.statusBanner.textContent = message;

    const item = this.document.createElement("article");
    item.className = "output-item";
    item.innerHTML = `<strong>${tone.toUpperCase()}</strong><p>${message}</p>`;
    this.elements.outputList.prepend(item);
  }

  showTriadicColors(basePaint, triadicColors) {
    this.elements.triadicSwatches.innerHTML = `
      <article class="triadic-item">
        <div class="triadic-preview" style="--swatch-color: ${basePaint.colorValue}"></div>
        <strong>${basePaint.name}</strong>
        <span>${basePaint.colorValue}</span>
      </article>
      ${triadicColors
        .map(
          (color) => `
            <article class="triadic-item">
              <div class="triadic-preview" style="--swatch-color: ${color.value}"></div>
              <strong>${color.label}</strong>
              <span>${color.value}</span>
            </article>
          `
        )
        .join("")}
    `;

    this.elements.triadicModal.showModal();
  }

  resetIngredientForm() {
    this.elements.ingredientForm.reset();
  }

  resetMachineForm() {
    this.elements.machineForm.reset();
  }

  readDragPayload(event) {
    try {
      return JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch {
      return null;
    }
  }

  getPotStatusLabel(status) {
    return (
      {
        ready: "klaar om te mengen",
        mixing: "bezig met mengen",
        mixed: "gemengd",
      }[status] ?? status
    );
  }

  findPotNumber(pots, potId) {
    return pots.findIndex((pot) => pot.id === potId) + 1;
  }
}
