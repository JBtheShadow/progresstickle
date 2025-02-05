class Util {
    static units = ["", "k", "M", "B", "T", "q", "Q", "s", "S", "O", "N", "d", "U", "D"];

    static groupDigits = function(number) {
        var str = number.toFixed(0);
        return str.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }

    static prettifyNumber = function(number) {
        var exp = number.toExponential(3);
        var power = Number(exp.split('e')[1]);
        var ind = Math.floor(power / 3);

        if (ind >= Util.units.length) {
            return exp;
        }

        var num = number;
        for (var i = 0; i < ind; i++) {
            num = num / 1000;
        }

        var sNum = num.toString().split(".");
        var integer = sNum[0];
        var decimal = ("." + ((sNum[1] || "")[0] || "0")).replace(".0", "");
        return integer + (Util.units[ind] ? decimal + Util.units[ind] : "");
    }

    static prettifyDate = function(ticks) {
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
        var month = ("0" + (d.getMonth() + 1)).slice(-2);
        var day = ("0" + d.getDate()).slice(-2);
        var hour = ("0" + hourNumber).slice(-2);
        var minute = ("0" + d.getMinutes()).slice(-2);
        var second = ("0" + d.getSeconds()).slice(-2);

        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second + " " + timeOfDay;
    };
}
