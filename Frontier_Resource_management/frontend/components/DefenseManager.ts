import { DefenseUnit } from './DefenseUnit';
import { EnemyUnit } from './EnemyUnit';
import { Base } from './Base';

export class DefenseManager {
    private defenses: DefenseUnit[] = [];  
    private reserveUnits: DefenseUnit[] = []; 
    private nextPlacementPosition = { x: 50, y: 400 };  
    private readonly unitWidth = 40;  
    private readonly unitHeight = 40;  
    private readonly canvasWidth: number;
    private base: Base;

    constructor(canvasWidth: number, base: Base) {
        this.canvasWidth = canvasWidth;
        this.base = base;
        this.nextPlacementPosition = { x: 50, y:400 };
    }

    public placeDefenseUnit(type: string, health: number, attackPower: number, attackSpeed: number, range: number): void {
        const totalUnitsPerRow = Math.min(this.defenses.length + 1, Math.floor(this.canvasWidth / (this.unitWidth + 20)));  // Mennyi egység fér el egy sorban
        const totalPlacedUnits = this.defenses.length;  // Hány egység van már elhelyezve
        
        // Számoljuk ki, melyik sorban van az egység
        const currentRow = Math.floor(totalPlacedUnits / totalUnitsPerRow);
        const unitsInRow = totalPlacedUnits % totalUnitsPerRow;
    
        // A sor közepére igazított kezdő pozíció
        const totalSpacing = (this.canvasWidth - (totalUnitsPerRow * this.unitWidth)) / (totalUnitsPerRow + 1);  // Egyenlő távolságok az egységek között
        const newX = totalSpacing + unitsInRow * (this.unitWidth + totalSpacing);  // A pozíció számítása
        const newY = this.nextPlacementPosition.y + (currentRow * (this.unitHeight + 20));  // Sor közötti távolság
    
        const newDefense = new DefenseUnit(type, health, attackPower, attackSpeed, range, newX, newY);
        this.defenses.push(newDefense);
        
        // Meghívjuk az updatePlacementPosition-t az új pozíció frissítéséhez
        this.updatePlacementPosition();
    
        console.log(`New defense unit created at position: ${newDefense.getPosition().x}, ${newDefense.getPosition().y}`);
    }

    private updatePlacementPosition(): void {
        const unitsPerRow = Math.floor(this.canvasWidth / (this.unitWidth + 20)); // Egységek száma egy sorban
        const indexInRow = this.defenses.length % unitsPerRow; // Az egység indexe a soron belül
        const currentRow = Math.floor(this.defenses.length / unitsPerRow); // Az aktuális sor
    
        // Az egység vízszintes pozíciója a soron belül, és az új sor kezdése
        const spacing = (this.canvasWidth - (unitsPerRow * this.unitWidth)) / (unitsPerRow + 1);
        const newX = spacing + indexInRow * (this.unitWidth + spacing);
        const newY = this.nextPlacementPosition.y + currentRow * (this.unitHeight + 10);
    
        this.nextPlacementPosition = { x: newX, y: newY };
    }
    public manageAttacks(enemies: EnemyUnit[]): void {
        this.defenses.sort((a, b) => b.getRange() - a.getRange());
        enemies.sort((a, b) => b.getRange() - a.getRange());
    
    for (let i = 0; i < this.defenses.length; i++) {
        const defense = this.defenses[i];

        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];

            if (defense.isEnemyInRange(enemy.getPosition())) {
                enemy.takeDamage(defense.attack(Date.now()));
                console.log(`Enemy attacked: Remaining health ${enemy.getHealth()}`);

                if (enemy.getHealth() <= 0) {
                    console.log(`Enemy destroyed!`);
                    enemies.splice(j, 1);
                    j--;
                }

                if (defense.getHealth() <= 0) {
                    console.log(`Defense unit destroyed!`);
                    this.defenses.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
    }
    if (this.defenses.length === 0) {
        enemies.forEach(enemy => {
            this.base.takeDamage(enemy.getAttackPower());
            console.log(`Base attacked! Base health: ${this.base.getHealth()}`);
        });
    }
}
    public renderDefenses(ctx: CanvasRenderingContext2D): void {
        this.defenses.forEach(defense => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(defense.getPosition().x, defense.getPosition().y, this.unitWidth, this.unitHeight);
        });
    }
    public resetAttacks(): void {
        this.defenses.forEach(defense => defense.resetAttackStatus());
    }

    public getDefenses(): DefenseUnit[] {
        return this.defenses;
    }
}
