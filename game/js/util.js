class Util {
    static units = ["", "k", "M", "B", "T", "q", "Q", "s", "S", "O", "N", "d", "U", "D"];

    static groupDigits(number) {
        var str = number.toFixed(0);
        return str.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }

    static prettifyNumber(number) {
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

        var sNum = num.toFixed(2).split(".");
        var integer = sNum[0];
        var decimal = `.${sNum[1]}`.replace(/0+$/g, "").replace(/\.$/g, "");
        return `${integer}${decimal}${Util.units[ind] || ""}`;
    }

    /**
     * Takes a number of milliseconds and formats it as a date
     * @param {Number} ticks Number in milliseconds
     * @returns {String} Date formatted as yyyy-MM-dd HH:mm:ss AM/PM
     */
    static prettifyDate(ticks) {
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

    /**
     * Capitalizes the first letter of a string
     * @param {string} text Text to capitalize
     * @returns {string} Capitalized text
     */
    static capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
}
