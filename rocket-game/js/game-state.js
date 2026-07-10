const RocketParts = [
    {
        id: 'central',
        name: 'Вторая ступень',
        accusativeName: 'вторую ступень',
        description: 'Основная несущая конструкция. Содержит двигатели и топливо для начального этапа полёта.',
        disassemblyDescription: 'После отделения боковых ускорителей вторая ступень продолжает подъём. Когда топливо заканчивается, ступень отбрасывается.',
        image: 'images/2_stupen.png',
        layerId: 'layer-central',
        order: 1,
        disassemblyOrder: 2,
        isMultiPart: false,
        dropZone: { xMin: 0.48, xMax: 0.52, yMin: 0.65, yMax: 0.69 },
        disassemblyZone: { xMin: 0.48, xMax: 0.52, yMin: 0.4, yMax: 0.89}
    },
    {
        id: 'boostersLeft',
        name: 'Левые ускорители (передний и задний)',
        accusativeName: 'ОБА левых ускорителя',
        description: 'Относятся к первой стпуени ракеты и каждый из них создаёт тягу около 100 тонн-силы, работая на керосине и жидком кислороде.',
        disassemblyDescription: 'Работают первые две минуты, создавая основную тягу. Когда топливо заканчивается, они отделяются первыми – это снижает массу ракеты и позволяет экономить топливо центрального блока.',
        image: 'images/booster_left.png',
        order: 2,
        disassemblyOrder: 1,
        isMultiPart: true,
        subParts: [
            { name: 'Левый задний ускоритель', layerId: 'layer-booster-left-back', dropZone: { xMin: 0.45, xMax: 0.48, yMin: 0.7, yMax: 0.74 }, disassemblyZone: { xMin: 0.44, xMax: 0.49, yMin: 0.56, yMax: 0.9 } },
            { name: 'Левый передний ускоритель', layerId: 'layer-booster-left-front', dropZone: { xMin: 0.45, xMax: 0.48, yMin: 0.7, yMax: 0.74 }, disassemblyZone: { xMin: 0.44, xMax: 0.49, yMin: 0.56, yMax: 0.9 } }
        ]
    },
    {
        id: 'boostersRight',
        name: 'Правые ускорители (передний и задний)',
        accusativeName: 'ОБА правых ускориетеля',
        description: 'Относятся к первой стпуени ракеты и каждый из них создаёт тягу около 100 тонн-силы, работая на керосине и жидком кислороде.',
        disassemblyDescription: 'Работают первые две минуты, создавая основную тягу. Когда топливо заканчивается, они отделяются первыми – это снижает массу ракеты и позволяет экономить топливо центрального блока.',
        image: 'images/booster_right.png',
        order: 2,
        disassemblyOrder: 1,
        isMultiPart: true,
        subParts: [
            { name: 'Правый задний ускоритель', layerId: 'layer-booster-right-back', dropZone: { xMin: 0.52, xMax: 0.55, yMin: 0.7, yMax: 0.74 }, disassemblyZone: { xMin: 0.5, xMax: 0.56, yMin: 0.56, yMax: 0.9 } },
            { name: 'Правый передний ускоритель', layerId: 'layer-booster-right-front', dropZone: { xMin: 0.52, xMax: 0.55, yMin: 0.7, yMax: 0.74 }, disassemblyZone: { xMin: 0.5, xMax: 0.56, yMin: 0.56, yMax: 0.9 } }
        ]
    },
    {
        id: 'upperStage',
        name: 'Третья ступень',
        accusativeName: 'третью ступень',
        description: 'Эта ступень включается после отделения второй и выводит корабль на орбиту. После отделения корабля ступень остаётся на орбите как космический мусор и постепенно сгорает в атмосфере.',
        disassemblyDescription: 'Выводит корабль на орбиту, а затем отделяется и остаётся на орбите как космический мусор, постепенно сгорая в атмосфере.',
        image: 'images/3_stupen.png',
        layerId: 'layer-upperStage',
        order: 3,
        disassemblyOrder: 5,
        isMultiPart: false,
        dropZone: { xMin: 0.48, xMax: 0.52, yMin: 0.36, yMax: 0.38 },
        disassemblyZone: { xMin: 0.46, xMax: 0.53, yMin: 0.30, yMax: 0.43 }
    },
    {
        id: 'sasLower',
        name: 'Головной обтекатель',
        accusativeName: 'головной обтекатель',
        description: 'Часть головного блока, остающаяся на ракете. Защищает корабль от аэродинамического нагрева при прохождении плотных слоёв атмосферы.',
        disassemblyDescription: 'Защищает космический корабль от аэродинамического нагрева и механических нагрузок при прохождении плотных слоёв атмосферы. После выхода на высоту, где сопротивление воздуха становится минимальным, обтекатель сбрасывается, открывая корабль для выхода на орбиту.',
        image: 'images/sas_lower.png',
        layerId: 'layer-sasLower',
        order: 4,
        disassemblyOrder: 4,
        isMultiPart: false,
        dropZone: { xMin: 0.48, xMax: 0.52, yMin: 0.23, yMax: 0.28 },
        disassemblyZone: { xMin: 0.44, xMax: 0.54, yMin: 0.18, yMax: 0.32 }
    },
    {
        id: 'sasUpper',
        name: 'САС (Системы аварийного спасения экипажа)',
        accusativeName: 'САС',
        description: 'Часть головного блока, уводящая капсулу с космонавтами от ракеты в случае аварийной ситуации.',
        disassemblyDescription: ' На высоте, когда атмосфера уже достаточно разрежена и угроза аварии на стартовом участке миновала, САС отделяется, чтобы не мешать дальнейшему полёту.',
        image: 'images/sas_upper.png',
        layerId: 'layer-sasUpper',
        order: 5,
        disassemblyOrder: 3,
        isMultiPart: false,
        dropZone: { xMin: 0.48, xMax: 0.52, yMin: 0.1, yMax: 0.15 },
        disassemblyZone: { xMin: 0.48, xMax: 0.52, yMin: 0.07, yMax: 0.18 }
    }
];

const GameState = {
    dressedElements: new Set(),
    multiPartProgress: { 'boostersLeft': 0, 'boostersRight': 0 },
    totalElements: RocketParts.length,
    disassemblyMode: false,
    
    getCurrentDropZone(partId) {
        const part = RocketParts.find(p => p.id === partId);
        if (!part) return null;
        if (!part.isMultiPart) return part.dropZone;
        const installed = this.multiPartProgress[partId] || 0;
        if (installed >= part.subParts.length) return null;
        return part.subParts[installed].dropZone;
    },
    
    getCurrentLayerId(partId) {
        const part = RocketParts.find(p => p.id === partId);
        if (!part) return null;
        if (!part.isMultiPart) return part.layerId;
        const installed = this.multiPartProgress[partId] || 0;
        if (installed >= part.subParts.length) return null;
        return part.subParts[installed].layerId;
    },
    
    canDressElement(elementId) {
        const part = RocketParts.find(p => p.id === elementId);
        if (!part) return false;
        if (part.isMultiPart) {
            const installed = this.multiPartProgress[elementId] || 0;
            if (installed >= part.subParts.length) return false;
            if (!this.isOrderSatisfied(part)) return false;
            return true;
        } else {
            if (this.hasElement(elementId)) return false;
            if (!this.isOrderSatisfied(part)) return false;
            return true;
        }
    },
    
    isOrderSatisfied(part) {
        if (part.order === 1) return true;
        const previousParts = RocketParts.filter(p => p.order < part.order);
        for (let prev of previousParts) {
            if (prev.isMultiPart) {
                const installed = this.multiPartProgress[prev.id] || 0;
                if (installed < prev.subParts.length) return false;
            } else {
                if (!this.hasElement(prev.id)) return false;
            }
        }
        return true;
    },
    
    dressElement(elementId) {
        const part = RocketParts.find(p => p.id === elementId);
        if (!part) return false;
        if (part.isMultiPart) {
            const installed = this.multiPartProgress[elementId] || 0;
            if (installed >= part.subParts.length) return false;
            if (!this.isOrderSatisfied(part)) return false;
            this.multiPartProgress[elementId] = installed + 1;
            return true;
        } else {
            if (this.hasElement(elementId)) return false;
            if (!this.isOrderSatisfied(part)) return false;
            this.dressedElements.add(elementId);
            return true;
        }
    },
    
    undressElement(elementId) {
        const part = RocketParts.find(p => p.id === elementId);
        if (!part) return false;
        if (part.isMultiPart) {
            const installed = this.multiPartProgress[elementId] || 0;
            if (installed === 0) return false;
            this.multiPartProgress[elementId] = installed - 1;
            return true;
        } else {
            if (!this.hasElement(elementId)) return false;
            this.dressedElements.delete(elementId);
            return true;
        }
    },
    
    isElementFullyDressed(elementId) {
        const part = RocketParts.find(p => p.id === elementId);
        if (!part) return false;
        if (part.isMultiPart) {
            const installed = this.multiPartProgress[elementId] || 0;
            return installed === part.subParts.length;
        } else {
            return this.hasElement(elementId);
        }
    },
    
    hasElement(elementId) {
        return this.dressedElements.has(elementId);
    },
    
    getDressedCount() {
        let count = 0;
        for (let part of RocketParts) {
            if (this.isElementFullyDressed(part.id)) count++;
        }
        return count;
    },
    
    isComplete() {
        return this.getDressedCount() === this.totalElements;
    },
    
    isFullyUndressed() {
        for (let part of RocketParts) {
            if (part.isMultiPart) {
                if ((this.multiPartProgress[part.id] || 0) > 0) return false;
            } else {
                if (this.hasElement(part.id)) return false;
            }
        }
        return true;
    },
    
    reset() {
        this.dressedElements.clear();
        this.multiPartProgress = { 'boostersLeft': 0, 'boostersRight': 0 };
        this.disassemblyMode = false;
        if (GameUI.switchToAssemblyMode) GameUI.switchToAssemblyMode();
    },
    
    getNextSubPart(partId) {
        const part = RocketParts.find(p => p.id === partId);
        if (!part || !part.isMultiPart) return null;
        const installed = this.multiPartProgress[partId] || 0;
        if (installed >= part.subParts.length) return null;
        return part.subParts[installed];
    },
    
    getDressError(elementId) {
        const part = RocketParts.find(p => p.id === elementId);
        if (!part) return 'Неизвестная деталь';
        if (this.isElementFullyDressed(elementId)) return 'Эта деталь уже полностью установлена';
        if (!this.isOrderSatisfied(part)) {
            const previousParts = RocketParts.filter(p => p.order < part.order);
            for (let prev of previousParts) {
                if (!this.isElementFullyDressed(prev.id)) {
                    return `Сначала нужно установить ${prev.accusativeName}!`;
                }
            }
            return 'Не выполнены условия порядка';
        }
        return '';
    },
    
    switchToDisassemblyUI() {
        this.disassemblyMode = true;
        if (GameUI.switchToDisassemblyMode) GameUI.switchToDisassemblyMode();
    }
};