import { AppError } from "../utils/AppError.js";

export class WeatherService {
  constructor(config) {
    this.config = config;
  }

  async getWeatherByCity(city) {
    const safeCity = city?.trim();

    if (!safeCity) {
      throw new AppError("Vul eerst een stad in.", "CITY_REQUIRED");
    }

    try {
      const coordinates = await this.getCoordinates(safeCity);
      const forecast = await this.getForecast(coordinates.latitude, coordinates.longitude);
      return this.mapWeatherData(safeCity, forecast);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "De weergegevens konden niet geladen worden. Controleer de verbinding of API-instellingen.",
        "WEATHER_FETCH_FAILED",
        error
      );
    }
  }

  async getCoordinates(city) {
    const url = new URL(this.config.endpoints.geocoding);
    url.searchParams.set("name", city);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "nl");
    url.searchParams.set("format", "json");

    const response = await fetch(url);

    if (!response.ok) {
      throw new AppError("Locatie kon niet worden opgezocht.", "GEOCODING_FAILED");
    }

    const data = await response.json();
    const firstResult = data.results?.[0];

    if (!firstResult) {
      throw new AppError(`Geen locatie gevonden voor "${city}".`, "CITY_NOT_FOUND");
    }

    return {
      latitude: firstResult.latitude,
      longitude: firstResult.longitude,
    };
  }

  async getForecast(latitude, longitude) {
    const url = new URL(this.config.endpoints.forecast);
    url.searchParams.set("latitude", latitude.toString());
    url.searchParams.set("longitude", longitude.toString());
    url.searchParams.set("current", "temperature_2m,weather_code");

    const response = await fetch(url);

    if (!response.ok) {
      throw new AppError("Voorspelling kon niet worden opgehaald.", "FORECAST_FAILED");
    }

    return response.json();
  }

  mapWeatherData(city, forecast) {
    const temperature = forecast.current?.temperature_2m;
    const weatherCode = forecast.current?.weather_code;

    if (typeof temperature !== "number") {
      throw new AppError("Temperatuur ontbreekt in het antwoord van de API.", "WEATHER_DATA_INVALID");
    }

    const condition = this.resolveCondition(weatherCode);
    const mixMultiplier = this.resolveMixMultiplier(condition, temperature);

    return {
      city,
      condition,
      temperature,
      mixMultiplier,
    };
  }

  resolveCondition(weatherCode) {
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      return "Sneeuw";
    }

    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
      return "Regen";
    }

    return "Droog";
  }

  resolveMixMultiplier(condition, temperature) {
    let multiplier = 1;

    if (condition === "Regen" || condition === "Sneeuw") {
      multiplier += 0.1;
    }

    if (temperature < 10) {
      multiplier += 0.15;
    }

    return Number(multiplier.toFixed(2));
  }
}
