class Consent {
  constructor() {
    this.consentKey = "analyticsConsent";
    this.banner = null;
    this.requiresConsent = null;

    this.initializeGtagWithConsentMode();
    this.init();

    document.addEventListener("analyticsConsentChanged", (e) => {
      this.updateConsentMode(e.detail.consent);
    });

    this.setupTrackingFunction();
    this.setupEventListeners();
  }

  initializeGtagWithConsentMode() {
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
      window.gtag = gtag;

      gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        wait_for_update: 500,
      });

      gtag("js", new Date());
      gtag("config", "G-D48H2PL948", {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
    }
  }

  updateConsentMode(hasConsent) {
    if (typeof gtag !== "undefined") {
      gtag("consent", "update", {
        analytics_storage: hasConsent ? "granted" : "denied",
      });
    }
  }

  async init() {
    const consent = localStorage.getItem(this.consentKey);

    if (consent === null) {
      await this.determineConsentRequirement();

      if (this.requiresConsent) {
        this.createBanner();
        this.attachEventListeners();
      } else {
        localStorage.setItem(this.consentKey, "true");
        this.updateConsentMode(true);

        document.dispatchEvent(
          new CustomEvent("analyticsConsentChanged", {
            detail: { consent: true },
          }),
        );
      }
    } else {
      if (consent === "true") {
        this.updateConsentMode(true);
      } else if (consent === "false") {
        this.updateConsentMode(false);
      }
    }
  }

  async determineConsentRequirement() {
    try {
      const geoData = await this.getGeoLocation();

      if (geoData && geoData.country) {
        this.requiresConsent = this.isConsentRequiredForCountry(
          geoData.country,
        );
      } else {
        this.requiresConsent = true;
      }
    } catch (error) {
      console.warn(
        "Geo detection failed, defaulting to requiring consent:",
        error,
      );
      this.requiresConsent = true;
    }
  }

  async getGeoLocation() {
    const services = [
      "https://ipapi.co/json/",
      "https://api.ipify.org?format=json",
    ];

    for (const service of services) {
      try {
        const response = await fetch(service, {
          timeout: 5000,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (service.includes("ipapi.co")) {
            return {
              country: data.country_code || data.country,
              region: data.region_code || data.region,
            };
          }
        }
      } catch (error) {
        console.warn(`Geo service ${service} failed:`, error);
        continue;
      }
    }

    throw new Error("All geo services failed");
  }

  isConsentRequiredForCountry(countryCode) {
    // prettier-ignore
    const consentRequiredRegions = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 
    'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 
    'RO', 'SK', 'SI', 'ES', 'SE', // EU (27)
    'IS', 'LI', 'NO', // EEA (3)
    'GB', // UK
    'CH', // Switzerland
    'TR' // Turkey
  ];

    return consentRequiredRegions.includes(countryCode?.toUpperCase());
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

  // settings check
  attachEventListeners() {
    document.getElementById("cookie-accept").addEventListener("click", () => {
      localStorage.setItem(this.consentKey, "true");
      this.updateConsentMode(true);

      document.dispatchEvent(
        new CustomEvent("analyticsConsentChanged", {
          detail: { consent: true },
        }),
      );

      this.removeBanner();
    });

    document.getElementById("cookie-decline").addEventListener("click", () => {
      localStorage.setItem(this.consentKey, "false");
      this.updateConsentMode(false);

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

  isAnalyticsEnabled() {
    return localStorage.getItem(this.consentKey) === "true";
  }

  setupTrackingFunction() {
    window.trackEvent = (category, action, label) => {
      if (typeof gtag !== "undefined") {
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
          e.detail.tower.calculationSystem,
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
