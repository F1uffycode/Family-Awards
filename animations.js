const year = document.querySelector('.blob__title span');
const text = year.textContent;

year.textContent = '';

const startDelay = 3.5; // секунды

[...text].forEach((letter, index) => {
    const span = document.createElement('span');

    span.classList.add('letter');
    span.textContent = letter;
    span.style.animationDelay = `${startDelay + index * 0.40}s`;

    year.appendChild(span);
});

gsap.from(".fam__text", { 
    duration: 1,
    delay: 2,
    opacity: 0
})

gsap.from(".fam__discord", { 
    duration: 2,
    delay: 2,
    opacity: 0
})

gsap.from(".nav__list", {
     y: -200,
     duration: 2,
     delay: 5
})

gsap.from(".vote__btn", {
  opacity: 0,
  duration: 2,
  delay: 5
});

gsap.from(".blob__awards", {
  opacity: 0,
  duration: 5,
  delay: 2
});

gsap.from(".blob__title", {
  opacity: 0,
  duration: 5,
  delay: 3
});

gsap.from(".blob__sub", {
  opacity: 0,
  duration: 2,
  delay: 4
});

gsap.from(".blob", {
  opacity: 0,
  duration: 3,
  delay: 1
});

gsap.from(".footer__copy", {
  y: 200,
  duration: 2
});

gsap.from(".top-left", {
  x: -200,
  duration: 2
});

gsap.from(".bottom-left", {
  x: -200,
  duration: 2
});

gsap.from(".top-right", {
  x: 200,
  duration: 2
});

gsap.from(".bottom-right", {
  x: 200,
  duration: 2
});