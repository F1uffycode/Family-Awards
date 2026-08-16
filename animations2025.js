const title = document.querySelector('.hero__title');
const sub = document.querySelector('.hero__sub');

// Сохраняем исходный текст
const titleText = title.textContent.trim();
const subText = sub.textContent.trim();

// Очищаем элементы
title.textContent = '';
sub.textContent = '';

function typeText(element, text, speed) {
    return new Promise(resolve => {
        let i = 0;

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;

                gsap.delayedCall(speed, type);
            } else {
                resolve();
            }
        }

        type();
    });
}

async function startTyping() {
    await typeText(title, titleText, 0.10);
    await typeText(sub, subText, 0.04);
}

startTyping();

gsap.from(".nav__list", {
  y: -200,
  duration: 2,
  delay: 4
});

gsap.from(".hero__btn", {
  y: 200,
  duration: 5,
  opacity: 0,
  delay: 4
});

gsap.from(".cyber-grid", {
  duration: 10,
  opacity: 0
});

gsap.registerPlugin(ScrollTrigger);

gsap.from('.nom__sound', {
    opacity: 0,
    duration: 4,

    scrollTrigger: {
        trigger: '.nom__sound',
        start: 'top 80%'
    }
});

gsap.from('.nom__legends', {
    opacity: 0,
    duration: 4,

    scrollTrigger: {
        trigger: '.nom__legends',
        start: 'top 80%'
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
