class VersionHistory {
    static history = [
        new Version("v0.3.1", "2025-02-07", [
            "Fixed a deeper bug discovered by the earlier exploit fix where subjects didn't start with a state set, messing with the tickling"
        ]),
        new Version("v0.3.0.0-dev", "2025-02-07", [
            "Reworked on upgrade costs to follow a geometric curve",
            "Changed upgrade logic to consider set upgrade amounts rather than fixing the new amount to 1.7x the previous one",
            "Reworked stats to pull from database + upgrades instead of directly from raw stats on the subjects",
            "Fixed an exploit when refreshing the page while a subject was fainted removed the fainted status",
            "Changed Util.prettifyNumber to allow printing with decimals, too"
        ]),
        new Version("v0.2.0.0-dev", "2025-02-07", [
            "Migrated game-manager.js to class notation",
            "Made changes to the subjects and rooms dropdownlists to actually pull from the save data",
            "Changed some terms, like job is now role",
            "Now showing the subject role upon viewing stats",
            "Fixed a bug with Util.capitalize returning undefined",
            "Changed script loading order",
            "Renamed game.js to index.js",
            "All variables are now within their own respective classes",
            "TODO: rethink stat purchases/upgrades",
            "TODO: rethink reaction images (endurance thresholds vs stamina thresholds)"
        ]),
        new Version("v0.1.0.13-dev", "2025-02-06", [
            "Migrating database.js to class notation",
            "TODO: break a few more objets from POJOs to classes, maybe"
        ]),
        new Version("v0.1.0.12-dev", "2025-02-06", [
            "Investigating type hint annotations for source code",
            "Removed ease animation on progress bars for more accurate display of health"
        ]),
        new Version("v0.1.0.11-dev", "2025-02-06", [
            "Fixed bug where stats were no longer viewable since changing the first subject id from 0 to 1",
            "Id 0 was hardcoded in the template, changed that"
        ]),
        new Version("v0.1.0.10-dev", "2025-02-06", [
            "Renamed datamanager to storage and migrated it to class notation",
            "Fixed an image loading bug, species wasn't being set on new game",
            "TODO: tweak with reaction expression logic to better match some name changes",
            "Expressions themselves could be animated too",
            "TODO: algo gotta fix a bug when stamina recovers faster than it can be drained"
        ]),
        new Version("v0.1.0.9-dev", "2025-02-05", [
            "Created \"enums\" to hold certain constants to minimize typing errors",
            "Removed field \"image\" from subject data as for now the species field alone should suffice"
        ]),
        new Version("v0.1.0.8-dev", "2025-02-05", [
            "Fixed an exploit from restarting a run multiple times without refreshing the page"
        ]),
        new Version("v0.1.0.7-dev", "2025-02-05", [
            "Rebalanced laffs awarded from dragging your mouse over subjects to half of what it was granting before",
            "TODO: Might have to actually look into some kind of delta time calculation here instead"
        ]),
        new Version("v0.1.0.6-dev", "2025-02-05", [
            "Rewrote util into a class",
            "Replaced calls to substr with slice"
        ]),
        new Version("v0.1.0.5-dev", "2025-02-03", [
            "Rewrote version history to use class notation"
        ]),
        new Version("v0.1.0.4-dev", "2025-02-03", [
            "Changed image logic to rely on css classes instead of editing the source directly",
            "This could be useful later for animations via css"
        ]),
        new Version("v0.1.0.3-dev", "2025-02-03", [
            "Moved external libraries to a separate /libs folder"
        ]),
        new Version("v0.1.0.2-dev", "2018-10-14", [
            "Basic stat screen! Now you can check David's stats and even spend laffs to improve them!"
        ]),
        new Version("v0.1.0.1-dev", "2018-10-13", [
            "Code was broken down on different files by function",
            "Changed data management to always use localStorage if available, else attempts with cookies; it might make the game work with IE and Edge even if opened locally",
            "Added fainting as a mechanic: now if you tickle your subjects too much they'll faint and you'll have to wait until both their stamina and endurance recover before you can tickle them again",
            "Added a short delay for the animation to change from tickled to idle; hopefully it makes the animation more pleasing (and also make it work better on mobile)"
        ]),
        new Version("v0.1.0.0-dev", "2018-10-12", [
            "Brought David back! (the demonling used for testing)",
            "Somewhat playable version! (Finally! :D)",
            "Initial version of endurance + stamina bars working",
            "Both endurance and stamina drain from tickling, but laffs are only earned when endurance is down",
            "If stamina hits zero you can't earn anymore laffs until it's recovered a little bit",
            "When idle stamina recovers first, then endurance",
            "Need to implement another state for 'fainted' where no laffs are earned whatsoever until both bars are back to full",
            "Need a means to boost how many laffs you gain per click, or the amount of helpers you can have, or how many of them are earning extra laffs for you by tickling their peers, or all that other good stuff"
        ]),
        new Version("v0.0.0.7-dev", "2018-10-12", [
            "Added code to detect if save is from different version, show version history if it is",
            "Added a crude validation if some of the data is missing (data saved on prior versions) to give it some default values",
            "Added placeholder buttons for subjects and rooms"
        ]),
        new Version("v0.0.0.6-dev", "2018-10-12", [
            "Moved toolbar buttons to the top right corner",
            "Moved auto-save and last save timestamp to dropdown menu (looks slightly off but uses less of the screen so is fine)",
            "Changed last save timestamp's format",
            "Changed big numbers format to show three digits and a decimal at most instead of 5 digits",
            "Fixed bug game would display big numbers with rounding instead of truncating (e.g. 3,299 should show as 3.2k instead of 3.3k)"
        ]),
        new Version("v0.0.0.5-dev", "2018-10-11", [
            "Learned how to use Git and VSCode to clone a repository",
            "Uploaded these to GitHub"
        ]),
        new Version("v0.0.0.4-dev", "2018-10-10", [
            "Did more with data management",
            "Technically \"game\" now saves, loads and clears data",
            "(Even though currently there's barely any data to really save)",
            "Moved version history tracking to separate file",
            "Looked into potential size limits of cookies vs. local storage"
        ]),
        new Version("v0.0.0.3-dev", "2018-10-09", [
            "Layout change, using Bootstrap and JQuery",
            "Figured how to save and load data using cookies and local storage",
            "Has yet to create a \"playable\" version"
        ]),
        new Version("v0.0.0.2-dev", "2018-10-06", [
            "Figured how to make progress bars",
            "Sample subject for clicking/tickling",
            "Figured how to change image based on progress"
        ]),
        new Version("v0.0.0.1-dev", "2018-10-01", [
            "Initial idea",
            "Code for writing big numbers as slightly more human-readable"
        ])
    ];
    static latest = VersionHistory.history[0].version;

    static writeVersion() {
        $("#latestVersion").text(VersionHistory.latest);

        var $versionUl = $("<ul>").appendTo("#versionHistoryList");
    
        $(VersionHistory.history).each(function (i, el) {
            var $versionLi = $("<li>").appendTo($versionUl);
            $versionLi.text(el.version + " (" + el.date + ")");
    
            var $changesUl = $("<ul>").appendTo($versionLi);
            $(el.changes).each(function (i2, el2) {
                var $changesLi = $("<li>").appendTo($changesUl);
                $changesLi.text(el2);
            });
        });
    }
}
