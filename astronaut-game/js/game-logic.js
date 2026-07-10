const GameLogic = {
    dressElement(element) {
        if (GameState.hasElement(element.id)) {
            GameUI.showElementInfo(element);
            return false;
        }
        
        if (!GameState.canDressElement(element.id)) {
            this.showDressHint(element.id);
            GameUI.showElementInfo(element);
            return false;
        }
        
        const success = GameState.dressElement(element.id);
        if (success) {
            GameUI.showLayer(element.id);
            GameUI.showElementInfo(element);
            GameUI.updateProgress();
            
            GameUI.updateInventory(element.id);
            
            if (element.id === 'suit') {
                GameUI.updateInventory();
            } else if (element.id === 'helmet') {
                GameUI.updateInventory('lights');
            }
            
            if (element.id === 'backpack') {
                this.autoAddBelt();
            }
            
            if (GameState.isComplete()) {
                setTimeout(() => {
                    GameUI.showCompletionMessage();
                }, 500);
            }
            return true;
        }
        return false;
    },

    autoAddBelt() {
        const beltElement = SuitElements.find(e => e.id === 'belt');
        if (!beltElement) return;
        
        if (!GameState.hasElement('belt')) {
            GameState.dressElement('belt');
            GameUI.showLayer('belt');
            GameUI.updateProgress();
            GameUI.updateInventory('belt');
        }
    },
    
    showDressHint(elementId) {
        const errorMessage = GameState.getDressError(elementId);
        if (errorMessage) {
            this.highlightRequiredElement(elementId);
        }
    },
    
    highlightRequiredElement(elementId) {
        let requiredId = '';
        
        switch(elementId) {
            case 'lights':
                requiredId = 'helmet';
                break;
            default:
                if (elementId !== 'suit') {
                    requiredId = 'suit';
                }
        }
        
        if (requiredId) {
            const requiredElement = document.querySelector(`[data-id="${requiredId}"]`);
            if (requiredElement) {
                requiredElement.classList.add('required-highlight');
                setTimeout(() => {
                    requiredElement.classList.remove('required-highlight');
                }, 1000);
            }
        }
    },
    
    resetGame() {
        SuitElements.forEach(element => {
            GameUI.hideLayer(element.id);
        });
        document.getElementById('layer-body').classList.add('active');
        GameState.reset();
        GameUI.updateInventory();
        GameUI.updateProgress();
        GameUI.hideCompletionMessage();
        GameUI.showElementInfo(SuitElements[0]);
    },
    
    init() {
        GameUI.init();
        console.log('Игра "Одень космонавта" инициализирована!');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    GameLogic.init();
});