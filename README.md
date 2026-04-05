# Future Color

Een vanilla JavaScript-app voor een verfsimulator met:

- ingredienten aanmaken
- potten vullen via drag-and-drop
- mengmachines starten
- weerafhankelijke mengtijd
- gemengde verf gebruiken in een kleurentest-grid
- triadic kleuradvies

De app is opgebouwd met een MVC-achtige structuur. De code is inmiddels verder opgesplitst dan de oorspronkelijke startopzet: controllers hebben helpers gekregen, views zijn verdeeld in bindings en renderers, en de styling is opgesplitst over meerdere CSS-bestanden.

## Huidige projectstructuur

```text
FutureColor/
|-- index.html
|-- README.md
`-- src/
    |-- app.js
    |-- config/
    |   |-- appConfig.js
    |   `-- weatherConfig.js
    |-- controllers/
    |   |-- AppController.js
    |   |-- bindAppControllerEvents.js
    |   |-- demoStateFactory.js
    |   |-- mixingState.js
    |   `-- appController/
    |       |-- colorTestActions.js
    |       |-- ingredientActions.js
    |       |-- machineActions.js
    |       |-- renderActions.js
    |       `-- weatherActions.js
    |-- models/
    |   |-- AppState.js
    |   |-- Ingredient.js
    |   |-- MixingMachine.js
    |   `-- Pot.js
    |-- services/
    |   `-- WeatherService.js
    |-- styles/
    |   |-- base.css
    |   |-- components.css
    |   |-- layout.css
    |   |-- main.css
    |   |-- responsive.css
    |   `-- tokens.css
    |-- utils/
    |   |-- AppError.js
    |   |-- colorUtils.js
    |   `-- errorHandler.js
    `-- views/
        |-- AppView.js
        |-- appLayout.js
        |-- viewElements.js
        |-- viewLogger.js
        |-- bindings/
        |   |-- coreBindings.js
        |   `-- interactionBindings.js
        `-- renderers/
            |-- colorTestRenderer.js
            `-- simulatorRenderer.js
```

## Wat doet elke map?

### Root

`index.html`  
Laadt de stylesheet en de JavaScript entrypoint.

`README.md`  
Documentatie van de huidige opzet.

## `src/`

`src/app.js`  
Bootstrap van de app. Hier worden layout, state, view en controller opgestart.

## `src/config/`

Configuratie die losstaat van de domeinlogica.

`appConfig.js`
- hallen
- beschikbare texturen
- kleurmodi
- standaard gridinstellingen

`weatherConfig.js`
- standaardlocatie
- API-endpoints voor Open-Meteo

## `src/controllers/`

De controllerlaag koppelt state, domeinregels en view aan elkaar.

`AppController.js`  
Is nu vooral een dunne orchestrator. Deze klasse:

- beheert gedeelde dependencies zoals `state`, `view`, `weatherService` en `mixTimers`
- bindt events via `bindAppControllerEvents.js`
- roept kleinere action-modules aan
- houdt de publieke API van de controller stabiel voor de rest van de app

`bindAppControllerEvents.js`  
Verbindt alle UI-events met de juiste controller-acties.

`demoStateFactory.js`  
Levert een startsnapshot met demo-data voor de app.

`mixingState.js`  
Helperfuncties voor menglogica, zoals:

- ingredienten in een pot ophalen
- potnummer bepalen
- gemengde verf aanmaken of vernieuwen
- gemengde verf ongeldig maken
- definitieve mengduur berekenen

### `src/controllers/appController/`

Hier staat de opgesplitste implementatie van de controllerlogica per domein.

`ingredientActions.js`

- ingredienten aanmaken
- willekeurige ingredienten genereren
- ingredienten verwijderen
- potten vullen

`machineActions.js`

- potten aanmaken
- machines aanmaken en verwijderen
- potten leegmaken
- mengruns starten en afronden

`colorTestActions.js`

- verf selecteren
- triadic advies tonen
- gridcellen inkleuren

`weatherActions.js`

- demo-state seeden
- weerdata laden en toepassen

`renderActions.js`

- complete UI renderen
- losse rendercalls voor ingredienten, potten, hallen, palette en grid

## `src/models/`

De modellen beschrijven de data en domeinregels.

`AppState.js`
- actieve pagina
- actieve hal
- ingredienten
- potten
- gemengde verf
- grid
- weerstatus

Daarnaast zitten hier lookup-methodes in voor potten, machines, hallen en verf.

`Ingredient.js`  
Model voor een ingredient, inclusief validatie en aanmaak uit formdata of random demo-data.

`Pot.js`  
Model voor een pot met status, ingredienten en gekoppelde machine/verf.

`MixingMachine.js`  
Model voor een mengmachine met snelheid, duur en runtime-status.

## `src/views/`

De viewlaag is opgesplitst in layout, elementselectie, event-bindings en renderers.

`AppView.js`  
Façade voor de rest van de app. De controller praat alleen met deze viewklasse.

`appLayout.js`  
Bevat de markup-template voor de applicatie-layout.

`viewElements.js`  
Verzamelt DOM-referenties op één centrale plek.

`viewLogger.js`  
Stuurt status- en foutmeldingen door naar de console.

### `src/views/bindings/`

UI-eventbindingen.

`coreBindings.js`
- formulieren
- paginawissel
- halnavigatie
- weer ophalen

`interactionBindings.js`
- drag-and-drop
- ingredienten verwijderen
- machines verwijderen
- palette-acties
- pot leegmaken
- gridinteractie

### `src/views/renderers/`

DOM-rendering per functioneel deel.

`simulatorRenderer.js`
- pagina-activatie
- ingredientenlijst
- potten
- menghallen
- weerweergave

`colorTestRenderer.js`
- palette
- geselecteerde verf
- grid
- triadic modal

## `src/services/`

`WeatherService.js`  
Haalt weerdata op via Open-Meteo en zet die om naar app-data:

- locatie opzoeken
- forecast ophalen
- conditie bepalen
- mengmultiplier berekenen

## `src/utils/`

Technische helpers die in meerdere lagen gebruikt worden.

`AppError.js`  
Eigen fouttype voor gecontroleerde applicatiefouten.

`colorUtils.js`  
Kleurhelpers, zoals middelen van RGB-waardes en triadic kleurafleiding.

`errorHandler.js`  
Helpers voor centrale foutafhandeling, zowel sync als async.

## `src/styles/`

De styling is opgesplitst in meerdere bestanden.

`main.css`  
Centraal entrypoint met `@import`s.

`tokens.css`  
CSS-variabelen zoals kleuren, spacing en radii.

`base.css`  
Basisstyling voor body, typografie, formulieren en knoppen.

`layout.css`  
Structuur van de pagina, grids, panelen en algemene layoutblokken.

`components.css`  
Componentstyling voor kaarten, potten, machines, palette, modal en grid.

`responsive.css`  
Alle media queries.

## Architectuur in het kort

De grove rolverdeling is:

- Model: data en domeinregels
- View: DOM-opbouw, rendering en event-binding
- Controller: applicatielogica en coördinatie

Praktische flow:

1. `app.js` start de app.
2. `appLayout.js` zet de layout neer.
3. `AppController.init()` seed demo-data, bindt events en rendert de eerste UI.
4. De gebruiker triggert acties via bindings.
5. De controller past state aan.
6. De juiste renderer(s) tekenen de UI opnieuw.

## Belangrijkste functionaliteit

- ingredienten handmatig of willekeurig toevoegen
- potten aanmaken
- ingredienten naar potten slepen
- potten naar machines slepen
- mengtijd bepalen op basis van ingredienten, machine en weer
- outputverf tonen in het palette
- geselecteerde verf gebruiken in het kleurentest-grid
- triadic kleuradvies tonen in een modal

## Project lokaal draaien

Omdat dit project ES modules gebruikt, open je het het best via een lokale server.

Voorbeeld:

```powershell
python -m http.server 5500
```

Open daarna:

```text
http://localhost:5500
```

Of gebruik Live Server in VS Code.

## Opmerking over weerdata

De app gebruikt de Open-Meteo APIs voor geocoding en forecastdata. Als je deze wilt vervangen, dan hoef je in principe alleen:

- `src/config/weatherConfig.js` aan te passen
- eventueel `src/services/WeatherService.js` uit te breiden
