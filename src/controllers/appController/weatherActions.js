import { createDemoStateSnapshot } from "../demoStateFactory.js";

export async function loadWeatherAction(controller, city) {
  const weather = await controller.weatherService.getWeatherByCity(city);
  controller.state.weather = weather;
  controller.view.renderWeather(weather);
  controller.renderHalls();

  if (weather.temperature > 35 && controller.state.getActiveMachineCount() > 1) {
    controller.view.showStatus(
      "Waarschuwing: boven 35 graden mag er maar 1 machine tegelijk draaien.",
      "warning"
    );
    return;
  }

  controller.view.showStatus(`Weer geladen voor ${weather.city}.`, "success");
}

export function seedDemoDataAction(controller) {
  Object.assign(controller.state, createDemoStateSnapshot());
}
