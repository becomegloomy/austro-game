const SuitElements = [
    {
        id: 'suit',
        name: 'Скафандр',
        description: 'Основной защитный слой, обеспечивающий герметичность и защиту от перепадов температур.',
        image: 'images/suit.png',
        layerId: 'layer-suit',
        dropZone: { xMin: 0.45, xMax: 0.55, yMin: 0.45, yMax: 0.55 }
    },
    {
        id: 'pnevma',
        name: 'Пневмогидро пульт',
        description: 'Регулятор давления и газового состава. Поддерживает избыточное давление 0.4 атм, удаляет CO₂, контролирует влажность и температуру воздуха.',
        image: 'images/pnevma.png',
        layerId: 'layer-pnevma',
        dropZone: { xMin: 0.45, xMax: 0.552, yMin: 0.33, yMax: 0.4 }
    },
    {
        id: 'water',
        name: 'Водяная система',
        description: 'Жидкостное охлаждение с замкнутым контуром. Отводит избыточное тепло тела космонавта (до 2000 ккал/ч) через сублимационный теплообменник.',
        image: 'images/water.png',
        layerId: 'layer-water',
        dropZone: { xMin: 0.35, xMax: 0.43, yMin: 0.35, yMax: 0.4 }
    },
    {
        id: 'backpack',
        name: 'Рюкзак',
        description: 'Автономный блок жизнеобеспечения. Содержит запасы кислорода (до 8 часов), аккумуляторы, регенерацию CO₂, радиосвязь и телеметрию.',
        image: 'images/backpack.png',
        layerId: 'layer-backpack',
        dropZone: { xMin: 0.48, xMax: 0.62, yMin: 0.35, yMax: 0.45 }
    },
    {
        id: 'belt',
        name: 'Ремень',
        description: 'Фиксирует рюкзак на скафандре, обеспечивая надежное крепление.',
        image: 'images/belt.png',
        layerId: 'layer-belt',
        dropZone: null
    },
    {
        id: 'panel',
        name: 'Электропульт',
        description: 'Бортовой интерфейс скафандра. Отображает давление, расход кислорода, заряд батарей и температуру. Позволяет переключать режимы питания и связи.',
        image: 'images/panel.png',
        layerId: 'layer-panel',
        dropZone: { xMin: 0.35, xMax: 0.45, yMin: 0.25, yMax: 0.35 }
    },
    {
        id: 'lights',
        name: 'Фонари подсветки',
        description: 'Светодиодные фонари с регулируемой яркостью. Обеспечивают освещение рабочей зоны в теневых секторах станции и в ночных условиях.',
        image: 'images/lights.png',
        layerId: 'layer-lights',
        dropZone: { xMin: 0.43, xMax: 0.48, yMin: 0.12, yMax: 0.18 }
    },
    {
        id: 'helmet',
        name: 'Шлем',
        description: 'Прозрачный поликарбонатный шлем. Защищает от УФ-излучения, оснащен гарнитурой связи и системой вентиляции.',
        image: 'images/helmet.png',
        layerId: 'layer-helmet',
        dropZone: { xMin: 0.43, xMax: 0.48, yMin: 0.12, yMax: 0.18 }
    }
];

const GameState = {
    dressedElements: new Set(),
    totalElements: SuitElements.length,
    
    canDressElement(elementId) {
        if (this.hasElement(elementId)) return false;
        if (elementId === 'suit') return true;
        if (elementId === 'lights') return this.hasElement('helmet');
        return this.hasElement('suit'); 
    },
    
    dressElement(elementId) {
        if (this.canDressElement(elementId)) {
            this.dressedElements.add(elementId);
            return true;
        }
        return false;
    },
    
    undressElement(elementId) {
        this.dressedElements.delete(elementId);
    },
    
    hasElement(elementId) {
        return this.dressedElements.has(elementId);
    },
    
    getDressedCount() {
        return this.dressedElements.size;
    },
    
    isComplete() {
        return this.dressedElements.size === this.totalElements;
    },
    
    reset() {
        this.dressedElements.clear();
    },
    
    getDressError(elementId) {
        switch(elementId) {
            case 'suit':
                return '';
                
            case 'lights':
                if (!this.hasElement('helmet')) {
                    return 'Сначала нужно надеть шлем!';
                }
                return '';
                
            default:
                if (!this.hasElement('suit')) {
                    return 'Сначала нужно надеть основной костюм!';
                }
                return '';
        }
    }
};