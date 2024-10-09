// frontend/components/DefenseManager.ts

import { DefenseUnit } from './DefenseUnit';
import { EnemyUnit } from './EnemyUnit';

export class DefenseManager {
    private defenses: DefenseUnit[] = [];
    private hasAttackedThisRound: boolean = false;  

    constructor() {}

    public placeDefenseUnit(type: string, attackPower: number, attackSpeed: number, range: number, startX: number, startY: number): void {
        const newDefense = new DefenseUnit(type, attackPower, attackSpeed, range, startX, startY);
        this.defenses.push(newDefense);
    }

    public manageAttacks(enemies: EnemyUnit[]): void {
        if (!this.hasAttackedThisRound) {
            this.defenses.forEach(defense => {
                enemies.forEach(enemy => {
                    if (defense.isEnemyInRange(enemy.getPosition())) {
                        enemy.takeDamage(defense.attack());
                    }
                });
            });
            this.hasAttackedThisRound = true;  
        }
    }

    public resetAttacks(): void {
        this.hasAttackedThisRound = false;
    }

    public renderDefenses(ctx: CanvasRenderingContext2D): void {
        this.defenses.forEach(defense => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(defense.getPosition().x, defense.getPosition().y, 20, 20);
        });
    }

    public getDefenses(): DefenseUnit[] {
        return this.defenses;
    }
}
