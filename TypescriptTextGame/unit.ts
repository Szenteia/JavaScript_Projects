// Base class for Unit
export class Unit {
    name: string;
    health: number;
    attack: number;
    defense: number;
    initiative: number;

    constructor(name: string, health: number, attack: number, defense: number, initiative: number = 2) {
        this.name = name;
        this.health = health;
        this.attack = attack;
        this.defense = defense;
        this.initiative = initiative;
    }

    // Method to display unit details
    displayDetails() {
        console.log(`Name: ${this.name}`);
        console.log(`Health: ${this.health}`);
        console.log(`Attack: ${this.attack}`);
        console.log(`Defense: ${this.defense}`);
        console.log(`Initiative: ${this.initiative}`);
    }

    // Method to check if the unit is dead
    isDead(): boolean {
        return this.health <= 0;
    }

    // Method to apply modifiers (to be implemented later)
    modifier() {
        // Placeholder for modifier implementation
    }
}
