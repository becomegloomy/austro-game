const DragDropSystem = {
    currentDragElement: null,
    dropZone: null,
    dragImage: null,
    isDragging: false,
    dragStartThreshold: 5,
    moveRequestId: null,
    dragImageTimer: null,

    getGlobalScale() {
        const root = document.documentElement;
        const scale = parseFloat(getComputedStyle(root).getPropertyValue('--ui-scale'));
        return isNaN(scale) ? 1 : scale;
    },
    
    visualCenters: {
        'suit':      { offsetX: 0.5, offsetY: 0.5 },
        'helmet':    { offsetX: 0.44, offsetY: 0.12 },
        'backpack':  { offsetX: 0.62, offsetY: 0.4 },
        'pnevma':    { offsetX: 0.48, offsetY: 0.36 },
        'water':     { offsetX: 0.34, offsetY: 0.36 },
        'panel':     { offsetX: 0.36, offsetY: 0.28 },
        'lights':    { offsetX: 0.44, offsetY: 0.12 },
        'belt':      { offsetX: 0.5, offsetY: 0.6 }
    },
    
    elementScales: {
        'suit':      1.8,
        'helmet':    1.2,
        'backpack':  1.4,
        'pnevma':    1.0,
        'water':     1.0,
        'panel':     0.8,
        'lights':    0.9,
        'belt':      1.0
    },
    
    init() {
        this.createDropZone();
        this.setupEventListeners();
    },
    
    createDropZone() {
        const astronautDisplay = document.querySelector('.astronaut-display');
        this.dropZone = document.createElement('div');
        this.dropZone.className = 'drop-zone';
        astronautDisplay.appendChild(this.dropZone);
    },
    
    setupEventListeners() {
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        document.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        window.addEventListener('blur', this.cancelDrag.bind(this));
    },
    
    handleMouseDown(e) {
        const elementItem = e.target.closest('.element-item:not(.dressed)');
        if (!elementItem) return;
        
        e.preventDefault();
        
        const elementId = elementItem.dataset.id;
        const element = SuitElements.find(e => e.id === elementId);

        GameUI.updateElementInfoOnClick(elementId);
        
        if (!element || !GameState.canDressElement(elementId)) {
            GameLogic.showDressHint(elementId);
            return;
        }
        
        if (!element || GameState.hasElement(elementId)) return;
        
        this.currentDragElement = {
            element: element,
            elementItem: elementItem,
            startX: e.clientX,
            startY: e.clientY,
            isDragStarted: false
        };
        
        elementItem.classList.add('dragging');
    },
    
    handleTouchStart(e) {
        const elementItem = e.target.closest('.element-item:not(.dressed)');
        if (!elementItem) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        
        const elementId = elementItem.dataset.id;
        const element = SuitElements.find(e => e.id === elementId);
        
        GameUI.updateElementInfoOnClick(elementId);
        
        if (!element || !GameState.canDressElement(elementId)) {
            GameLogic.showDressHint(elementId);
            return;
        }
        
        this.currentDragElement = {
            element: element,
            elementItem: elementItem,
            startX: touch.clientX,
            startY: touch.clientY,
            isDragStarted: false
        };
        
        elementItem.classList.add('dragging');
    },
    
    handleMouseMove(e) {
        if (!this.currentDragElement) return;
        
        const dx = e.clientX - this.currentDragElement.startX;
        const dy = e.clientY - this.currentDragElement.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (!this.currentDragElement.isDragStarted && distance > this.dragStartThreshold) {
            this.startDrag(e.clientX, e.clientY);
        }
        
        if (this.currentDragElement.isDragStarted) {
            e.preventDefault();
            if (this.moveRequestId) return;
            this.moveRequestId = requestAnimationFrame(() => {
                this.moveDragImage(e.clientX, e.clientY);
                this.moveRequestId = null;
            });
        }
    },
    
    handleTouchMove(e) {
        if (!this.currentDragElement) return;
        
        const touch = e.touches[0];
        const dx = touch.clientX - this.currentDragElement.startX;
        const dy = touch.clientY - this.currentDragElement.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (!this.currentDragElement.isDragStarted && distance > this.dragStartThreshold) {
            this.startDrag(touch.clientX, touch.clientY);
        }
        
        if (this.currentDragElement.isDragStarted) {
            e.preventDefault();
            if (this.moveRequestId) return;
            this.moveRequestId = requestAnimationFrame(() => {
                this.moveDragImage(touch.clientX, touch.clientY);
                this.moveRequestId = null;
            });
        }
    },
    
    startDrag(x, y) {
        this.currentDragElement.isDragStarted = true;
        this.isDragging = true;
        
        this.createDragImage(this.currentDragElement.elementItem, x, y);
        
        this.dropZone.classList.add('active');
    },
    
    createDragImage(elementItem, x, y) {
        const elementId = elementItem.dataset.id;
        const layerOnAstronaut = document.getElementById(`layer-${elementId}`);
        if (!layerOnAstronaut) return;
        
        const preloadedImg = ImagePreloader.getImage(elementId);
        if (!preloadedImg) {
            const tempImg = new Image();
            tempImg.src = layerOnAstronaut.src;
            tempImg.onload = () => this._finalizeDragImage(tempImg, x, y, elementId);
            return;
        }
        
        this._finalizeDragImage(preloadedImg, x, y, elementId);
    },

    _finalizeDragImage(sourceImg, x, y, elementId) {
        this.dragImage = document.createElement('img');
        this.dragImage.className = 'drag-image';
        this.dragImage.src = sourceImg.src;
        this.dragImage.alt = elementId;
        
        const astronautDisplay = document.querySelector('.astronaut-display');
        const containerRect = astronautDisplay.getBoundingClientRect();
        
        const baseScale = this.elementScales[elementId] || 1.2;
        const globalScale = this.getGlobalScale();
        const finalScale = baseScale * globalScale;
        
        const visualCenter = this.visualCenters[elementId] || { offsetX: 0.5, offsetY: 0.5 };
        
        const aspectRatio = sourceImg.naturalWidth / sourceImg.naturalHeight;

        let height = containerRect.height * finalScale;
        let width = height * aspectRatio;
        
        const maxSize = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.8);
        if (width > maxSize || height > maxSize) {
            const scaleFactor = maxSize / Math.max(width, height);
            width *= scaleFactor;
            height *= scaleFactor;
        }
        
        const minSize = Math.min(window.innerWidth * 0.28, window.innerHeight * 0.55);
        if (Math.max(width, height) < minSize) {
            const scaleFactor = minSize / Math.max(width, height);
            width *= scaleFactor;
            height *= scaleFactor;
        }
        
        this.dragImage.style.width = `${width}px`;
        this.dragImage.style.height = `${height}px`;
        
        this.dragImage.style.left = `${x - width * visualCenter.offsetX}px`;
        this.dragImage.style.top = `${y - height * visualCenter.offsetY}px`;
        
        document.body.appendChild(this.dragImage);
        
        if (this.dragImageTimer) {
            clearTimeout(this.dragImageTimer);
            this.dragImageTimer = null;
        }
        
        this.dragImageTimer = setTimeout(() => {
            if (this.dragImage) {
                this.dragImage.classList.add('visible');
            }
            this.dragImageTimer = null;
        }, 10);
    },
    
    moveDragImage(x, y) {
        if (!this.dragImage) return;
        
        const elementId = this.dragImage.alt;
        const width = parseInt(this.dragImage.style.width) || 100;
        const height = parseInt(this.dragImage.style.height) || 100;
        
        const visualCenter = this.visualCenters[elementId] || { offsetX: 0.5, offsetY: 0.5 };
        
        this.dragImage.style.left = `${x - width * visualCenter.offsetX}px`;
        this.dragImage.style.top = `${y - height * visualCenter.offsetY}px`;
        
        this.checkDropZoneHover(x, y);
    },
    
    checkDropZoneHover(x, y) {
        if (!this.dropZone || !this.dragImage) return;
        
        const dropZoneRect = this.dropZone.getBoundingClientRect();
        const isOverDropZone = (
            x >= dropZoneRect.left &&
            x <= dropZoneRect.right &&
            y >= dropZoneRect.top &&
            y <= dropZoneRect.bottom
        );
        
        if (isOverDropZone) {
            const isValid = this.checkElementPosition(this.currentDragElement.element, x, y);
            
            if (isValid) {
                this.dropZone.classList.add('valid');
                this.dropZone.classList.remove('invalid');
            } else {
                this.dropZone.classList.add('invalid');
                this.dropZone.classList.remove('valid');
            }
        } else {
            this.dropZone.classList.remove('valid', 'invalid');
        }
    },
    
    checkElementPosition(element, x, y) {
        if (!element.dropZone) return false;
        
        const dropZoneRect = this.dropZone.getBoundingClientRect();
        const relX = (x - dropZoneRect.left) / dropZoneRect.width;
        const relY = (y - dropZoneRect.top) / dropZoneRect.height;
        const zone = element.dropZone;
        
        return relX > zone.xMin && relX < zone.xMax && relY > zone.yMin && relY < zone.yMax;
    },
    
    handleMouseUp(e) {
        this.finishDrag(e.clientX, e.clientY);
    },
    
    handleTouchEnd(e) {
        if (!this.currentDragElement) return;
        
        const touch = e.changedTouches[0];
        this.finishDrag(touch.clientX, touch.clientY);
    },
    
    handleMouseLeave(e) {
        if (e.relatedTarget === null) {
            this.cancelDrag();
        }
    },
    
    finishDrag(x, y) {
        if (this.dragImageTimer) {
            clearTimeout(this.dragImageTimer);
            this.dragImageTimer = null;
        }
        
        if (!this.currentDragElement) return;
        
        const element = this.currentDragElement.element;
        const elementItem = this.currentDragElement.elementItem;
        const wasDragStarted = this.currentDragElement.isDragStarted;
        
        this.immediatelyRemoveDragImage();
        
        if (elementItem) {
            elementItem.classList.remove('dragging');
        }
        
        if (this.dropZone) {
            this.dropZone.classList.remove('active', 'valid', 'invalid');
        }
        
        if (wasDragStarted) {
            const dropZoneRect = this.dropZone.getBoundingClientRect();
            const isOverDropZone = (
                x >= dropZoneRect.left &&
                x <= dropZoneRect.right &&
                y >= dropZoneRect.top &&
                y <= dropZoneRect.bottom
            );
            
            if (isOverDropZone) {
                const isValid = this.checkElementPosition(element, x, y);
                
                if (isValid) {
                    GameLogic.dressElement(element);
                } else {
                    GameUI.updateElementInfoOnClick(element.id);
                }
            }
        }
        
        if (this.moveRequestId) {
            cancelAnimationFrame(this.moveRequestId);
            this.moveRequestId = null;
        }
        
        this.currentDragElement = null;
        this.isDragging = false;
    },
    
    immediatelyRemoveDragImage() {
        if (this.dragImageTimer) {
            clearTimeout(this.dragImageTimer);
            this.dragImageTimer = null;
        }
        
        if (!this.dragImage) return;
        
        if (this.dragImage.parentNode) {
            this.dragImage.parentNode.removeChild(this.dragImage);
        }
        this.dragImage = null;
    },
    
    cancelDrag() {
        if (this.dragImageTimer) {
            clearTimeout(this.dragImageTimer);
            this.dragImageTimer = null;
        }
        
        this.immediatelyRemoveDragImage();
        
        if (this.currentDragElement && this.currentDragElement.elementItem) {
            this.currentDragElement.elementItem.classList.remove('dragging');
        }
        
        if (this.dropZone) {
            this.dropZone.classList.remove('active', 'valid', 'invalid');
        }
        
        if (this.moveRequestId) {
            cancelAnimationFrame(this.moveRequestId);
            this.moveRequestId = null;
        }
        
        this.currentDragElement = null;
        this.isDragging = false;
    }
};