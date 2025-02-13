class Room {
    constructor(id, name, upgrades) {
        this.id = id;
        this.name = name;
        this.upgrades = upgrades;
    }

    static fromJson(json) {
        return new Room(
            json.id,
            json.name || `Room #${json.id}`,
            RoomUpgrades.fromJson(json.upgrades)
        );
    }

    static listFromJson(json) {
        let rooms = [];
        let jsonRooms = json.rooms || [];
        for (let jsonRoom of jsonRooms) {
            jsonRoom.id = jsonRoom.id || rooms.length;
            rooms.push(Room.fromJson(jsonRoom));
        }
        return rooms;
    }
}

class RoomUpgrades {
    constructor(size, powerFactor, staminaFactor, laffFactor) {
        this.size = size || 1;
        this.powerFactor = powerFactor || 1;
        this.staminaFactor = staminaFactor || 1;
        this.laffFactor = laffFactor || 1;
    }

    static fromJson(json) {
        json = json || {};
        return new RoomUpgrades(
            json.size,
            json.powerFactor,
            json.staminaFactor,
            json.laffFactor
        );
    }
}