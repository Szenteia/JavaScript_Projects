

export class BadgeDisplay {
    private element: HTMLElement;
    private badges: string[] = [];

    constructor() {
        this.element = document.createElement('div');
        this.element.style.padding = '10px';
        this.element.style.backgroundColor = '#444';
        this.element.style.color = '#fff';
        this.element.style.textAlign = 'center';
        this.element.style.fontSize = '16px';
        this.element.style.margin = '20px';
        this.element.innerHTML = '<h2>Achievements and Badges</h2>';
    }

    public addBadge(badge: string): void {
        this.badges.push(badge);
        this.updateDisplay();
    }

    private updateDisplay(): void {
        this.element.innerHTML = '<h2>Achievements and Badges</h2>';
        const badgeList = document.createElement('ul');
        this.badges.forEach(badge => {
            const badgeItem = document.createElement('li');
            badgeItem.innerText = badge;
            badgeList.appendChild(badgeItem);
        });
        this.element.appendChild(badgeList);
    }

    public render(parentElement: HTMLElement): void {
        parentElement.appendChild(this.element);
    }
}
