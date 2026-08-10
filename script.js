const year = document.querySelector('.blob__title span');
    const text = year.textContent;

    year.textContent = '';

    [...text].forEach((letter, index) => {
        const span = document.createElement('span');

        span.classList.add('letter');
        span.textContent = letter;
        span.style.animationDelay = `${index * 0.45}s`;

        year.appendChild(span);
    });