(function() {
    var db = game.db = {};
    var imageData = db.imageData = {};
    imageData.thresholds = [1, 0.9, 0.6, 0.3, 0];
    imageData.states = [
        StaminaLevels.FULL,
        StaminaLevels.HIGH,
        StaminaLevels.HALF,
        StaminaLevels.LOW,
        StaminaLevels.WEAK,
        StaminaLevels.FAINTED
    ];

    db.defaultDemonling = function(id, name, roomId) {
        return {
            id: id,
            name: name,
            species: Species.Demonling,
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
            job: Jobs.LEE,
            nature: Natures.NEUTRAL,
            room: roomId
        };
    };

    db.defaultRoom = function(id) {
        return {
            id: id,
            name: `Room #${id}`
        };
    };

    db.startingLaffs = function() {
        return {
            current: 0,
            power: 0.1,
            modifier: 0,
            factor: 1.0,
        };
    }

    db.initializeGameData = function() {
        var data = {};
        data.startTime = new Date().getTime();
        data.lastSaveTime = new Date().getTime();
        data.autosave = true;
        data.version = VersionHistory.latest;
        data.subjects = [];
        data.subjects.push(db.defaultDemonling(1, "David", 1));
        data.rooms = [];
        data.rooms.push(db.defaultRoom(1));
        data.laffs = db.startingLaffs();

        return data;
    };

    db.normalizeGameData = function(data) {
        if (!data) {
            return this.initializeGameData();
        }

        if (typeof data.startTime === "undefined") {
            data.startTime = new Date().getTime();
        }
        if (typeof data.lastSaveTime === "undefined") {
            data.lastSaveTime = new Date().getTime();
        }
        if (typeof data.autosave === "undefined") {
            data.autosave = true;
        }
        if (typeof data.subjects === "undefined") {
            data.subjects = [];
        }
        if (!data.subjects || !data.subjects.length) {
            data.subjects.push(db.defaultDemonling(1, "David", 1));
        }
        $(data.subjects).each(function(i, el) {
            if (typeof el.species === "string") {
                el.species = el.species.toLowerCase();
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
        });

        if (typeof data.rooms === "undefined") {
            data.rooms = [];
        }
        if (!data.rooms || !data.rooms.length) {
            data.rooms.push(db.defaultRoom(1));
        }
        if (typeof data.laffs === "undefined") {
            data.laffs = db.startingLaffs();
        }

        return data;
    };

    db.getSpeciesImage = function(species) {
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

    db.getSubjectImage = function(subject) {
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
            for (var i = 0; i < imageData.thresholds.length; i++) {
                var threshold = imageData.thresholds[i];
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

        var subjectImage = db.getSpeciesImage(subject.species);

        return `subject-img ${subjectImage} ${reaction} ${imageData.states[index]}`;
    };

    db.getSubjectProfile = function(subject) {
        if (!subject) {
            return;
        }

        var subjectImage = db.getSpeciesImage(subject.species);

        return `subject-img ${subjectImage} idle high`;
    };

    db.getNature = function(subject) {
        switch (subject.nature) {
            case Natures.NEUTRAL:
                return "Doesn't have many preferences, enjoys most everything.";
            default:
                return "Nature unknown.";
        }
    };

    db.getStatUpgrade = function(stat, value) {
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
})();
