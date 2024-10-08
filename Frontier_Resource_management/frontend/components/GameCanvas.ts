// frontend/components/GameCanvas.ts

import { EnemyManager } from './EnemyManager';

export class GameCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private enemyManager: EnemyManager;

    constructor(enemyManager: EnemyManager) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.enemyManager = enemyManager;

        // Canvas alapvető stílusok
        this.canvas.style.border = '1px solid #61dafb';
        this.setCanvasSize();
        window.addEventListener('resize', this.setCanvasSize.bind(this));  // Méretváltozás figyelése
    }

    // Dinamikus canvas méretezés a teljes képernyő kitöltéséhez
    private setCanvasSize(): void {
        const headerHeight = document.querySelector('header')?.clientHeight || 0;
        const gameControlsHeight = document.querySelector('div')?.clientHeight || 0;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - headerHeight - gameControlsHeight - 40; // A header és vezérlők közötti magasság kitöltése
    }

    public render(parentElement: HTMLElement): void {
        parentElement.appendChild(this.canvas);
    }

    public update(): void {
        if (this.ctx) {
            // Játéktér törlése (frissítés)
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Ellenséges egységek mozgatása
            this.enemyManager.moveEnemies();

            // Ellenséges egységek kirajzolása
            this.enemyManager.renderEnemies(this.ctx);
        }
    }
    getCanvasWidth(): number {
        return this.canvas.width;
    }
}
