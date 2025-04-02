// loadTower function to work with the Viewer class
function loadTower(tower, viewer) {
    if (tower) {
        // hide landing page
        document.getElementById('landing-page').classList.add('d-none');

        if (viewer) {
            viewer.load(tower);
        }
    } else {
        // show landing page
        document.getElementById('landing-page').classList.remove('d-none');

        document.querySelector('.table-responsive').classList.add('d-none');
        document.getElementById('json-panel').classList.add('d-none');
        document.getElementById('wikitable-panel').classList.add('d-none');
        document.getElementById('lua-panel').classList.add('d-none');

        const allSpinners = document.querySelectorAll('.spinner-border');
        allSpinners.forEach(spinner => {
            spinner.style.display = 'none';
        });
    }
}

function clearUrlAndShowLanding() {
    // clear URL parameters without refreshing the page
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, '', url);

    loadTower(null);
}

export { loadTower, clearUrlAndShowLanding };
