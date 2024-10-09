import { DefenseUnit } from './DefenseUnit';
import { EnemyUnit } from './EnemyUnit';

export class DefenseManager {
    private defenses: DefenseUnit[] = [];  
    private reserveUnits: DefenseUnit[] = []; 
    private hasAttackedThisRound: boolean = false;
    private nextPlacementPosition = { x: 50, y: 350 };  
    private readonly unitWidth = 40;  
    private readonly unitHeight = 40;  
    private readonly canvasWidth: number;  

    constructor(canvasWidth: number) {
        this.canvasWidth = canvasWidth;
    }

    public placeDefenseUnit(type: string, attackPower: number, attackSpeed: number, range: number): void {
        const newDefense = new DefenseUnit(type, attackPower, attackSpeed, range, this.nextPlacementPosition.x, this.nextPlacementPosition.y);
        this.defenses.push(newDefense);
        this.updatePlacementPosition();  
    }

    private updatePlacementPosition(): void {
        this.nextPlacementPosition.x += this.unitWidth + 10;

        if (this.nextPlacementPosition.x + this.unitWidth > this.canvasWidth) {
            this.nextPlacementPosition.x = 50;
            this.nextPlacementPosition.y += this.unitHeight + 10;
        }
    }

    public manageAttacks(enemies: EnemyUnit[], currentTime: number): void {
        if (!this.hasAttackedThisRound) {
            this.defenses.forEach(defense => {
                enemies.forEach(enemy => {
                    if (defense.isEnemyInRange(enemy.getPosition()) && defense.canAttack(currentTime)) {
                        enemy.takeDamage(defense.attack(currentTime));
                    }
                });
            });
            this.hasAttackedThisRound = true;
        }
    }

    public moveToReserve(): void {
        this.reserveUnits = this.defenses.filter(defense => defense.getType() !== 'Destroyed');
        this.defenses = [];
    }

    public deployReserveUnits(): void {
        this.reserveUnits.forEach(unit => {
            unit['position'] = { x: this.nextPlacementPosition.x, y: this.nextPlacementPosition.y };
            this.defenses.push(unit);
            this.updatePlacementPosition();
        });
        this.reserveUnits = [];
    }

    public renderDefenses(ctx: CanvasRenderingContext2D): void {
        this.defenses.forEach(defense => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(defense.getPosition().x, defense.getPosition().y, this.unitWidth, this.unitHeight);
        });
    }

    public resetAttacks(): void {
        this.hasAttackedThisRound = false;
        this.defenses.forEach(defense => defense.resetAttackStatus());
    }

    public getDefenses(): DefenseUnit[] {
        return this.defenses;
    }
}
