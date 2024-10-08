

export class GameControls {
    private element: HTMLElement;
    private onStartCallback: () => void;
    private onPauseCallback: () => void;

    constructor(onStartCallback: () => void, onPauseCallback: () => void) {
        this.element = document.createElement('div');
        this.element.style.display = 'flex';
        this.element.style.justifyContent = 'center';
        this.element.style.margin = '20px';

        this.onStartCallback = onStartCallback;
        this.onPauseCallback = onPauseCallback;

        const startButton = this.createButton('Start Game', this.onStartCallback);
        const pauseButton = this.createButton('Pause Game', this.onPauseCallback);

        this.element.appendChild(startButton);
        this.element.appendChild(pauseButton);
    }

    private createButton(label: string, onClick: () => void): HTMLButtonElement {
        const button = document.createElement('button');
        button.innerText = label;
        button.style.padding = '10px 20px';
        button.style.margin = '0 10px';
        button.style.fontSize = '16px';
        button.style.cursor = 'pointer';

        button.addEventListener('click', onClick);
        return button;
    }

    public render(parentElement: HTMLElement): void {
        parentElement.appendChild(this.element);
    }
}
