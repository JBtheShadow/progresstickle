var game = {};
game.util = {
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
        return integer + decimal + this.units[ind];
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
    }
};
game.data = null;
game.start = function () {
    game.data = {};
    game.data.startTime = new Date().getTime();
    game.data.lastSaveTime = new Date().getTime();
    game.data.autosave = true;
    game.util.saveData("data", game.data);
    $("#lastSaved").html("last saved: <br/>" + game.util.prettifyDate(game.data.lastSaveTime));

    $("#chkAutosave").prop("checked", game.data.autosave);
    $("[data-page]").hide();
    $("[data-page='game']").show();
};
game.load = function () {
    game.data = game.util.loadData("data");
    if (game.data) {
        // TODO - prepare data

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
    game.util.saveData("data", game.data);
    $("#lastSaved").html("last saved: <br/>" + game.util.prettifyDate(game.data.lastSaveTime));
};
game.doOver = function () {
    game.util.clearData("data");
    game.data = null;

    $("[data-page]").hide();
    $("[data-page='intro']").show();
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
