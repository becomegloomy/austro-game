function applyResponsiveScale() {
    const referenceWidth = 1920;
    const referenceHeight = 1080;
    const widthScale = window.innerWidth / referenceWidth;
    const heightScale = window.innerHeight / referenceHeight;
    const isWideLowScreen = window.innerWidth >= 1200 && window.innerHeight <= 800;
    const isLaptop = window.innerWidth >= 1280 && window.innerWidth < 1600;

    let boostedScale = Math.min(widthScale, heightScale) * 1.12;
    if (isWideLowScreen) boostedScale *= 0.9;
    if (isLaptop) boostedScale *= 1.08;

    const minScale = isLaptop ? 0.90 : 0.82;
    const safeScale = Math.min(Math.max(boostedScale, minScale), 1.45);
    document.documentElement.style.setProperty('--scale', safeScale.toFixed(3));
}

function generateStars(container, count = 150) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const size = Math.random() < 0.4 ? 1 : (Math.random() < 0.75 ? 2 : (Math.random() < 0.9 ? 3 : 4));
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 6 + 's';
        star.style.animationDuration = (2 + Math.random() * 4) + 's';
        container.appendChild(star);
    }
}

function goToMainMenu() {
    window.location.href = '../index.html';
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function preloadImages(imageUrls, callback) {
    let loaded = 0;
    const total = imageUrls.length;
    if (total === 0) {
        if (callback) callback();
        return;
    }
    imageUrls.forEach(url => {
        const img = new Image();
        img.onload = () => {
            loaded++;
            if (loaded === total && callback) callback();
        };
        img.onerror = () => {
            loaded++;
            if (loaded === total && callback) callback();
        };
        img.src = url;
    });
}

function initBackButton(selector = '.back-btn') {
    const btn = document.querySelector(selector);
    if (btn) {
        btn.addEventListener('click', goToMainMenu);
    }
}

function setupResizeListener(onResize, delay = 100) {
    const handler = debounce(onResize, delay);
    window.addEventListener('resize', handler);
    return handler;
}

window.applyResponsiveScale = applyResponsiveScale;
window.generateStars = generateStars;
window.goToMainMenu = goToMainMenu;
window.debounce = debounce;
window.preloadImages = preloadImages;
window.initBackButton = initBackButton;
window.setupResizeListener = setupResizeListener;