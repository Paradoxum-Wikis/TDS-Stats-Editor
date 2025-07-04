/**
 * TDSWikiSorter.js
 * Handles searching, filtering and sorting of towers in the tower browser
 */

window.sortState = {
  criteria: "wiki",
  direction: "asc",
};
window.originalCardsOrder = [];
window.towerDataCache = window.towerDataCache || {};

function setupSearch() {
  const searchInput = document.querySelector(
    '.form-control[placeholder="Search a Tower or Author"]',
  );
  if (!searchInput) return;

  searchInput.addEventListener(
    "input",
    debounce(function () {
      applyFilters();
    }, 300),
  );
}

// helper to prevent excessive function calls
function debounce(func, wait) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// filters functionality
window.setupFilters = function () {
  const filterNewTower = document.getElementById("filterNewTower");
  const filterTowerRework = document.getElementById("filterTowerRework");
  const filterTowerRebalance = document.getElementById("filterTowerRebalance");
  const filterUnverified = document.getElementById("filterUnverified");
  const filterFeatured = document.getElementById("filterFeatured");
  const filterGrandfathered = document.getElementById("filterGrandfathered");

  // set all exclusive filters to unchecked by default
  if (filterUnverified) filterUnverified.checked = false;
  if (filterFeatured) filterFeatured.checked = false;
  if (filterGrandfathered) filterGrandfathered.checked = false;

  if (filterNewTower) filterNewTower.addEventListener("change", applyFilters);
  if (filterTowerRework)
    filterTowerRework.addEventListener("change", applyFilters);
  if (filterTowerRebalance)
    filterTowerRebalance.addEventListener("change", applyFilters);
  if (filterUnverified)
    filterUnverified.addEventListener("change", applyFilters);
  if (filterFeatured) filterFeatured.addEventListener("change", applyFilters);
  if (filterGrandfathered)
    filterGrandfathered.addEventListener("change", applyFilters);

  applyFilters();
};

function addClearFilterButton(container, icon, message) {
  const noResults = document.createElement("div");
  noResults.id =
    icon === "filter"
      ? "no-filter-results"
      : icon === "emoji-smile"
        ? "no-unverified-results"
        : icon === "award"
          ? "no-featured-results"
          : "no-grandfathered-results";
  noResults.className = "col-12 text-center text-light p-5";
  noResults.innerHTML = `
        <i class="bi bi-${icon} fs-1"></i>
        <p class="mt-2">${message}</p>
        <div class="mt-3">
            <button class="btn btn-outline-secondary mt-2" id="enable-all-filters">Clear Filter</button>
        </div>
    `;
  container.appendChild(noResults);

  document
    .getElementById("enable-all-filters")
    .addEventListener("click", () => {
      document.getElementById("filterNewTower").checked = true;
      document.getElementById("filterTowerRework").checked = true;
      document.getElementById("filterTowerRebalance").checked = true;
      document.getElementById("filterUnverified").checked = false;
      document.getElementById("filterFeatured").checked = false;
      document.getElementById("filterGrandfathered").checked = false;
      applyFilters();
    });
}

function applyFilters(maintainSort = true) {
  const showNew = document.getElementById("filterNewTower")?.checked ?? true;
  const showRework =
    document.getElementById("filterTowerRework")?.checked ?? true;
  const showRebalance =
    document.getElementById("filterTowerRebalance")?.checked ?? true;
  const showUnverified =
    document.getElementById("filterUnverified")?.checked ?? false;
  const showFeatured =
    document.getElementById("filterFeatured")?.checked ?? false;
  const showGrandfathered =
    document.getElementById("filterGrandfathered")?.checked ?? false;

  const hasExclusiveFilter =
    showUnverified || showFeatured || showGrandfathered;
  const allRegularFiltersOff = !showNew && !showRework && !showRebalance;

  const searchInput = document.querySelector(
    '.form-control[placeholder="Search a Tower or Author"]',
  );
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  const allTowersContainer = document.getElementById("all-towers");
  const featuredContainer = document
    .querySelector(".featured-towers")
    ?.closest(".mb-4");
  const headings = document.querySelectorAll("h4.text-white");
  const cards = allTowersContainer.querySelectorAll(".col");
  let matchCount = 0;

  document.getElementById("no-filter-results")?.remove();
  document.getElementById("no-search-results")?.remove();
  document.getElementById("no-unverified-results")?.remove();
  document.getElementById("no-featured-results")?.remove();
  document.getElementById("no-grandfathered-results")?.remove();

  // Show/hide featured section
  if (query || hasExclusiveFilter) {
    if (featuredContainer) featuredContainer.classList.add("d-none");
    headings.forEach((heading) => heading.classList.add("d-none"));
  } else if (featuredContainer) {
    featuredContainer.classList.remove("d-none");
    headings.forEach((heading) => heading.classList.remove("d-none"));
  }

  // if all filters are off, show no results message
  if (!showNew && !showRework && !showRebalance && !hasExclusiveFilter) {
    addClearFilterButton(
      allTowersContainer,
      "filter",
      "No towers shown because all filters are turned off.",
    );

    cards.forEach((card) => card.classList.add("d-none"));
    return;
  }

  cards.forEach((card) => {
    const towerName =
      card.querySelector(".card-title")?.textContent?.toLowerCase() || "";
    const towerDescription =
      card.querySelector(".card-text")?.textContent?.toLowerCase() || "";
    const towerAuthor =
      card.querySelector(".card-footer .fw-bold")?.textContent?.toLowerCase() ||
      "";

    // Check for regular tag badges: New, Rework, Rebalance
    const tagBadge = card.querySelector(
      '.badge:not(.bg-gold):not(.bg-dark):not([data-unverified="true"])',
    );
    const towerTag = tagBadge?.textContent?.trim() || "";
    const tagText = towerTag.toLowerCase();

    // Check for exclusives: Featured, Grandfathered, Unverified
    const isFeatured = card.querySelector(".badge.bg-gold") !== null;
    const isGrandfathered = card.querySelector(".badge.bg-dark") !== null;
    const isUnverified =
      card.querySelector('.badge[data-unverified="true"]') !== null;

    if (isUnverified && !showUnverified) {
      card.classList.add("d-none");
      return;
    }

    const matchesSearch =
      !query ||
      towerName.includes(query) ||
      towerDescription.includes(query) ||
      towerAuthor.includes(query) ||
      tagText.includes(query);

    // exclusive filters - must match ALL checked filters
    let matchesExclusiveFilter = true;
    if (hasExclusiveFilter) {
      if (showUnverified && !isUnverified) {
        matchesExclusiveFilter = false;
      }

      if (showFeatured && !isFeatured) {
        matchesExclusiveFilter = false;
      }

      if (showGrandfathered && !isGrandfathered) {
        matchesExclusiveFilter = false;
      }
    }

    // check category filters: New, Rework, Rebalance
    let matchesTypeFilter = false;

    // check regular tag filters - ONLY if no exclusive filter is active or if tower MATCHES exclusive filter
    if (!hasExclusiveFilter || matchesExclusiveFilter) {
      if (tagBadge) {
        if (
          (towerTag === "New" && showNew) ||
          (towerTag === "Rework" && showRework) ||
          (towerTag === "Rebalance" && showRebalance)
        ) {
          matchesTypeFilter = true;
        }
      } else {
        matchesTypeFilter = showNew || showRework || showRebalance;
      }
    }

    // tower is shown only if it matches search, exclusive filter, and type filter (if applicable)
    if (
      matchesSearch &&
      (matchesExclusiveFilter || !hasExclusiveFilter) &&
      (matchesTypeFilter || allRegularFiltersOff)
    ) {
      card.classList.remove("d-none");
      matchCount++;
    } else {
      card.classList.add("d-none");
    }
  });

  if (matchCount === 0 && query) {
    const noResults = document.createElement("div");
    noResults.id = "no-search-results";
    noResults.className = "col-12 text-center text-light p-5";
    noResults.innerHTML = `
            <i class="bi bi-search fs-1"></i>
            <p class="mt-2"></p>
            <button class="btn btn-outline-secondary mt-2" id="clear-search">Clear Search</button>
        `;
    noResults.querySelector("p").textContent =
      `No towers found matching "${query}"`;
    allTowersContainer.appendChild(noResults);

    document.getElementById("clear-search").addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        applyFilters();
        searchInput.focus();
      }
    });
  }

  // generate appropriate messages for exclusive filters
  if (matchCount === 0 && !query) {
    if (
      (showFeatured && showGrandfathered) ||
      (showFeatured && showUnverified) ||
      (showGrandfathered && showUnverified) ||
      (showFeatured && showGrandfathered && showUnverified)
    ) {
      let filterNames = [];
      if (showFeatured) filterNames.push("Featured");
      if (showGrandfathered) filterNames.push("Grandfathered");
      if (showUnverified) filterNames.push("Unverified");

      addClearFilterButton(
        allTowersContainer,
        "filter-circle",
        `No towers match these selected filters: ${filterNames.join(" + ")}.`,
      );
    }
    // Single filter messages, probably will never be used but eh
    else if (showUnverified) {
      addClearFilterButton(
        allTowersContainer,
        "emoji-smile",
        "All towers are verified! There are no unverified towers to show.",
      );
    } else if (showFeatured) {
      addClearFilterButton(
        allTowersContainer,
        "award",
        "There are no featured towers matching this filter.",
      );
    } else if (showGrandfathered) {
      addClearFilterButton(
        allTowersContainer,
        "clock-history",
        "There are no grandfathered towers matching this filter.",
      );
    }
  }

  if (maintainSort && window.sortState.criteria) {
    sortTowers(window.sortState.criteria, window.sortState.direction);
  }
}

function setupSorting() {
  const allTowersContainer = document.getElementById("all-towers");
  if (allTowersContainer) {
    window.originalCardsOrder = Array.from(
      allTowersContainer.querySelectorAll(".col"),
    );
  }

  const sortLinks = document.querySelectorAll(
    ".sidebar-heading + ul .nav-link",
  );
  const sortIds = [
    "sort-by-wiki-listing",
    "sort-by-tower-name",
    "sort-by-user-name",
    "sort-by-time",
  ];
  const sortCriteria = ["wiki", "name", "author", "time"];

  for (let i = 0; i < Math.min(sortLinks.length, sortIds.length); i++) {
    sortLinks[i].id = sortIds[i];

    const newLink = sortLinks[i].cloneNode(true);
    sortLinks[i].parentNode.replaceChild(newLink, sortLinks[i]);

    newLink.addEventListener("click", function (e) {
      e.preventDefault();
      toggleSort(sortCriteria[i], this);
    });
  }

  const wikiListingBtn = document.getElementById("sort-by-wiki-listing");
  if (wikiListingBtn) {
    setActiveSortButton(wikiListingBtn);
  }
}

function toggleSort(criteria, button) {
  if (window.sortState.criteria === criteria) {
    window.sortState.direction =
      window.sortState.direction === "asc" ? "desc" : "asc";
  } else {
    window.sortState.criteria = criteria;
    window.sortState.direction = "asc";
  }

  setActiveSortButton(button);
  sortTowers(criteria, window.sortState.direction);
}

function setActiveSortButton(activeButton) {
  const sortLinks = document.querySelectorAll(
    ".sidebar-heading + ul .nav-link",
  );
  sortLinks.forEach((link) => {
    link.classList.remove("active");
    link.querySelector(".sort-icon")?.remove();
  });

  activeButton.classList.add("active");

  const sortIcon = document.createElement("span");
  sortIcon.className = "sort-icon me-2";
  sortIcon.innerHTML =
    window.sortState.direction === "asc"
      ? '<i class="bi bi-sort-down-alt"></i>'
      : '<i class="bi bi-sort-up-alt"></i>';

  if (activeButton.firstChild) {
    activeButton.insertBefore(sortIcon, activeButton.firstChild);
  } else {
    activeButton.appendChild(sortIcon);
  }
}

function sortTowers(criteria, direction = "asc") {
  window.sortState.criteria = criteria;
  window.sortState.direction = direction;

  const allTowersContainer = document.getElementById("all-towers");
  if (!allTowersContainer) return;

  let cards;
  if (criteria === "wiki" && window.originalCardsOrder.length > 0) {
    cards = [...window.originalCardsOrder];
    if (direction === "desc") {
      cards.reverse();
    }
  } else {
    cards = Array.from(allTowersContainer.querySelectorAll(".col"));

    if (criteria !== "wiki") {
      cards.sort((a, b) => {
        let comparison = 0;

        if (criteria === "name") {
          const nameA =
            a.querySelector(".card-title")?.textContent.toLowerCase() || "";
          const nameB =
            b.querySelector(".card-title")?.textContent.toLowerCase() || "";
          comparison = nameA.localeCompare(nameB);
        } else if (criteria === "author") {
          const authorA =
            a
              .querySelector(".card-footer .fw-bold")
              ?.textContent.toLowerCase() || "";
          const authorB =
            b
              .querySelector(".card-footer .fw-bold")
              ?.textContent.toLowerCase() || "";
          const cleanAuthorA = authorA.replace(/^by\s+/i, "");
          const cleanAuthorB = authorB.replace(/^by\s+/i, "");
          comparison = cleanAuthorA.localeCompare(cleanAuthorB);
        } else if (criteria === "time") {
          const timeTextA =
            a.querySelector(".card-footer small:last-child")?.textContent || "";
          const timeTextB =
            b.querySelector(".card-footer small:last-child")?.textContent || "";
          comparison = compareUploadDates(timeTextB, timeTextA);

          if (direction === "desc") {
            comparison = -comparison;
          }
          return comparison;
        }

        return direction === "asc" ? comparison : -comparison;
      });
    }
  }

  cards.forEach((card) => allTowersContainer.appendChild(card));

  applyFilters(false);
}

function compareUploadDates(dateA, dateB) {
  function getDateValue(dateText) {
    dateText = dateText.trim();
    if (!dateText) return 0;

    if (dateText.toLowerCase().includes("ago")) {
      const value = parseInt(dateText) || 0;

      if (dateText.includes("second")) return Date.now() - value * 1000;
      if (dateText.includes("minute")) return Date.now() - value * 60 * 1000;
      if (dateText.includes("hour")) return Date.now() - value * 60 * 60 * 1000;
      if (dateText.includes("day"))
        return Date.now() - value * 24 * 60 * 60 * 1000;
      if (dateText.includes("week"))
        return Date.now() - value * 7 * 24 * 60 * 60 * 1000;
      if (dateText.includes("month"))
        return Date.now() - value * 30 * 24 * 60 * 60 * 1000;
      if (dateText.includes("year"))
        return Date.now() - value * 365 * 24 * 60 * 60 * 1000;
    }

    const months = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
    };

    const parts = dateText.split(/\s+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const monthLower = parts[1].toLowerCase();
      const year = parseInt(parts[2]);

      if (!isNaN(day) && monthLower in months && !isNaN(year)) {
        const month = months[monthLower];
        return new Date(year, month, day).getTime();
      }
    }
  }

  return getDateValue(dateA) - getDateValue(dateB);
}

window.setupSearch = setupSearch;
window.setupFilters = setupFilters;
window.setupSorting = setupSorting;
window.applyFilters = applyFilters;
