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

    public takeDamage(damage: number): void {
        this.health -= damage;
        if (this.health < 0) {
            this.health = 0; 
            console.log(`damage taken: ${damage}`)
        }

    }

    public isDestroyed(): boolean {
        return this.health <= 0;
    }
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'green';
        ctx.fillRect(10, ctx.canvas.height - 30, (this.health / 1000) * (ctx.canvas.width - 20), 20);  // Egyszerű életerő csík
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText(`Base Health: ${this.health}`, 10, ctx.canvas.height - 35);
    }
}