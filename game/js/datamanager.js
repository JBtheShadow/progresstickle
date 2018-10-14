(function() {
    var manager = game.dataManager = {};

    manager.useLocalStorage = function() {
        return typeof localStorage !== "undefined";
    };
    
    manager.load = function(key) {
        var safeBase64 = this.loadFromCookie(key);
        
        // Start using local storage, preferably, if it exists
        // Some save data may have been saved in cookies before so move that data to storage
        if (this.useLocalStorage()) {
            if (safeBase64) {
                this.saveInStorage(key, safeBase64);
                this.deleteFromCookie(key);
            }
            else {
                safeBase64 = this.loadFromStorage(key);
            }
        }

        if (!safeBase64) {
            return;
        }

        if (!safeBase64) {
            return;
        }

        var base64 = safeBase64.replace(/#/g, "=");
        var sData = atob(base64);
        return JSON.parse(sData);
    };

    manager.loadFromStorage = function(key) {
        if (typeof localStorage === "undefined") {
            return;
        }
        
        return localStorage.getItem(key);
    };

    manager.loadFromCookie = function(key) {
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
    };

    manager.save = function(key, data) {
        var sData = JSON.stringify(data);
        var base64 = btoa(sData);
        var safeBase64 = base64.replace(/=/g, "#");

        if (this.useLocalStorage()) {
            this.saveInStorage(key, safeBase64);
        }
        else {
            this.saveInCookie(key, safeBase64);
        }
    };

    manager.saveInStorage = function(key, value) {
        if (typeof localStorage === "undefined") {
            return;
        }

        localStorage.setItem(key, value);
    };

    manager.saveInCookie = function(key, value) {
        var d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        var cookie = key + "=" + value + "; " + expires + "; path=/";
        document.cookie = cookie;
    };

    manager.delete = function(key) {
        if (this.useLocalStorage()) {
            this.deleteFromStorage(key);
        }
        else {
            this.deleteFromCookie(key);
        }
    };

    manager.deleteFromStorage = function(key) {
        if (typeof localStorage === "undefined") {
            return;
        }

        localStorage.removeItem(key);
    };

    manager.deleteFromCookie = function(key) {
        var d = new Date();
        d.setTime(d.getTime() - 1);
        var expires = "expires=" + d.toUTCString();
        var cookie = key + "=; " + expires + "; path=/";
        document.cookie = cookie;
    };
})();
