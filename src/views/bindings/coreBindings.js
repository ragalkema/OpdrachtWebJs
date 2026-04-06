function bindFormSubmit(form, callback) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    callback(new FormData(form));
  });
}

export function bindPageNavigation(elements, handler) {
  elements.pageButtons.forEach((button) => {
    button.addEventListener("click", () => handler(button.dataset.pageTarget));
  });
}

export function bindHallNavigation(elements, handler) {
  elements.hallButtons.forEach((button) => {
    button.addEventListener("click", () => handler(button.dataset.hallTarget));
  });
}

export function bindIngredientCreate(elements, handler) {
  bindFormSubmit(elements.ingredientForm, handler);
}

export function bindRandomIngredient(elements, handler) {
  elements.randomIngredientButton.addEventListener("click", handler);
}

export function bindPotCreate(elements, handler) {
  elements.potButton.addEventListener("click", handler);
}

export function bindMachineCreate(elements, handler) {
  bindFormSubmit(elements.machineForm, handler);
}

export function bindWeatherSearch(elements, handler) {
  elements.weatherForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(elements.weatherForm);
    handler(formData.get("city")?.toString() ?? "");
  });
}

export function bindGridGenerate(elements, handler) {
  elements.gridForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(elements.gridForm);
    handler({
      columns: Number(formData.get("columns")),
      rows: Number(formData.get("rows")),
    });
  });
}

export function bindGridReset(elements, handler) {
  elements.resetGridButton.addEventListener("click", handler);
}
