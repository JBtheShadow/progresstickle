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

    static defaultDemonling(id, name, role, nature) {
        return {
            id: id,
            name: name,
            species: Species.DEMONLING,
            endurance: {
                current: 5,
                max: 5,
                regen: 0.01
            },
            stamina: {
                current: 20,
                max: 20,
                regen: 0.01
            },
            laffs: 1,
            power: 0.01,
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
            laffs: Database.startingLaffs()
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
            if (typeof el.power === "undefined") {
                el.power = 0.01;
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
        });

        if (typeof data.laffs === "undefined") {
            data.laffs = Database.startingLaffs();
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

        var stamina = subject.stamina;
        var percStamina = stamina.current / stamina.max;
        var endurance = subject.endurance;
        var percEndurance = endurance.current / endurance.max;

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

    static getStatUpgrade(stat, value) {
        var multiplier = 100;
        var decimals = value < 1 ? 2 : 0;
        if (stat == Fields.ENDURANCE_REGEN) {
            multiplier = 50000;
        }
        if (stat == Fields.STAMINA_REGEN) {
            multiplier = 100000;
        }
        if (stat == Fields.POWER) {
            multiplier = 25000;
        }
        if (stat == Fields.LAFFS) {
            multiplier = 200;
        }

        var nextValue = Number((value * 1.7).toFixed(decimals));
        var diff = Number((nextValue - value).toFixed(decimals));
        var cost = Number((diff * 2.1 * multiplier).toFixed(0));

        return { cost: cost, nextValue: nextValue, diff: diff };
    };
}
