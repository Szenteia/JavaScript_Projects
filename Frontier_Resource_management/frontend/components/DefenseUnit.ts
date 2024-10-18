
export class DefenseUnit {
    private type: string;
    private health: number;
    private attackPower: number;
    private attackSpeed: number;
    private range: number;
    private position: { x: number, y: number };
    private lastAttackTime: number;

    constructor(type: string, health: number, attackPower: number, attackSpeed: number, range: number, startX: number, startY: number) {
        this.type = type;
        this.health = health;
        this.attackPower = attackPower;
        this.attackSpeed = attackSpeed;  // Time (in ms) between attacks
        this.range = range; 
        this.position = { x: startX, y: startY };  // Position of the defense unit on the canvas
        this.lastAttackTime = 0;  // Keeps track of the last attack time for cooldown purposes
    }

    public getPosition(): { x: number, y: number } {
        return this.position;
    }

    public isEnemyInRange(enemyPosition: { x: number, y: number }): boolean {
        const dx = enemyPosition.x - this.position.x;
        const dy = enemyPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.range;
    }

    public canAttack(currentTime: number): boolean {
        return currentTime - this.lastAttackTime >= this.attackSpeed;
    }

    // Perform an attack, updating the last attack time and returning the attack power
    public attack(currentTime: number): number {
        this.lastAttackTime =  currentTime;
        console.log(`${this.type} attacked! Power: ${this.attackPower}`);
        return this.attackPower;
    }
    public getRange(): number {
        return this.range;
    }
    public getHealth(): number {
        return this.health;
    }
    // Get the type of defense unit
    public getType(): string {
        return this.type;
    }

    // Resets the unit's attack status at the end of each round
    public resetAttackStatus(): void {
        this.lastAttackTime = 0;
    }
}
