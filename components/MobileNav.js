export default class MobileNav {
  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.mobileNav = document.querySelector('.mobile-nav');
    this.mobileSidebar = document.querySelector('.mobile-sidebar');
    this.sidebarContent = document.querySelector('.mobile-sidebar-content');
    this.navButtons = document.querySelectorAll('.mobile-nav-btn');
    this.activeSection = null;
    
    // grab references to desktop elements
    this.originalContainers = {
      'upgrades': {
        element: document.getElementById('level-view'),
        parent: document.getElementById('level-view').parentNode
      },
      'views': {
        element: document.getElementById('property-viewer-section'),
        parent: document.getElementById('property-viewer-section').parentNode
      },
      'boosts': {
        element: document.getElementById('boost-view'),
        parent: document.getElementById('boost-view').parentNode
      }
    };
    
    this.mirrors = {};
    
    this.init();
    this.setupEventListeners();
  }
  
  init() {
    // check if we're on mobile
    this.checkMobile();
    
    window.addEventListener('resize', () => this.checkMobile());
  }
  
  checkMobile() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('is-mobile', this.isMobile);
    
    // handle transitions between mobile and desktop
    if (wasMobile && !this.isMobile) {
      this.closeSidebar();
      this.mobileSidebar.style.display = 'none';
    } else if (!wasMobile && this.isMobile) {
      this.mobileSidebar.style.display = '';
    }
  }
  
  setupEventListeners() {
    this.navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const section = btn.dataset.mobileSection;
        
        // close if tapping the active button
        if (this.activeSection === section && this.mobileSidebar.classList.contains('active')) {
          this.closeSidebar();
          return;
        }
        
        this.openSection(section);
        
        // reset buttons
        this.navButtons.forEach(b => {
          b.classList.remove('active');
          const iconElement = b.querySelector('i');
          const originalClass = iconElement.dataset.originalClass || iconElement.className;
          iconElement.className = originalClass;
        });
        
        // show x icon on active button
        btn.classList.add('active');
        const iconElement = btn.querySelector('i');
        if (!iconElement.dataset.originalClass) {
          iconElement.dataset.originalClass = iconElement.className;
        }
        iconElement.className = 'bi bi-x-lg';
      });
    });
  }
  
  openSection(section) {
    this.activeSection = section;
    this.sidebarContent.innerHTML = '';
    
    if (section === 'tools') {
      // create tools section ui
      const content = document.createElement('div');
      content.className = 'mobile-tools-section';
      content.innerHTML = `
        <h5 class="text-white mb-3">Tools</h5>
        <div class="d-flex flex-column gap-2">
          <button class="btn btn-outline-secondary" id="mobile-poll-btn">
            <i class="bi bi-broadcast me-2"></i>Community Poll
          </button>
          <button class="btn btn-outline-secondary" id="mobile-delta-btn">
            <i class="bi bi-triangle me-2"></i>Show Deltas
          </button>
          <button class="btn btn-outline-secondary" id="mobile-clone-btn" data-bs-toggle="modal" data-bs-target="#clone-tower">
            <i class="bi bi-pencil me-2"></i>Clone Tower
          </button>
          <button class="btn btn-outline-secondary" id="mobile-settings-btn" data-bs-toggle="modal" data-bs-target="#settings-modal">
            <i class="bi bi-gear me-2"></i>Settings
          </button>
          <a href="https://tds.fandom.com/wiki/" class="btn btn-outline-secondary" id="mobile-wiki-btn" target="_blank">
            <i class="bi bi-journal-text me-2"></i>TDS Wiki
          </a>
          <a href="./db" class="btn btn-outline-secondary" id="mobile-database-btn">
            <i class="bi bi-database me-2"></i>TDS Database
          </a>
          <button class="btn btn-outline-secondary" id="mobile-about-btn" data-bs-toggle="modal" data-bs-target="#discord-modal">
            <i class="bi bi-info-circle me-2"></i>About
          </button>
        </div>
      `;
      this.sidebarContent.appendChild(content);
      
      this.connectToolButton('mobile-delta-btn', 'button-delta');
      this.connectToolButton('mobile-poll-btn', 'poll-toggle');
      
      // close sidebar when a modal opens
      const modalButtons = ['mobile-clone-btn', 'mobile-settings-btn', 'mobile-about-btn'];
      modalButtons.forEach(btnId => {
        const mobileBtn = document.getElementById(btnId);
        if (mobileBtn) {
          mobileBtn.addEventListener('click', () => {
            setTimeout(() => this.closeSidebar(), 100);
          });
        }
      });
    } else if (this.originalContainers[section]) {
      // mirror the desktop content
      const originalContainer = this.originalContainers[section];
      const originalElement = originalContainer.element;
      
      const mirrorContainer = document.createElement('div');
      mirrorContainer.className = 'mobile-mirror-container';
      mirrorContainer.dataset.mirrorFor = section;
      
      const mirrorElement = originalElement.cloneNode(true);
      mirrorElement.classList.remove('d-none');
      mirrorContainer.appendChild(mirrorElement);
      
      this.sidebarContent.appendChild(mirrorContainer);
      
      this.mirrors[section] = {
        container: mirrorContainer,
        element: mirrorElement,
        original: originalElement
      };
      
      this.setupMutationObserver(section);
      this.setupMirrorEvents(section);
    }
    
    this.mobileSidebar.classList.add('active');
    this.updateActiveButton(section);
  }
  
  updateActiveButton(section) {
    this.navButtons.forEach(btn => {
      btn.classList.remove('active');
      const iconElement = btn.querySelector('i');
      if (iconElement && iconElement.dataset.originalClass) {
        iconElement.className = iconElement.dataset.originalClass;
      }
    });
    
    const activeBtn = Array.from(this.navButtons).find(btn => 
      btn.dataset.mobileSection === section
    );
    
    if (activeBtn) {
      activeBtn.classList.add('active');
      const iconElement = activeBtn.querySelector('i');
      if (!iconElement.dataset.originalClass) {
        iconElement.dataset.originalClass = iconElement.className;
      }
      iconElement.className = 'bi bi-x-lg';
    }
  }
  
  setupMutationObserver(section) {
    if (!this.observers) this.observers = {};
    
    if (this.observers[section]) {
      this.observers[section].disconnect();
    }
    
    const mirror = this.mirrors[section];
    const original = this.originalContainers[section].element;
    
    this.observers[section] = new MutationObserver((mutations) => {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = setTimeout(() => {
        if (document.contains(mirror.element)) {
          this.syncNonInputElements(section);
        }
      }, 50);
    });
    
    this.observers[section].observe(original, { 
      childList: true,
      subtree: true
    });
  }
  
  syncNonInputElements(section) {
    const mirror = this.mirrors[section];
    const original = this.originalContainers[section].element;
    
    // use temp container to avoid losing input values
    const temp = document.createElement('div');
    temp.innerHTML = original.innerHTML;
    
    const tempInputs = temp.querySelectorAll('input, select, textarea');
    tempInputs.forEach(input => {
      const path = this.getElementPath(input, temp);
      if (path) {
        const mirrorInput = this.findElementByPath(path, mirror.element);
        if (mirrorInput) {
          const placeholder = document.createElement('span');
          placeholder.dataset.inputPath = path.join(',');
          input.parentNode.replaceChild(placeholder, input);
        }
      }
    });
    
    mirror.element.innerHTML = temp.innerHTML;
    
    // put inputs back in place
    const placeholders = mirror.element.querySelectorAll('span[data-input-path]');
    placeholders.forEach(placeholder => {
      const path = placeholder.dataset.inputPath.split(',').map(Number);
      const originalInput = this.findElementByPath(path, original);
      
      if (originalInput) {
        const newInput = originalInput.cloneNode(true);
        
        if (originalInput.type === 'checkbox' || originalInput.type === 'radio') {
          newInput.checked = originalInput.checked;
        } else if (originalInput.tagName === 'SELECT') {
          newInput.value = originalInput.value;
          Array.from(newInput.options).forEach((option, index) => {
            option.selected = originalInput.options[index].selected;
          });
        } else {
          newInput.value = originalInput.value;
        }
        
        placeholder.parentNode.replaceChild(newInput, placeholder);
      }
    });
    
    this.setupInputEvents(section);
  }
  
  setupInputEvents(section) {
    const mirror = this.mirrors[section];
    const inputs = mirror.element.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const eventsToForward = ['input', 'change'];
      
      eventsToForward.forEach(eventType => {
        input.addEventListener(eventType, (event) => {
          const path = this.getElementPath(event.target, mirror.element);
          if (path) {
            const originalTarget = this.findElementByPath(path, this.originalContainers[section].element);
            if (originalTarget) {
              // sync with original
              if (input.type === 'checkbox' || input.type === 'radio') {
                originalTarget.checked = input.checked;
              } else if (input.tagName === 'SELECT') {
                originalTarget.value = input.value;
                originalTarget.selectedIndex = input.selectedIndex;
              } else {
                originalTarget.value = input.value;
              }
              
              // fire event on original
              const newEvent = new Event(eventType, {
                bubbles: event.bubbles,
                cancelable: event.cancelable
              });
              originalTarget.dispatchEvent(newEvent);
            }
          }
        });
      });
    });
  }
  
  setupMirrorEvents(section) {
    const mirror = this.mirrors[section];
    const eventsToForward = ['click', 'input', 'change', 'focusout', 'focusin', 'focus', 'blur', 'submit'];
    
    eventsToForward.forEach(eventType => {
      mirror.element.addEventListener(eventType, (event) => {
        // fixes bug where enter key will refresh the page
        if (eventType === 'submit') {
          event.preventDefault();
        }
        
        const path = this.getElementPath(event.target, mirror.element);
        
        if (path) {
          const originalTarget = this.findElementByPath(path, this.originalContainers[section].element);
          
          if (originalTarget) {
            // sync values
            if ((event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || 
                 event.target.tagName === 'TEXTAREA') && 'value' in event.target) {
              originalTarget.value = event.target.value;
            }
            
            if (event.target.type === 'checkbox' || event.target.type === 'radio') {
              originalTarget.checked = event.target.checked;
            }
            
            const newEvent = new Event(eventType, {
              bubbles: event.bubbles,
              cancelable: event.cancelable
            });
            
            if (eventType === 'focus' || eventType === 'click') {
              originalTarget.focus();
            }
            
            if (eventType === 'submit') {
              const submitEvent = new SubmitEvent('submit', {
                bubbles: true,
                cancelable: true
              });
              originalTarget.dispatchEvent(submitEvent);
              if (!submitEvent.defaultPrevented) {
                return false;
              }
            } else if (eventType === 'focus' && event.target.tagName === 'INPUT') {
              const originalValue = originalTarget.value;
              originalTarget.dispatchEvent(newEvent);
              if (originalValue === originalTarget.value && originalValue !== '') {
                originalTarget.value = '';
                event.target.value = '';
              }
            } else {
              originalTarget.dispatchEvent(newEvent);
            }
          }
        }
      });
    });
    
    // capture form submissions at the form level
    const forms = mirror.element.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        return false;
      });
    });
    
    this.setupTwoWayBinding(section);
  }

  setupTwoWayBinding(section) {
    const mirror = this.mirrors[section];
    const original = this.originalContainers[section].element;
    
    // sync all inputs from original to mirror
    const syncInputs = () => {
      const inputSelectors = 'input, select, textarea';
      const originalInputs = original.querySelectorAll(inputSelectors);
      
      originalInputs.forEach(originalInput => {
        const path = this.getElementPath(originalInput, original);
        if (path) {
          const mirrorInput = this.findElementByPath(path, mirror.element);
          if (mirrorInput) {
            if (originalInput.type === 'checkbox' || originalInput.type === 'radio') {
              mirrorInput.checked = originalInput.checked;
            } else {
              mirrorInput.value = originalInput.value;
            }
          }
        }
      });
    };
    
    // watch for attribute changes on inputs
    const inputObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && 
           (mutation.attributeName === 'value' || mutation.attributeName === 'checked')) {
          syncInputs();
        }
      });
    });
    
    const originalInputs = original.querySelectorAll('input, select, textarea');
    originalInputs.forEach(input => {
      inputObserver.observe(input, { 
        attributes: true,
        attributeFilter: ['value', 'checked']
      });
    });
    
    // catch programmatic changes too
    const valueChangeHandler = () => syncInputs();
    original.addEventListener('input', valueChangeHandler);
    original.addEventListener('change', valueChangeHandler);
    
    if (!this.inputObservers) this.inputObservers = {};
    if (!this.valueChangeHandlers) this.valueChangeHandlers = {};
    
    this.inputObservers[section] = inputObserver;
    this.valueChangeHandlers[section] = {
      element: original,
      handler: valueChangeHandler
    };
    
    syncInputs();
  }
  
  getElementPath(element, container) {
    const path = [];
    let current = element;
    
    while (current && current !== container) {
      const parent = current.parentNode;
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(current);
      path.unshift(index);
      current = parent;
    }
    
    return current === container ? path : null;
  }
  
  findElementByPath(path, container) {
    let current = container;
    
    for (const index of path) {
      if (current.children && index < current.children.length) {
        current = current.children[index];
      } else {
        return null;
      }
    }
    
    return current;
  }
  
  closeSidebar() {
    // cleanup observers
    if (this.observers) {
      Object.values(this.observers).forEach(observer => observer.disconnect());
    }
    
    if (this.inputObservers) {
      Object.values(this.inputObservers).forEach(observer => observer.disconnect());
    }
    
    if (this.valueChangeHandlers) {
      Object.entries(this.valueChangeHandlers).forEach(([section, handler]) => {
        handler.element.removeEventListener('input', handler.handler);
        handler.element.removeEventListener('change', handler.handler);
      });
    }
    
    this.mirrors = {};
    this.inputObservers = {};
    this.valueChangeHandlers = {};
    
    if (this.toolButtonObservers) {
      Object.values(this.toolButtonObservers).forEach(observer => observer.disconnect());
    }
    
    this.mobileSidebar.classList.remove('active');
    this.activeSection = null;
    
    // reset buttons
    this.navButtons.forEach(btn => {
      btn.classList.remove('active');
      
      const iconElement = btn.querySelector('i');
      if (iconElement && iconElement.dataset.originalClass) {
        iconElement.className = iconElement.dataset.originalClass;
      }
    });
  }

  connectToolButton(mobileButtonId, desktopButtonId) {
    const mobileButton = document.getElementById(mobileButtonId);
    const desktopButton = document.getElementById(desktopButtonId);
    
    if (mobileButton && desktopButton) {
      // avoid duplicate listeners
      const newMobileButton = mobileButton.cloneNode(true);
      mobileButton.parentNode.replaceChild(newMobileButton, mobileButton);
      
      newMobileButton.addEventListener('click', (event) => {
        event.preventDefault();
        
        desktopButton.click();
        this.updateToolButtonState(newMobileButton, desktopButton);
        
        // close sidebar for delta view
        if (mobileButtonId === 'mobile-delta-btn') {
          setTimeout(() => this.closeSidebar(), 100);
        }
      });
      
      this.updateToolButtonState(newMobileButton, desktopButton);
      
      // track desktop button state
      const observer = new MutationObserver(() => {
        this.updateToolButtonState(newMobileButton, desktopButton);
      });
      
      observer.observe(desktopButton, { 
        attributes: true, 
        attributeFilter: ['class', 'aria-pressed'] 
      });
      
      if (!this.toolButtonObservers) this.toolButtonObservers = {};
      this.toolButtonObservers[mobileButtonId] = observer;
    }
  }

  updateToolButtonState(mobileButton, desktopButton) {
    // check if active
    const isActive = 
      desktopButton.classList.contains('active') || 
      desktopButton.getAttribute('aria-pressed') === 'true' ||
      desktopButton.classList.contains('btn-primary');
    
    // update style
    if (isActive) {
      mobileButton.classList.add('active');
      mobileButton.classList.remove('btn-outline-secondary');
      mobileButton.classList.add('btn-primary');
    } else {
      mobileButton.classList.remove('active');
      mobileButton.classList.remove('btn-primary');
      mobileButton.classList.add('btn-outline-secondary');
    }
  }
}