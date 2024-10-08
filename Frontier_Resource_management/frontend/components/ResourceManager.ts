export class ResourceManager {
    private resourceAmount: number;
    private unitCosts: {[key: string]: number};

    constructor(initialResources: number) {
        this.resourceAmount = initialResources;

            this.unitCosts = {
                'Anti-Tank Infantry': 50,
                'Air Defense': 100,
                'Radar': 75,
                'Plane': 150,
                'Tank': 200,
                'APC': 100,
                'Drone': 120,
                'Rocket': 250,
                'Artillery': 300,
                'Elite Infantry': 80,
                'Simple Infantry': 30
            };
        }
        public getUnitCosts(): { [key: string]: number } {
            return this.unitCosts;
        }
        public getAvailableResources(): number {
            return this.resourceAmount;
        }

        public canPurchaseUnit(unitType: string): boolean {
            return this.unitCosts[unitType] <= this.resourceAmount;
        }

        public purchaseUnit(unitType: string): boolean {
            if (this.canPurchaseUnit(unitType)) {
                this.resourceAmount -= this.unitCosts[unitType];
                return true;
            }
            return false;
        }
        
        public addResources(amount: number): void {
            this.resourceAmount += amount;
        }
    }
