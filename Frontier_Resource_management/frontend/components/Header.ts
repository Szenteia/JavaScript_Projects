export class Header {
    private element: HTMLElement;

    constructor() {
        this.element = document.createElement('header');
        this.element.style.padding = '20px';
        this.element.style.backgroundColor = '#222';
        this.element.style.textAlign = 'center';
        this.element.style.fontSize = '24px';
        this.element.innerHTML = '<h1>Frontier</h1>';
    }

    public render(parentElement: HTMLElement): void {
        parentElement.appendChild(this.element);
    }
}