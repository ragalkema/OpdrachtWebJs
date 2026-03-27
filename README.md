# Future Color - Projectopzet

Deze repository bevat een startopzet voor de eindopdracht **Future Color** in **vanilla JavaScript** met een **MVC-structuur** en een eerste basis voor **error handling**.

De bedoeling van deze opzet is dat jullie sneller kunnen beginnen met:

- een duidelijke scheiding tussen data, logica en interface
- een pagina-indeling voor simulator en kleurentest
- een vaste plek voor weather API-logica
- centrale foutafhandeling in plaats van overal losse `try/catch`

## Projectstructuur

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
    |   `-- AppController.js
    |-- models/
    |   |-- AppState.js
    |   |-- Ingredient.js
    |   |-- MixingMachine.js
    |   `-- Pot.js
    |-- services/
    |   `-- WeatherService.js
    |-- styles/
    |   `-- main.css
    |-- utils/
    |   |-- AppError.js
    |   `-- errorHandler.js
    `-- views/
        `-- AppView.js
```

## Welke map is waarvoor?

### Root

`index.html`  
De hoofdpagina van de applicatie. Hier staat de basislayout met:

- ingrediëntenformulier
- lijst met ingrediënten
- potten-overzicht
- menghallen
- weather-sectie
- kleurentest pagina
- popup voor triadic kleuradvies

`README.md`  
Uitleg over de mappenstructuur, architectuur en hoe jullie deze basis verder kunnen uitbreiden.

## `src/`

Hier staat alle JavaScript- en CSS-code van het project.

`src/app.js`  
Het startpunt van de applicatie. Hier worden de `AppState`, `AppView` en `AppController` aan elkaar gekoppeld en wordt de app opgestart.

## `src/config/`

Bestanden met instellingen die je makkelijk wilt kunnen aanpassen zonder logica te veranderen.

`src/config/appConfig.js`  
Algemene app-instellingen, zoals:

- beschikbare menghallen
- ondersteunde structuren
- ondersteunde kleurmodi
- standaard gridgrootte

`src/config/weatherConfig.js`  
Instellingen voor de weer-API, zoals:

- standaardlocatie
- API-endpoints

Handig als je later makkelijk van stad, locatie of API wilt wisselen.

## `src/controllers/`

Hier staat de logica die **model** en **view** aan elkaar koppelt.

`src/controllers/AppController.js`  
De centrale controller van de app. Deze:

- luistert naar events uit de interface
- maakt nieuwe ingrediënten, potten en machines aan
- stuurt render-methodes aan
- vraagt weerdata op via de service
- verwerkt foutafhandeling op een centrale plek

Later kun je dit opsplitsen in losse controllers, bijvoorbeeld:

- `IngredientController.js`
- `MachineController.js`
- `ColorTestController.js`

## `src/models/`

Hier staan de data-objecten en regels van de applicatie.

`src/models/AppState.js`  
Bevat de globale toestand van de applicatie, zoals:

- actieve pagina
- actieve menghal
- ingrediënten
- potten
- machines
- gridinstellingen
- weerinformatie

`src/models/Ingredient.js`  
Model voor een ingrediënt. Hier horen eigenschappen bij zoals:

- minimale mengtijd
- mengsnelheid
- kleur
- structuur
- vorm

Ook zit hier alvast een simpele methode in voor triadic kleuradvies.

`src/models/Pot.js`  
Model voor een pot. Houdt bij welke ingrediënten erin zitten en of een pot al gemengd is.

`src/models/MixingMachine.js`  
Model voor een mengmachine. Houdt de machine-instellingen bij zoals snelheid en basistijd.

## `src/views/`

Alles wat direct met de DOM en interface-opbouw te maken heeft.

`src/views/AppView.js`  
Bevat methodes voor:

- events koppelen aan knoppen en formulieren
- ingrediënten renderen
- potten renderen
- hallen renderen
- weather info tonen
- grid opbouwen
- statusmeldingen en errors zichtbaar maken

Als jullie project groter wordt, kun je dit opdelen in:

- `IngredientView.js`
- `HallView.js`
- `WeatherView.js`
- `ColorTestView.js`

## `src/services/`

Hier plaats je logica voor externe data of communicatie met APIs.

`src/services/WeatherService.js`  
Deze service haalt weerinformatie op en zet de API-response om naar bruikbare app-data.

Waarom apart?

- controller blijft overzichtelijk
- API-logica staat op een vaste plek
- foutafhandeling rond async code is makkelijker te testen en beheren

## `src/utils/`

Hulpfuncties en gedeelde technische logica.

`src/utils/AppError.js`  
Een eigen error-type voor gecontroleerde applicatiefouten.

Gebruik dit voor fouten zoals:

- ongeldige invoer
- ontbrekende data
- regels die niet gehaald mogen worden

`src/utils/errorHandler.js`  
Bevat helpers om sync en async fouten netjes op te vangen en op een centrale manier te verwerken.

Dit is handig voor de opdracht, omdat juist **error handling in asynchrone code** belangrijk is.

## `src/styles/`

Alle styling van de applicatie.

`src/styles/main.css`  
De basisstijl van de hele applicatie:

- layout
- formulieren
- kaarten
- hallen
- kleurentest grid
- animatie voor machines
- popup styling

## MVC in deze opzet

De rolverdeling is in deze startopzet:

- **Model**: data en regels, bijvoorbeeld `Ingredient`, `Pot`, `MixingMachine`, `AppState`
- **View**: alles wat getoond en gerenderd wordt in de DOM
- **Controller**: reageert op gebruikersacties en stuurt models en views aan

Kort voorbeeld:

1. gebruiker vult formulier in
2. view geeft de invoer door aan controller
3. controller maakt een `Ingredient` model
4. state wordt aangepast
5. view rendert de nieuwe lijst opnieuw

## Error handling aanpak

In deze basisopzet wordt error handling niet "overal los" gedaan, maar centraal opgezet:

- `AppError` voor verwachte applicatiefouten
- `withErrorBoundary()` voor synchrone UI-acties
- `handleAsyncError()` voor asynchrone acties zoals API-calls
- statusbanner in de UI om fouten zichtbaar te maken

Voorbeelden van fouten die jullie later kunnen opvangen:

- ingrediënt zonder geldige mengtijd
- pot met verkeerde mengsnelheid-combinatie
- API niet bereikbaar
- stad niet gevonden
- gebruiker probeert te veel machines te starten bij hitte

## Wat er al klaarstaat

Deze basis bevat al:

- een HTML-layout die bij jullie schets aansluit
- wisselen tussen simulator en kleurentest zonder reload
- wisselen tussen hal 1 en hal 2 zonder reload
- voorbeelddata voor ingrediënten, potten en machines
- weather API-service structuur
- popup voor triadic kleuradvies
- animatie voor de machines
- centrale status- en foutmeldingen

## Slimme volgende stappen

Een logische volgorde om dit project uit te bouwen:

1. Drag & drop maken voor ingrediënten naar potten
2. Regels toevoegen: alleen gelijke mengsnelheid samen in een pot
3. Pot naar machine slepen
4. Mengproces simuleren met `setTimeout()` op basis van hoogste mengtijd
5. Weerfactor toepassen op echte mengtijd
6. Gemengde verf toevoegen aan de kleurentest
7. Klik op grid-cel om verf toe te wijzen
8. Triadic kleuradvies verbeteren met echte HSL-berekening
9. Controllers en views opsplitsen als de code groter wordt

## Openen van het project

Omdat alles in ES modules staat, werkt het het prettigst via een lokale server.

Voorbeeld:

```powershell
python -m http.server 5500
```

Of gebruik de Live Server extensie in VS Code.

Open daarna:

```text
http://localhost:5500
```

## Belangrijke opmerking

De weather-service gebruikt in deze opzet een publieke API-structuur als voorbeeld. Controleer altijd of de API die jullie uiteindelijk gebruiken past bij de eisen van jullie opleiding en docent.
