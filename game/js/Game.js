var game = {};
game.updateInterval = null;
game.imageData = {
    Demonling: [
        { at: 1, when: "idle", src: "img/lil demon - idle.png" },
        { at: 1, when: "tickled", src: "img/lil demon - wink.png" },
        { min: 0.75, max: 1, when: "idle", src: "img/lil demon - smile.png" },
        { min: 0.75, max: 1, when: "tickled", src: "img/lil demon - wink.png" },
        { min: 0.5, max: 0.75, when: "idle", src: "img/lil demon - smile.png" },
        { min: 0.5, max: 0.75, when: "tickled", src: "img/lil demon - grin.png" },
        { min: 0.25, max: 0.5, when: "idle", src: "img/lil demon - open mouth.png" },
        { min: 0.25, max: 0.5, when: "tickled", src: "img/lil demon - grin.png" },
        { min: 0, max: 0.25, when: "idle", src: "img/lil demon - laugh 2.png" },
        { min: 0, max: 0.25, when: "tickled", src: "img/lil demon - laugh.png" }
    ]
};
game.util = {
    getSubjectImage: function(subject, state) {
        if (!subject || !state) {
            return;
        }

        var species = subject.species;
        var stages = game.imageData[species];
        if (!stages || !stages.length) {
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

        var stage = $(stages).filter(function(i, el) {
            if (state != el.when) {
                return false;
            }
            if (percStamina == el.at || percStamina >= el.min && percStamina < el.max) {
                return true;
            }
            return false;
        }).get(0);
        
        if (!stage) {
            return;
        }

        return stage.src;
    },
    units: ["", "k", "M", "B", "T", "q", "Q", "s", "S", "O", "N", "d", "U", "D"],
    groupDigits: function(number) {
        var str = number.toFixed(0);
        return str.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    },
    prettifyNumber: function (number) {
        var exp = number.toExponential(3);
        var power = Number(exp.split('e')[1]);
        var ind = Math.floor(power / 3);

        if (ind >= this.units.length) {
            return exp;
        }

        var num = number;
        for (var i = 0; i < ind; i++) {
            num = num / 1000;
        }

        var sNum = num.toString().split(".");
        var integer = sNum[0];
        var decimal = ("." + ((sNum[1] || "")[0] || "0")).replace(".0", "");
        return integer + (this.units[ind] ? decimal + this.units[ind] : "");
    },
    useLocalStorage: function() {
        return /^file:\/\//i.test(location.href);
    },
    loadData: function (key) {
        var safeBase64;
        if (this.useLocalStorage()) {
            safeBase64 = this.getFromStorage(key);
        }
        else {
            safeBase64 = this.getFromCookie(key);
        }

        if (!safeBase64) {
            return;
        }

        var base64 = safeBase64.replace(/#/g, "=");
        var sData = atob(base64);
        return JSON.parse(sData);
    },
    getFromStorage: function (key) {
        if (typeof localStorage === "undefined") {
            return;
        }
        
        return localStorage.getItem(key);
    },
    getFromCookie: function (key) {
        var cookie = document.cookie;
        if (!cookie) {
            return;
        }

        var decoded = decodeURIComponent(cookie);
        var ca = decoded.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            var keyValue = c.split("=");
            if (keyValue[0] == key) {
                return keyValue[1];
            }
        }
    },
    saveData: function (key, data) {
        var sData = JSON.stringify(data);
        var base64 = btoa(sData);
        var safeBase64 = base64.replace(/=/g, "#");

        if (this.useLocalStorage()) {
            this.putInStorage(key, safeBase64);
        }
        else {
            this.putInCookie(key, safeBase64);
        }
    },
    putInStorage: function (key, value) {
        if (typeof localStorage === "undefined") {
            return;
        }

        localStorage.setItem(key, value);
    },
    putInCookie: function (key, value) {
        var d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        var cookie = key + "=" + value + "; " + expires + "; path=/";
        document.cookie = cookie;
    },
    clearData: function (key) {
        if (this.useLocalStorage()) {
            this.removeFromStorage(key);
        }
        else {
            this.removeFromCookie(key);
        }
    },
    removeFromStorage: function (key) {
        if (typeof localStorage === "undefined") {
            return;
        }

        localStorage.removeItem(key);
    },
    removeFromCookie: function (key) {
        var d = new Date();
        d.setTime(d.getTime() - 1);
        var expires = "expires=" + d.toUTCString();
        var cookie = key + "=; " + expires + "; path=/";
        document.cookie = cookie;
    },
    prettifyDate: function(ticks) {
        var d = new Date(ticks);
        
        var hourNumber = d.getHours();
        var timeOfDay = "AM";
        if (hourNumber == 0) {
            hourNumber = 12;
        }
        else if (hourNumber > 11) {
            timeOfDay = "PM";
            if (hourNumber > 12) {
                hourNumber = hourNumber - 12;
            }
        }

        var year = d.getFullYear();
        var month = ("0" + (d.getMonth() + 1)).substr(-2);
        var day = ("0" + d.getDate()).substr(-2);
        var hour = ("0" + hourNumber).substr(-2);
        var minute = ("0" + d.getMinutes()).substr(-2);
        var second = ("0" + d.getSeconds()).substr(-2);
        //var milisecond = ("00" + d.getMilliseconds()).substr(-3);

        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second + " " + timeOfDay;
    },
    normalizeData: function(data) {
        if (!data) {
            return this.initializeData();
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
                job: "lee",
                room: 0
            });
        }
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

        if (game.data.version != latestVersion) {
            $("#versionInfoModal").modal("show");
        }

        return data;
    },
    initializeData: function() {
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
    }
};
game.data = null;
game.start = function () {
    if (game.updateInterval) {
        clearInterval(game.updateInterval);
        game.updateInterval = null;
    }

    game.data = game.util.initializeData();
    game.util.saveData("data", game.data);
    game.load();
};
game.load = function () {
    game.data = game.util.loadData("data");
    if (game.data) {
        game.data = game.util.normalizeData(game.data);

        game.setupSubjects();

        $("#chkAutosave").prop("checked", game.data.autosave);
        $("#lastSaved").html("last saved: <br/>" + game.util.prettifyDate(game.data.lastSaveTime));

        $("[data-page]").hide();
        $("[data-page='game']").show();
    }
    else {
        $("[data-page]").hide();
        $("[data-page='intro']").show();
    }
};
game.save = function () {
    if (!game.data) {
        return;
    }

    game.data.lastSaveTime = new Date().getTime();
    game.data.version = latestVersion;
    game.util.saveData("data", game.data);
    $("#lastSaved").html("last saved: <br/>" + game.util.prettifyDate(game.data.lastSaveTime));
};
game.doOver = function () {
    if (game.updateInterval) {
        clearInterval(game.updateInterval);
        game.updateInterval = null;
    }

    game.util.clearData("data");
    game.data = null;

    $("[data-page]").hide();
    $("[data-page='intro']").show();
};
game.setupSubjects = function() {
    $(".card[data-subject]").each(function() {
        var $card = $(this);
        var id = Number($card.attr("data-subject"));

        var isTickling = function() {
            $card.data("state", "tickled");
        };
        var ticklingStopped = function() {
            $card.data("state", "idle");
        };

        ticklingStopped();

        var data = game.data;
        if (!data) {
            return;
        }
        var subject = $(data.subjects || []).filter(function(i, el) {
                return el.id == id;
        }).get(0);
        if (!subject) {
            return;
        }

        var $name = $card.find("[data-stat='name']");
        var setName = function() {
            $name.text(subject.name);
        };
        setName();

        var $img = $card.find("[data-stat='state']");
        var updateImage = function() {
            var state = $card.data("state");
            var src = game.util.getSubjectImage(subject, state);
            if ($img && $img.attr("src") != src) {
                $img.attr(src);
            }    
        }
        updateImage();

        var $clickable = $card.find("[data-stat='clickable']");
        $clickable.on("dragstart", function () { return false; });
        $clickable.mousedown(isTickling);
        $clickable.mouseup(ticklingStopped);
        $clickable.mouseleave(ticklingStopped);

        var moveTickle = function() {
            var state = $card.data("state");
            if (state == "tickled") {
                var endurance = subject.endurance;
                var stamina = subject.stamina;
                var power = game.data.laffs.power;

                endurance.current = Math.max(0, endurance.current - power / 5);
                stamina.current = Math.max(0, stamina.current - power / 5);

                if (endurance.current <= 0 && stamina.current > 0) {
                    var laffs = game.data.laffs;
                    var earned = (subject.laffs + laffs.modifier) * laffs.factor / 5;
                    game.data.laffs.current += earned;
                }
            }
        }
        $clickable.mousemove(moveTickle);

        var clickTickle = function() {
            var endurance = subject.endurance;
            var stamina = subject.stamina;
            var power = game.data.laffs.power;

            endurance.current = Math.max(0, endurance.current - power);
            stamina.current = Math.max(0, stamina.current - power);

            if (endurance.current <= 0 && stamina.current > 0) {
                var laffs = game.data.laffs;
                var earned = (subject.laffs + laffs.modifier) * laffs.factor;
                game.data.laffs.current += earned;
            }
        }
        $clickable.click(clickTickle);
    });

    game.updateInterval = setInterval(function () {
        $("#fundsText").each(function() {
            var $text = $(this);
            var current = game.data.laffs.current;
            var pretty = game.util.prettifyNumber(current);
            $text.text(pretty);
        });

        $(".card[data-subject]").each(function() {
            var $card = $(this);
            var id = Number($card.attr("data-subject"));

            var data = game.data;
            if (!data) {
                return;
            }
            var subject = $(data.subjects || []).filter(function(i, el) {
                return el.id == id;
            }).get(0);
            if (!subject) {
                return;
            }

            var regen = function() {
                var state = $card.data("state");
                var endurance = subject.endurance;
                var stamina = subject.stamina;

                if (state == "idle") {
                    var stat = stamina.current < stamina.max ? stamina : endurance;
                    stat.current = Math.min(stat.max, stat.current + stat.regen);
                }

                var $enduranceBar = $card.find(".progress[data-stat='endurance'] .progress-bar");
                var $staminaBar = $card.find(".progress[data-stat='stamina'] .progress-bar");

                var updateBar = function($bar, stat) {
                    $bar.attr({
                        "aria-valuenow": stat.current,
                        "aria-valuemin": 0,
                        "aria-valuemax": stat.max
                    });
                    $bar.css("width", (stat.current / stat.max * 100).toFixed(3) + "%");
                };
                updateBar($enduranceBar, endurance);
                updateBar($staminaBar, stamina);
            };
            regen();
            
            var $img = $card.find("[data-stat='state']");
            var updateImage = function() {
                var state = $card.data("state");
                var src = game.util.getSubjectImage(subject, state);
                if (src && $img && $img.attr("src") != src) {
                    $img.attr("src", src);
                }    
            }
            updateImage();
        });
    }, 50);
};

$(function () {
    game.load();

    setInterval(function () {
        if (game.data && game.data.autosave) {
            game.save();
        }
    }, 1000 * 60 * 5);

    $("#chkAutosave").click(function () {
        if (!game.data) {
            return;
        }
        game.data.autosave = $(this).is(":checked");
    });

    $("#btnSave").click(function () {
        game.save();
    });

    $(window).on("beforeunload", function () {
        if (game.data && game.data.autosave) {
            game.save();
        }
    });
});
