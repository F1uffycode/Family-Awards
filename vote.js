// ======================
// Анимация заголовка
// ======================

const year = document.querySelector('.blob__title span');

if (year) {

    const text = year.textContent;

    year.textContent = '';

    [...text].forEach((letter, index) => {

        const span = document.createElement('span');

        span.classList.add('letter');
        span.textContent = letter;
        span.style.animationDelay = `${index * 0.45}s`;

        year.appendChild(span);

    });

}


// ======================
// Голосование
// ======================

const finalBtn = document.querySelector(".final__btn");

if (finalBtn) {

    finalBtn.addEventListener("click", async (e) => {

        e.preventDefault();

        // Ищем выбранную карточку
        const selected = document.querySelector(
            'input[name="tournament-of-year"]:checked'
        );

        if (!selected) {

            alert("Сначала выберите карточку!");

            return;

        }

        // Получаем название кандидата из h3
        const candidateElement = document.querySelector(
            `label[for="${selected.id}"] h3`
        );

        if (!candidateElement) {

            alert("Не удалось определить кандидата.");

            return;

        }

        const candidate = candidateElement.textContent.trim();

        try {

            const response = await fetch("/api/vote", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    nomination: "Турнир года",
                    vote: candidate
                })

            });

            const data = await response.json();

            if (data.success) {

                alert("Голос успешно отправлен!");

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.error("Vote Error:", error);

            alert("Ошибка отправки голоса.");

        }

    });

}