import "../../Styles/bootstrap.css";
import "../../Styles/Dashboard.css";
import "../../Styles/torus.css";
import "../../Styles/theme.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./skills.css";

import "../../components/Slides.js";

import * as bootstrap from "bootstrap";
import { SkillTreePlanner } from './SkillTreePlanner.js';

window.bootstrap = bootstrap;
document.addEventListener('DOMContentLoaded', () => {
  new SkillTreePlanner();
});