function setVersionNumber(version) {
  const versionElements = document.querySelectorAll(".tdsversion");
  versionElements.forEach((element) => {
    element.textContent = version;
  });
}

/**
 * Loads the FULL update log found in modals and whatnot that pulls from GitHub.
 */
function generateUpdateLogHtml(updates) {
  return updates
    .map(
      (update) => `
        <div class="update-item mb-3">
            <h5>${update.version} <small class="text-muted">${update.date}</small></h5>
            <ul class="ps-3">
                ${update.changes.map((change) => `<li>${change}</li>`).join("")}
                <li>Various changes</li>
            </ul>
        </div>
    `,
    )
    .join("");
}

/**
 * Loads the SUMMARIZED UPDATE LOG that is found on the landing page.
 */
function loadUpdateLog() {
  fetch("/updatelog.json")
    .then((response) => response.json())
    .then((data) => {
      const updateLogModal = document.getElementById("update-log-content");
      const updateLogLanding = document.getElementById("landing-update-log");

      const updateHtml = generateUpdateLogHtml(data);

      if (updateLogModal) updateLogModal.innerHTML = updateHtml;
      if (updateLogLanding) {
        updateLogLanding.innerHTML = generateUpdateLogHtml(data);
      }
    })
    .catch((error) => {
      console.error("Error loading update log:", error);
      const errorHtml =
        '<div class="alert alert-danger">Failed to load update log.</div>';

      const updateLogModal = document.getElementById("update-log-content");
      const updateLogLanding = document.getElementById("landing-update-log");

      if (updateLogModal) updateLogModal.innerHTML = errorHtml;
      if (updateLogLanding) updateLogLanding.innerHTML = errorHtml;
    });
}

/**
 * Loads announcements from announcements.json and populates the announcements list.
 */
function loadAnnouncements() {
  fetch("/announcements.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load announcements: ${response.status}`);
      }
      return response.json();
    })
    .then((announcements) => {
      const announcementsList = document.getElementById("announcements-list");
      if (!announcementsList) return;

      announcementsList.innerHTML = "";
      announcements.forEach((announcement) => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item bg-dark text-light border-secondary";
        listItem.innerHTML = `
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${announcement.title}</h5>
            <small class="text-muted">${announcement.date}</small>
          </div>
          <p class="mb-1">${announcement.description}</p>
          <a href="${announcement.link}" target="_blank" class="btn btn-sm btn-outline-info mt-2">
            <i class="bi bi-arrow-right me-2"></i>Read Full Post
          </a>
        `;
        announcementsList.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.error("Error loading announcements:", error);
      const announcementsList = document.getElementById("announcements-list");
      if (announcementsList) {
        announcementsList.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Failed to load announcements. Please try again later.
          </div>
        `;
      }
    });
}

export { setVersionNumber, generateUpdateLogHtml, loadUpdateLog, loadAnnouncements };
