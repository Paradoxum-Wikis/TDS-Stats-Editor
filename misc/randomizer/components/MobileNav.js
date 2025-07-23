import { UI_ELEMENTS, appState } from "./Constants.js";
import { performRandomization } from "./Randomize.js";
import { generateResultUrl } from "./url.js";
import { clearAllFilters } from "./Filters.js";
import {
  renderPreselectedTowers,
  renderExcludedMaps,
  renderExcludedTowers,
} from "./Render.js";
import { MobileNavBase } from "../../../Shared/MobileNavBase.js";

class RandomizerMobileNav extends MobileNavBase {
  constructor() {
    const sectionConfigs = {
      controls: {
        originalElement: UI_ELEMENTS.originalSidebar,
        removeClasses: ["aside", "d-none", "d-md-flex"],
        addClasses: ["mobile-controls-section"],
        style: {
          width: "100%",
          height: "auto",
          minWidth: "auto",
          overflowY: "visible",
        },
      },
    };

    const modalConfigs = {
      about: "about-modal",
      settings: "settings-modal",
    };

    super({
      sectionConfigs,
      modalConfigs,
      bodyActiveClass: "mobile-sidebar-open",
    });
  }

  /**
   * Overrides the base populateSidebarContent so that UI_ELEMENTS.originalSidebar is used
   * for the "controls" section.
   * @param {string} sectionName - The name of the section to populate.
   */
  populateSidebarContent(sectionName) {
    if (!this.mobileSidebarContent) return;

    this.mobileSidebarContent.innerHTML = "";

    if (sectionName === "controls") {
      const config = this.sectionConfigs.controls;
      if (config && config.originalElement) {
        const clonedElement = config.originalElement.cloneNode(true);
        clonedElement.classList.remove(...(config.removeClasses || []));
        clonedElement.classList.add(...(config.addClasses || []));
        Object.assign(clonedElement.style, config.style);
        this.mobileSidebarContent.appendChild(clonedElement);
        this.attachSectionEventListeners(clonedElement, sectionName);
      }
    } else {
      const message = document.createElement("p");
      message.className = "text-white";
      message.textContent = "Unknown section selected.";
      this.mobileSidebarContent.appendChild(message);
    }
  }

  /**
   * Overrides the base attachSectionEventListeners for randomizer-specific listeners.
   * Note: `populateSidebarContent` is called after state changes to re-render badges/counts.
   * @param {HTMLElement} container - The container element where the section content was added.
   * @param {string} sectionName - The name of the section.
   */
  attachSectionEventListeners(container, sectionName) {
    if (sectionName === "controls") {
      function setupClonedEventListeners(container) {
        // Syncs
        const clonedIncludeMapsToggle =
          container.querySelector("#includeMapsToggle");
        const clonedIncludeGamemodesToggle = container.querySelector(
          "#includeGamemodesToggle",
        );
        const clonedIncludeLoadoutsToggle = container.querySelector(
          "#includeLoadoutsToggle",
        );
        const clonedExcludeExclusiveTowersToggle = container.querySelector(
          "#excludeExclusiveTowersToggle",
        );
        const clonedExcludeGoldenTowersToggle = container.querySelector(
          "#excludeGoldenTowersToggle",
        );
        const clonedExcludeRemovedTowersToggle = container.querySelector(
          "#excludeRemovedTowersToggle",
        );

        if (clonedIncludeMapsToggle) {
          clonedIncludeMapsToggle.checked =
            UI_ELEMENTS.includeMapsToggle.checked;
          clonedIncludeMapsToggle.addEventListener("change", (e) => {
            UI_ELEMENTS.includeMapsToggle.checked = e.target.checked;
          });
        }
        if (clonedIncludeGamemodesToggle) {
          clonedIncludeGamemodesToggle.checked =
            UI_ELEMENTS.includeGamemodesToggle.checked;
          clonedIncludeGamemodesToggle.addEventListener("change", (e) => {
            UI_ELEMENTS.includeGamemodesToggle.checked = e.target.checked;
          });
        }
        if (clonedIncludeLoadoutsToggle) {
          clonedIncludeLoadoutsToggle.checked =
            UI_ELEMENTS.includeLoadoutsToggle.checked;
          clonedIncludeLoadoutsToggle.addEventListener("change", (e) => {
            UI_ELEMENTS.includeLoadoutsToggle.checked = e.target.checked;
          });
        }
        if (clonedExcludeExclusiveTowersToggle) {
          clonedExcludeExclusiveTowersToggle.checked =
            UI_ELEMENTS.excludeExclusiveTowersToggle.checked;
          clonedExcludeExclusiveTowersToggle.addEventListener("change", (e) => {
            UI_ELEMENTS.excludeExclusiveTowersToggle.checked = e.target.checked;
          });
        }
        if (clonedExcludeGoldenTowersToggle) {
          clonedExcludeGoldenTowersToggle.checked =
            UI_ELEMENTS.excludeGoldenTowersToggle.checked;
          clonedExcludeGoldenTowersToggle.addEventListener("change", (e) => {
            UI_ELEMENTS.excludeGoldenTowersToggle.checked = e.target.checked;
          });
        }
        if (clonedExcludeRemovedTowersToggle) {
          clonedExcludeRemovedTowersToggle.checked =
            UI_ELEMENTS.excludeRemovedTowersToggle.checked;
          clonedExcludeRemovedTowersToggle.addEventListener("change", (e) => {
            UI_ELEMENTS.excludeRemovedTowersToggle.checked = e.target.checked;
          });
        }
      }

      setupClonedEventListeners(container);

      const clonedPreselectMapDropdown =
        container.querySelector("#preselectMap");
      const clonedPreselectModeDropdown =
        container.querySelector("#preselectMode");

      if (clonedPreselectMapDropdown) {
        clonedPreselectMapDropdown.innerHTML =
          UI_ELEMENTS.preselectMapDropdown.innerHTML;
        clonedPreselectMapDropdown.value =
          UI_ELEMENTS.preselectMapDropdown.value;
        clonedPreselectMapDropdown.addEventListener("change", (e) => {
          UI_ELEMENTS.preselectMapDropdown.value = e.target.value;
        });
      }
      if (clonedPreselectModeDropdown) {
        clonedPreselectModeDropdown.innerHTML =
          UI_ELEMENTS.preselectModeDropdown.innerHTML;
        clonedPreselectModeDropdown.value =
          UI_ELEMENTS.preselectModeDropdown.value;
        clonedPreselectModeDropdown.addEventListener("change", (e) => {
          UI_ELEMENTS.preselectModeDropdown.value = e.target.value;
        });
      }

      const clonedPreselectedTowersContainer = container.querySelector(
        "#preselectedTowersContainer",
      );
      if (clonedPreselectedTowersContainer) {
        clonedPreselectedTowersContainer.innerHTML = "";
        appState.preselectedTowers.forEach((tower, index) => {
          const towerBadge = document.createElement("span");
          towerBadge.className =
            "badge bg-primary text-white d-flex align-items-center me-1 mb-1";
          towerBadge.innerHTML = `
            ${tower.name}
            <button type="button" class="btn-close btn-close-white ms-2" aria-label="Remove" data-index="${index}"></button>
          `;
          clonedPreselectedTowersContainer.appendChild(towerBadge);

          towerBadge
            .querySelector(".btn-close")
            .addEventListener("click", (e) => {
              const idxToRemove = parseInt(e.target.dataset.index);
              appState.preselectedTowers.splice(idxToRemove, 1);
              renderPreselectedTowers();
              this.populateSidebarContent("controls");
            });
        });
        container.querySelector("#preselectedTowerCount").textContent =
          `${appState.preselectedTowers.length}/5 towers selected`;
      }

      const clonedExcludedMapsContainer = container.querySelector(
        "#excludedMapsContainer",
      );
      if (clonedExcludedMapsContainer) {
        clonedExcludedMapsContainer.innerHTML = "";
        appState.excludedMaps.forEach((map, index) => {
          const mapBadge = document.createElement("span");
          mapBadge.className =
            "badge bg-danger text-white d-flex align-items-center me-1 mb-1";
          mapBadge.innerHTML = `
            ${map.name}
            <button type="button" class="btn-close btn-close-white ms-2" aria-label="Remove" data-index="${index}"></button>
          `;
          clonedExcludedMapsContainer.appendChild(mapBadge);

          mapBadge
            .querySelector(".btn-close")
            .addEventListener("click", (e) => {
              const idxToRemove = parseInt(e.target.dataset.index);
              appState.excludedMaps.splice(idxToRemove, 1);
              renderExcludedMaps();
              this.populateSidebarContent("controls");
            });
        });
        container.querySelector("#excludedMapCount").textContent =
          `${appState.excludedMaps.length} maps excluded`;
      }

      const clonedExcludedTowersContainer = container.querySelector(
        "#excludedTowersContainer",
      );
      if (clonedExcludedTowersContainer) {
        clonedExcludedTowersContainer.innerHTML = "";
        appState.excludedTowers.forEach((tower, index) => {
          const towerBadge = document.createElement("span");
          towerBadge.className =
            "badge bg-danger text-white d-flex align-items-center me-1 mb-1";
          towerBadge.innerHTML = `
            ${tower.name}
            <button type="button" class="btn-close btn-close-white ms-2" aria-label="Remove" data-index="${index}"></button>
          `;
          clonedExcludedTowersContainer.appendChild(towerBadge);

          towerBadge
            .querySelector(".btn-close")
            .addEventListener("click", (e) => {
              const idxToRemove = parseInt(e.target.dataset.index);
              appState.excludedTowers.splice(idxToRemove, 1);
              renderExcludedTowers();
              this.populateSidebarContent("controls");
            });
        });
        container.querySelector("#excludedTowerCount").textContent =
          `${appState.excludedTowers.length} towers excluded`;
      }

      const clonedAddPreselectTowerBtn = container.querySelector(
        "#addPreselectTowerBtn",
      );
      const clonedPreselectTowerInput = container.querySelector(
        "#preselectTowerInput",
      );
      if (clonedAddPreselectTowerBtn && clonedPreselectTowerInput) {
        clonedAddPreselectTowerBtn.addEventListener("click", () => {
          const towerName = clonedPreselectTowerInput.value.trim();
          if (towerName && appState.preselectedTowers.length < 5) {
            const tower = appState.allTowers.find(
              (t) => t.name.toLowerCase() === towerName.toLowerCase(),
            );
            if (tower) {
              if (
                !appState.preselectedTowers.some(
                  (t) => t.name.toLowerCase() === tower.name.toLowerCase(),
                ) &&
                !appState.excludedTowers.some(
                  (t) => t.name.toLowerCase() === tower.name.toLowerCase(),
                )
              ) {
                appState.preselectedTowers.push(tower);
                renderPreselectedTowers();
                clonedPreselectTowerInput.value = "";
                this.populateSidebarContent("controls");
              } else {
                alert(`"${tower.name}" is already selected or excluded.`);
              }
            } else {
              alert(`Tower "${towerName}" not found.`);
            }
          } else if (appState.preselectedTowers.length >= 5) {
            alert("You can select a maximum of 5 towers.");
          }
        });
      }

      const clonedAddExcludeMapBtn =
        container.querySelector("#addExcludeMapBtn");
      const clonedExcludeMapInput = container.querySelector("#excludeMapInput");
      if (clonedAddExcludeMapBtn && clonedExcludeMapInput) {
        clonedAddExcludeMapBtn.addEventListener("click", () => {
          const mapName = clonedExcludeMapInput.value.trim();
          if (mapName) {
            const map = appState.allMaps.find(
              (m) => m.name.toLowerCase() === mapName.toLowerCase(),
            );
            if (map) {
              if (
                !appState.excludedMaps.some(
                  (m) => m.name.toLowerCase() === map.name.toLowerCase(),
                ) &&
                UI_ELEMENTS.preselectMapDropdown.value.toLowerCase() !==
                  map.name.toLowerCase()
              ) {
                appState.excludedMaps.push(map);
                renderExcludedMaps();
                clonedExcludeMapInput.value = "";
                this.populateSidebarContent("controls");
              } else {
                alert(`"${map.name}" is already excluded or pre-selected.`);
              }
            } else {
              alert(`Map "${mapName}" not found.`);
            }
          }
        });
      }

      const clonedAddExcludeTowerBtn = container.querySelector(
        "#addExcludeTowerBtn",
      );
      const clonedExcludeTowerInput =
        container.querySelector("#excludeTowerInput");
      if (clonedAddExcludeTowerBtn && clonedExcludeTowerInput) {
        clonedAddExcludeTowerBtn.addEventListener("click", () => {
          const towerName = clonedExcludeTowerInput.value.trim();
          if (towerName) {
            const tower = appState.allTowers.find(
              (t) => t.name.toLowerCase() === towerName.toLowerCase(),
            );
            if (tower) {
              if (
                !appState.excludedTowers.some(
                  (t) => t.name.toLowerCase() === tower.name.toLowerCase(),
                ) &&
                !appState.preselectedTowers.some(
                  (t) => t.name.toLowerCase() === tower.name.toLowerCase(),
                )
              ) {
                appState.excludedTowers.push(tower);
                renderExcludedTowers();
                clonedExcludeTowerInput.value = "";
                this.populateSidebarContent("controls");
              } else {
                alert(`"${tower.name}" is already excluded or pre-selected.`);
              }
            } else {
              alert(`Tower "${towerName}" not found.`);
            }
          }
        });
      }

      const clonedRandomizeBtn = container.querySelector("#randomize-btn");
      const clonedCopyResultBtn = container.querySelector("#copy-result-btn");
      const clonedClearFiltersBtn =
        container.querySelector("#clear-filters-btn");

      if (clonedRandomizeBtn) {
        clonedRandomizeBtn.addEventListener("click", () => {
          performRandomization();
          this.closeSidebar();
        });
      }
      if (clonedCopyResultBtn) {
        clonedCopyResultBtn.addEventListener("click", async () => {
          if (
            !appState.lastSelectedMap &&
            !appState.lastSelectedMode &&
            appState.lastFinalTowers.length === 0
          ) {
            alert("Please randomize a challenge first!");
            return;
          }
          const resultUrl = generateResultUrl(
            appState.lastSelectedMap,
            appState.lastSelectedMode,
            appState.lastFinalTowers,
          );
          try {
            await navigator.clipboard.writeText(resultUrl);
            alert("Result URL copied to clipboard!");
          } catch (err) {
            console.error("Failed to copy URL: ", err);
            alert("Failed to copy URL. Please copy manually:\n" + resultUrl);
          }
          this.closeSidebar();
        });
      }
      if (clonedClearFiltersBtn) {
        clonedClearFiltersBtn.addEventListener("click", () => {
          clearAllFilters();
          this.closeSidebar();
        });
      }
    }
  }
}

export default RandomizerMobileNav;
