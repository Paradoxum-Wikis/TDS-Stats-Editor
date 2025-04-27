import { UpdateLog } from "../components/UpdateLog.js";

// Help modal tab switching
document.addEventListener("DOMContentLoaded", function () {
  const helpBrowser = document.getElementById("helpBrowser");
  const helpUpload = document.getElementById("helpUpload");
  const browserContent = document.getElementById("browserHelpContent");
  const uploadContent = document.getElementById("uploadHelpContent");

  helpBrowser.addEventListener("change", function () {
    if (this.checked) {
      browserContent.classList.remove("d-none");
      uploadContent.classList.add("d-none");
    }
  });

  helpUpload.addEventListener("change", function () {
    if (this.checked) {
      uploadContent.classList.remove("d-none");
      browserContent.classList.add("d-none");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const updateLog = new UpdateLog();

  updateLog.modal = document.getElementById("updatelog-modal");
  updateLog.contentContainer = document.getElementById("db-update-log-content");

  updateLog.modal.addEventListener("shown.bs.modal", () => {
    updateLog.fetchCommits();
  });
});
