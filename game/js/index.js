$(function() {
    VersionHistory.writeVersion();
    Database.initializeStats();
    GameManager.initialize();
});