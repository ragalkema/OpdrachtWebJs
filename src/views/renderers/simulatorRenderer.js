function getPotStatusLabel(status) {
  return (
    {
      ready: "klaar om te mengen",
      mixing: "bezig met mengen",
      mixed: "gemengd",
    }[status] ?? status
  );
}

function findPotNumber(pots, potId) {
  return pots.findIndex((pot) => pot.id === potId) + 1;
}

export function setActivePage(elements, page) {
  elements.pageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.pageTarget === page);
  });

  elements.pages.forEach((section) => {
    section.classList.toggle("is-active", section.dataset.page === page);
  });
}

export function renderIngredients(elements, ingredients) {
  elements.ingredientCount.textContent = ingredients.length.toString();

  if (ingredients.length === 0) {
    elements.ingredientList.innerHTML =
      '<p class="empty-state">Geen losse ingredienten. Maak er een aan of wacht tot je nieuwe voorraad hebt.</p>';
    return;
  }

  elements.ingredientList.innerHTML = ingredients
    .map(
      (ingredient) => `
        <article class="ingredient-card" draggable="true" data-drag-type="ingredient" data-drag-id="${ingredient.id}">
          <div class="card-toolbar">
            <span class="drag-chip" aria-hidden="true">Sleep</span>
            <button type="button" class="card-remove-button" data-ingredient-remove="${ingredient.id}" aria-label="Verwijder ingredient ${ingredient.name}">x</button>
          </div>
          <div class="ingredient-card-body drag-surface">
            <div class="shape shape-${ingredient.shape} texture-${ingredient.texture}" style="--ingredient-color: ${ingredient.colorValue}"></div>
            <div>
              <h3>${ingredient.name}</h3>
              <p>${ingredient.mixTime} ms | snelheid ${ingredient.mixSpeed}</p>
              <p>${ingredient.texture} | ${ingredient.colorValue}</p>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

export function renderPots(elements, pots, ingredients, mixedPaints) {
  const workspacePots = pots.filter((pot) => pot.status !== "mixed");

  if (workspacePots.length === 0) {
    elements.potList.innerHTML =
      '<p class="empty-state">Nog geen potten. Maak eerst een lege pot aan.</p>';
    return;
  }

  elements.potList.innerHTML = workspacePots
    .map((pot, index) => {
      const potIngredients = pot.ingredientIds
        .map((id) => ingredients.find((ingredient) => ingredient.id === id))
        .filter(Boolean);
      const paint = mixedPaints.find((item) => item.id === pot.mixedPaintId);
      const isDraggable = potIngredients.length > 0 && pot.status === "ready";
      const canClear = potIngredients.length > 0 && pot.status !== "mixing";
      const dragAttributes = isDraggable
        ? `draggable="true" data-drag-type="pot" data-drag-id="${pot.id}"`
        : "";

      return `
        <article class="pot-card pot-card-${pot.status}" data-pot-id="${pot.id}" ${dragAttributes}>
          <div class="card-toolbar">
            ${isDraggable ? '<span class="drag-chip" aria-hidden="true">Sleep</span>' : '<span class="drag-chip is-muted" aria-hidden="true">Vast</span>'}
            ${canClear ? `<button type="button" class="card-remove-button" data-pot-remove="${pot.id}" aria-label="Maak pot ${index + 1} leeg">x</button>` : '<span class="card-remove-placeholder" aria-hidden="true"></span>'}
          </div>
          <div class="pot-card-body drag-surface">
            <div class="pot-visual ${pot.status === "mixed" ? "is-mixed" : ""}"></div>
            <div>
              <h3>Pot ${index + 1}</h3>
              <p>Status: ${getPotStatusLabel(pot.status)}</p>
              <p>Snelheid: ${potIngredients[0]?.mixSpeed ?? "-"}</p>
              <p>${potIngredients.length ? potIngredients.map((item) => item.name).join(", ") : "Nog leeg"}</p>
              ${paint ? `<p class="paint-badge" style="--badge-color: ${paint.colorValue}">${paint.name}</p>` : ""}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

export function renderHalls(elements, halls, activeHallId, pots, ingredients, mixedPaints, weather) {
  const hall = halls.find((item) => item.id === activeHallId);
  const paintMap = new Map(mixedPaints.map((paint) => [paint.id, paint]));

  elements.hallButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.hallTarget === activeHallId);
  });

  if (!hall) {
    elements.hallStage.innerHTML = "";
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
          <strong>Pot ${findPotNumber(pots, potId)}</strong>
          <span>Klaar</span>
        </article>
      `;
    })
    .join("");

  elements.hallStage.innerHTML = `
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
            const currentPot = machine.potId ? pots.find((pot) => pot.id === machine.potId) : null;
            const currentIngredients = currentPot
              ? currentPot.ingredientIds
                  .map((id) => ingredients.find((ingredient) => ingredient.id === id))
                  .filter(Boolean)
              : [];

            return `
              <article class="machine-card ${machine.active ? "is-active" : ""}" data-machine-id="${machine.id}">
                <div class="machine-top">
                  <div class="machine-meta">
                    <span>Machine ${index + 1}</span>
                    <strong>x${machine.speed}</strong>
                  </div>
                  <button type="button" class="card-remove-button" data-machine-remove="${machine.id}" aria-label="Verwijder machine ${index + 1}">x</button>
                </div>
                <div class="machine-body">
                  <div class="spinner ${machine.active ? "is-running" : ""}"></div>
                  <div class="machine-drop">
                    ${machine.active ? `Pot ${findPotNumber(pots, machine.potId)}` : "Sleep pot hier"}
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

export function renderWeather(elements, weather) {
  elements.weatherLocation.textContent = weather.city;
  elements.weatherCondition.textContent = weather.condition;
  elements.weatherTemperature.textContent = `${weather.temperature.toFixed(1)} C`;
  elements.weatherMultiplier.textContent = `${weather.mixMultiplier.toFixed(2)}x`;
}
