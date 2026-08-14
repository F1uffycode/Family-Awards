document.addEventListener("DOMContentLoaded", () => {

    const track = document.querySelector(".marquee-track");

    if (!track) return;

    // Дублируем элементы
    track.innerHTML += track.innerHTML;

    // Рандомный поворот
    document.querySelectorAll(".marquee-item").forEach(item => {

        item.addEventListener("mouseenter", () => {

            const angle = Math.random() * 12 - 6;

            item.style.transform =
                `translateY(-8px) rotate(${angle}deg)`;

        });

        item.addEventListener("mouseleave", () => {

            item.style.transform =
                "translateY(0) rotate(0deg)";

        });

    });

    let position = 0;

    function animate() {

        position -= 0.5;

        const width = track.scrollWidth / 2;

        if (Math.abs(position) >= width) {
            position = 0;
        }

        track.style.transform =
            `translateX(${position}px)`;

        requestAnimationFrame(animate);
    }

    animate();

});