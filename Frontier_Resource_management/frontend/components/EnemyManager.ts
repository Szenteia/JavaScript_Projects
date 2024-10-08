

import { EnemyUnit } from './EnemyUnit';

export class EnemyManager {
    private enemies: EnemyUnit[] = [];

    constructor() {}


    public spawnEnemy(type: string, health: number, speed: number, attackPower: number, startX: number, startY: number): void {
        const newEnemy = new EnemyUnit(type, health, speed, attackPower, startX, startY);
        this.enemies.push(newEnemy);
    }

    public moveEnemies(): void {
        this.enemies.forEach(enemy => {
            enemy.move();  
        });
    }

    public renderEnemies(ctx: CanvasRenderingContext2D): void {
        this.enemies.forEach(enemy => {
            ctx.fillStyle = 'red';
            ctx.fillRect(enemy.getPosition().x, enemy.getPosition().y, 20, 20);  //simple square for now 
        });
    }

    public removeDestroyedEnemies(): void {
        this.enemies = this.enemies.filter(enemy => !enemy.isDestroyed() && enemy.getPosition().y < window.innerHeight);
    }

    public getEnemies(): EnemyUnit[] {
        return this.enemies;
    }
}
