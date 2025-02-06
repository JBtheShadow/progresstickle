class Storage {
    static key = "data";

    static useLocalStorage() {
        return typeof localStorage !== "undefined";
    }

    static load() {
        var safeBase64 = Storage.loadFromCookie(Storage.key);
        
        // Start using local storage, preferably, if it exists
        // Some save data may have been saved in cookies before so move that data to storage
        if (Storage.useLocalStorage()) {
            if (safeBase64) {
                Storage.saveInStorage(Storage.key, safeBase64);
                Storage.deleteFromCookie(Storage.key);
            }
            else {
                safeBase64 = Storage.loadFromStorage(Storage.key);
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
    }

    static loadFromStorage(key) {
        if (typeof localStorage === "undefined") {
            return;
        }
        
        return localStorage.getItem(key);
    }

    static loadFromCookie(key) {
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
    }

    static save(data) {
        var sData = JSON.stringify(data);
        var base64 = btoa(sData);
        var safeBase64 = base64.replace(/=/g, "#");

        if (Storage.useLocalStorage()) {
            Storage.saveInStorage(Storage.key, safeBase64);
        }
        else {
            Storage.saveInCookie(Storage.key, safeBase64);
        }
    }

    static saveInStorage(key, value) {
        if (typeof localStorage === "undefined") {
            return;
        }

        localStorage.setItem(key, value);
    }

    static saveInCookie(key, value) {
        var d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        var cookie = key + "=" + value + "; " + expires + "; path=/";
        document.cookie = cookie;
    }

    static delete() {
        if (Storage.useLocalStorage()) {
            Storage.deleteFromStorage(Storage.key);
        }
        else {
            Storage.deleteFromCookie(Storage.key);
        }
    }

    static deleteFromStorage = function(key) {
        if (typeof localStorage === "undefined") {
            return;
        }

        localStorage.removeItem(key);
    };

    static deleteFromCookie = function(key) {
        var d = new Date();
        d.setTime(d.getTime() - 1);
        var expires = "expires=" + d.toUTCString();
        var cookie = key + "=; " + expires + "; path=/";
        document.cookie = cookie;
    };
}
