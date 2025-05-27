/**
 * HeadsUp.js
 * Create a modal from headsup.json
 */
class HeadsUp {
  constructor() {
    this.modalId = "announcement-modal";
    this.initialized = false;
    this.pollData = null;
  }

  // Check if the poll is active based on end date
  isPollActive(pollData) {
    if (!pollData || !pollData.id || !pollData.endDate) {
      return false; // backwards compatibility in case I want to use it
    }

    const currentDate = new Date();
    const endDate = new Date(pollData.endDate);

    // End date is end of day
    endDate.setHours(23, 59, 59, 999);

    return currentDate <= endDate;
  }

  // Modal system
  async initialize() {
    if (this.initialized) return;

    try {
      // Load the headsup.json file
      const response = await fetch("/headsup.json");
      if (!response.ok) {
        console.warn("Failed to load headsup.json");
        return;
      }

      const data = await response.json();

      // Store poll data
      if (data && data.poll) {
        this.pollData = data.poll;

        const isActive = this.isPollActive(this.pollData);

        // Show modal if active, even if id is "NULL"
        if (isActive) {
          if (this.pollData.id && !this.pollData.id.startsWith("NULL")) {
            this.createModal(this.pollData);
          } else {
            this.createModalNoPoll(this.pollData);
          }

          const announcementKey = `dismissed_announcement_${this.pollData.id}`;
          if (!localStorage.getItem(announcementKey)) {
            this.showModal();
          }

          // dismiss handler
          document
            .getElementById("announcement-dismiss")
            .addEventListener("click", () => {
              localStorage.setItem(announcementKey, "true");
              this.hideModal();
            });
        }
      }

      const pollToggleBtn = document.getElementById("poll-toggle");
      if (pollToggleBtn) {
        pollToggleBtn.addEventListener("click", () => {
          if (this.pollData && this.isPollActive(this.pollData)) {
            // For active polls, make sure modal exists and show it
            if (!document.getElementById(this.modalId)) {
              this.createModal(this.pollData);
            }
            this.showModal();
          } else {
            // For inactive or expired polls, show placeholder
            this.createPlaceholderModal();
            this.showModal();
          }
        });
      }

      this.initialized = true;
    } catch (error) {
      console.error("Error initializing announcement modal:", error);
    }
  }

  createPlaceholderModal() {
    const existingModal = document.getElementById(this.modalId);
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.id = this.modalId;
    modal.className = "modal fade";
    modal.tabIndex = "-1";
    modal.setAttribute("aria-labelledby", "announcement-title");
    modal.setAttribute("aria-hidden", "true");

    let statusMessage = "No active polls at this time";
    let detailMessage = "Check back later for new community polls!";

    // If we have poll data with an end date, see if it's expired or not
    if (this.pollData && this.pollData.endDate) {
      const currentDate = new Date();
      const endDate = new Date(this.pollData.endDate);

      if (currentDate > endDate) {
        // Poll has ended
        statusMessage = "This Poll Has Ended";
        detailMessage = `The previous poll ended on ${endDate.toLocaleDateString()}. Check back soon for new polls!`;
      }
    }

    modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <div class="d-flex align-items-center">
                            <div class="toru-icon-container me-3">
                                <i class="bi bi-broadcast fs-3"></i>
                            </div>
                            <div>
                                <h5 class="modal-title unisans mb-0" id="announcement-title">Community Poll</h5>
                                <p class="text-muted small mb-0">To poll or not to poll...</p>
                            </div>
                        </div>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="toru-section">
                            <div class="toru-options text-center py-4">
                                <i class="bi bi-calendar-x fs-1 mb-3 text-secondary"></i>
                                <h5>${statusMessage}</h5>
                                <p class="text-muted">${detailMessage}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
  }

  createModal(pollData) {
    // Remove existing modal if any
    const existingModal = document.getElementById(this.modalId);
    if (existingModal) {
      existingModal.remove();
    }

    // Generate embed code from poll ID
    const pollId = pollData.id;
    const embedCode = this.generateStrawPollEmbed(pollId);

    // Calculate days remaining
    let daysText = "";
    if (pollData.endDate) {
      const endDate = new Date(pollData.endDate);
      endDate.setHours(23, 59, 59, 999);
      const currentDate = new Date();
      const daysRemaining = Math.ceil(
        (endDate - currentDate) / (1000 * 60 * 60 * 24),
      );
      daysText =
        daysRemaining > 1 ? `${daysRemaining} days` : `${daysRemaining} day`;
    }

    const modal = document.createElement("div");
    modal.id = this.modalId;
    modal.className = "modal fade";
    modal.tabIndex = "-1";
    modal.setAttribute("aria-labelledby", "announcement-title");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <div class="d-flex align-items-center">
                            <div class="toru-icon-container me-3">
                                <i class="bi bi-broadcast fs-3"></i>
                            </div>
                            <div>
                                <h5 class="modal-title unisans mb-0" id="announcement-title">${pollData.title || "Community Poll"}</h5>
                                <p class="text-muted small mb-0">
                                    ${pollData.endDate ? `This poll closes in ${daysText}` : "Share your opinion with the community"}
                                </p>
                            </div>
                        </div>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="toru-section">
                            <div class="toru-options">
                                <p>${pollData.description || "Placeholder. Yes Yes."}</p>
                                ${embedCode}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="announcement-dismiss" class="btn btn-primary">Don't show this poll again</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
  }

  createModalNoPoll(pollData) {
    // Remove existing modal if any
    const existingModal = document.getElementById(this.modalId);
    if (existingModal) {
      existingModal.remove();
    }

    // Calculate days remaining
    let daysText = "";
    if (pollData.endDate) {
      const endDate = new Date(pollData.endDate);
      endDate.setHours(23, 59, 59, 999);
      const currentDate = new Date();
      const daysRemaining = Math.ceil(
        (endDate - currentDate) / (1000 * 60 * 60 * 24),
      );
      daysText =
        daysRemaining > 1 ? `${daysRemaining} days` : `${daysRemaining} day`;
    }

    const modal = document.createElement("div");
    modal.id = this.modalId;
    modal.className = "modal fade";
    modal.tabIndex = "-1";
    modal.setAttribute("aria-labelledby", "announcement-title");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <div class="d-flex align-items-center">
                            <div class="toru-icon-container me-3">
                                <i class="bi bi-broadcast fs-3"></i>
                            </div>
                            <div>
                                <h5 class="modal-title unisans mb-0" id="announcement-title">${pollData.title || "Announcement"}</h5>
                                <p class="text-muted small mb-0">
                                    ${pollData.endDate ? `This message closes in ${daysText}` : ""}
                                </p>
                            </div>
                        </div>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="toru-section">
                            <div class="toru-options">
                                <p>${pollData.description || ""}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="announcement-dismiss" class="btn btn-primary">Don't show this again</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
  }

  generateStrawPollEmbed(pollId) {
    if (!pollId) return "";

    return `<div class="strawpoll-embed" id="strawpoll_${pollId}" style="height: 50vh; width: 100%; margin: 0 auto; display: flex; flex-direction: column;">
            <iframe title="StrawPoll Embed" id="strawpoll_iframe_${pollId}" src="https://strawpoll.com/embed/${pollId}" 
                style="position: static; visibility: visible; display: block; width: 100%; flex-grow: 1;" 
                frameborder="0" allowfullscreen allowtransparency>Loading...</iframe>
            <script async src="https://cdn.strawpoll.com/dist/widgets.js" charset="utf-8"></script>
        </div>`;
  }

  showModal() {
    const modalElement = document.getElementById(this.modalId);
    if (modalElement) {
      const bsModal = new bootstrap.Modal(modalElement);
      bsModal.show();
    }
  }

  hideModal() {
    const modalElement = document.getElementById(this.modalId);
    if (modalElement) {
      const bsModal = bootstrap.Modal.getInstance(modalElement);
      if (bsModal) {
        bsModal.hide();
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const headsUp = new HeadsUp();
  headsUp.initialize();
});

export default HeadsUp;
