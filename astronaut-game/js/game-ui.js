const ImagePreloader = {
    images: {},
    loadedCount: 0,
    totalCount: 0,
    
    preloadAll() {
        this.totalCount = SuitElements.length;
        this.loadedCount = 0;
        
        SuitElements.forEach(element => {
            const img = new Image();
            img.onload = () => {
                this.loadedCount++;
                if (this.loadedCount === this.totalCount) {
                    console.log('Все изображения скафандра загружены');
                }
            };
            img.onerror = () => {
                console.error(`Ошибка загрузки: ${element.image}`);
                this.loadedCount++;
            };
            img.src = element.image;
            this.images[element.id] = img;
        });
    },
    
    getImage(elementId) {
        return this.images[elementId];
    },
    
    isAllLoaded() {
        return this.loadedCount === this.totalCount;
    }
};

const GameUI = {
    elements: {
        grid: null,
        progressFill: null,
        progressText: null,
        elementInfo: null,
        hintModal: null,
        completionMessage: null
    },
    
    init() {
        this.applyResponsiveScale();

        this.elements.grid = document.querySelector('.elements-grid');
        this.elements.progressFill = document.getElementById('progress-fill');
        this.elements.progressText = document.getElementById('progress-text');
        this.elements.elementInfo = document.getElementById('element-info');
        this.elements.hintModal = document.getElementById('hint-modal');
        this.elements.completionMessage = document.querySelector('.completion-message');
        
        ImagePreloader.preloadAll();
        
        this.createInventory();
        
        this.addInventoryClickHandlers();
        
        this.updateProgress();
        
        this.setupEventListeners();
        
        this.showElementInfo(SuitElements[0]);
        
        document.getElementById('layer-body').classList.add('active');
        
        DragDropSystem.init();
        
        console.log('Игровой интерфейс инициализирован');
    },

    applyResponsiveScale() {
        const referenceWidth = 1920;
        const referenceHeight = 1080;
        const widthScale = window.innerWidth / referenceWidth;
        const heightScale = window.innerHeight / referenceHeight;
        const isWideLowScreen = window.innerWidth >= 1200 && window.innerHeight <= 800;

        let boostedScale = Math.min(widthScale, heightScale) * 1.12;

        if (isWideLowScreen) {
            boostedScale *= 0.9;
        }

        const safeScale = Math.min(Math.max(boostedScale, 0.82), 1.45);
        document.documentElement.style.setProperty('--ui-scale', safeScale.toFixed(3));
        document.documentElement.style.setProperty('--scale', safeScale.toFixed(3));
    },
    
    createInventory() {
        this.elements.grid.innerHTML = '';
        
        const elementsToShow = [
            SuitElements.find(e => e.id === 'suit'),
            SuitElements.find(e => e.id === 'helmet'),
            SuitElements.find(e => e.id === 'lights'),
            SuitElements.find(e => e.id === 'backpack'),
            SuitElements.find(e => e.id === 'pnevma'),
            SuitElements.find(e => e.id === 'water'),
            SuitElements.find(e => e.id === 'panel'),
        ].filter(Boolean);
        
        elementsToShow.forEach(element => {
            const elementDiv = document.createElement('div');
            elementDiv.className = 'element-item';
            elementDiv.dataset.id = element.id;
            
            elementDiv.innerHTML = `
                <img src="${element.image}" alt="${element.name}" class="element-img">
                <div class="element-name">${element.name}</div>
            `;
            
            this.elements.grid.appendChild(elementDiv);
        });
        
        this.updateInventory();
    },

    addInventoryClickHandlers() {
        document.querySelectorAll('.element-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.updateElementInfoOnClick(item.dataset.id);
            });
        });
    },

    updateElementInfoOnClick(elementId) {
        const element = SuitElements.find(e => e.id === elementId);
        if (!element) return;
        
        const errorMessage = GameState.getDressError(elementId);
        const showError = errorMessage !== '' && !GameState.hasElement(elementId);
        
        const currentError = this.elements.elementInfo.querySelector('.element-error');
        if (showError && currentError) {
            const currentMessage = currentError.querySelector('.error-message')?.textContent;
            if (currentMessage === errorMessage) {
                return; 
            }
        }
        
        this.showElementInfo(element, showError, errorMessage);
    },
    
    updateInventory(elementId = null) {
        if (elementId) {
            const item = document.querySelector(`.element-item[data-id="${elementId}"]`);
            if (item) {
                this._updateSingleInventoryItem(item, elementId);
            }
            return;
        }
        
        document.querySelectorAll('.element-item').forEach(item => {
            const id = item.dataset.id;
            this._updateSingleInventoryItem(item, id);
        });
    },

    _updateSingleInventoryItem(item, elementId) {
        item.classList.remove('available', 'dressed', 'required-highlight', 'selected');
        
        if (GameState.hasElement(elementId)) {
            item.classList.add('dressed');
        } else if (GameState.canDressElement(elementId)) {
            item.classList.add('available');
        }
    },
    
    showLayer(elementId) {
        const layer = document.getElementById(`layer-${elementId}`);
        if (layer) {
            layer.classList.add('active');
            layer.classList.add('dressing');
            
            setTimeout(() => {
                layer.classList.remove('dressing');
            }, 300);
        }
    },
    
    hideLayer(elementId) {
        const layer = document.getElementById(`layer-${elementId}`);
        if (layer) {
            layer.classList.remove('active');
        }
    },
    
    showElementInfo(element, showError = false, errorMessage = '') {
        if (!element || !this.elements.elementInfo) return;
        
        document.querySelectorAll('.element-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        if (!showError) {
            const selectedElement = document.querySelector(`[data-id="${element.id}"]`);
            if (selectedElement) {
                selectedElement.classList.add('selected');
            }
        }
        
        let html = '';
        
        if (showError && errorMessage) {
            html = `
                <div class="element-error">
                    <i class="fas fa-exclamation-circle"></i> 
                    <div class="error-message">${errorMessage}</div>
                </div>
            `;
        } else {
            html = `
                <div class="element-description">
                    <strong>${element.name}</strong>
                    <div class="element-details">${element.description}</div>
                </div>
            `;
        }
        
        this.elements.elementInfo.innerHTML = html;
        
        if (showError && errorMessage) {
            this.elements.elementInfo.classList.add('has-error');
        } else {
            this.elements.elementInfo.classList.remove('has-error');
        }
    },
    
    updateProgress() {
        const dressedCount = GameState.getDressedCount();
        const totalElements = SuitElements.length;
        const percentage = (dressedCount / totalElements) * 100;
        
        this.elements.progressFill.style.width = `${percentage}%`;
        this.elements.progressText.textContent = `${dressedCount}/${totalElements}`;
    },
    
    showCompletionMessage() {
        if (!document.querySelector('.completion-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'completion-overlay';
            document.body.appendChild(overlay);
        }
        
        this.elements.completionMessage.classList.remove('hidden');

        const backBtn = document.getElementById('backToMenuBtn');
        if (backBtn) backBtn.style.display = 'none';
    },

    hideCompletionMessage() {
        this.elements.completionMessage.classList.add('hidden');
        const overlay = document.querySelector('.completion-overlay');
        if (overlay) {
            overlay.remove();
        }

        const backBtn = document.getElementById('backToMenuBtn');
        if (backBtn) backBtn.style.display = 'flex';
    },
    
    toggleHintModal(show = true) {
        if (show) {
            this.elements.hintModal.classList.remove('hidden');
        } else {
            this.elements.hintModal.classList.add('hidden');
        }
    },

    setupEventListeners() {
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                this.applyResponsiveScale();
            }, 100);
        });

        document.getElementById('reset-game-btn').addEventListener('click', () => {
            GameLogic.resetGame();
        });
        
        const closeModalBtn = document.querySelector('.close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.toggleHintModal(false);
            });
        }
        
        if (this.elements.hintModal) {
            this.elements.hintModal.addEventListener('click', (e) => {
                if (e.target === this.elements.hintModal) {
                    this.toggleHintModal(false);
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toggleHintModal(false);
            }
        });

        const grid = document.querySelector('.elements-grid');
        if (grid) {
            grid.addEventListener('wheel', function(e) {
                if (this.scrollWidth > this.clientWidth) {
                    e.preventDefault();
                    this.scrollLeft += e.deltaY;
                }
            }, { passive: false });
        }

        const backBtn = document.getElementById('backToMenuBtn');
        const backComplete = document.getElementById('backToMenuFromComplete');
        if (backBtn) backBtn.addEventListener('click', goToMainMenu);
        if (backComplete) backComplete.addEventListener('click', goToMainMenu);
    }
};