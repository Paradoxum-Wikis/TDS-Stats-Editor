export class BuildManager {
  static saveBuild(buildData) {
    const buildString = btoa(JSON.stringify(buildData));
    const blob = new Blob([buildString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tds-skill-build-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static loadBuild(buildDataString) {
    if (!buildDataString) {
      return { success: false, error: "No build data provided" };
    }

    try {
      const buildData = JSON.parse(atob(buildDataString));

      if (!buildData.skillLevels) {
        return { success: false, error: "Invalid build data format" };
      }

      return { success: true, data: buildData };
    } catch (error) {
      return {
        success: false,
        error: "Invalid build data format: " + error.message,
      };
    }
  }

  static loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const buildData = {
      totalCoins: 0,
      totalCredits: 0,
      skillLevels: {},
    };

    if (urlParams.has("coins")) {
      buildData.totalCoins = parseInt(urlParams.get("coins")) || 0;
    }

    if (urlParams.has("credits")) {
      buildData.totalCredits = parseInt(urlParams.get("credits")) || 0;
    }

    if (urlParams.has("skills")) {
      try {
        buildData.skillLevels = JSON.parse(atob(urlParams.get("skills")));
      } catch (error) {
        console.error("Error parsing skills from URL:", error);
        buildData.skillLevels = {};
      }
    }

    return buildData;
  }

  static updateURL(buildData) {
    const urlParams = new URLSearchParams();

    // Only add parameters if they have meaningful values
    if (buildData.totalCoins > 0) {
      urlParams.set("coins", buildData.totalCoins.toString());
    }

    if (buildData.totalCredits > 0) {
      urlParams.set("credits", buildData.totalCredits.toString());
    }

    // Compress skill levels data
    const skillsWithLevels = {};
    Object.keys(buildData.skillLevels).forEach((skillName) => {
      if (buildData.skillLevels[skillName] > 0) {
        skillsWithLevels[skillName] = buildData.skillLevels[skillName];
      }
    });

    if (Object.keys(skillsWithLevels).length > 0) {
      // Base64 encode the skills data to keep URL cleaner
      urlParams.set("skills", btoa(JSON.stringify(skillsWithLevels)));
    }

    const newUrl = urlParams.toString()
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, "", newUrl);
  }

  static shareURL() {
    const currentUrl = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: "My TDS Skill Build",
          text: "Check out my Tower Defense Simulator skill build!",
          url: currentUrl,
        })
        .catch((err) => {
          console.log("Error sharing:", err);
          BuildManager.copyURLToClipboard(currentUrl);
        });
    } else {
      BuildManager.copyURLToClipboard(currentUrl);
    }
  }

  static copyURLToClipboard(url) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert(
          "Build URL copied to clipboard! Share this link with others to show your skill build.",
        );
      })
      .catch(() => {
        // older browsers
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          alert("Build URL copied to clipboard!");
        } catch (err) {
          console.error("Failed to copy URL:", err);
          prompt("Copy this URL to share your build:", url);
        }
        document.body.removeChild(textarea);
      });
  }
}
