// frontend/components/GameCanvas.ts

import { EnemyManager } from './EnemyManager';
import { DefenseManager } from './DefenseManager';
import { Base } from './Base';

export class GameCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private enemyManager: EnemyManager;
    private defenseManager: DefenseManager;
    private base: Base;

    constructor(enemyManager: EnemyManager, defenseManager: DefenseManager, base: Base) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.enemyManager = enemyManager;
        this.defenseManager = defenseManager;
        this.base = base;

        this.canvas.style.border = '1px solid #61dafb';
        this.setCanvasSize();
        window.addEventListener('resize', this.setCanvasSize.bind(this));  //keep track of window size change
    }

    // dinamic canvas sizing
    private setCanvasSize(): void {
        const headerHeight = document.querySelector('header')?.clientHeight || 0;
        const gameControlsHeight = document.querySelector('div')?.clientHeight || 0;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - headerHeight - gameControlsHeight - 40; 
    }

    public render(parentElement: HTMLElement): void {
        parentElement.appendChild(this.canvas);
    }

    public update(): void {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.enemyManager.moveEnemies();

            this.enemyManager.manageAttacks(this.base);

            this.enemyManager.renderEnemies(this.ctx);

            this.defenseManager.manageAttacks(this.enemyManager.getEnemies());

            this.defenseManager.renderDefenses(this.ctx);
        }
    }
    getCanvasWidth(): number {
        return this.canvas.width;
    }

    public endRound(): void {
        this.defenseManager.resetAttacks();
    }
}
