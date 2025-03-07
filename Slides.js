document.addEventListener('DOMContentLoaded', function() {
    let slideIndex = 0;
    const slides = document.querySelectorAll('.slide');
    let slideInterval;
    
    showSlides();
    startSlideshow();
    document.querySelector('.slide-prev').addEventListener('click', function() {
        changeSlide(-1);
    });
    
    document.querySelector('.slide-next').addEventListener('click', function() {
        changeSlide(1);
    });
    
    function showSlides() {
        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove('active');
        }
        
        slides[slideIndex].classList.add('active');
    }
    
    function changeSlide(n) {
        clearInterval(slideInterval);

        slideIndex += n;
        if (slideIndex >= slides.length) slideIndex = 0;
        if (slideIndex < 0) slideIndex = slides.length - 1;
        
        showSlides();
        startSlideshow();
    }
    
    function startSlideshow() {
        slideInterval = setInterval(function() {
            slideIndex++;
            if (slideIndex >= slides.length) slideIndex = 0;
            showSlides();
        }, 15000); // miliseconds to change slides
    }
});