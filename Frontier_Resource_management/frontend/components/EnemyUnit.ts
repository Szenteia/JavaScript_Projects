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
        // Fentről lefelé mozgás (y tengely mentén növekszik a pozíció)
        this.position.y += this.speed;
    }

    public getPosition(): { x: number, y: number } {
        return this.position;
    }

    public getHealth(): number {
        return this.health;
    }

    public takeDamage(amount: number): void {
        this.health -= amount;
    }

    public isDestroyed(): boolean {
        return this.health <= 0;
    }

    public getType(): string {
        return this.type;
    }
}
