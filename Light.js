document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggle-light-mode');
    toggleButton.addEventListener('click', function() {
        document.body.classList.toggle('bg-dark');
        document.body.classList.toggle('bg-light');
        document.querySelector('.aside').classList.toggle('aside-light');
        document.body.classList.toggle('text-white');
        document.body.classList.toggle('text-black');
    });
});