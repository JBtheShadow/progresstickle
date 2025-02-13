class SaveData {
    static fromJson(json) {
        this.startTime = json.startTime || new Date().getTime();
        this.lastSaveTime = json.lastSaveTime || new Date().getTime();
        this.version = json.version || Version.latest;
        this.rooms = Room.listFromJson(json);
        this.subjects = Subject.listFromJson(json);
        this.upgrades = Upgrades.fromJson(json);
        this.settings = Settings.fromJson(json);
        this.currencies = Currencies.fromJson(json);
    }
}