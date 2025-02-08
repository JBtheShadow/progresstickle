class Database {
    static imageData = {
        thresholds: [1, 0.9, 0.6, 0.3, 0],
        states: [
            StaminaLevels.FULL,
            StaminaLevels.HIGH,
            StaminaLevels.HALF,
            StaminaLevels.LOW,
            StaminaLevels.WEAK,
            StaminaLevels.FAINTED
        ]
    };

    static costs = {
        stamina: {
            max: { base: 1000, unit: 5 },
            regen: { base: 100000, unit: 0.01 }
        },
        laffs: { base: 100, unit: 0.5 },
        power: { base: 500, unit: 0.01 },
        growth: 1.5
    }

    static stats = {};
    static initializeStats() {
        Database.stats[Species.DEMONLING] = {
            endurance: { max: 5, regen: 0.01 },
            stamina: { max: 20, regen: 0.01 },
            laffs: 1,
            power: 0.02
        };
        Database.stats[Species.FUFFLEBUG] = {
            endurance: { max: 3, regen: 0.01 },
            stamina: { max: 30, regen: 0.02 },
            laffs: 0.5,
            power: 0.01
        };
        Database.stats[Species.BUNDELION] = {
            endurance: { max: 5, regen: 0.01 },
            stamina: { max: 15, regen: 0.02 },
            laffs: 1.5,
            power: 0.01
        };
        Database.stats[Species.NVOII] = {
            endurance: { max: 3, regen: 0.01 },
            stamina: { max: 15, regen: 0.02 },
            laffs: 1,
            power: 0.01
        };
        Database.stats[Species.STONAUTO] = {
            endurance: { max: 10, regen: 0.02 },
            stamina: { max: 50, regen: 0.02 },
            laffs: 0.5,
            power: 0.01
        };
    }

    static defaultDemonling(id, name, role, nature) {
        return {
            id: id,
            name: name,
            species: Species.DEMONLING,
            endurance: Database.stats[Species.DEMONLING].endurance.max,
            stamina: Database.stats[Species.DEMONLING].stamina.max,
            upgrades: {
                stamina: { max: 0, regen: 0 },
                laffs: 0,
                power: 0
            },
            state: TickledStates.IDLE,
            tickleDelay: 0,
            role: role,
            nature: nature
        };
    }

    static defaultRoom(id, type, subjectGroups) {
        var room = {
            id: id,
            name: `Room #${id}`,
            type: type,
            subjects: []
        };
        for (var group of subjectGroups) {
            room.subjects.push({
                lee: group[0],
                lers: group[1]
            });
        }
        return room;
    }

    static startingLaffs() {
        return {
            current: 0,
            power: 0.1,
            modifier: 0,
            factor: 1.0,
        };
    }

    static initializeGameData() {
        return {
            startTime: new Date().getTime(),
            lastSaveTime: new Date().getTime(),
            autoSave: true,
            version: VersionHistory.latest,
            subjects: [Database.defaultDemonling(1, "David", Roles.LEE, Natures.NEUTRAL)],
            rooms: [Database.defaultRoom(1, RoomTypes.BASIC, [[1, []]])],
            laffs: Database.startingLaffs(),
            choices: {
                subjectMultiplier: 1
            }
        };
    }

    static normalizeGameData(data) {
        if (!data) {
            return Database.initializeGameData();
        }

        if (typeof data.startTime === "undefined") {
            data.startTime = new Date().getTime();
        }
        if (typeof data.lastSaveTime === "undefined") {
            data.lastSaveTime = new Date().getTime();
        }
        if (typeof data.autosave !== "undefined") {
            data.autoSave = !!data.autosave;
            delete data.autosave;
        }
        if (typeof data.autoSave === "undefined") {
            data.autoSave = true;
        }

        if (typeof data.rooms === "undefined") {
            data.rooms = [];
        }
        if (!data.rooms || !data.rooms.length) {
            data.rooms.push(Database.defaultRoom(1, RoomTypes.BASIC, [[1, []]]));
        }
        $(data.rooms).each(function(i, el) {
            if (typeof el.type === "undefined") {
                el.type = RoomTypes.BASIC;
            }
        });

        if (typeof data.subjects === "undefined") {
            data.subjects = [];
        }
        if (!data.subjects || !data.subjects.length) {
            data.subjects.push(Database.defaultDemonling(1, "David", Roles.LEE, Natures.NEUTRAL));
        }
        $(data.subjects).each(function(i, el) {
            if (typeof el.species === "string") {
                el.species = el.species.toLowerCase();
            } else if (typeof el.species === "undefined") {
                el.species = Species.DEMONLING;
            }
            if (typeof el.nature === "undefined") {
                el.nature = Natures.NEUTRAL;
            }
            if (typeof el.image !== "undefined") {
                delete el.image;
            }

            if (typeof el.endurance === "object" || typeof el.stamina === "object") {
                var speciesStats = Database.stats[el.species];
                var endurance = el.endurance.current;
                var stamina = el.stamina.current;
                var upgrades = {
                    stamina: {
                        max: (el.stamina.max - speciesStats.stamina.max) / Database.costs.stamina.max.unit,
                        regen: (el.stamina.regen - speciesStats.stamina.regen) / Database.costs.stamina.regen.unit
                    },
                    laffs: (el.laffs - speciesStats.laffs) / Database.costs.laffs.unit,
                    power: (el.power - speciesStats.power) / Database.costs.power.unit
                }

                el.endurance = endurance;
                el.stamina = stamina;
                el.upgrades = upgrades;
            }
            if (typeof el.power !== "undefined") {
                delete el.power;
            }
            if (typeof el.laffs !== "undefined") {
                delete el.laffs;
            }

            if (typeof el.job !== "undefined") {
                el.role = el.job;
                delete el.job;
            }
            if (typeof el.role === "undefined") {
                el.role = Roles.UNASSIGNED;
            }
            if (typeof el.roomId !== "undefined") {
                if (el.role == Roles.LEE) {
                    var room = data.rooms.filter(x => x.id == el.roomId)[0];
                    if (room) {
                        var group = room.subjects.filter(x => x.lee == el.id)[0];
                        if (!group) {
                            room.subjects.push({lee: subject.id, lers: []});
                        }
                    }
                }

                delete el.roomId;
            }

            if (typeof el.state === "undefined") {
                el.state = TickledStates.IDLE;
            }

            if (typeof el.tickleDelay === "undefined") {
                el.tickleDelay = 0;
            }
        });

        if (typeof data.laffs === "undefined") {
            data.laffs = Database.startingLaffs();
        }

        if (typeof data.choices === "undefined") {
            data.choices = {};
        }
        if (typeof data.choices.subjectMultiplier === "undefined") {
            data.choices.subjectMultiplier = 1;
        }

        return data;
    }

    static getSpeciesImage(species) {
        switch (species) {
            case Species.DEMONLING:
                return SpeciesImages.DEMONLING;
            case Species.FUFFLEBUG:
                return SpeciesImages.FUFFLEBUG;
            case Species.BUNDELION:
                return SpeciesImages.BUNDELION;
            case Species.NVOII:
                return SpeciesImages.NVOII;
            case Species.STONAUTO:
                return SpeciesImages.STONAUTO;
            default:
                return "";
        }
    }

    static getSubjectImage(subject) {
        if (!subject && !subject.state) {
            return;
        }

        var speciesStats = Database.stats[subject.species];

        var percStamina = subject.stamina / (speciesStats.stamina.max + subject.upgrades.stamina.max * Database.costs.stamina.max.unit);
        var percEndurance = subject.endurance / speciesStats.endurance.max;

        // If endurance is not full treat it as if stamina was drained a little, for image purposes
        if (percStamina >= 1 && percEndurance < 1) {
            percStamina = 0.99;
        }

        var index = 0;
        if (percStamina <= 0) {
            index = 5;
        }
        else {
            for (var i = 0; i < Database.imageData.thresholds.length; i++) {
                var threshold = Database.imageData.thresholds[i];
                if (percStamina >= threshold) {
                    index = i;
                    break;
                }
            }
        }

        var reaction =
            subject.state == TickledStates.TICKLED ? Reactions.RESISTING :
            subject.state == TickledStates.IDLE ? Reactions.IDLE :
            subject.state == TickledStates.FAINTED ? Reactions.FAINTED :
            Reactions.LAUGHING;
        
        if (subject.autostate == TickledStates.TICKLED) {
            if (subject.state == TickledStates.TICKLED || subject.state == TickledStates.IDLE && subject.tickleDelay) {
                reaction = Reactions.LAUGHING;
            }
            else if (subject.state == TickledStates.IDLE) {
                reaction = Reactions.RESISTING;
            }
        }
        else if (subject.state == TickledStates.IDLE && subject.tickleDelay) {
            reaction = Reactions.RESISTING;
        }

        var subjectImage = Database.getSpeciesImage(subject.species);

        return `subject-img ${subjectImage} ${reaction} ${Database.imageData.states[index]}`;
    }

    static getSubjectProfile(subject) {
        if (!subject) {
            return;
        }

        var subjectImage = Database.getSpeciesImage(subject.species);

        return `subject-img ${subjectImage} idle high`;
    };

    static getNature(subject) {
        switch (subject.nature) {
            case Natures.NEUTRAL:
                return "Doesn't have many preferences, enjoys most everything.";
            default:
                return "Nature unknown.";
        }
    };

    static cumulativeStatCost(base, growth, amount) {
        return base * (Math.pow(growth, amount) - 1) / (growth - 1);
    }

    static getStatUpgrade(stat, currUpgrades, amount) {
        var upgradeStats =
            stat == Fields.STAMINA_REGEN ? Database.costs.stamina.regen :
            stat == Fields.STAMINA_MAX ? Database.costs.stamina.max :
            stat == Fields.POWER ? Database.costs.power :
            stat == Fields.LAFFS ? Database.costs.laffs :
            null;
        
        if (!upgradeStats)
            return;

        if (amount < 1)
            return;

        var spent = currUpgrades > 0 ? Database.cumulativeStatCost(upgradeStats.base, Database.costs.growth, currUpgrades) : 0;
        var cumulative = Database.cumulativeStatCost(upgradeStats.base, Database.costs.growth, currUpgrades + amount);

        return {
            diff: upgradeStats.unit * amount,
            cost: cumulative - spent
        };
    };

    static getMaxAmount(stat, currUpgrades) {
        var upgradeStats =
            stat == Fields.STAMINA_REGEN ? Database.costs.stamina.regen :
            stat == Fields.STAMINA_MAX ? Database.costs.stamina.max :
            stat == Fields.POWER ? Database.costs.power :
            stat == Fields.LAFFS ? Database.costs.laffs :
            null;
        
        if (!upgradeStats)
            return;

        var spent = currUpgrades > 0 ? Database.cumulativeStatCost(upgradeStats.base, Database.costs.growth, currUpgrades) : 0;

        if (Storage.data.laffs.current + spent <= 0)
            return 1;

        // money = cumulative - spent
        // money + spent = cumulative
        // money + spent = base * (growth^amount - 1) / (growth - 1)
        // (money + spent) * (growth - 1) / base = growth^amount - 1
        // (money + spent) * (growth - 1) / base + 1 = growth^amount
        // log((money + spent) * (growth - 1) / base + 1) / log(growth) = amount

        // This seems to get an amount with cost immediately greater than what funds the player has, but not always, so
        // until I figure out a better way I'm just gonna double check it here

        var amount = Math.round(Math.log((Storage.data.laffs.current + spent) * (Database.costs.growth - 1) / upgradeStats.base + 1) / Math.log(Database.costs.growth));
        if (amount > 1) {
            do {
                var cost = Database.getStatUpgrade(stat, currUpgrades, amount);
                if (cost.cost > Storage.data.laffs.current)
                    amount--;

            } while (amount > 1 && cost > Storage.data.laffs.current);
        }

        return Math.max(1, amount);
    }
}
