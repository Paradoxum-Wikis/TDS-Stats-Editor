class Consent {
  constructor() {
    this.consentKey = "analyticsConsent";
    this.banner = null;

    this.init();

    // settings check
    document.addEventListener("analyticsConsentChanged", (e) => {
      if (e.detail.consent === true) {
        this.enableAnalytics();
      }
    });

    this.setupTrackingFunction();
    this.setupEventListeners();
  }

  init() {
    // Check if consent has been set already
    const consent = localStorage.getItem(this.consentKey);

    // Only show banner if consent hasn't been set
    if (consent === null) {
      this.createBanner();
      this.attachEventListeners();
    } else if (consent === "true") {
      // Enable analytics if previously consented
      this.enableAnalytics();
    }
  }

  createBanner() {
    this.banner = document.createElement("div");
    this.banner.className = "cookie-consent-banner";
    this.banner.innerHTML = `
      <div class="cookie-content">
        <div class="cookie-text">
          <i class="bi bi-cookie me-3"></i>
          <span>This site uses cookies for analytics in order to help research and improve it. Do you consent to anonymous data collection? You can always change it later in the settings. <a href="./privacy">Privacy Policy</a></span>
        </div>
        <div class="cookie-buttons">
          <button id="cookie-decline" class="btn btn-outline-secondary btn-sm px-3 border25">Decline</button>
          <button id="cookie-accept" class="btn btn-primary btn-sm px-3 border25">Accept</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.banner);

    setTimeout(() => {
      this.banner.classList.add("visible");
    }, 100);
  }

  attachEventListeners() {
    document.getElementById("cookie-accept").addEventListener("click", () => {
      localStorage.setItem(this.consentKey, "true");

      // for SettingsManager to listen
      document.dispatchEvent(
        new CustomEvent("analyticsConsentChanged", {
          detail: { consent: true },
        }),
      );

      this.enableAnalytics();
      this.removeBanner();
    });

    document.getElementById("cookie-decline").addEventListener("click", () => {
      localStorage.setItem(this.consentKey, "false");

      document.dispatchEvent(
        new CustomEvent("analyticsConsentChanged", {
          detail: { consent: false },
        }),
      );

      this.removeBanner();
    });
  }

  removeBanner() {
    if (this.banner) {
      this.banner.classList.remove("visible");
      setTimeout(() => {
        this.banner.remove();
      }, 300);
    }
  }

  enableAnalytics() {
    if (typeof gtag === "undefined") {
      const gtagScript = document.createElement("script");
      gtagScript.async = true;
      gtagScript.src =
        "https://www.googletagmanager.com/gtag/js?id=G-D48H2PL948";
      document.head.appendChild(gtagScript);

      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", "G-D48H2PL948");

      window.gtag = gtag;
    }
  }

  isAnalyticsEnabled() {
    return localStorage.getItem(this.consentKey) === "true";
  }

  setupTrackingFunction() {
    window.trackEvent = (category, action, label) => {
      if (this.isAnalyticsEnabled() && typeof gtag !== "undefined") {
        gtag("event", action, {
          event_category: category,
          event_label: label,
        });
        console.debug(`Analytics: ${category} - ${action} - ${label}`); // you might need to enable verbose logging on chromiums
      }
    };
  }

  setupEventListeners() {
    // Tower selection tracking
    document.addEventListener("towerSelected", (e) => {
      if (e.detail && e.detail.towerName) {
        window.trackEvent("Tower", "Selected", e.detail.towerName);
      }
    });

    // Calculation system change tracking
    document.addEventListener("calculationSystemChanged", (e) => {
      if (e.detail.tower) {
        window.trackEvent(
          "Settings",
          "CalculationSystemChanged",
          e.detail.system,
        );
      }
    });

    // Tower search tracking
    const searchInput = document.querySelector("#Tower-Selector input");
    if (searchInput) {
      searchInput.addEventListener("change", () => {
        if (searchInput.value.trim()) {
          window.trackEvent("Search", "TowerSearch", searchInput.value);
        }
      });
    }

    // Copy button tracking
    ["json-copy", "wikitable-copy", "lua-copy"].forEach((id) => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener("click", () => {
          window.trackEvent("Data", "Copy", id.split("-")[0].toUpperCase());
        });
      }
    });

    // Export button tracking
    ["json-export", "wikitable-export", "lua-export"].forEach((id) => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener("click", () => {
          window.trackEvent("Data", "Export", id.split("-")[0].toUpperCase());
        });
      }
    });
  }
}

export default Consent;
