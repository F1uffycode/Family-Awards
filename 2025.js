// window.addEventListener('scroll', () => {
//     if (window.scrollY > 1000) {
//         document.querySelector('.back-btn').classList.add('show');
//     }
// });

// window.addEventListener('scroll', () => {
//     if (window.scrollY < 1000) {
//         document.querySelector('.back-btn').classList.remove('show');
//     }
// });

const modal = document.querySelector('.video-modal');
const openBtn = document.querySelector('.open-video');
const closeBtn = document.querySelector('.close-video');
const iframe = modal.querySelector('iframe');

const videoSrc = iframe.src;

function closeVideo() {
    modal.classList.remove('active');

    // Останавливаем видео
    iframe.src = '';
    iframe.src = videoSrc;
}

openBtn.addEventListener('click', () => {
    modal.classList.add('active');
});

closeBtn.addEventListener('click', closeVideo);

// Закрытие по клику на тёмный фон
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeVideo();
    }
});

const sections = document.querySelectorAll('.scroll-section');
const nextBtn = document.querySelector('.next-btn');

let currentSection = 0;

nextBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if (currentSection < sections.length - 1) {
        currentSection++;

        sections[currentSection].scrollIntoView({
            behavior: 'smooth'
        });
    } else {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        currentSection = 0;
    }
});

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.create({
    trigger: '.nom__sound',
    start: 'top 70%',

    onEnter: () => {
        gsap.to('.next-btn', {
            opacity: 1,
            visibility: 'visible',
            duration: 0.4
        });
    },

    onLeaveBack: () => {
        gsap.to('.next-btn', {
            opacity: 0,
            visibility: 'hidden',
            duration: 0.4
        });
    }
});