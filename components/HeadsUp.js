/**
 * HeadsUp.js
 * Create a modal from headsup.json
 */
class HeadsUp {
    constructor() {
        this.modalId = 'announcement-modal';
        this.initialized = false;
    }

    // Modal system
    async initialize() {
        if (this.initialized) return;
        
        try {
            // Load the headsup.json file
            const response = await fetch('./headsup.json');
            if (!response.ok) {
                console.warn('Failed to load headsup.json');
                return;
            }
            
            const data = await response.json();
            
            // Check if we have an active poll announcement
            if (data && data.poll && data.poll.active === true && data.poll.id) {
                // Check if user has dismissed this specific announcement
                const announcementKey = `dismissed_announcement_${data.poll.id}`;
                if (!localStorage.getItem(announcementKey)) {
                    this.createModal(data.poll);
                    this.showModal();
                    
                    // dismiss handler
                    document.getElementById('announcement-dismiss').addEventListener('click', () => {
                        localStorage.setItem(announcementKey, 'true');
                        this.hideModal();
                    });
                }
            }
            
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing announcement modal:', error);
        }
    }

    createModal(pollData) {
        if (document.getElementById(this.modalId)) return;
        
        // Generate embed code from poll ID
        const pollId = pollData.id;
        const embedCode = this.generateStrawPollEmbed(pollId);
        
        const modal = document.createElement('div');
        modal.id = this.modalId;
        modal.className = 'modal fade';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-labelledby', 'announcement-title');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                        <h5 class="modal-title" id="announcement-title">
                            <i class="bi bi-broadcast me-2"></i>${pollData.title || 'Community Poll'}
                        </h5>
                    </div>
                    <div class="modal-body">
                        <p>${pollData.description || 'We value your input! Please take a moment to participate in our community poll.'}</p>
                        ${embedCode}
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="announcement-dismiss" class="btn btn-primary">Don't show again</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    generateStrawPollEmbed(pollId) {
        if (!pollId) return '';
        
        return `<div class="strawpoll-embed" id="strawpoll_${pollId}" style="height: 50vh; width: 100%; margin: 0 auto; display: flex; flex-direction: column;">
            <iframe title="StrawPoll Embed" id="strawpoll_iframe_${pollId}" src="https://strawpoll.com/embed/${pollId}" 
                style="position: static; visibility: visible; display: block; width: 100%; flex-grow: 1;" 
                frameborder="0" allowfullscreen allowtransparency>Loading...</iframe>
            <script async src="https://cdn.strawpoll.com/dist/widgets.js" charset="utf-8"></script>
        </div>`;
    }

    showModal() {
        const modalElement = document.getElementById(this.modalId);
        if (modalElement) {
            const bsModal = new bootstrap.Modal(modalElement);
            bsModal.show();
        }
    }

    hideModal() {
        const modalElement = document.getElementById(this.modalId);
        if (modalElement) {
            const bsModal = bootstrap.Modal.getInstance(modalElement);
            if (bsModal) {
                bsModal.hide();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const headsUp = new HeadsUp();
    headsUp.initialize();
});

export default HeadsUp;