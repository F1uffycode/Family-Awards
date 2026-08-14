const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const axios = require("axios");
const { google } = require("googleapis");

dotenv.config();

const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets"
    ]
});

const sheets = google.sheets({
    version: "v4",
    auth
});

const app = express();

// =========================
// Настройки
// =========================

app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // Пока работаем через localhost
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    })
);

// Показываем файлы сайта
app.use(express.static("."));


// =========================
// Discord авторизация
// =========================

app.get("/auth/discord", (req, res) => {

    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
        response_type: "code",
        scope: "identify"
    });

    const discordUrl =
        `https://discord.com/oauth2/authorize?${params.toString()}`;

    res.redirect(discordUrl);
});


// =========================
// Discord callback
// =========================

app.get("/auth/discord/callback", async (req, res) => {

    const { code } = req.query;

    if (!code) {
        return res.status(400).send("Discord не передал код авторизации.");
    }

    try {

        // Получаем access token
        const tokenResponse = await axios.post(
            "https://discord.com/api/oauth2/token",
            new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: "authorization_code",
                code: code,
                redirect_uri: process.env.DISCORD_REDIRECT_URI
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        const accessToken = tokenResponse.data.access_token;


        // Получаем информацию о пользователе Discord
        const userResponse = await axios.get(
            "https://discord.com/api/users/@me",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        const user = userResponse.data;


        // Сохраняем пользователя в сессии
        req.session.user = {
            id: user.id,
            username: user.username,
            global_name: user.global_name,
            avatar: user.avatar
        };


        // Возвращаем пользователя на сайт
        res.redirect("/2026.html");

    } catch (error) {

        console.error(
            "Discord OAuth error:",
            error.response?.data || error.message
        );

        res.status(500).send("Ошибка авторизации через Discord.");
    }
});


// =========================
// Проверка авторизации
// =========================

app.get("/api/me", (req, res) => {

    if (!req.session.user) {
        return res.json({
            loggedIn: false
        });
    }

    res.json({
        loggedIn: true,
        user: req.session.user
    });
});


// =========================
// Проверка сервера
// =========================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "Backend работает!"
    });

});

app.get("/api/sheets-test", async (req, res) => {

    try {

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: "A1:E5"
        });

        res.json({
            success: true,
            data: response.data.values || []
        });

    } catch (error) {

        console.error("Google Sheets error:", error);

        res.status(500).json({
            success: false,
            message: "Не удалось подключиться к Google Sheets."
        });

    }

});

// =========================
// Голосование
// =========================

// Очередь нужна, чтобы два одновременных запроса
// не смогли записать два голоса до проверки.
// Для нашего небольшого проекта этого достаточно.
let voteQueue = Promise.resolve();

function addVoteToQueue(task) {
    const result = voteQueue.then(task, task);

    voteQueue = result.catch(() => {});

    return result;
}


// =========================
// POST /api/vote
// =========================

app.post("/api/vote", async (req, res) => {

    // Проверяем авторизацию
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Сначала войдите через Discord."
        });
    }

    const { nomination, vote } = req.body;

    // Проверяем данные
    if (!nomination || !vote) {
        return res.status(400).json({
            success: false,
            message: "Не указана номинация или кандидат."
        });
    }

    // Убираем случайные пробелы
    const nominationName = String(nomination).trim();
    const voteName = String(vote).trim();

    // Ограничиваем размер данных
    if (nominationName.length > 100 || voteName.length > 100) {
        return res.status(400).json({
            success: false,
            message: "Слишком длинное название."
        });
    }


    // Ставим голос в очередь
    try {

        const result = await addVoteToQueue(async () => {

            const discordId = req.session.user.id;
            const username =
                req.session.user.global_name ||
                req.session.user.username;


            // Получаем существующие голоса
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: "A2:E"
            });

            const rows = response.data.values || [];


            // Проверяем, голосовал ли пользователь
            // в этой конкретной номинации
            const alreadyVoted = rows.some(row => {

                const existingDiscordId = row[0];
                const existingNomination = row[2];

                return (
                    existingDiscordId === discordId &&
                    existingNomination === nominationName
                );

            });


            if (alreadyVoted) {

                return {
                    success: false,
                    alreadyVoted: true,
                    message: "Вы уже голосовали в этой номинации."
                };

            }


            // Записываем голос
            await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,

                range: "A:E",

                valueInputOption: "USER_ENTERED",

                insertDataOption: "INSERT_ROWS",

                requestBody: {
                    values: [[
                        discordId,
                        username,
                        nominationName,
                        voteName,
                        new Date().toLocaleString("ro-RO", {
                            timeZone: "Europe/Bucharest"
                        })
                    ]]
                }
            });


            return {
                success: true,
                message: "Голос успешно записан!"
            };

        });


        res.json(result);


    } catch (error) {

        console.error(
            "Vote error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            success: false,
            message: "Не удалось сохранить голос."
        });

    }

});


// =========================
// GET /api/my-votes
// =========================

app.get("/api/my-votes", async (req, res) => {

    // Проверяем авторизацию
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Сначала войдите через Discord."
        });
    }


    try {

        const discordId = req.session.user.id;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: "A2:E"
        });

        const rows = response.data.values || [];


        // Оставляем только голоса текущего пользователя
        const myVotes = rows
            .filter(row => row[0] === discordId)
            .map(row => ({
                nomination: row[2],
                vote: row[3],
                date: row[4]
            }));


        res.json({
            success: true,
            votes: myVotes
        });


    } catch (error) {

        console.error(
            "My votes error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            success: false,
            message: "Не удалось получить ваши голоса."
        });

    }

});


// =========================
// Запуск сервера
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(`Server started on port ${PORT}`);

});