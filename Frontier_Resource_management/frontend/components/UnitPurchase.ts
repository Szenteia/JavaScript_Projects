import { ResourceManager } from './ResourceManager';

export class UnitPurchase {
    private element: HTMLElement;
    private resourceManager: ResourceManager;
    private onUnitPurchasedCallback: (unitType: string) => void;


    constructor(resourceManager: ResourceManager, onUnitPurchasedCallback: (unitType: string) => void) {
        this.resourceManager = resourceManager;
        this.onUnitPurchasedCallback = onUnitPurchasedCallback;

        this.element = document.createElement('div');
        this.element.style.display = 'flex';
        this.element.style.flexWrap = 'wrap';
        this.element.style.justifyContent = 'center';
        this.element.style.margin = '20px';

        this.createUnitButtons();
    }

    private createUnitButtons(): void {
        // A getter metódus használata a unitCosts eléréséhez
        Object.keys(this.resourceManager.getUnitCosts()).forEach(unitType => {
            const button = this.createButton(unitType);
            this.element.appendChild(button);
        });
    }

    private createButton(unitType: string): HTMLButtonElement {
        const button = document.createElement('button');
        button.innerText = `${unitType} (${this.resourceManager.getUnitCosts()[unitType]} pts)`;
        button.style.padding = '10px 15px';
        button.style.margin = '5px';
        button.style.fontSize = '14px';
        button.style.cursor = 'pointer';
        button.style.flexBasis = '30%';

        button.addEventListener('click', () => {
            if (this.resourceManager.purchaseUnit(unitType)) {
                this.onUnitPurchasedCallback(unitType);
            } else {
                alert('Not enough resources!');
            }
        });
        return button;
    }

    public render(parentElement: HTMLElement): void {
        parentElement.appendChild(this.element);
    }
}