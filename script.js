const games = [
    {
        id: 1,
        title: "Одень космонавта",
        description: "Собери скафандр космонавта для выхода в открытый космос",
        icon: "👨‍🚀",
        image: "./images/astronaut.png",
        url: "./astronaut-game/index.html"
    },
    {
        id: 2,
        title: "Запусти ракету",
        description: "Собери ракету-носитель СОЮЗ и запусти её в космос",
        icon: "🚀",
        image: "./images/rocket.png",
        url: "./rocket-game/index.html"
    },
    {
        id: 3,
        title: "Угадай спутник",
        description: "Определи миссию космического аппарата по внешнему виду",
        icon: "🛰️",
        image: "./images/sputnik.png",
        url: "./sputnik-game/index.html"
    },
    {
        id: 4,
        title: "Космическая викторина",
        description: "Проверь свои знания о космосе и космонавтике",
        icon: "🧠",
        image: "./images/laboratory.png",
        url: "./laboratory-game/index.html"
    }
];

function renderGames() {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;

    if (games.length === 0) {
        grid.innerHTML = '<div class="loading">🚀 Игры скоро появятся</div>';
        return;
    }

    grid.innerHTML = '';
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-url', game.url);
        card.setAttribute('tabindex', '0');

        const imageHtml = game.image 
            ? `<img class="game-image" src="${game.image}" alt="${game.title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect width=%27100%27 height=%27100%27 fill=%27%23333%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%23fff%27%3E${game.icon}%3C/text%3E%3C/svg%3E'">`
            : `<div class="game-image" style="display: flex; align-items: center; justify-content: center; background: #0a0f2a; font-size: 3rem;">${game.icon}</div>`;

        card.innerHTML = `
            ${imageHtml}
            <div class="game-info">
                <div class="game-title">${escapeHtml(game.title)}</div>
                <div class="game-description">${escapeHtml(game.description)}</div>
                <div class="play-badge">
                    <span>▶</span>
                    <span>Играть</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.href = game.url;
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = game.url;
            }
        });
        grid.appendChild(card);
    });
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function resetScroll() {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

function applyResponsiveScale() {
    const referenceWidth = 1920;
    const referenceHeight = 1080;
    const widthScale = window.innerWidth / referenceWidth;
    const heightScale = window.innerHeight / referenceHeight;
    const isWideLowScreen = window.innerWidth >= 1200 && window.innerHeight <= 800;

    let boostedScale = Math.min(widthScale, heightScale) * 1.12;
    if (isWideLowScreen) boostedScale *= 0.9;

    const safeScale = Math.min(Math.max(boostedScale, 0.82), 1.45);
    document.documentElement.style.setProperty('--scale', safeScale.toFixed(3));
}

let resizeTimeout;
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        applyResponsiveScale();
    }, 100);
}

window.addEventListener('DOMContentLoaded', () => {
    const starsContainer = document.getElementById('starsBg');
    if (starsContainer) {
        window.generateStars(starsContainer, 150);
    }
    applyResponsiveScale();
    resetScroll();
    renderGames();
});

window.addEventListener('resize', handleResize);
window.addEventListener('pageshow', () => {
    resetScroll();
    setTimeout(resetScroll, 10);
    setTimeout(resetScroll, 100);
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) resetScroll();
});

window.addEventListener('orientationchange', () => {
    setTimeout(applyResponsiveScale, 50);
});