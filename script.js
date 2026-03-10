const eventDate = new Date('December 25, 2024 16:00:00').getTime();

const galleryImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600',
    'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600'
];

let currentImageIndex = 0;
let musicPlaying = false;

const welcomeScreen = document.getElementById('welcomeScreen');
const mainContent = document.getElementById('mainContent');
const enterBtn = document.getElementById('enterBtn');
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');
const rsvpForm = document.getElementById('rsvpForm');
const successMessage = document.getElementById('successMessage');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

enterBtn.addEventListener('click', () => {
    welcomeScreen.classList.remove('active');
    mainContent.classList.add('active');
    
    bgMusic.play().then(() => {
        musicPlaying = true;
    }).catch(err => {
        console.log('Music autoplay prevented');
    });
});

function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

musicToggle.addEventListener('click', () => {
    if (musicPlaying) {
        bgMusic.pause();
        musicIcon.textContent = '🔇';
        musicPlaying = false;
    } else {
        bgMusic.play();
        musicIcon.textContent = '🔊';
        musicPlaying = true;
    }
});

function openLightbox(index) {
    currentImageIndex = index;
    lightboxImg.src = galleryImages[index];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function changeImage(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = galleryImages.length - 1;
    } else if (currentImageIndex >= galleryImages.length) {
        currentImageIndex = 0;
    }
    
    lightboxImg.src = galleryImages[currentImageIndex];
}

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
    if (lightbox.classList.contains('active')) {
        if (e.key === 'ArrowLeft') changeImage(-1);
        if (e.key === 'ArrowRight') changeImage(1);
    }
});

rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const attendance = document.getElementById('attendance').value;
    
    if (!name || name.length < 2) {
        alert('Please enter a valid name');
        return;
    }
    
    if (!phone || phone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }
    
    if (!attendance) {
        alert('Please select your attendance');
        return;
    }
    
    console.log('RSVP Submitted:', { name, phone, attendance });
    
    successMessage.classList.add('active');
    rsvpForm.reset();
    
    setTimeout(() => {
        successMessage.classList.remove('active');
    }, 5000);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
});
