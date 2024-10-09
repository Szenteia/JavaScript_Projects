// frontend/components/EnemyUnit.ts

export class EnemyUnit {
    private type: string;
    private health: number;
    private speed: number;
    private attackPower: number;
    private position: { x: number, y: number };

    constructor(type: string, health: number, speed: number, attackPower: number, startX: number, startY: number) {
        this.type = type;
        this.health = health;
        this.speed = speed;
        this.attackPower = attackPower;
        this.position = { x: startX, y: startY };
    }

    public move(): void {
        // moving from up to down
        this.position.y += this.speed;
    }

    public getPosition(): { x: number, y: number } {
        return this.position;
    }

    public getHealth(): number {
        return this.health;
    }

    public getAttackPower(): number {
        return this.attackPower;
    }

    public takeDamage(damage: number): void {
        this.health -= damage;
        console.log(`Enemy took ${damage} damage. Remaining health: ${this.health}`);
    }

    public isDestroyed(): boolean {
        return this.health <= 0;
    }

    public getType(): string {
        return this.type;
    }
}
