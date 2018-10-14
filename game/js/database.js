(function() {
    var db = game.db = {};
    var imageData = db.imageData = {};
    imageData.thresholds = [1, 0.9, 0.6, 0.3, 0];
    imageData.images = {
        demonling: {
            idle: ["img/lil demon - idle.png", "img/lil demon - smile.png", "img/lil demon - smile.png", "img/lil demon - open mouth.png", "img/lil demon - laugh 2.png"],
            tickled: ["img/lil demon - wink.png", "img/lil demon - wink.png", "img/lil demon - grin.png", "img/lil demon - grin.png", "img/lil demon - laugh.png"],
            tickled2: ["img/lil demon - wink.png", "img/lil demon - grin.png", "img/lil demon - grin.png", "img/lil demon - laugh.png", "img/lil demon - laugh.png"],
            fainted: ["img/lil demon - fainted.png"]
        }
    };

    db.initializeGameData = function() {
        var data = {};
        data.startTime = new Date().getTime();
        data.lastSaveTime = new Date().getTime();
        data.autosave = true;
        data.version = latestVersion;
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
        for (var i = 0; i < imageData.thresholds.length; i++) {
            var threshold = imageData.thresholds[i];
            if (percStamina >= threshold) {
                index = i;
                break;
            }
        }

        var state = subject.state;
        if (subject.autostate == "tickled") {
            if (state == "tickled" || state == "idle" && subject.tickleDelay) {
                state = "tickled2";
            }
            else if (state == "idle") {
                state = "tickled";
            }
        }
        else if (state == "idle" && subject.tickleDelay) {
            state = "tickled";
        }

        var images = imageData.images[subject.image][state];
        if (!images || !images.length) {
            return;
        }

        return images[index] || images[0];
    };
})();
