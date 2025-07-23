export function showLoading(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center p-4">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;
}

export function showError(container, message = "Failed to load data.") {
  container.innerHTML = `<p class="text-danger text-center mb-0">${message}</p>`;
}