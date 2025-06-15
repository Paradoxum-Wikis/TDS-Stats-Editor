import "../../Styles/bootstrap.css";
import "../../Styles/Dashboard.css";
import "../../Styles/torus.css";
import "../../Styles/theme.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./skills.css";

import "../../components/Slides.js";
import "../../components/SettingsManager.js";

import * as bootstrap from "bootstrap";
import { SkillTreePlanner } from './SkillTreePlanner.js';
import { MobileNav } from './MobileNav.js';

window.bootstrap = bootstrap;
document.addEventListener('DOMContentLoaded', () => {
  new SkillTreePlanner();

  if (window.innerWidth < 768) {
    new MobileNav();
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth < 768 && !window.skillsMobileNav) {
      window.skillsMobileNav = new MobileNav();
    }
  });
});