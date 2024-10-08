import { ResourceManager } from "./ResourceManager";

export class ResourceDisplay {
    private element: HTMLElement;
    private resourceManager: ResourceManager;  // Kezdeti erőforrás mennyiség

    constructor(resourceManager: ResourceManager) {
        this.resourceManager = resourceManager;

        this.element = document.createElement('div');
        this.element.style.padding = '10px';
        this.element.style.backgroundColor = '#333';
        this.element.style.color = '#fff';
        this.element.style.textAlign = 'center';
        this.element.style.fontSize = '18px';
        this.updateDisplay();
    }

    private updateDisplay(): void {
        this.element.innerHTML = `Available Resources: ${this.resourceManager.getAvailableResources()}`;
    }

    public updateResources(): void {
        this.updateDisplay();
    }

    public render(parentElement: HTMLElement): void {
        parentElement.appendChild(this.element);
    }
}