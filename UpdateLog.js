/**
 * Fetches and displays GitHub commit history as an update log
 */
class UpdateLog {
    constructor() {
        this.repoOwner = 't7ru';
        this.repoName = 'TDS-Stats-Editor';
        this.commitLimit = 20;
        
        this.modal = null;
        this.contentContainer = null;
    }
    
    async fetchCommits() {
        if (!this.contentContainer) return;
        
        try {
            this.contentContainer.innerHTML = `
                <div class="d-flex justify-content-center">
                    <div class="spinner-border text-secondary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
            
            const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/commits?per_page=${this.commitLimit}`);
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const commits = await response.json();
            this.displayCommits(commits);
        } catch (error) {
            console.error("Failed to fetch commits:", error);
            this.showError("Couldn't fetch updates. Please try again later.");
        }
    }
    
    displayCommits(commits) {
        if (!this.contentContainer) return;
        
        if (!commits || commits.length === 0) {
            this.contentContainer.innerHTML = '<p class="text-center">No updates available.</p>';
            return;
        }
        
        let html = '<div class="list-group">';
        
        commits.forEach(commit => {
            const date = new Date(commit.commit.author.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            let message = commit.commit.message;
            let type = '';
            let scope = '';
            let description = message;
            
            const conventionalPattern = /^(\w+)(?:\(([^)]+)\))?: (.+)/;
            const match = message.match(conventionalPattern);
            
            if (match) {
                [, type, scope, description] = match;
                
                description = description.split('\n')[0];
            }
            
            let badgeClass = 'bg-secondary';
            if (type) {
                switch (type.toLowerCase()) {
                    case 'feat': badgeClass = 'bg-success'; type = 'Feature'; break;
                    case 'fix': badgeClass = 'bg-danger'; type = 'Fix'; break;
                    case 'docs': badgeClass = 'bg-info'; type = 'Documentation'; break;
                    case 'style': badgeClass = 'bg-primary'; type = 'Style'; break;
                    case 'refactor': badgeClass = 'bg-warning text-dark'; type = 'Refactor'; break;
                    case 'perf': badgeClass = 'bg-purple'; type = 'Performance'; break;
                    case 'test': badgeClass = 'bg-dark'; type = 'Test'; break;
                    case 'chore': badgeClass = 'bg-secondary'; type = 'Chore'; break;
                }
            }
            
            html += `
                <div class="list-group-item bg-dark text-white border-secondary">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">
                            ${type ? `<span class="badge ${badgeClass} me-1">${type}</span>` : ''}
                            ${scope ? `<span class="text-muted">(${scope})</span> ` : ''}
                            ${description}
                        </h5>
                    </div>
                    <p class="mb-1 text-muted">by ${commit.commit.author.name}</p>
                    <div class="d-flex w-100 justify-content-between">
                        <small>
                            <a href="${commit.html_url}" target="_blank" class="text-info">
                                View more on GitHub
                            </a>
                        </small>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        this.contentContainer.innerHTML = html;
    }
    
    showError(message) {
        if (!this.contentContainer) return;
        
        this.contentContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${message}
            </div>
        `;
    }
    
    init() {
        this.modal = document.getElementById('discord-modal');
        this.contentContainer = document.getElementById('update-log-content');
        
        const aboutRadio = document.getElementById('aboutSectionAbout');
        const updatesRadio = document.getElementById('aboutSectionUpdates');
        
        const aboutContent = document.getElementById('about-content');
        const updateContent = document.getElementById('update-log-content');
        
        if (!aboutRadio || !updatesRadio || !aboutContent || !updateContent) {
            console.warn("Required DOM elements for UpdateLog not found, skipping initialization.");
            return;
        }
        
        aboutRadio.addEventListener('change', () => {
            if (aboutRadio.checked) {
                aboutContent.classList.remove('d-none');
                updateContent.classList.add('d-none');
            }
        });
        
        updatesRadio.addEventListener('change', () => {
            if (updatesRadio.checked) {
                aboutContent.classList.add('d-none');
                updateContent.classList.remove('d-none');
                this.fetchCommits();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const updateLog = new UpdateLog();
    updateLog.init();
});

export default UpdateLog;