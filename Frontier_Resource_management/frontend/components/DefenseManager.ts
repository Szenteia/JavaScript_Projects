import { DefenseUnit } from './DefenseUnit';
import { EnemyUnit } from './EnemyUnit';

export class DefenseManager {
    private defenses: DefenseUnit[] = [];   // Aktuális védelmi egységek
    private reserveUnits: DefenseUnit[] = [];  // Tartalék egységek, amelyek túléltek egy hullámot
    private hasAttackedThisRound: boolean = false;
    private nextPlacementPosition = { x: 50, y: 450 };  // Kezdő pozíció a base alatti elhelyezéshez
    private readonly unitWidth = 40;  // Egység szélessége a pozícionáláshoz
    private readonly unitHeight = 40;  // Egység magassága a pozícionáláshoz
    private readonly canvasWidth: number;  // Canvas szélessége a sorok rendezéséhez

    constructor(canvasWidth: number) {
        this.canvasWidth = canvasWidth;
    }

    // Új védelmi egység elhelyezése a base alá automatikusan
    public placeDefenseUnit(type: string, attackPower: number, attackSpeed: number, range: number): void {
        const newDefense = new DefenseUnit(type, attackPower, attackSpeed, range, this.nextPlacementPosition.x, this.nextPlacementPosition.y);
        this.defenses.push(newDefense);
        this.updatePlacementPosition();  // Frissítjük a következő pozíciót
    }

    // Frissíti a következő egység elhelyezésének pozícióját
    private updatePlacementPosition(): void {
        this.nextPlacementPosition.x += this.unitWidth + 10;  // Következő pozíció balra mozgatása

        // Ha a következő pozíció túllépi a canvas szélességét, új sorba lép
        if (this.nextPlacementPosition.x + this.unitWidth > this.canvasWidth) {
            this.nextPlacementPosition.x = 50;  // Vissza az első oszlophoz
            this.nextPlacementPosition.y += this.unitHeight + 10;  // Lejjebb lép egy sorral
        }
    }

    // Védelmi egységek támadása az ellenségekre, egyszeri támadás egy körön belül
    public manageAttacks(enemies: EnemyUnit[]): void {
        if (!this.hasAttackedThisRound) {
            this.defenses.forEach(defense => {
                enemies.forEach(enemy => {
                    if (defense.isEnemyInRange(enemy.getPosition())) {
                        enemy.takeDamage(defense.attack());
                    }
                });
            });
            this.hasAttackedThisRound = true;  // Támadást végrehajtották ebben a körben
        }
    }

    // Kör végén az életben maradt egységek áthelyezése a tartalékba
    public moveToReserve(): void {
        this.reserveUnits = this.defenses.filter(defense => defense.attack() > 0);  // Csak az életben maradt egységeket helyezzük át
        this.defenses = [];  // Az aktuális védelmi egységek listájának kiürítése
    }

    // Tartalékban lévő egységek újra elhelyezése a base alá
    public deployReserveUnits(): void {
        this.reserveUnits.forEach(unit => {
            unit['position'] = { x: this.nextPlacementPosition.x, y: this.nextPlacementPosition.y };
            this.defenses.push(unit);
            this.updatePlacementPosition();
        });
        this.reserveUnits = [];  // Kiürítjük a tartalékot
    }

    // Védelmi egységek kirajzolása a játéktérre
    public renderDefenses(ctx: CanvasRenderingContext2D): void {
        this.defenses.forEach(defense => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(defense.getPosition().x, defense.getPosition().y, this.unitWidth, this.unitHeight);
        });
    }

    // Kör végén a támadási státusz visszaállítása
    public resetAttacks(): void {
        this.hasAttackedThisRound = false;
        this.defenses.forEach(defense => defense.resetAttackStatus());
    }

    public getDefenses(): DefenseUnit[] {
        return this.defenses;
    }
}
