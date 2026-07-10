const ImagePreloader = {
    images: {},
    loadedCount: 0,
    totalCount: 0,
    
    preloadAll() {
        this.totalCount = RocketParts.length;
        this.loadedCount = 0;
        RocketParts.forEach(part => {
            const img = new Image();
            img.onload = () => { this.loadedCount++; };
            img.onerror = () => { this.loadedCount++; };
            img.src = part.image;
            this.images[part.id] = img;
        });
    },
    
    getImage(partId) {
        return this.images[partId];
    }
};

const GameUI = {
    elements: {
        grid: null,
        progressFill: null,
        progressText: null,
        elementInfo: null,
        disassemblyArea: null,
        elementsGridContainer: null
    },
    
    init() {
        this.applyResponsiveScale();

        this.elements.grid = document.getElementById('elements-grid');
        this.elements.progressFill = document.getElementById('progress-fill');
        this.elements.progressText = document.getElementById('progress-text');
        this.elements.elementInfo = document.getElementById('element-info');
        this.elements.disassemblyArea = document.getElementById('disassembly-area');
        this.elements.elementsGridContainer = document.querySelector('.elements-grid');
        this.elements.inventoryTitle = document.querySelector('.inventory-area h2');
        
        ImagePreloader.preloadAll();
        
        const centralLayer = document.getElementById('layer-central');
        const centralPart = RocketParts.find(p => p.id === 'central');
        if (centralLayer && centralPart) centralLayer.src = centralPart.image;
        
        const upperLayer = document.getElementById('layer-upperStage');
        const upperPart = RocketParts.find(p => p.id === 'upperStage');
        if (upperLayer && upperPart) upperLayer.src = upperPart.image;
        
        const sasLowerLayer = document.getElementById('layer-sasLower');
        const sasLowerPart = RocketParts.find(p => p.id === 'sasLower');
        if (sasLowerLayer && sasLowerPart) sasLowerLayer.src = sasLowerPart.image;
        const sasLowerRemovable = document.getElementById('layer-sasLower-removable');
        const sasLowerPermanent = document.getElementById('layer-sasLower-permanent');
        if (sasLowerRemovable) sasLowerRemovable.src = 'images/sas_lower1.png';
        if (sasLowerPermanent) sasLowerPermanent.src = 'images/sas_lower2.png';
        const spacecraftLayer = document.getElementById('layer-spacecraft');
        if (spacecraftLayer) spacecraftLayer.src = 'images/spacecraft.png';
        
        const sasUpperLayer = document.getElementById('layer-sasUpper');
        const sasUpperPart = RocketParts.find(p => p.id === 'sasUpper');
        if (sasUpperLayer && sasUpperPart) sasUpperLayer.src = sasUpperPart.image;
        
        const leftBoostersPart = RocketParts.find(p => p.id === 'boostersLeft');
        const rightBoostersPart = RocketParts.find(p => p.id === 'boostersRight');
        const leftImg = leftBoostersPart ? leftBoostersPart.image : '';
        const rightImg = rightBoostersPart ? rightBoostersPart.image : '';
        
        const leftBack = document.getElementById('layer-booster-left-back');
        const leftFront = document.getElementById('layer-booster-left-front');
        const rightBack = document.getElementById('layer-booster-right-back');
        const rightFront = document.getElementById('layer-booster-right-front');
        
        if (leftBack) leftBack.src = leftImg;
        if (leftFront) leftFront.src = leftImg;
        if (rightBack) rightBack.src = rightImg;
        if (rightFront) rightFront.src = rightImg;
        
        const bodyLayer = document.getElementById('layer-body');
        if (bodyLayer) bodyLayer.src = 'images/rocket_body.png';
        
        this.createInventory();
        this.addInventoryClickHandlers();
        this.updateProgress();
        this.setupEventListeners();
        this.setupDisassemblyDragAndDrop();
        this.showInstructions();
        DragDropSystem.init();
        this.switchToAssemblyMode();
        
        this.updateInventory();
        this.updateProgress();
        this._lastErrorMessage = '';
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
    
    showInstructions() {
        this._lastErrorMessage = '';
        const infoDiv = document.getElementById('element-info');
        if (infoDiv) {
            infoDiv.innerHTML = `<div class="element-description">
                <div class="element-details">Перетащите деталь из панели выше на ракету, учитывая правильный порядок сборки.</div>
            </div>`;
            infoDiv.classList.remove('has-error');
        }
    },

    switchToAssemblyMode() {
        if (this.elements.elementsGridContainer) {
            this.elements.elementsGridContainer.classList.add('assembly-mode');
            this.elements.elementsGridContainer.classList.remove('disassembly-mode');
        }
        if (this.elements.disassemblyArea) {
            this.elements.disassemblyArea.classList.add('assembly-mode');
            this.elements.disassemblyArea.classList.remove('disassembly-mode');
        }

        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            subtitle.textContent = 'Собери ракету-носитель СОЮЗ в правильной последовательности';
        }
        const dressingArea = document.querySelector('.dressing-area');
        if (dressingArea) dressingArea.classList.remove('disassembly-active');

        const rightPanel = document.querySelector('.right-panel');
        if (rightPanel) rightPanel.classList.remove('disassembly-mode');

        const astronautDisplay = document.querySelector('.astronaut-display');
        if (astronautDisplay) {
            astronautDisplay.classList.remove('space-mode');
            astronautDisplay.classList.remove('stars-fast');
        }

        const mainLayout = document.querySelector('.main-layout');
        if (mainLayout) mainLayout.classList.remove('disassembly-vertical');

        const inventoryArea = document.querySelector('.inventory-area');
        if (inventoryArea) inventoryArea.classList.remove('disassembly-mode');

        const permanent = document.getElementById('layer-sasLower-permanent');
        if (permanent) permanent.classList.remove('active');

        const spacecraft = document.getElementById('layer-spacecraft');
        if (spacecraft) {
            spacecraft.classList.remove('layer-spacecraft-zoom', 'layer-spacecraft-fly');
        }

        console.log('Переключено в режим СБОРКИ');
        const progressLabel = document.querySelector('.progress-label span:first-child');
        if (progressLabel) progressLabel.textContent = 'Прогресс сборки:';

        if (this.elements.inventoryTitle) {
            this.elements.inventoryTitle.classList.remove('disassembly-hidden');
        }
        this.showInstructions();
        this.updateProgress();

        if (rightPanel) {
            rightPanel.style.animation = 'none';
            rightPanel.offsetHeight;
            rightPanel.style.animation = null;
        }
        if (dressingArea) {
            dressingArea.style.animation = 'none';
            dressingArea.offsetHeight;
            dressingArea.style.animation = null;
        }
    },

    switchToDisassemblyMode() {
        const dressingArea = document.querySelector('.dressing-area');
        if (dressingArea) dressingArea.classList.add('disassembly-active');

        const rightPanel = document.querySelector('.right-panel');
        if (rightPanel) rightPanel.classList.add('disassembly-mode');

        const mainLayout = document.querySelector('.main-layout');
        if (mainLayout) mainLayout.classList.add('disassembly-vertical');

        const astronautDisplay = document.querySelector('.astronaut-display');
        if (astronautDisplay) astronautDisplay.classList.add('space-mode');

        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            subtitle.textContent = 'Теперь разбери ракету в правильном порядке, чтобы оставить только космический корабль';
        }
        const progressLabel = document.querySelector('.progress-label span:first-child');
        if (progressLabel) progressLabel.textContent = 'Прогресс разборки:';

        this.showDisassemblyInstructions();
        this.updateProgress();

        if (this.elements.elementsGridContainer) {
            this.elements.elementsGridContainer.classList.add('disassembly-mode');
            this.elements.elementsGridContainer.classList.remove('assembly-mode');
        }
        if (this.elements.inventoryTitle) {
            this.elements.inventoryTitle.classList.add('disassembly-hidden');
        }
        const inventoryArea = document.querySelector('.inventory-area');
        if (inventoryArea) inventoryArea.classList.add('disassembly-mode');

        if (this.elements.disassemblyArea) {
            this.elements.disassemblyArea.classList.add('disassembly-mode');
            this.elements.disassemblyArea.classList.remove('assembly-mode');
        }

        if (rightPanel) {
            rightPanel.style.animation = 'none';
            rightPanel.offsetHeight;
            rightPanel.style.animation = null;
        }
        if (dressingArea) {
            dressingArea.style.animation = 'none';
            dressingArea.offsetHeight;
            dressingArea.style.animation = null;
        }
    },

    showDisassemblyInstructions() {
        this._lastErrorMessage = '';
        const infoDiv = document.getElementById('element-info');
        if (infoDiv) {
            infoDiv.innerHTML = `<div class="element-description">
                <div class="element-details">Перетащите деталь в сторону от ракеты, чтобы ее снять, учитывая правильный порядок.</div>
            </div>`;
            infoDiv.classList.remove('has-error');
        }
    },

    showTopRemainingPartInfo() {
        let topPart = null;
        let maxOrder = -1;
        for (let p of RocketParts) {
            let isInstalled = false;
            if (p.isMultiPart) {
                isInstalled = (GameState.multiPartProgress[p.id] || 0) > 0;
            } else {
                isInstalled = GameState.hasElement(p.id);
            }
            if (isInstalled && p.order > maxOrder) {
                maxOrder = p.order;
                topPart = p;
            }
        }
        if (topPart) {
            this.showElementInfo(topPart, false, '');
        } else {
            this._lastErrorMessage = '';
            const infoDiv = document.getElementById('element-info');
            if (infoDiv) {
                infoDiv.innerHTML = `<div class="element-description">
                    <div class="element-details"></div>
                </div>`;
                infoDiv.classList.remove('has-error');
            }
        }
    },
    
    setupDisassemblyDragAndDrop() {
        const allElements = document.querySelectorAll('.layer, img');
        allElements.forEach(el => {
            el.setAttribute('draggable', 'false');
            el.style.userSelect = 'none';
            el.style.webkitUserDrag = 'none';
            el.style.userDrag = 'none';
        });

        let dragActive = false;
        let currentPart = null;
        let dragImageElement = null;
        let animationId = null;

        const findPartAtPoint = (x, y) => {
            const displayRect = document.querySelector('.astronaut-display').getBoundingClientRect();
            const relX = (x - displayRect.left) / displayRect.width;
            const relY = (y - displayRect.top) / displayRect.height;
            const sortedParts = [...RocketParts].sort((a, b) => b.order - a.order);
            for (let part of sortedParts) {
                const hasAnyInstalled = part.isMultiPart
                    ? (GameState.multiPartProgress[part.id] || 0) > 0
                    : GameState.isElementFullyDressed(part.id);
                if (!hasAnyInstalled) continue;
                let zone = null;
                if (part.isMultiPart) {
                    const installedCount = GameState.multiPartProgress[part.id] || 0;
                    if (installedCount === 0) continue;
                    const subPart = part.subParts[installedCount - 1];
                    zone = subPart.disassemblyZone || subPart.dropZone;
                } else {
                    zone = part.disassemblyZone || part.dropZone;
                }
                if (zone && relX >= zone.xMin && relX <= zone.xMax && relY >= zone.yMin && relY <= zone.yMax) {
                    return part;
                }
            }
            return null;
        };

        const createDragImage = (part, x, y, callback) => {
            let layerId = null;
            if (part.isMultiPart) {
                const installedCount = GameState.multiPartProgress[part.id] || 0;
                if (installedCount === 0) return;
                layerId = part.subParts[installedCount - 1].layerId;
            } else {
                layerId = part.layerId;
            }
            const layer = document.getElementById(layerId);
            if (!layer) return;
            
            let imgSrc = layer.src;
            if (part.id === 'sasLower') {
                imgSrc = 'images/sas_lower1.png';
            }
            
            const img = new Image();
            img.src = imgSrc;
            const container = document.querySelector('.astronaut-display');
            const rect = container.getBoundingClientRect();
            const baseScale = DragDropSystem.elementScales[part.id] || 1.0;
            const globalScale = DragDropSystem.getGlobalScale();
            const finalScale = baseScale * globalScale;
            img.onload = () => {
                const aspect = img.naturalWidth / img.naturalHeight;
                let height = rect.height * finalScale;
                let width = height * aspect;
                const maxSize = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.8);
                if (width > maxSize || height > maxSize) {
                    const f = maxSize / Math.max(width, height);
                    width *= f;
                    height *= f;
                }
                const dragImg = document.createElement('img');
                dragImg.src = imgSrc;
                dragImg.className = 'drag-image';
                dragImg.alt = part.id;
                dragImg.style.width = `${width}px`;
                dragImg.style.height = `${height}px`;
                dragImg.style.position = 'fixed';
                dragImg.style.pointerEvents = 'none';
                dragImg.style.zIndex = '10000';
                const center = DragDropSystem.visualCenters[part.id] || { offsetX: 0.5, offsetY: 0.5 };
                dragImg.style.left = `${x - width * center.offsetX}px`;
                dragImg.style.top = `${y - height * center.offsetY}px`;
                document.body.appendChild(dragImg);
                dragImg.classList.add('visible');
                callback(dragImg);
            };
            if (img.complete) {
                const onload = img.onload;
                img.onload = null;
                onload();
            }
        };

        const updateDragImagePosition = (dragImage, x, y, part) => {
            if (!dragImage) return;
            const width = parseFloat(dragImage.style.width);
            const height = parseFloat(dragImage.style.height);
            const center = DragDropSystem.visualCenters[part.id] || { offsetX: 0.5, offsetY: 0.5 };
            dragImage.style.left = `${x - width * center.offsetX}px`;
            dragImage.style.top = `${y - height * center.offsetY}px`;
        };

        const isOutsideRocket = (x, y) => {
            const dressingArea = document.querySelector('.dressing-area');
            const rocketArea = document.querySelector('.astronaut-display');
            if (!dressingArea || !rocketArea) return false;
            const areaRect = dressingArea.getBoundingClientRect();
            if (x < areaRect.left || x > areaRect.right || y < areaRect.top || y > areaRect.bottom) return false;
            const rocketRect = rocketArea.getBoundingClientRect();
            const relX = (x - rocketRect.left) / rocketRect.width;
            const relY = (y - rocketRect.top) / rocketRect.height;
            const inRocket = relX >= 0.45 && relX <= 0.52 && relY >= 0.02 && relY <= 0.96;
            return !inRocket;
        };

        const onMouseDown = (e) => {
            if (!GameState.disassemblyMode) return;
            const part = findPartAtPoint(e.clientX, e.clientY);
            if (!part) return;

            let minOrder = Infinity;
            let nextToSeparateIds = [];
            for (let p of RocketParts) {
                let isInstalled = false;
                if (p.isMultiPart) {
                    isInstalled = (GameState.multiPartProgress[p.id] || 0) > 0;
                } else {
                    isInstalled = GameState.hasElement(p.id);
                }
                if (isInstalled) {
                    const orderValue = (p.disassemblyOrder !== undefined) ? p.disassemblyOrder : p.order;
                    if (orderValue < minOrder) {
                        minOrder = orderValue;
                        nextToSeparateIds = [p.id];
                    } else if (orderValue === minOrder) {
                        nextToSeparateIds.push(p.id);
                    }
                }
            }
            if (!nextToSeparateIds.includes(part.id)) {
                let neededNames = RocketParts.filter(p => nextToSeparateIds.includes(p.id))
                                            .map(p => p.accusativeName || (p.name[0].toLowerCase() + p.name.slice(1)))
                                            .join(' и ');
                GameUI.showElementInfo(part, true, `Сначала нужно снять ${neededNames}`);
                return;
            }

            GameUI.showElementInfo(part, false, '');

            let layerId = null;
            if (part.isMultiPart) {
                const installedCount = GameState.multiPartProgress[part.id] || 0;
                if (installedCount > 0) {
                    const subPart = part.subParts[installedCount - 1];
                    layerId = subPart.layerId;
                }
            } else {
                layerId = part.layerId;
            }
            const layer = document.getElementById(layerId);
            
            if (part.id === 'sasLower') {
                const permanent = document.getElementById('layer-sasLower-permanent');
                if (permanent && !permanent.classList.contains('active')) {
                    permanent.classList.add('active');
                }
                const spacecraft = document.getElementById('layer-spacecraft');
                if (spacecraft && !spacecraft.classList.contains('active')) {
                    spacecraft.classList.add('active');
                }
            }
            
            if (layer && layer.classList.contains('active')) {
                layer.classList.add('temp-hidden');
            }

            dragActive = true;
            currentPart = { part: part, layer: layer, layerId: layerId };
            createDragImage(part, e.clientX, e.clientY, (dragImg) => {
                dragImageElement = dragImg;
            });
            document.body.style.userSelect = 'none';
            e.preventDefault();
            e.stopPropagation();
        };

        const onMouseMove = (e) => {
            if (!dragActive) return;
            e.preventDefault();
            e.stopPropagation();
            if (animationId) cancelAnimationFrame(animationId);
            animationId = requestAnimationFrame(() => {
                if (dragImageElement && currentPart) {
                    updateDragImagePosition(dragImageElement, e.clientX, e.clientY, currentPart.part);
                    const dressingArea = document.querySelector('.dressing-area');
                    if (dressingArea) {
                        if (isOutsideRocket(e.clientX, e.clientY)) {
                            dressingArea.classList.add('disassembly-can-drop');
                        } else {
                            dressingArea.classList.remove('disassembly-can-drop');
                        }
                    }
                }
            });
        };

        const onMouseUp = (e) => {
            if (!dragActive) return;
            dragActive = false;

            if (dragImageElement && dragImageElement.parentNode) {
                dragImageElement.parentNode.removeChild(dragImageElement);
                dragImageElement = null;
            }
            if (animationId) cancelAnimationFrame(animationId);
            document.body.style.userSelect = '';
            const dressingArea = document.querySelector('.dressing-area');
            if (dressingArea) dressingArea.classList.remove('disassembly-can-drop');

            let isCorrectDrop = false;
            if (currentPart && isOutsideRocket(e.clientX, e.clientY)) {
                isCorrectDrop = true;
            }

            let dropSuccessful = false;
            let isSasLower = currentPart && currentPart.part && currentPart.part.id === 'sasLower';

            if (isCorrectDrop && currentPart) {
                dropSuccessful = true;
                const part = currentPart.part;
                const srcLayer = document.getElementById(currentPart.layerId);

                if (srcLayer && srcLayer.src) {
                    const fallImage = document.createElement('img');
                    if (part.id === 'sasLower') {
                        fallImage.src = 'images/sas_lower1.png';
                    } else {
                        fallImage.src = srcLayer.src;
                    }
                    fallImage.className = 'fall-copy';

                    let w = '100px', h = '100px';
                    if (dragImageElement) {
                        w = dragImageElement.style.width;
                        h = dragImageElement.style.height;
                    } else {
                        const container = document.querySelector('.astronaut-display');
                        const rect = container.getBoundingClientRect();
                        const baseScale = DragDropSystem.elementScales[part.id] || 1.0;
                        const globalScale = DragDropSystem.getGlobalScale();
                        const finalScale = baseScale * globalScale;
                        const img = new Image();
                        img.src = srcLayer.src;
                        if (img.complete) {
                            const aspect = img.naturalWidth / img.naturalHeight;
                            let height = rect.height * finalScale;
                            let width = height * aspect;
                            const maxSize = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.8);
                            if (width > maxSize || height > maxSize) {
                                const f = maxSize / Math.max(width, height);
                                width *= f;
                                height *= f;
                            }
                            w = `${width}px`;
                            h = `${height}px`;
                        }
                    }
                    fallImage.style.width = w;
                    fallImage.style.height = h;
                    const widthVal = parseFloat(fallImage.style.width);
                    const heightVal = parseFloat(fallImage.style.height);

                    let topCoeff = 0.5;
                    switch (part.id) {
                        case 'sasUpper':
                        case 'sasLower':
                            topCoeff = 0.15;
                            break;
                        case 'central':
                        case 'upperStage':
                            topCoeff = 0.35;
                            break;
                        case 'boostersLeft':
                        case 'boostersRight':
                            topCoeff = 0.5;
                            break;
                        default:
                            topCoeff = 0.4;
                    }

                    fallImage.style.left = `${e.clientX - widthVal * 0.5}px`;
                    fallImage.style.top = `${e.clientY - heightVal * topCoeff}px`;
                    fallImage.style.position = 'fixed';
                    fallImage.style.pointerEvents = 'none';
                    fallImage.style.zIndex = '10001';
                    document.body.appendChild(fallImage);
                    fallImage.classList.add('fall-animation');
                    fallImage.addEventListener('animationend', () => {
                        if (fallImage.parentNode) fallImage.parentNode.removeChild(fallImage);
                    }, { once: true });
                }

                if (part.id === 'sasLower') {
                    if (currentPart.layer) {
                        currentPart.layer.classList.remove('temp-hidden');
                        GameUI.hideLayer(currentPart.layerId);
                    }
                    const permanent = document.getElementById('layer-sasLower-permanent');
                    if (permanent) permanent.classList.remove('active');
                    const removable = document.getElementById('layer-sasLower-removable');
                    if (removable) removable.classList.remove('active');
                    GameState.undressElement('sasLower');
                    GameUI.updateInventory();
                    GameUI.updateProgress();
                } else {
                    if (currentPart.layer) {
                        currentPart.layer.classList.remove('temp-hidden');
                        GameUI.hideLayer(currentPart.layerId);
                    }
                    GameLogic.undressRocketPart(part.id);
                }
            } else if (currentPart) {
                if (currentPart.layer) {
                    currentPart.layer.classList.remove('temp-hidden');
                }
            }

            if (isSasLower && !dropSuccessful) {
                const spacecraft = document.getElementById('layer-spacecraft');
                if (spacecraft) spacecraft.classList.remove('active');
            }

            currentPart = null;
            e.preventDefault();
            e.stopPropagation();
        };

        const container = document.querySelector('.astronaut-display');
        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        this.disassemblyHandlers = { container, onMouseDown, onMouseMove, onMouseUp };
    },
    
    createInventory() {
        this.elements.grid.innerHTML = '';
        const sorted = [...RocketParts].sort((a,b) => a.order - b.order);
        sorted.forEach(part => {
            const div = document.createElement('div');
            div.className = 'element-item';
            div.dataset.id = part.id;
            div.innerHTML = `<img src="${part.image}" alt="${part.name}" class="element-img">`;
            this.elements.grid.appendChild(div);
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
        const part = RocketParts.find(p => p.id === elementId);
        if (!part) return;
        
        if (GameState.disassemblyMode) {
            let topPart = null;
            let maxOrder = -1;
            for (let p of RocketParts) {
                let isInstalled = false;
                if (p.isMultiPart) {
                    isInstalled = (GameState.multiPartProgress[p.id] || 0) > 0;
                } else {
                    isInstalled = GameState.hasElement(p.id);
                }
                if (isInstalled && p.order > maxOrder) {
                    maxOrder = p.order;
                    topPart = p;
                }
            }
            if (topPart && topPart.id === part.id) {
                this.showElementInfo(part, false, '');
            } else if (topPart) {
                let neededName = topPart.accusativeName || (topPart.name[0].toLowerCase() + topPart.name.slice(1));
                this.showElementInfo(part, true, `сначала снимите ${neededName}`);
            } else {
                this.showElementInfo(part, true, 'разборка уже завершена');
            }
        } else {
            const error = GameState.getDressError(elementId);
            const showError = error !== '' && !GameState.isElementFullyDressed(elementId);
            this.showElementInfo(part, showError, error);
        }
    },
    
    updateInventory(elementId = null) {
        if (elementId) {
            const item = document.querySelector(`.element-item[data-id="${elementId}"]`);
            if (item) this._updateSingleInventoryItem(item, elementId);
            return;
        }
        document.querySelectorAll('.element-item').forEach(item => {
            this._updateSingleInventoryItem(item, item.dataset.id);
        });
    },
    
    _updateSingleInventoryItem(item, elementId) {
        item.classList.remove('available', 'dressed', 'required-highlight');
        if (GameState.isElementFullyDressed(elementId)) {
            item.classList.add('dressed');
        } else if (GameState.canDressElement(elementId)) {
            item.classList.add('available');
        }
    },
    
    showLayer(layerId) {
        const layer = document.getElementById(layerId);
        if (layer) {
            layer.classList.add('active');
            setTimeout(() => layer.classList.remove('dressing'), 300);
        }
    },
    
    hideLayer(layerId) {
        const layer = document.getElementById(layerId);
        if (layer) layer.classList.remove('active');
    },
    
    showElementInfo(part, showError = false, errorMessage = '') {
        if (!part || !this.elements.elementInfo) return;
        if (showError && errorMessage === this._lastErrorMessage) return;
        this._lastErrorMessage = showError ? errorMessage : '';

        document.querySelectorAll('.element-item').forEach(item => item.classList.remove('selected'));
        if (!showError) {
            const selected = document.querySelector(`.element-item[data-id="${part.id}"]`);
            if (selected) selected.classList.add('selected');
        }

        let html = '';
        if (showError && errorMessage) {
            html = `<div class="element-error"><i class="fas fa-exclamation-circle"></i><div class="error-message">${errorMessage}</div></div>`;
            this.elements.elementInfo.classList.add('has-error');
        } else {
            let description = part.description;
            if (GameState.disassemblyMode && part.disassemblyDescription) {
                description = part.disassemblyDescription;
            }
            html = `<div class="element-description"><strong>${part.name}</strong><div class="element-details">${description}</div></div>`;
            this.elements.elementInfo.classList.remove('has-error');
        }
        this.elements.elementInfo.innerHTML = html;
    },
    
    updateProgress() {
        const dressed = GameState.getDressedCount();
        const total = RocketParts.length;
        
        let progressValue;
        if (GameState.disassemblyMode) {
            progressValue = total - dressed;
        } else {
            progressValue = dressed;
        }
        
        const percent = (progressValue / total) * 100;
        this.elements.progressFill.style.width = `${percent}%`;
        this.elements.progressText.textContent = `${progressValue}/${total}`;
    },
    
    showTransportModal() {
        const modal = document.getElementById('transport-modal');
        if (modal) modal.classList.remove('hidden');
    },
    
    hideTransportModal() {
        const modal = document.getElementById('transport-modal');
        if (modal) modal.classList.add('hidden');
    },
    
    showLaunchModal() {
        const modal = document.getElementById('launch-modal');
        if (modal) modal.classList.remove('hidden');
    },
    
    hideLaunchModal() {
        const modal = document.getElementById('launch-modal');
        if (modal) modal.classList.add('hidden');
    },
    
    showFinalModal() {
        const modal = document.getElementById('final-modal');
        if (modal) modal.classList.remove('hidden');
    },

    animateSpacecraftAndShowFinal() {
        const spacecraft = document.getElementById('layer-spacecraft');
        if (!spacecraft) return;
        
        spacecraft.classList.add('layer-spacecraft-zoom');
        
        const astronautDisplay = document.querySelector('.astronaut-display');
        if (astronautDisplay && astronautDisplay.classList.contains('space-mode')) {
            astronautDisplay.classList.add('stars-fast');
        }
        
        setTimeout(() => {
            spacecraft.classList.add('layer-spacecraft-fly');
            
            setTimeout(() => {
                if (astronautDisplay) astronautDisplay.classList.remove('stars-fast');
                this.showFinalModal();
            }, 300);
            
        }, 1500);
    },
    
    hideFinalModal() {
        const modal = document.getElementById('final-modal');
        if (modal) modal.classList.add('hidden');
    },
    
    setupEventListeners() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.applyResponsiveScale(), 100);
        });
        
        const transportNext = document.getElementById('transport-next-btn');
        if (transportNext) {
            transportNext.addEventListener('click', () => {
                this.hideTransportModal();
                this.showLaunchModal();
            });
        }
        
        const launchClose = document.getElementById('launch-close-btn');
        if (launchClose) {
            launchClose.addEventListener('click', () => {
                this.hideLaunchModal();

                RocketParts.forEach(part => {
                    if (part.isMultiPart) {
                        GameState.multiPartProgress[part.id] = part.subParts.length;
                        part.subParts.forEach(sub => this.showLayer(sub.layerId));
                    } else {
                        GameState.dressElement(part.id);
                        this.showLayer(part.layerId);
                    }
                });
                this.updateInventory();
                this.updateProgress();

                GameState.disassemblyMode = true;
                this.switchToDisassemblyMode();
            });
        }
        
        const finalReset = document.getElementById('final-reset-btn');
        if (finalReset) {
            finalReset.addEventListener('click', () => {
                this.hideFinalModal();
                GameLogic.resetGame();
            });
        }
        
        const grid = document.querySelector('.elements-grid');
        if (grid) {
            grid.addEventListener('wheel', (e) => {
                if (grid.scrollWidth > grid.clientWidth) {
                    e.preventDefault();
                    grid.scrollLeft += e.deltaY;
                }
            }, { passive: false });
        }

        const backBtn = document.getElementById('backToMenuBtn');
        const backCompleteBtn = document.getElementById('backToMenuFromComplete');
        if (backBtn) backBtn.addEventListener('click', goToMainMenu);
        if (backCompleteBtn) backCompleteBtn.addEventListener('click', goToMainMenu);

        const originalShowTransport = this.showTransportModal;
        const originalHideTransport = this.hideTransportModal;
        const originalShowLaunch = this.showLaunchModal;
        const originalHideLaunch = this.hideLaunchModal;
        const originalShowFinal = this.showFinalModal;
        const originalHideFinal = this.hideFinalModal;

        this.showTransportModal = () => {
            originalShowTransport.call(this);
            if (backBtn) backBtn.style.display = 'none';
        };
        this.hideTransportModal = () => {
            originalHideTransport.call(this);
            if (backBtn) backBtn.style.display = 'flex';
        };
        this.showLaunchModal = () => {
            originalShowLaunch.call(this);
            if (backBtn) backBtn.style.display = 'none';
        };
        this.hideLaunchModal = () => {
            originalHideLaunch.call(this);
            if (backBtn) backBtn.style.display = 'flex';
        };
        this.showFinalModal = () => {
            originalShowFinal.call(this);
            if (backBtn) backBtn.style.display = 'none';
        };
        this.hideFinalModal = () => {
            originalHideFinal.call(this);
            if (backBtn) backBtn.style.display = 'flex';
        };
    }
};