export default class SidebarToggle {
    constructor() {
        this.container = document.querySelector('.container-main');
        this.toggleButton = document.getElementById('sidebar-toggle');
        this.collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        
        if (this.collapsed) {
            this.container.classList.add('sidebar-collapsed');
        }
        
        this.toggleButton.addEventListener('click', this.toggle.bind(this));
    }
    
    toggle() {
        this.collapsed = !this.collapsed;
        this.container.classList.toggle('sidebar-collapsed', this.collapsed);
        
        // save to localStorage
        localStorage.setItem('sidebar-collapsed', this.collapsed);

        window.dispatchEvent(new Event('resize'));
    }
}