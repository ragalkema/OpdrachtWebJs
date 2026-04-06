import { renderColorTestPage } from "./layout/colorTestPageTemplate.js";
import { renderNavigation } from "./layout/navigationTemplate.js";
import { renderSidebar } from "./layout/sidebarTemplate.js";
import { renderSimulatorPage } from "./layout/simulatorPageTemplate.js";
import { renderTriadicModal } from "./layout/triadicModalTemplate.js";

function createAppLayoutMarkup() {
  return `
    <div class="app-shell">
      ${renderNavigation()}

      <main class="layout">
        ${renderSidebar()}

        <section class="content">
          ${renderSimulatorPage()}
          ${renderColorTestPage()}
        </section>
      </main>
    </div>

    ${renderTriadicModal()}
  `;
}

export function renderAppLayout(documentRef) {
  const mountPoint = documentRef.querySelector('[data-js="app-root"]');
  mountPoint.innerHTML = createAppLayoutMarkup();
}
