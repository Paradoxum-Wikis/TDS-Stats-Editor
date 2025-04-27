export default class SidebarToggle {
  constructor() {
    this.container = document.querySelector(".container-main");
    this.toggleButton = document.getElementById("sidebar-toggle");
    this.collapsed = localStorage.getItem("sidebar-collapsed") === "true";

    if (this.collapsed) {
      this.container.classList.add("sidebar-collapsed");
      // set initial button style for collapsed state
      this.toggleButton.classList.add("btn-outline-secondary");
      this.toggleButton.classList.remove("btn-primary");
    } else {
      // open state
      this.toggleButton.classList.add("btn-primary");
      this.toggleButton.classList.remove("btn-outline-secondary");
    }

    this.toggleButton.addEventListener("click", this.toggle.bind(this));
  }

  toggle() {
    this.collapsed = !this.collapsed;
    this.container.classList.toggle("sidebar-collapsed", this.collapsed);

    // button appearance toggle
    if (this.collapsed) {
      this.toggleButton.classList.remove("btn-primary");
      this.toggleButton.classList.add("btn-outline-secondary");
    } else {
      this.toggleButton.classList.add("btn-primary");
      this.toggleButton.classList.remove("btn-outline-secondary");
    }

    // save to localStorage
    localStorage.setItem("sidebar-collapsed", this.collapsed);

    window.dispatchEvent(new Event("resize"));
  }
}
