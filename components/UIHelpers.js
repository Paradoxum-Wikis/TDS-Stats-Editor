function setVersionNumber(version) {
    const versionElements = document.querySelectorAll('.tdsversion');
    versionElements.forEach(element => {
        element.textContent = version;
    });
}

function generateUpdateLogHtml(updates) {
    return updates.map(update => `
        <div class="update-item mb-3">
            <h5>${update.version} <small class="text-muted">${update.date}</small></h5>
            <ul class="ps-3">
                ${update.changes.map(change => `<li>${change}</li>`).join('')}
                <li>Various changes</li>
            </ul>
        </div>
    `).join('');
}

function loadUpdateLog() {
    fetch('updatelog.json')
        .then(response => response.json())
        .then(data => {
            const updateLogModal = document.getElementById('update-log-content');
            const updateLogLanding = document.getElementById('landing-update-log');

            const updateHtml = generateUpdateLogHtml(data);

            if (updateLogModal) updateLogModal.innerHTML = updateHtml;
            if (updateLogLanding) {
                updateLogLanding.innerHTML = generateUpdateLogHtml(data);
            }
        })
        .catch(error => {
            console.error('Error loading update log:', error);
            const errorHtml = '<div class="alert alert-danger">Failed to load update log.</div>';

            const updateLogModal = document.getElementById('update-log-content');
            const updateLogLanding = document.getElementById('landing-update-log');

            if (updateLogModal) updateLogModal.innerHTML = errorHtml;
            if (updateLogLanding) updateLogLanding.innerHTML = errorHtml;
        });
}

export { setVersionNumber, generateUpdateLogHtml, loadUpdateLog };
