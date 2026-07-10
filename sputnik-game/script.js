(function() {

    const SATELLITE_TYPES = [
        {
            id: 'communication',
            name: 'Спутник связи',
            missionKeyword: 'связь',
            orbitType: 'geostationary',
            speed: 0,
            orbitRadiusFactor: 2.6,
            fact: 'Геостационарные спутники связи висят над одной точкой Земли, поэтому их антенна всегда направлена на одну область. Они работают на высоте ~36 000 км и обеспечивают телевидение, интернет и связь.',
            minimalHint: '📡 Большая круглая антенна-тарелка',
            detailedHint: 'Этот спутник ловит и передаёт сигналы на Землю.',
            imageSrc: 'images/satellite_comm.png'
        },
        {
            id: 'weather',
            name: 'Метеоспутник',
            missionKeyword: 'погода',
            orbitType: 'low',
            speed: 0.019,
            orbitRadiusFactor: 2.2,
            fact: 'Метеоспутники облетают Землю за 90–100 минут и сканируют до 90% её поверхности за сутки. Без них прогноз погоды был бы точным лишь на 30%.',
            minimalHint: '🌡️ Круглые датчики - сенсоры для измерения температуры, влажности, облачности. Вытянутая антена - сканер поверхности и атмосферы.',
            detailedHint: 'Спутник постоянно вращается, чтобы сканировать облака и измерять температуру. Без него прогноз погоды был бы неточным.',
            imageSrc: 'images/satellite_weather.png'
        },
        {
            id: 'navigation',
            name: 'Навигационный спутник',
            missionKeyword: 'навигация',
            orbitType: 'medium',
            speed: 0.009,
            orbitRadiusFactor: 2.5,
            fact: 'В каждом навигационном спутнике установлены атомные часы. Они настолько точны, что отстают всего на 1 секунду за 100 миллионов лет. Чтобы ваш смартфон узнал своё местоположение, ему нужно услышать сигналы как минимум от 4 спутников. Три из них нужны для расчёта расстояний, а четвёртый — для коррекции времени',
            minimalHint: '📍 Много золотых прямоугольников на корпусе – антенны для точного позиционирования',
            detailedHint: 'Спутник посылает сигналы с точным временем, телефон ловит их, вычисляет расстояние и показывает ваше местоположение на карте.',
            imageSrc: 'images/satellite_nav.png'
        },
        {
            id: 'scientific',
            name: 'Астрономический спутник',
            missionKeyword: 'астрономия',
            orbitType: 'high',
            speed: 0.006,
            orbitRadiusFactor: 3.0,
            fact: 'Космический телескоп не искажает изображение атмосферой Земли, поэтому видит галактики на расстоянии миллиардов световых лет. Именно так были открыты тысячи экзопланет.',
            minimalHint: '🔭 Похож на трубу телескопа',
            detailedHint: 'Он направлен в открытый космос, а не на Землю. Именно так астрономы изучают далёкие галактики и чёрные дыры.',
            imageSrc: 'images/satellite_sci.png'
        },
        {
            id: 'earthObs',
            name: 'Спутник наблюдения Земли',
            missionKeyword: 'наблюдение',
            orbitType: 'low',
            speed: 0.018,
            orbitRadiusFactor: 2.3,
            fact: 'Спутники наблюдения могут «видеть» не только обычным светом, но и инфракрасным. Это позволяет им обнаруживать скрытые пожары ещё до того, как появится дым, или определять здоровье растений по цвету листьев.',
            minimalHint: '📷 Солнечные панели в виде «лепестков» при запуске сложены и занимают мало места, а на орбите раскрываются на максимальную площадь для выработки достаточной энергии для мощных камер.',
            detailedHint: 'Его камеры всегда направлены на Землю. Он делает снимки высокого разрешения для карт, экологии и сельского хозяйства.',
            imageSrc: 'images/satellite_earth.png'
        },
        {
            id: 'experimental',
            name: 'Экспериментальный спутник',
            missionKeyword: 'эксперимент',
            orbitType: 'medium',
            speed: 0.012,
            orbitRadiusFactor: 2.4,
            fact: 'Экспериментальные спутники называют «летающими лабораториями». Именно на них впервые испытали ионные двигатели, лазерную связь и развёртываемые фермы. Данные таких миссий позволяют создавать более совершенные аппараты для науки и связи.',
            minimalHint: '🔧 Длинная штанга выносит два датчика подальше от корпуса – для точных замеров гравитации и магнитного поля',
            detailedHint: 'Спутник используется для калибровки новых приборов и проведения фундаментальных экспериментов в космосе.',
            imageSrc: 'images/satellite_experimental.png'
        }
    ];

    const satelliteImages = {};
    let imagesLoadedCount = 0;
    const totalImages = SATELLITE_TYPES.length;

    function preloadImages(callback) {
        SATELLITE_TYPES.forEach(sat => {
            const img = new Image();
            img.onload = () => {
                imagesLoadedCount++;
                if (imagesLoadedCount === totalImages) callback();
            };
            img.onerror = () => {
                console.warn(`Не удалось загрузить ${sat.imageSrc}`);
                imagesLoadedCount++;
                if (imagesLoadedCount === totalImages) callback();
            };
            img.src = sat.imageSrc;
            satelliteImages[sat.id] = img;
        });
    }

    const canvas = document.getElementById('satelliteCanvas');
    const ctx = canvas.getContext('2d');
    const previewCanvas = document.getElementById('previewCanvas');
    const previewCtx = previewCanvas.getContext('2d');
    const missionsGrid = document.getElementById('missionsGrid');
    const resetBtn = document.getElementById('resetBtn');
    const nextBtn = document.getElementById('nextSatelliteBtn');
    const factDisplay = document.getElementById('factDisplay');
    const progressStarsDiv = document.getElementById('progressStars');
    const completionOverlay = document.getElementById('completionOverlay');
    const completionMessage = document.getElementById('completionMessage');
    const completionResetBtn = document.getElementById('completionResetBtn');
    const hintButton = document.getElementById('hintButton');

    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const backToMenuComplete = document.getElementById('backToMenuFromComplete');

    if (backToMenuBtn) backToMenuBtn.addEventListener('click', goToMainMenu);
    if (backToMenuComplete) backToMenuComplete.addEventListener('click', goToMainMenu);

    let width, height;
    let earthX, earthY, earthRadius;
    let satelliteAngle = 0;
    let rotating = false;
    let gameLocked = false;
    let currentSatellite = null;
    let currentSpeed = 0;
    let stars = [];

    let queue = [];
    let solvedCount = 0;
    let isCurrentGuessed = false;
    let isGameFinished = false;
    let hintTimeout = null;
    let showSmallSatellite = false;
    let orbitVisible = false;

    let isAnimating = false;
    let animStartTime = 0;
    const animDuration = 800;
    let animStartX, animStartY, animStartSize;
    let animEndX, animEndY, animEndSize;
    let animImage = null;
    let animFrameRequest = null;

    let earthImage = new Image();
    let earthImageLoaded = false;
    earthImage.onload = () => { earthImageLoaded = true; };
    earthImage.onerror = () => { earthImageLoaded = false; };
    earthImage.src = 'images/earth.png';

    function drawPreview() {
        if (!currentSatellite) return;
        const w = previewCanvas.width;
        const h = previewCanvas.height;
        if (w === 0 || h === 0) return;
        previewCtx.clearRect(0, 0, w, h);
        if (!isCurrentGuessed && !isGameFinished && !isAnimating) {
            const img = satelliteImages[currentSatellite.id];
            if (img && img.complete && img.naturalWidth > 0) {
                const maxSize = Math.min(w, h) * 0.65;
                let imgWidth = img.naturalWidth;
                let imgHeight = img.naturalHeight;
                let drawWidth, drawHeight;
                if (imgWidth > imgHeight) {
                    drawWidth = maxSize;
                    drawHeight = maxSize * (imgHeight / imgWidth);
                } else {
                    drawHeight = maxSize;
                    drawWidth = maxSize * (imgWidth / imgHeight);
                }
                const x = (w - drawWidth) / 2;
                const y = (h - drawHeight) / 2;
                const bgRadius = Math.max(drawWidth, drawHeight) * 0.6;
                previewCtx.beginPath();
                previewCtx.arc(w/2, h/2, bgRadius, 0, Math.PI*2);
                previewCtx.fillStyle = "rgba(0, 0, 0, 0.65)";
                previewCtx.fill();
                previewCtx.shadowBlur = 12;
                previewCtx.shadowColor = "#6bc8ff";
                previewCtx.imageSmoothingEnabled = true;
                previewCtx.imageSmoothingQuality = 'high';
                previewCtx.drawImage(img, x, y, drawWidth, drawHeight);
                previewCtx.shadowBlur = 0;
                previewCtx.beginPath();
                previewCtx.arc(w/2, h/2, bgRadius + 4, 0, Math.PI*2);
                previewCtx.strokeStyle = "#88aaff";
                previewCtx.lineWidth = 2;
                previewCtx.stroke();
            } else {
                previewCtx.fillStyle = "#ffaa33";
                previewCtx.font = `${Math.min(w, h) * 0.1}px sans-serif`;
                previewCtx.textAlign = "center";
                previewCtx.textBaseline = "middle";
                previewCtx.fillText(currentSatellite.name.charAt(0), w/2, h/2);
            }
        } else {
            previewCtx.clearRect(0, 0, w, h);
        }
    }

    function drawStars() {
        for (let s of stars) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 240, 210, ${s.alpha + Math.sin(Date.now() * s.twinkle) * 0.12})`;
            ctx.fill();
        }
    }

    function drawEarth() {
        if (earthImageLoaded && earthImage.complete && earthImage.naturalWidth > 0) {
            const imgSize = earthRadius * 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(earthImage, earthX - earthRadius, earthY - earthRadius, imgSize, imgSize);
            ctx.restore();
            ctx.beginPath();
            ctx.arc(earthX, earthY, earthRadius + 3, 0, Math.PI * 2);
            ctx.strokeStyle = "#aaf0ff55";
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            const grad = ctx.createRadialGradient(earthX - 12, earthY - 12, 12, earthX, earthY, earthRadius + 5);
            grad.addColorStop(0, '#2a6f8f');
            grad.addColorStop(0.6, '#1c9f6e');
            grad.addColorStop(1, '#1a4d3a');
            ctx.beginPath();
            ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = "#88ddff99";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = "#93c47dbb";
            ctx.beginPath();
            ctx.ellipse(earthX - 18, earthY - 12, earthRadius * 0.23, earthRadius * 0.28, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(earthX + 22, earthY + 10, earthRadius * 0.25, earthRadius * 0.2, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(earthX + 5, earthY + 28, earthRadius * 0.17, earthRadius * 0.22, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(earthX, earthY, earthRadius + 3, 0, Math.PI * 2);
            ctx.strokeStyle = "#aaf0ff55";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    function drawOrbit(radius) {
        ctx.beginPath();
        ctx.arc(earthX, earthY, radius, 0, Math.PI * 2);
        ctx.setLineDash([8, 12]);
        ctx.strokeStyle = "#5b8cbb88";
        ctx.lineWidth = Math.max(1.5, earthRadius * 0.02);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function easeOutQuad(t) {
        return t * (2 - t);
    }

    function drawAnimatedSatellite() {
        if (!isAnimating || !animImage) return;
        const now = performance.now();
        let t = (now - animStartTime) / animDuration;
        if (t >= 1) {
            isAnimating = false;
            showSmallSatellite = true;
            rotating = true;
            gameLocked = true;
            drawPreview();
            if (animFrameRequest) cancelAnimationFrame(animFrameRequest);
            return;
        }
        t = easeOutQuad(t);
        const currX = animStartX + (animEndX - animStartX) * t;
        const currY = animStartY + (animEndY - animStartY) * t;
        const currSize = animStartSize + (animEndSize - animStartSize) * t;
        const img = animImage;
        if (img && img.complete && img.naturalWidth > 0) {
            const origW = img.naturalWidth;
            const origH = img.naturalHeight;
            let drawW, drawH;
            if (origW > origH) {
                drawW = currSize;
                drawH = currSize * (origH / origW);
            } else {
                drawH = currSize;
                drawW = currSize * (origW / origH);
            }
            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, currX - drawW/2, currY - drawH/2, drawW, drawH);
            ctx.restore();
        } else {
            ctx.fillStyle = "#ffaa33";
            ctx.beginPath();
            ctx.arc(currX, currY, currSize/2, 0, Math.PI*2);
            ctx.fill();
        }
        animFrameRequest = requestAnimationFrame(() => drawAnimatedSatellite());
    }

    function drawSmallSatellite() {
        if (!showSmallSatellite || !currentSatellite || isAnimating) return;
        const orbitR = earthRadius * currentSatellite.orbitRadiusFactor;
        let angle = satelliteAngle;
        if (!rotating && currentSatellite.speed === 0) {
            angle = satelliteAngle;
        } else if (!rotating && currentSatellite.speed !== 0) {
            angle = satelliteAngle;
        }
        const satX = earthX + orbitR * Math.cos(angle);
        const satY = earthY + orbitR * Math.sin(angle);
        const img = satelliteImages[currentSatellite.id];
        const satSize = earthRadius * 0.9;
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();
            ctx.shadowBlur = 6;
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            const origW = img.naturalWidth;
            const origH = img.naturalHeight;
            let drawW, drawH;
            if (origW > origH) {
                drawW = satSize;
                drawH = satSize * (origH / origW);
            } else {
                drawH = satSize;
                drawW = satSize * (origW / origH);
            }
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, satX - drawW/2, satY - drawH/2, drawW, drawH);
            ctx.restore();
        } else {
            ctx.fillStyle = "#ffaa33";
            ctx.beginPath();
            ctx.arc(satX, satY, satSize/2, 0, Math.PI * 2);
            ctx.fill();
        }
        if (rotating && gameLocked && currentSatellite) {
            ctx.beginPath();
            ctx.arc(satX, satY, satSize/2 + 5, 0, Math.PI * 2);
            ctx.fillStyle = "#9effff20";
            ctx.fill();
        }
    }

    function updateDimensions() {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        if (width === 0 || height === 0) {
            setTimeout(updateDimensions, 50);
            return;
        }
        canvas.width = width;
        canvas.height = height;
        previewCanvas.width = width;
        previewCanvas.height = height;
        earthX = width / 2;
        earthY = height / 2;
        earthRadius = Math.min(width, height) * 0.15;
        stars = [];
        const starCount = Math.min(500, Math.floor(width * height / 2000));
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 1,
                alpha: Math.random() * 0.6 + 0.3,
                twinkle: Math.random() * 0.03 + 0.01
            });
        }
        drawPreview();
    }

    function animate() {
        if (rotating && currentSatellite && gameLocked && !isGameFinished && showSmallSatellite) {
            satelliteAngle += currentSpeed;
            if (satelliteAngle > Math.PI * 2) satelliteAngle -= Math.PI * 2;
        }
        ctx.clearRect(0, 0, width, height);
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#03001c');
        grad.addColorStop(1, '#010010');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        drawStars();
        if (currentSatellite && orbitVisible) {
            drawOrbit(earthRadius * currentSatellite.orbitRadiusFactor);
        }
        drawEarth();
        if (isAnimating) {
            drawAnimatedSatellite();
        } else {
            drawSmallSatellite();
        }
        requestAnimationFrame(animate);
    }

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function updateProgressStars() {
        progressStarsDiv.innerHTML = '';
        for (let i = 0; i < queue.length; i++) {
            const star = document.createElement('i');
            star.className = `fas fa-star star-icon`;
            if (i < solvedCount) {
                star.classList.add('completed');
            } else if (i === solvedCount && isCurrentGuessed) {
                star.classList.add('completed');
            }
            star.title = queue[i].name;
            progressStarsDiv.appendChild(star);
        }
    }

    function updateInfoPanelNormal() {
        if (!currentSatellite) return;
        if (factDisplay.classList.contains('success')) return;
        factDisplay.innerHTML = `<span class="main-text">Внимательно рассмотри спутник и выбери его миссию</span><span class="hint">${currentSatellite.minimalHint}</span>`;
        factDisplay.classList.remove('error', 'success');
        if (!gameLocked && !isGameFinished) {
            hintButton.disabled = false;
        } else {
            hintButton.disabled = true;
        }
    }

    function showDetailedHint() {
        if (!currentSatellite) return;
        if (factDisplay.classList.contains('success') || factDisplay.classList.contains('error')) return;
        if (hintTimeout) clearTimeout(hintTimeout);
        const originalHint = currentSatellite.minimalHint;
        factDisplay.innerHTML = `<span class="main-text">Внимательно рассмотри спутник и выбери его миссию</span><span class="hint">💡 ${currentSatellite.detailedHint}</span>`;
        hintTimeout = setTimeout(() => {
            if (!gameLocked && !isGameFinished && currentSatellite && 
                !factDisplay.classList.contains('success') && !factDisplay.classList.contains('error')) {
                updateInfoPanelNormal();
            }
            hintTimeout = null;
        }, 3000);
    }

    function enableMissionButtons(enable) {
        const btns = document.querySelectorAll('.btn-mission:not(.btn-next):not(.btn-reset)');
        btns.forEach(btn => btn.disabled = !enable);
    }

    function showCompletionModal() {
        completionOverlay.classList.remove('hidden');
        completionMessage.classList.remove('hidden');
        if (backToMenuBtn) backToMenuBtn.style.display = 'none';
    }

    function hideCompletionModal() {
        completionOverlay.classList.add('hidden');
        completionMessage.classList.add('hidden');
        if (backToMenuBtn) backToMenuBtn.style.display = 'flex';
    }

    function loadNextSatellite() {
        if (isGameFinished) return;
        if (!isCurrentGuessed) return;

        solvedCount++;
        isCurrentGuessed = false;
        showSmallSatellite = false;
        rotating = false;
        gameLocked = false;
        isAnimating = false;
        orbitVisible = false;
        satelliteAngle = Math.random() * Math.PI * 2;

        if (solvedCount >= queue.length) {
            isGameFinished = true;
            currentSatellite = null;
            enableMissionButtons(false);
            nextBtn.disabled = true;
            nextBtn.style.display = 'none';
            resetBtn.style.display = 'none';
            updateProgressStars();
            showCompletionModal();
            hintButton.disabled = true;
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            return;
        }

        currentSatellite = queue[solvedCount];
        currentSpeed = currentSatellite.speed;
        enableMissionButtons(true);
        nextBtn.disabled = true;

        factDisplay.classList.remove('success', 'error');
        updateInfoPanelNormal();

        updateProgressStars();
        document.getElementById('previewCanvas').style.opacity = '1';
        drawPreview();
    }

    function startTransitionToOrbit() {
        const startSize = Math.min(width, height) * 0.55;
        const startX = width / 2;
        const startY = height / 2;
        const orbitR = earthRadius * currentSatellite.orbitRadiusFactor;
        const targetAngle = satelliteAngle;
        const endX = earthX + orbitR * Math.cos(targetAngle);
        const endY = earthY + orbitR * Math.sin(targetAngle);
        const endSize = earthRadius * 0.9;
        animStartX = startX;
        animStartY = startY;
        animStartSize = startSize;
        animEndX = endX;
        animEndY = endY;
        animEndSize = endSize;
        animImage = satelliteImages[currentSatellite.id];
        animStartTime = performance.now();
        isAnimating = true;
        const previewElem = document.getElementById('previewCanvas');
        previewElem.style.opacity = '0';
        setTimeout(() => {
            previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            previewElem.style.opacity = '1';
        }, 300);
    }

    function onCorrectGuess() {
        if (gameLocked || isGameFinished) return;
        if (isCurrentGuessed) return;
        isCurrentGuessed = true;
        startTransitionToOrbit();
        orbitVisible = true;
        factDisplay.innerHTML = `✅ ПРАВИЛЬНО!<span class="hint">${currentSatellite.fact}</span>`;
        factDisplay.classList.remove('error');
        factDisplay.classList.add('success');
        hintButton.disabled = true;
        enableMissionButtons(false);
        nextBtn.disabled = false;
        updateProgressStars();
    }

    function handleMissionSelect(selectedKeyword) {
        if (gameLocked || isGameFinished || !currentSatellite) {
            if (isGameFinished) {
                factDisplay.innerHTML = "🏆 Игра завершена! Нажмите «Начать сначала».";
                factDisplay.classList.remove('error', 'success');
            }
            return;
        }
        if (selectedKeyword === currentSatellite.missionKeyword) {
            onCorrectGuess();
        } else {
            rotating = false;
            factDisplay.innerHTML = `❌ Неверно! Попробуй ещё раз.`;
            factDisplay.classList.remove('success');
            factDisplay.classList.add('error');
            hintButton.disabled = true;
            setTimeout(() => {
                if (!gameLocked && !isGameFinished && currentSatellite && !factDisplay.classList.contains('success')) {
                    updateInfoPanelNormal();
                } else {
                    hintButton.disabled = true;
                }
            }, 1200);
        }
    }

    function buildMissionButtons() {
        missionsGrid.innerHTML = '';
        const missions = [
            { keyword: 'связь', label: '📡 СВЯЗЬ', icon: 'fa-satellite-dish' },
            { keyword: 'погода', label: '🌦️ ПОГОДА', icon: 'fa-cloud-sun' },
            { keyword: 'навигация', label: '📍 НАВИГАЦИЯ', icon: 'fa-map-marker-alt' },
            { keyword: 'астрономия', label: '🔭 АСТРОНОМИЯ', icon: 'fa-telescope' },
            { keyword: 'наблюдение', label: '🛰️ НАБЛЮДЕНИЕ', icon: 'fa-globe' },
            { keyword: 'эксперимент', label: '🚀 ЭКСПЕРИМЕНТАЛЬНЫЙ', icon: 'fa-flask' }
        ];
        missions.forEach(m => {
            const btn = document.createElement('button');
            btn.className = 'btn-mission';
            btn.innerHTML = `<i class="fas ${m.icon}"></i> ${m.label}`;
            btn.addEventListener('click', () => handleMissionSelect(m.keyword));
            missionsGrid.appendChild(btn);
        });
    }

    function resetGame() {
        if (animFrameRequest) cancelAnimationFrame(animFrameRequest);
        isAnimating = false;
        rotating = false;
        gameLocked = false;
        isCurrentGuessed = false;
        showSmallSatellite = false;
        isGameFinished = false;
        solvedCount = 0;
        orbitVisible = false;
        queue = shuffleArray([...SATELLITE_TYPES]);
        updateProgressStars();
        currentSatellite = queue[0];
        satelliteAngle = Math.random() * Math.PI * 2;
        currentSpeed = currentSatellite.speed;
        enableMissionButtons(true);
        nextBtn.disabled = true;
        nextBtn.style.display = 'block';
        resetBtn.style.display = 'none';
        hintButton.disabled = false;
        factDisplay.classList.remove('success', 'error');
        updateInfoPanelNormal();
        hideCompletionModal();
        document.getElementById('previewCanvas').style.opacity = '1';
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        drawPreview();
    }

    let resizeTimeout;
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            window.applyResponsiveScale();
            updateDimensions();
            drawPreview();
        }, 100);
    }

    function init() {
        window.applyResponsiveScale();
        preloadImages(() => {
            buildMissionButtons();
            resetGame();
            updateDimensions();
            animate();
            window.addEventListener('resize', handleResize);
            resetBtn.addEventListener('click', resetGame);
            nextBtn.addEventListener('click', loadNextSatellite);
            completionResetBtn.addEventListener('click', resetGame);
            hintButton.addEventListener('click', () => {
                if (!gameLocked && !isGameFinished && currentSatellite && 
                    !factDisplay.classList.contains('success') && !factDisplay.classList.contains('error')) {
                    showDetailedHint();
                }
            });
            setTimeout(() => {
                updateDimensions();
                drawPreview();
            }, 200);
        });
    }
    init();
})();