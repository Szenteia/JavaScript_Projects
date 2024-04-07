// Class for Squad
export class Squad {
    members: string[];

    constructor() {
        this.members = [];
    }

    // Method to recruit new squad member
    recruit(member: string) {
        this.members.push(member);
        console.log(`${member} has joined your squad!`);
    }

    // Method to display squad members
    displayMembers() {
        console.log("Your Squad Members:");
        this.members.forEach(member => console.log(member));
    }
}
