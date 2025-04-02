import Alert from './Alert.js';

class StorageManager {
    constructor() {
        this.init();
    }

    init() {
        const resetLocalStorageBtn = document.getElementById('reset-localstorage');
        const settingsModal = document.getElementById('settings-modal');
        
        if (resetLocalStorageBtn) {
            resetLocalStorageBtn.addEventListener('click', () => {
                this.handleResetStorage(settingsModal);
            });
        }
    }

    handleResetStorage(settingsModal) {
        const confirmReset = confirm('This will delete ALL saved data and reset the website to its default state. This action cannot be undone. Are you sure you want to continue?');
        
        if (confirmReset) {
            localStorage.clear();
            
            const alert = new Alert('All data cleared successfully. Reloading page...', {
                alertStyle: 'alert-success',
            });
            alert.fire();

            if (settingsModal) {
                const modal = bootstrap.Modal.getInstance(settingsModal);
                if (modal) {
                    modal.hide();
                }
            }

            setTimeout(() => {
                window.location.reload();
            }, 1690);
        }
    }
}

export default StorageManager;
