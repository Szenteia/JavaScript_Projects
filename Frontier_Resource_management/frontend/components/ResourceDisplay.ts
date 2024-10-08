export class ResourceDisplay {
    private element: HTMLElement;
    private resourceAmount: number = 100;  // Kezdeti erőforrás mennyiség

    constructor() {
        this.element = document.createElement('div');
        this.element.style.padding = '10px';
        this.element.style.backgroundColor = '#333';
        this.element.style.color = '#fff';
        this.element.style.textAlign = 'center';
        this.element.style.fontSize = '18px';
        this.updateDisplay();
    }

    public updateResource(amount: number): void {
        this.resourceAmount += amount;
        this.updateDisplay();
    }

    private updateDisplay(): void {
        this.element.innerHTML = `Available Resources: ${this.resourceAmount}`;
    }

    public render(parentElement: HTMLElement): void {
        parentElement.appendChild(this.element);
    }
}