const DragDropSystem = {
    currentDragElement: null,
    dropZone: null,
    dragImage: null,
    isDragging: false,
    dragStartThreshold: 5,
    moveRequestId: null,
    dragImageTimer: null,
    
    visualCenters: {
        'central': { offsetX: 0.5, offsetY: 0.5 },
        'boostersLeft': { offsetX: 0.5, offsetY: 0.5 },
        'boostersRight': { offsetX: 0.5, offsetY: 0.5 },
        'upperStage': { offsetX: 0.5, offsetY: 0.5 },
        'sasLower': { offsetX: 0.5, offsetY: 0.5 },
        'sasUpper': { offsetX: 0.5, offsetY: 0.5 }
    },
    elementScales: {
        'central': 1.2,
        'boostersLeft': 1.2,
        'boostersRight': 1.2,
        'upperStage': 1.0,
        'sasLower': 0.9,
        'sasUpper': 0.7
    },
    
    getGlobalScale() {
        const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-scale'));
        return isNaN(scale) ? 1 : scale;
    },
    
    init() {
        this.createDropZone();
        this.setupEventListeners();
    },
    
    createDropZone() {
        const display = document.querySelector('.astronaut-display');
        this.dropZone = document.createElement('div');
        this.dropZone.className = 'drop-zone';
        display.appendChild(this.dropZone);
    },
    
    setupEventListeners() {
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
        document.addEventListener('mouseleave', this.cancelDrag.bind(this));
        window.addEventListener('blur', this.cancelDrag.bind(this));
    },
    
    handleMouseDown(e) {
        if (GameState.disassemblyMode) return;
        
        const elementItem = e.target.closest('.element-item:not(.dressed)');
        if (!elementItem) return;
        e.preventDefault();
        const partId = elementItem.dataset.id;
        const part = RocketParts.find(p => p.id === partId);
        if (!part || !GameState.canDressElement(partId)) {
            const error = GameState.getDressError(partId);
            GameUI.showElementInfo(part, true, error);
            GameLogic.highlightRequiredElement(partId);
            return;
        }
        if (GameState.isElementFullyDressed(partId)) return;

        GameUI.updateElementInfoOnClick(partId);
        
        this.currentDragElement = {
            part: part,
            partId: partId,
            elementItem: elementItem,
            startX: e.clientX,
            startY: e.clientY,
            isDragStarted: false
        };
        elementItem.classList.add('dragging');
    },
    
    handleTouchStart(e) {
        if (GameState.disassemblyMode) return;
        
        const elementItem = e.target.closest('.element-item:not(.dressed)');
        if (!elementItem) return;
        e.preventDefault();
        const touch = e.touches[0];
        const partId = elementItem.dataset.id;
        const part = RocketParts.find(p => p.id === partId);
        if (!part || !GameState.canDressElement(partId)) {
            const error = GameState.getDressError(partId);
            GameUI.showElementInfo(part, true, error);
            GameLogic.highlightRequiredElement(partId);
            return;
        }
        if (GameState.isElementFullyDressed(partId)) return;
        
        this.currentDragElement = {
            part: part,
            partId: partId,
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
        if (!this.currentDragElement.isDragStarted && Math.hypot(dx, dy) > this.dragStartThreshold) {
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
        if (!this.currentDragElement.isDragStarted && Math.hypot(dx, dy) > this.dragStartThreshold) {
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
        const partId = elementItem.dataset.id;
        const part = RocketParts.find(p => p.id === partId);
        if (!part) return;
        const preloaded = ImagePreloader.getImage(partId);
        const imgSrc = preloaded ? preloaded.src : part.image;
        const dragImg = new Image();
        dragImg.src = imgSrc;
        dragImg.onload = () => this._finalizeDragImage(dragImg, x, y, partId);
    },
    
    _finalizeDragImage(img, x, y, partId) {
        this.dragImage = document.createElement('img');
        this.dragImage.className = 'drag-image';
        this.dragImage.src = img.src;
        this.dragImage.alt = partId;
        
        const container = document.querySelector('.astronaut-display');
        const rect = container.getBoundingClientRect();
        const baseScale = this.elementScales[partId] || 1.0;
        const globalScale = this.getGlobalScale();
        const finalScale = baseScale * globalScale;
        const aspect = img.naturalWidth / img.naturalHeight;
        let height = rect.height * finalScale;
        let width = height * aspect;
        const maxSize = Math.min(window.innerWidth * 0.6, window.innerHeight * 0.8);
        if (width > maxSize || height > maxSize) {
            const f = maxSize / Math.max(width, height);
            width *= f;
            height *= f;
        }
        this.dragImage.style.width = `${width}px`;
        this.dragImage.style.height = `${height}px`;
        
        const center = this.visualCenters[partId] || { offsetX: 0.5, offsetY: 0.5 };
        this.dragImage.style.left = `${x - width * center.offsetX}px`;
        this.dragImage.style.top = `${y - height * center.offsetY}px`;
        document.body.appendChild(this.dragImage);
        
        if (this.dragImageTimer) clearTimeout(this.dragImageTimer);
        this.dragImageTimer = setTimeout(() => {
            if (this.dragImage) this.dragImage.classList.add('visible');
            this.dragImageTimer = null;
        }, 10);
    },
    
    moveDragImage(x, y) {
        if (!this.dragImage) return;
        const partId = this.dragImage.alt;
        const width = parseInt(this.dragImage.style.width);
        const height = parseInt(this.dragImage.style.height);
        const center = this.visualCenters[partId] || { offsetX: 0.5, offsetY: 0.5 };
        this.dragImage.style.left = `${x - width * center.offsetX}px`;
        this.dragImage.style.top = `${y - height * center.offsetY}px`;
        this.checkDropZoneHover(x, y);
    },
    
    checkDropZoneHover(x, y) {
        if (!this.dropZone || !this.dragImage) return;
        const dropZoneRect = this.dropZone.getBoundingClientRect();
        const isOverDropZone = (
            x >= dropZoneRect.left && x <= dropZoneRect.right &&
            y >= dropZoneRect.top && y <= dropZoneRect.bottom
        );
        
        if (!isOverDropZone) {
            this.dropZone.classList.remove('valid', 'invalid');
            return;
        }
        
        const partId = this.currentDragElement.partId;
        const targetZone = GameState.getCurrentDropZone(partId);
        if (!targetZone) {
            this.dropZone.classList.remove('valid', 'invalid');
            return;
        }
        
        const displayRect = document.querySelector('.astronaut-display').getBoundingClientRect();
        const relX = (x - displayRect.left) / displayRect.width;
        const relY = (y - displayRect.top) / displayRect.height;
        
        const isValid = (
            relX >= targetZone.xMin && relX <= targetZone.xMax &&
            relY >= targetZone.yMin && relY <= targetZone.yMax
        );
        
        if (isValid) {
            this.dropZone.classList.add('valid');
            this.dropZone.classList.remove('invalid');
        } else {
            this.dropZone.classList.add('invalid');
            this.dropZone.classList.remove('valid');
        }
    },
    
    handleMouseUp(e) {
        this.finishDrag(e.clientX, e.clientY);
    },
    
    handleTouchEnd(e) {
        if (!this.currentDragElement) return;
        const touch = e.changedTouches[0];
        this.finishDrag(touch.clientX, touch.clientY);
    },
    
    finishDrag(x, y) {
        if (this.dragImageTimer) clearTimeout(this.dragImageTimer);
        if (!this.currentDragElement) return;
        const part = this.currentDragElement.part;
        const partId = this.currentDragElement.partId;
        const wasDragStarted = this.currentDragElement.isDragStarted;
        this.immediatelyRemoveDragImage();
        if (this.currentDragElement.elementItem) {
            this.currentDragElement.elementItem.classList.remove('dragging');
        }
        this.dropZone.classList.remove('active', 'valid', 'invalid');
        
        if (wasDragStarted) {
            const dropZoneRect = this.dropZone.getBoundingClientRect();
            const isOverDropZone = (
                x >= dropZoneRect.left && x <= dropZoneRect.right &&
                y >= dropZoneRect.top && y <= dropZoneRect.bottom
            );
            
            if (isOverDropZone) {
                const targetZone = GameState.getCurrentDropZone(partId);
                if (targetZone) {
                    const displayRect = document.querySelector('.astronaut-display').getBoundingClientRect();
                    const relX = (x - displayRect.left) / displayRect.width;
                    const relY = (y - displayRect.top) / displayRect.height;
                    const isValid = (
                        relX >= targetZone.xMin && relX <= targetZone.xMax &&
                        relY >= targetZone.yMin && relY <= targetZone.yMax
                    );
                    if (isValid) {
                        GameLogic.dressElement(part);
                    }
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
        if (this.dragImageTimer) clearTimeout(this.dragImageTimer);
        if (this.dragImage && this.dragImage.parentNode) {
            this.dragImage.parentNode.removeChild(this.dragImage);
        }
        this.dragImage = null;
    },
    
    cancelDrag() {
        this.immediatelyRemoveDragImage();
        if (this.currentDragElement && this.currentDragElement.elementItem) {
            this.currentDragElement.elementItem.classList.remove('dragging');
        }
        this.dropZone.classList.remove('active', 'valid', 'invalid');
        if (this.moveRequestId) cancelAnimationFrame(this.moveRequestId);
        this.currentDragElement = null;
        this.isDragging = false;
    }
};