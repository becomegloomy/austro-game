const GameLogic = {
    dressElement(part) {
        if (GameState.isElementFullyDressed(part.id)) {
            GameUI.showElementInfo(part, true, 'Эта деталь уже полностью установлена');
            return false;
        }
        
        if (!GameState.canDressElement(part.id)) {
            const error = GameState.getDressError(part.id);
            GameUI.showElementInfo(part, true, error);
            this.highlightRequiredElement(part.id);
            return false;
        }
        
        const success = GameState.dressElement(part.id);
        if (success) {
            const layerId = GameState.getCurrentLayerId(part.id);
            if (layerId) {
                GameUI.showLayer(layerId);
            }
            GameUI.showElementInfo(part, false);
            GameUI.updateProgress();
            GameUI.updateInventory();
            
            if (GameState.isComplete()) {
                setTimeout(() => {
                    GameUI.showTransportModal();
                }, 300);
            }
            return true;
        }
        return false;
    },
    
    undressRocketPart(partId) {
        if (!GameState.disassemblyMode) return false;
        const part = RocketParts.find(p => p.id === partId);
        if (!part) return false;
        
        let removedName = '';
        
        if (part.isMultiPart) {
            const installedCount = GameState.multiPartProgress[part.id] || 0;
            if (installedCount === 0) return false;
            const subPartIndex = installedCount - 1;
            const subPart = part.subParts[subPartIndex];
            GameState.undressElement(part.id);
            removedName = subPart.name;
        } else {
            if (!GameState.hasElement(part.id)) return false;
            GameState.undressElement(part.id);
            removedName = part.name;
        }
        
        GameUI.updateInventory();
        GameUI.updateProgress();
        
        if (GameState.isFullyUndressed()) {
             GameUI.animateSpacecraftAndShowFinal();
        }
        return true;
    },
    
    highlightRequiredElement(elementId) {
        const error = GameState.getDressError(elementId);
        if (!error) return;
        const match = error.match(/"([^"]+)"/);
        if (match) {
            const neededName = match[1];
            const neededPart = RocketParts.find(p => p.name === neededName);
            if (neededPart) {
                const elem = document.querySelector(`.element-item[data-id="${neededPart.id}"]`);
                if (elem) {
                    elem.classList.add('required-highlight');
                    setTimeout(() => elem.classList.remove('required-highlight'), 1000);
                }
            }
        }
    },
    
    resetGame() {
        RocketParts.forEach(part => {
            if (part.isMultiPart) {
                part.subParts.forEach(sub => GameUI.hideLayer(sub.layerId));
            } else {
                GameUI.hideLayer(part.layerId);
            }
        });
        document.getElementById('layer-body').classList.add('active');
        GameState.reset();
        GameUI.updateInventory();
        GameUI.updateProgress();
        GameUI.hideTransportModal();
        GameUI.hideLaunchModal();
        GameUI.hideFinalModal();
        GameUI.showInstructions();

        const permanent = document.getElementById('layer-sasLower-permanent');
        if (permanent) permanent.classList.remove('active');
        
        const spacecraft = document.getElementById('layer-spacecraft');
        if (spacecraft) {
            spacecraft.classList.remove('active');
            spacecraft.classList.remove('layer-spacecraft-animate');
            spacecraft.classList.remove('layer-spacecraft-zoom');
            spacecraft.classList.remove('layer-spacecraft-fly');
        }
        
        const astronautDisplay = document.querySelector('.astronaut-display');
        if (astronautDisplay) {
            astronautDisplay.classList.remove('stars-fast');
            astronautDisplay.classList.remove('space-mode');
        }

        const elementsGrid = document.querySelector('.elements-grid');
        if (elementsGrid) {
            elementsGrid.scrollLeft = 0;
        }
        
        GameState.disassemblyMode = false;
        GameUI.switchToAssemblyMode();
    },
    
    init() {
        GameUI.init();
        console.log('Игра "Собери ракету" с перетаскиванием для разборки запущена!');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    GameLogic.init();
});