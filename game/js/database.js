(function() {
    var db = game.db = {};
    var imageData = db.imageData = {};
    imageData.thresholds = [1, 0.9, 0.6, 0.3, 0];
    imageData.states = ["full", "high", "half", "low", "weak", "fainted"];

    db.initializeGameData = function() {
        var data = {};
        data.startTime = new Date().getTime();
        data.lastSaveTime = new Date().getTime();
        data.autosave = true;
        data.version = VersionHistory.latest;
        data.subjects = [];
        data.subjects.push({
            id: 0,
            name: "David",
            species: "Demonling",
            image: "demonling",
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
            job: "lee",
            room: 0
        });
        data.rooms = [];
        data.rooms.push({
            id: 0,
            name: "Room #0"
        });
        data.laffs = {
            current: 0,
            power: 0.1,
            modifier: 0,
            factor: 1.0,
        };

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
            data.subjects.push({
                id: 0,
                name: "David",
                species: "Demonling",
                image: "demonling",
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
                job: "lee",
                room: 0
            });
        }
        $(data.subjects).each(function(i, el) {
            if (typeof el.image === "undefined") {
                el.image = "demonling";
            }
            if (typeof el.power === "undefined") {
                el.power = 0.01;
            }
        });

        if (typeof data.rooms === "undefined") {
            data.rooms = [];
        }
        if (!data.rooms || !data.rooms.length) {
            data.rooms.push({
                id: 0,
                name: "Room #0"
            });
        }
        if (typeof data.laffs === "undefined") {
            data.laffs = {
                current: 0,
                power: 0.1,
                modifier: 0,
                factor: 1.0,
            };
        }

        return data;
    };

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

        var imgState = subject.state == "tickled" ? "resisting" : subject.state;
        if (subject.autostate == "tickled") {
            if (subject.state == "tickled" || subject.state == "idle" && subject.tickleDelay) {
                imgState = "laughing";
            }
            else if (subject.state == "idle") {
                imgState = "resisting";
            }
        }
        else if (subject.state == "idle" && subject.tickleDelay) {
            imgState = "resisting";
        }

        return `subject-img ${subject.image} ${imgState} ${imageData.states[index]}`;
    };

    db.getSubjectProfile = function(subject) {
        if (!subject) {
            return;
        }

        return `subject-img ${subject.image} idle high`;
    };

    db.getNature = function(subject) {
        // TODO
        return "Doesn't have many preferences, enjoys most everything.";
    };

    db.getStatUpgrade = function(stat, value) {
        var multiplier = 100;
        var decimals = value < 1 ? 2 : 0;
        if (stat == "endurance.regen") {
            multiplier = 50000;
        }
        if (stat == "stamina.regen") {
            multiplier = 100000;
        }
        if (stat == "power") {
            multiplier = 25000;
        }
        if (stat == "laffs") {
            multiplier = 200;
        }

        var nextValue = Number((value * 1.7).toFixed(decimals));
        var diff = Number((nextValue - value).toFixed(decimals));
        var cost = Number((diff * 2.1 * multiplier).toFixed(0));

        return { cost: cost, nextValue: nextValue, diff: diff };
    };
})();
