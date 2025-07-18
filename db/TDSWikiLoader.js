/**
 * TDSWikiLoader.js
 * Loads the content it got from the fetcher
 */

document.addEventListener("DOMContentLoaded", function () {
  const savedView = localStorage.getItem("towerViewPreference") || "grid";

  // start in grid view by default
  const allTowers = document.getElementById("all-towers");
  const gridViewBtn = document.getElementById("grid-view-btn");
  const listViewBtn = document.getElementById("list-view-btn");

  // remove ALL responsive grid classes (bootstrap bug with this site)
  function removeAllGridClasses(element) {
    element.classList.remove(
      "row-cols-1",
      "row-cols-sm-1",
      "row-cols-md-2",
      "row-cols-lg-3",
      "row-cols-lg-5",
      "row-cols-xl-4",
      "row-cols-xxl-5",
    );
  }

  if (savedView === "list") {
    removeAllGridClasses(allTowers);
    allTowers.classList.add("row-cols-1");

    listViewBtn.classList.add("active", "btn-primary");
    listViewBtn.classList.remove("btn-outline-primary");
    gridViewBtn.classList.remove("active", "btn-primary");
    gridViewBtn.classList.add("btn-outline-primary");
  } else {
    removeAllGridClasses(allTowers);
    allTowers.classList.add(
      "row-cols-sm-1",
      "row-cols-md-2",
      "row-cols-lg-3",
      "row-cols-xl-4",
      "row-cols-xxl-5",
    );

    gridViewBtn.classList.add("active", "btn-primary");
    gridViewBtn.classList.remove("btn-outline-primary");
    listViewBtn.classList.remove("active", "btn-primary");
    listViewBtn.classList.add("btn-outline-primary");
  }

  function toggleGridStylesheet(enabled) {
    const gridStyleLink = document.querySelector('link[href="GridScale.css"]');
    if (gridStyleLink) {
      gridStyleLink.disabled = !enabled;
    }
  }

  toggleGridStylesheet(savedView === "grid");

  document
    .getElementById("upload-tower-btn")
    .addEventListener("click", function () {
      const uploadModal = new bootstrap.Modal(
        document.getElementById("uploadTowerModal"),
      );
      uploadModal.show();
    });

  document
    .getElementById("grid-view-btn")
    .addEventListener("click", function () {
      removeAllGridClasses(allTowers);
      allTowers.classList.add(
        "row-cols-sm-1",
        "row-cols-md-2",
        "row-cols-lg-3",
        "row-cols-xl-4",
        "row-cols-xxl-5",
      );

      gridViewBtn.classList.add("active", "btn-primary");
      gridViewBtn.classList.remove("btn-outline-primary");
      listViewBtn.classList.remove("active", "btn-primary");
      listViewBtn.classList.add("btn-outline-primary");

      toggleGridStylesheet(true);

      document.querySelectorAll("#all-towers .card").forEach((card) => {
        card.classList.remove("list-view-card");

        const listBadgesContainer = card.querySelector(".card-body > .mt-2");
        if (listBadgesContainer && listBadgesContainer.innerHTML.trim()) {
          const absoluteContainer = document.createElement("div");
          absoluteContainer.className = "position-absolute top-0 end-0 p-2";
          absoluteContainer.innerHTML = listBadgesContainer.innerHTML;

          card.insertBefore(absoluteContainer, card.firstChild);
          listBadgesContainer.remove();
        }
      });

      localStorage.setItem("towerViewPreference", "grid");
    });

  document
    .getElementById("list-view-btn")
    .addEventListener("click", function () {
      removeAllGridClasses(allTowers);
      allTowers.classList.add("row-cols-1");

      listViewBtn.classList.add("active", "btn-primary");
      listViewBtn.classList.remove("btn-outline-primary");
      gridViewBtn.classList.remove("active", "btn-primary");
      gridViewBtn.classList.add("btn-outline-primary");

      toggleGridStylesheet(false);

      document.querySelectorAll("#all-towers .card").forEach((card) => {
        card.classList.add("list-view-card");

        const absoluteBadgesContainer = card.querySelector(
          ".position-absolute.top-0.end-0",
        );
        if (
          absoluteBadgesContainer &&
          absoluteBadgesContainer.innerHTML.trim()
        ) {
          const cardBody = card.querySelector(".card-body");
          if (cardBody) {
            const listContainer = document.createElement("div");
            listContainer.className = "mt-2";
            listContainer.innerHTML = absoluteBadgesContainer.innerHTML;

            cardBody.appendChild(listContainer);
            absoluteBadgesContainer.remove();
          }
        }
      });

      localStorage.setItem("towerViewPreference", "list");
    });

  const wikiFetcher = new TDSWikiFetcher();

  function renderTowerCard(tower, container) {
    const col = document.createElement("div");
    col.className = "col";

    const towerId = `tower-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (!window.towerDataCache) window.towerDataCache = {};
    if (tower.data) window.towerDataCache[towerId] = tower.data;

    let tagClass = "bg-secondary";
    if (tower.tag === "New") {
      tagClass = "bg-success";
    } else if (tower.tag === "Rework") {
      tagClass = "bg-danger";
    } else if (tower.tag === "Rebalance") {
      tagClass = "bg-info";
    }

    const isListView =
      container.id === "all-towers" &&
      container.classList.contains("row-cols-1");

    let buttonsHTML = "";

    if (tower.isLink && tower.linkedTower) {
      buttonsHTML = `<a href="${tower.linkedTower}" target="_blank" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-box-arrow-up-right me-2"></i>Visit Blog
            </a>`;
    } else if (tower.data) {
      buttonsHTML = `<button class="btn btn-sm btn-outline-info copy-json me-2" data-tower-id="${towerId}">
                <i class="bi bi-clipboard me-2"></i>Copy JSON
            </button>
            <button class="btn btn-sm btn-outline-success import-to-editor" data-tower-id="${towerId}">
                <i class="bi bi-box-arrow-up-right me-2"></i>Import Tower
            </button>`;
    }

    const authorLink = `<a href="https://tds.fandom.com/wiki/User:${encodeURIComponent(tower.author)}" 
                              target="_blank" 
                              class="author-link" 
                              title="View ${tower.author}'s profile">
                              ${tower.author}
                           </a>`;

    const badgesHtml = `
            ${tower.featured ? '<span class="badge bg-gold me-1">Featured</span>' : ""}
            ${tower.grandfathered ? '<span class="badge bg-dark me-1" data-grandfathered="true">Grandfathered</span>' : ""}
            ${tower.unverified ? '<span class="badge bg-secondary me-1" data-unverified="true">Unverified</span>' : ""}
            ${tower.tag ? `<span class="badge ${tagClass}">${tower.tag}</span>` : ""}
        `;

    col.innerHTML = `
            <div class="card h-100 bg-dark bg-gradient text-white ${tower.featured ? "border-gold" : ""} ${isListView ? "list-view-card" : ""}" data-tower-name="${tower.name.toLowerCase()}" data-author-name="${tower.author.toLowerCase()}">
                ${
                  !isListView
                    ? `
                    <div class="position-absolute top-0 end-0 p-2">
                        ${badgesHtml}
                    </div>
                `
                    : ""
                }
                <img src="${tower.image}" class="card-img-top" loading="lazy" alt="${tower.name}" 
                     onerror="this.src='https://static.wikia.nocookie.net/tower-defense-sim/images/4/4a/Site-favicon.ico'; this.classList.add('img-error');">
                <div class="card-body">
                    <h5 class="card-title">${tower.name}</h5>
                    <p class="card-text">${tower.description || "No description available."}</p>
                    ${isListView ? `<div class="mt-2">${badgesHtml}</div>` : ""}
                </div>
                <div class="card-footer ${tower.featured ? "gold" : ""} pb-2">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <small class="fw-bold me-1">By ${authorLink}</small>
                        ${tower.uploadDate ? `<small class="text-end"><i class="bi bi-clock text-info me-1"></i>${tower.uploadDate}</small>` : ""}
                    </div>
                    ${buttonsHTML ? `<div class="d-flex justify-content-center mt-2">${buttonsHTML}</div>` : ""}
                </div>
            </div>
        `;

    container.appendChild(col);

    if (tower.unverified && container.id === "all-towers") {
      col.classList.add("d-none");
    }
  }

  async function loadTowersFromWiki(forceRefresh = false) {
    const refreshButton = document.getElementById("refresh-towers-btn");
    refreshButton.disabled = true;
    refreshButton.innerHTML =
      '<i class="spinner-border spinner-border-sm me-2"></i>Refreshing...';

    try {
      window.originalCardsOrder = [];

      if (!forceRefresh) {
        const cachedData = localStorage.getItem("towerDataCache");
        const cacheTimestamp = localStorage.getItem("towerDataTimestamp");

        // use cache if it exists
        if (cachedData && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp);
          const cacheMaxAge = 12 * 60 * 60 * 1000; // 12 hours (modify the first number only)

          if (cacheAge < cacheMaxAge) {
            try {
              const towers = JSON.parse(cachedData);
              console.log(
                `Using cached tower data (${Math.round(cacheAge / 3600000)}h old)`,
              );
              renderAllTowers(towers);
              return;
            } catch (e) {
              console.warn("Cache parsing failed, fetching fresh data");
            }
          }
        }
      }

      document.getElementById("featured-towers").innerHTML =
        '<div class="col-12 text-center text-light p-5"><div class="spinner-border" role="status"></div><p class="mt-2">Commander get the highlights before I sell you to Lord Exo.</p></div>';

      document.getElementById("all-towers").innerHTML =
        '<div class="col-12 text-center text-light p-5"><div class="spinner-border" role="status"></div><p class="mt-2">Loading towers from the TDS Wiki...</p></div>';

      const towers = await wikiFetcher.fetchTowers();

      localStorage.setItem("towerDataCache", JSON.stringify(towers));
      localStorage.setItem("towerDataTimestamp", Date.now().toString());

      renderAllTowers(towers);
    } catch (error) {
      console.error("Failed to load towers:", error);
      document.getElementById("all-towers").innerHTML =
        '<div class="col-12 text-center text-danger p-5"><i class="bi bi-exclamation-triangle-fill fs-1"></i><p class="mt-2">Failed to load towers from the wiki. Please try again later.</p></div>';
    } finally {
      refreshButton.disabled = false;
      refreshButton.innerHTML =
        '<i class="bi bi-arrow-clockwise me-2"></i>Refresh';
    }
  }

  function renderAllTowers(towers) {
    const featuredContainer = document.querySelector(".featured-towers");
    const allTowersContainer = document.getElementById("all-towers");

    featuredContainer.innerHTML = "";
    allTowersContainer.innerHTML = "";

    const highlightedTowers = towers.filter((tower) => tower.highlighted);

    if (highlightedTowers.length === 0) {
      featuredContainer.innerHTML =
        '<div class="col-12 text-center text-light p-3">No highlights at this time.</div>';
    } else {
      highlightedTowers.forEach((tower) =>
        renderTowerCard(tower, featuredContainer),
      );
    }

    towers.forEach((tower) => renderTowerCard(tower, allTowersContainer));

    if (window.setupSearch) window.setupSearch();
    if (window.applyFilters) window.applyFilters();
    if (window.setupSorting) window.setupSorting();
  }

  loadTowersFromWiki();

  document
    .getElementById("refresh-towers-btn")
    .addEventListener("click", () => loadTowersFromWiki(true));

  // Set 3 filter checkboxes to checked by default
  document.getElementById("filterNewTower").checked = true;
  document.getElementById("filterTowerRework").checked = true;
  document.getElementById("filterTowerRebalance").checked = true;

  if (window.setupFilters) window.setupFilters();
  if (window.setupSorting) window.setupSorting();
});

document.addEventListener("click", function (event) {
  if (event.target.closest(".copy-json")) {
    const button = event.target.closest(".copy-json");
    const towerId = button.dataset.towerId;
    const towerData = window.towerDataCache[towerId];

    if (towerData) {
      navigator.clipboard
        .writeText(JSON.stringify(towerData, null, 2))
        .then(() => {
          showAlert("JSON copied to clipboard!", "success");
        })
        .catch((err) => {
          console.error("Failed to copy JSON:", err);
          showAlert("Failed to copy JSON", "danger");
        });
    } else {
      showAlert("No JSON data available", "warning");
    }
  }

  // import to editor
  if (event.target.closest(".import-to-editor")) {
    const button = event.target.closest(".import-to-editor");
    const towerId = button.dataset.towerId;
    const towerData = window.towerDataCache[towerId];

    if (towerData) {
      try {
        const importData = {
          data: JSON.stringify(towerData, null, 2),
          timestamp: Date.now(),
          source: "database",
        };

        localStorage.setItem("pendingTowerImport", JSON.stringify(importData));

        const currentOrigin = window.location.origin;
        const editorUrl = currentOrigin.replace("/db", "") + "/?import=pending";

        window.open(editorUrl, "_blank");

        showAlert("Tower data sent to editor! Check the new tab.", "success");
      } catch (error) {
        console.error("Failed to prepare tower data for import:", error);
        showAlert(
          "Failed to prepare tower data for import: " + error.message,
          "danger",
        );
      }
    } else {
      showAlert("No tower data available for import", "warning");
    }
  }
});

function showAlert(message, type) {
  const alertPlaceholder = document.createElement("div");
  alertPlaceholder.className = "position-fixed bottom-0 end-0 p-3";
  alertPlaceholder.style.zIndex = "5";

  const wrapper = document.createElement("div");
  wrapper.className = `alert alert-${type} alert-dismissible fade`;
  wrapper.innerHTML = `
        <div>${message}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

  alertPlaceholder.appendChild(wrapper);
  document.body.appendChild(alertPlaceholder);

  wrapper.offsetHeight;

  setTimeout(() => {
    wrapper.classList.add("show");
  }, 10);

  setTimeout(() => {
    wrapper.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(alertPlaceholder);
    }, 300);
  }, 3000);
}
