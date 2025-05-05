import { UpdateLog } from "../components/UpdateLog.js";

// Help modal tab switching
document.addEventListener("DOMContentLoaded", function () {
  const helpBrowser = document.getElementById("helpBrowser");
  const helpUpload = document.getElementById("helpUpload");
  const browserContent = document.getElementById("browserHelpContent");
  const uploadContent = document.getElementById("uploadHelpContent");

  const toggleContent = (e) => {
    const isBrowser = e.target === helpBrowser;

    browserContent.classList.toggle("d-none", !isBrowser);
    uploadContent.classList.toggle("d-none", isBrowser);
  };

  helpBrowser.addEventListener("change", toggleContent);
  helpUpload.addEventListener("change", toggleContent);
});

document.addEventListener("DOMContentLoaded", () => {
  const updateLog = new UpdateLog();

  updateLog.modal = document.getElementById("updatelog-modal");
  updateLog.contentContainer = document.getElementById("db-update-log-content");

  updateLog.modal.addEventListener("shown.bs.modal", () => {
    updateLog.fetchCommits();
  });
});
