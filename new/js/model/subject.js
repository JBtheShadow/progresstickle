class Subject {
    constructor(id, name, species, endurance, stamina, upgrades, location, nature) {
        this.id = id;
        this.name = name;
        this.species = species;
        this.endurance = endurance;
        this.stamina = stamina;
        this.upgrades = upgrades;
        this.location = location;
        this.nature = nature;
    }

    static species = {
        DEMONLING: "demonling",
        FUFFLEBUG: "fufflebug",
        BUNDELION: "bundelion",
        NVOII: "nvoii",
        STONAUTO: "stonauto"
    };

    static natures = {
        NEUTRAL: "neutral"
    }

    static fromJson(json, jsonRooms) {
        let endurance, stamina

        return new Subject(
            json.id,
            json.name || `Subject #${json.id}`,
            (json.species || Subject.species.DEMONLING).toLowerCase(),

        );
    }

    static listFromJson(json) {
        let subjects = [];
        let jsonSubjects = json.subjects || [];
        let jsonRooms = json.rooms || [];
        for (let jsonSubject of jsonSubjects) {
            jsonSubject.id = jsonSubject.id || subjects.length;
            subjects.push(Subject.fromJson(jsonSubject, jsonRooms));
        }
    }
}
