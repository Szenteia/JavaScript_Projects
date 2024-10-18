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
                    enemies.splice(j, 1);  // Távolítsd el az ellenséget a listából
                    j--;  // Mivel egy elem eltűnik, vissza kell lépnünk egy indexet
                }

                // Ha a védelmi egység elpusztult, azt is eltávolítjuk
                if (defense.getHealth() <= 0) {
                    console.log(`Defense unit destroyed!`);
                    this.defenses.splice(i, 1);  // Távolítsd el a védelmi egységet
                    i--;  // Hasonlóan, vissza kell lépnünk egy indexet
                    break;  // Kilépünk az aktuális védelmi egység támadásából
                }
            }
        }
    }

    // Ha nincsenek többé védelmi egységek, a bázist támadják
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
