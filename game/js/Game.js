var Game = {};
Game.util = {
    units: ["", "k", "M", "B", "T", "q", "Q", "s", "S", "O", "N", "d", "U", "D"],
    groupDigits: function(number) {
        var str = number.toFixed(0);
        return str.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    },
    prettifyNumber: function (number) {
        var exp = number.toExponential(3);
        var power = Number(exp.split('e')[1]);
        var ind = power > 2 ? Math.floor((power - 2) / 3) : 0;

        if (ind >= this.units.length) {
            return exp;
        }

        var num = number;
        for (var i = 0; i < ind; i++) {
            num = num / 1000;
        }

        return this.groupDigits(num) + this.units[ind];
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
    }
};
Game.data = null;
Game.start = function () {
    Game.data = {};
    Game.data.startTime = new Date().getTime();
    Game.data.lastSaveTime = new Date().getTime();
    Game.data.autosave = true;
    Game.util.saveData("data", Game.data);
    $("#lastSaved").text("Game last saved on " + new Date(Game.data.lastSaveTime).toString());

    $("#chkAutosave").prop("checked", Game.data.autosave);
    $("[data-page]").hide();
    $("[data-page='game']").show();
};
Game.load = function () {
    Game.data = Game.util.loadData("data");
    if (Game.data) {
        // TODO - prepare data

        $("#chkAutosave").prop("checked", Game.data.autosave);
        $("#lastSaved").text("Game last saved on " + new Date(Game.data.lastSaveTime).toString());

        $("[data-page]").hide();
        $("[data-page='game']").show();
    }
};
Game.save = function () {
    if (!Game.data) {
        return;
    }

    Game.data.lastSaveTime = new Date().getTime();
    Game.util.saveData("data", Game.data);
    $("#lastSaved").text("Game last saved on " + new Date(Game.data.lastSaveTime).toString());
};
Game.doOver = function () {
    Game.util.clearData("data");
    Game.data = null;

    $("[data-page]").hide();
    $("[data-page='intro']").show();
};

$(function () {
    setInterval(function () {
        if (Game.data && Game.data.autosave) {
            Game.save();
        }
    }, 1000 * 60 * 5);

    $("#chkAutosave").click(function () {
        if (!Game.data) {
            return;
        }
        Game.data.autosave = $(this).is(":checked");
    });

    $("#btnSave").click(function () {
        Game.save();
    });

    Game.load();

    $(window).on("beforeunload", function () {
        if (Game.data && Game.data.autosave) {
            Game.save();
        }
    });
});
