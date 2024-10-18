import { DefenseUnit } from './DefenseUnit';
import { EnemyUnit } from './EnemyUnit';
import { Base } from './Base';

export class DefenseManager {
    private defenses: DefenseUnit[] = [];  
    private reserveUnits: DefenseUnit[] = []; 
    private nextPlacementPosition = { x: 50, y: 200 };  
    private readonly unitWidth = 40;  
    private readonly unitHeight = 40;  
    private readonly canvasWidth: number;
    private base: Base;

    constructor(canvasWidth: number, base: Base) {
        this.canvasWidth = canvasWidth;
        this.base = base;
        this.nextPlacementPosition = { x: 50, y: 200 };
    }

    // Egyszerűsített védelmi egység elhelyezés
    public placeDefenseUnit(type: string, health: number, attackPower: number, attackSpeed: number, range: number): void {
        const newDefense = new DefenseUnit(type, health, attackPower, attackSpeed, range, this.nextPlacementPosition.x, this.nextPlacementPosition.y);
        this.defenses.push(newDefense);
        this.updatePlacementPosition();
    }

    // Pozíció frissítése az új egységek számára
    private updatePlacementPosition(): void {
        this.nextPlacementPosition.x += this.unitWidth + 20;

        if (this.nextPlacementPosition.x + this.unitWidth > this.canvasWidth) {
            this.nextPlacementPosition.x = 50;
            this.nextPlacementPosition.y += this.unitHeight + 10;
        }
    }

    // Támadások kezelése egyszerűsített logikával
    public manageAttacks(enemies: EnemyUnit[]): void {
        // Rendezés hatótávolság szerint
        this.defenses.sort((a, b) => b.getRange() - a.getRange());
        enemies.sort((a, b) => b.getRange() - a.getRange());

        // Védekezési támadások
        while (this.defenses.length > 0 && enemies.length > 0) {
            const defense = this.defenses[0];  // A legnagyobb hatótávolságú védelmi egység
            const enemy = enemies[0];  // Az első ellenség a sorban

            if (defense.isEnemyInRange(enemy.getPosition())) {
                enemy.takeDamage(defense.attack(Date.now()));  // Védelmi egység támad
                if (enemy.getHealth() <= 0) {
                    enemies.shift();  // Ellenség eltávolítása
                }
            }

            // Ellenőrizd, ha a védelmi egység elpusztult
            if (defense.getHealth() <= 0) {
                this.defenses.shift();  // Védelmi egység eltávolítása
            }
        }

        // Ha nincsenek védelmi egységek, a bázist támadják az ellenségek
        if (this.defenses.length === 0) {
            enemies.forEach(enemy => {
                this.base.takeDamage(enemy.getAttackPower());
                console.log(`Base attacked! Base health: ${this.base.getHealth()}`);
            });
        }
    }

    // Védekezési egységek kirajzolása
    public renderDefenses(ctx: CanvasRenderingContext2D): void {
        this.defenses.forEach(defense => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(defense.getPosition().x, defense.getPosition().y, this.unitWidth, this.unitHeight);
        });
    }

    // Védelmi egységek visszaállítása egy kör végén
    public resetAttacks(): void {
        this.defenses.forEach(defense => defense.resetAttackStatus());
    }

    public getDefenses(): DefenseUnit[] {
        return this.defenses;
    }
}
