export class Base {
    private health: number;
    private maxHealth: number;
    private repairCostPerPoint: number;

    constructor(initialHealth: number,  repairCostPerPoint: number) {
        this.health = initialHealth;
        this.maxHealth = initialHealth;
        this.repairCostPerPoint = repairCostPerPoint;
    }

    public getHealth(): number {
        return this.health;
    }

    public repair(points: number, availabeResources: number): number {
        const totalRepairCost = points * this.repairCostPerPoint;
        if (availabeResources >= totalRepairCost) {
            this.health = Math.min(this.maxHealth, this.health + points);
            return totalRepairCost;
        }
        return 0; //no available founds
    }

    public takeDamage(amount: number): void {
        this.health = Math.max(0, this.health - amount);
    }

    public isDestroyed(): boolean {
        return this.health <= 0;
    }
}