﻿var latestVersion = "v0.0.0.6-dev";
var versionHistory = [
    {
        version: "v0.0.0.6-dev",
        date: "2018-10-12",
        changes: [
            "Moved toolbar buttons to the top right corner",
            "Moved auto-save and last save timestamp to dropdown menu (looks slightly off but uses less of the screen so is fine)",
            "Changed last save timestamp's format",
            "Changed big numbers format to show three digits and a decimal at most instead of 5 digits",
            "Fixed bug game would display big numbers with rounding instead of truncating (e.g. 3,299 should show as 3.2k instead of 3.3k)"
        ]
    },
    {
        version: "v0.0.0.5-dev",
        date: "2018-10-11",
        changes: [
            "Learned how to use Git and VSCode to clone a repository",
            "Uploaded these to GitHub"
        ]
    },
    {
        version: "v0.0.0.4-dev",
        date: "2018-10-10",
        changes: [
            "Did more with data management",
            "Technically \"game\" now saves, loads and clears data",
            "(Even though currently there's barely any data to really save)",
            "Moved version history tracking to separate file",
            "Looked into potential size limits of cookies vs. local storage"
        ]
    },
    {
        version: "v0.0.0.3-dev",
        date: "2018-10-09",
        changes: [
            "Layout change, using Bootstrap and JQuery",
            "Figured how to save and load data using cookies and local storage",
            "Has yet to create a \"playable\" version"
        ]
    },
    {
        version: "v0.0.0.2-dev",
        date: "2018-10-06",
        changes: [
            "Figured how to make progress bars",
            "Sample subject for clicking/tickling",
            "Figured how to change image based on progress"
        ]
    },
    {
        version: "v0.0.0.1-dev",
        date: "2018-10-01",
        changes: [
            "Initial idea",
            "Code for writing big numbers as slightly more human-readable"
        ]
    }
];

(function () {
    $("#latestVersion").text(latestVersion);

    var $versionUl = $("<ul>").appendTo("#versionHistoryList");

    $(versionHistory).each(function (i, el) {
        var $versionLi = $("<li>").appendTo($versionUl);
        $versionLi.text(el.version + " (" + el.date + ")");

        var $changesUl = $("<ul>").appendTo($versionLi);
        $(el.changes).each(function (i2, el2) {
            var $changesLi = $("<li>").appendTo($changesUl);
            $changesLi.text(el2);
        });
    });
})();
