(function() {
    var util = game.util = {};

    util.units = ["", "k", "M", "B", "T", "q", "Q", "s", "S", "O", "N", "d", "U", "D"];

    util.groupDigits = function(number) {
        var str = number.toFixed(0);
        return str.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    };

    util.prettifyNumber = function (number) {
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
    };

    util.prettifyDate = function(ticks) {
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

        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second + " " + timeOfDay;
    };
})();