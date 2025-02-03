(function() {
    var manager = game.gameManager = {};

    manager.autosaveTime = 1000 * 60 * 5;
    manager.updateTime = 50;
    manager.updateInterval = null;

    manager.start = function() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        game.data = game.db.initializeGameData();
        game.dataManager.save("data", game.data);
        manager.load();
    };

    manager.load = function() {
        game.data = game.dataManager.load("data");
        if (game.data) {
            game.data = game.db.normalizeGameData(game.data);

            if (game.data.version != VersionHistory.latest) {
                $("#versionInfoModal").modal("show");
            }

            manager.setup();

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

    manager.save = function() {
        if (game.data) {
            game.data.lastSaveTime = new Date().getTime();
            game.data.version = VersionHistory.latest;
            game.dataManager.save("data", game.data);
            $("#lastSaved").html("last saved: <br/>" + game.util.prettifyDate(game.data.lastSaveTime));
        }
    };

    manager.autosave = function() {
        if (game.data && game.data.autosave) {
            manager.save();
        }
    };

    manager.doOver = function() {
        if (manager.updateInterval) {
            clearInterval(manager.updateInterval);
            manager.updateInterval = null;
        }

        game.dataManager.delete("data");
        game.data = null;

        $("[data-page]").hide();
        $("[data-page='intro']").show();
    };

    manager.updateImage = function($card, subject) {
        var $img = $card.find("[data-stat='state']");
        $img.removeClass().addClass(game.db.getSubjectImage(subject));
    }

    manager.setupSubjectCard = function($card, subject) {
        if (!$card || !subject) {
            return;
        }
        
        var $name = $card.find("[data-stat='name']");
        $name.text(subject.name);

        manager.updateImage($card, subject);

        var $clickable = $card.find("[data-stat='clickable']");
        $clickable.on("dragstart", function () {
            return false;
        });
        $clickable.mousedown(function () {
            if (subject.state == "idle") {
                subject.state = "tickled";
                subject.tickleDelay = 750;
            }
        });
        $clickable.mouseup(function () {
            if (subject.state == "tickled") {
                subject.state = "idle";
                subject.tickleDelay = 750;
            }
        });
        $clickable.mouseleave(function() {
            if (subject.state == "tickled") {
                subject.state = "idle";
                subject.tickleDelay = 750;
            }
        });
        $clickable.mousemove(function() {
            if (subject.state == "tickled") {
                var endurance = subject.endurance;
                var stamina = subject.stamina;
                var power = game.data.laffs.power;

                endurance.current = Math.max(0, endurance.current - power / 5);
                stamina.current = Math.max(0, stamina.current - power / 5);

                if (endurance.current <= 0 && stamina.current > 0) {
                    var laffs = game.data.laffs;
                    var earned = (subject.laffs + laffs.modifier) * laffs.factor / 5;
                    game.data.laffs.current += earned;
                }

                if (stamina.current <= 0) {
                    subject.state = "fainted";
                }
            }
        });
        $clickable.click(function() {
            if (subject.state != "fainted") {
                subject.tickleDelay = 750;

                var endurance = subject.endurance;
                var stamina = subject.stamina;
                var power = game.data.laffs.power;
                
                endurance.current = Math.max(0, endurance.current - power);
                stamina.current = Math.max(0, stamina.current - power);
                
                if (endurance.current <= 0 && stamina.current > 0) {
                    var laffs = game.data.laffs;
                    var earned = (subject.laffs + laffs.modifier) * laffs.factor;
                    game.data.laffs.current += earned;
                }
                
                if (stamina.current <= 0) {
                    subject.state = "fainted";
                }
            }
        });
    };

    manager.setupSubjects = function() {
        $(".card[data-subject]").each(function(i, el) {
            var $card = $(el);
            var id = Number($card.attr("data-subject"));

            var data = game.data;
            if (!data) {
                return;
            }
            var subject = $(data.subjects || []).filter(function(i, el) {
                return el.id == id;
            }).get(0);
            if (!subject) {
                return;
            }
            subject.state = "idle";
            subject.tickleDelay = 0;

            manager.setupSubjectCard($card, subject);
        });
    };

    manager.setupInterval = function() {
        this.updateInterval = setInterval(function() {
            $("#fundsText").each(function(i, el) {
                var $text = $(el);
                var current = game.data.laffs.current;
                var pretty = game.util.prettifyNumber(current);
                $text.text(pretty);
            });

            $(".btn-upgrade[data-cost]").each(function(i, el) {
                var $btn = $(el);
                var cost = Number($btn.attr("data-cost"));
                if (cost > game.data.laffs.current) {
                    $btn.addClass("disabled");
                }
                else {
                    $btn.removeClass("disabled");
                }
            });

            $(".card[data-subject]").each(function() {
                var $card = $(this);
                var id = Number($card.attr("data-subject"));
    
                var data = game.data;
                if (!data) {
                    return;
                }
                var subject = $(data.subjects || []).filter(function(i, el) {
                    return el.id == id;
                }).get(0);
                if (!subject) {
                    return;
                }
    
                var endurance = subject.endurance;
                var stamina = subject.stamina;

                if (subject.state != "tickled" && subject.autostate != "tickled") {
                    var stat = stamina.current < stamina.max ? stamina : endurance;
                    stat.current = Math.min(stat.max, stat.current + stat.regen);

                    if (subject.state == "fainted" && stamina.current == stamina.max && endurance.current == endurance.max) {
                        subject.state = "idle";
                    }
                }

                var $enduranceBar = $card.find(".progress[data-stat='endurance'] .progress-bar");
                var $staminaBar = $card.find(".progress[data-stat='stamina'] .progress-bar");

                var updateBar = function($bar, stat) {
                    $bar.attr({
                        "aria-valuenow": stat.current,
                        "aria-valuemin": 0,
                        "aria-valuemax": stat.max
                    });
                    $bar.css("width", (stat.current / stat.max * 100).toFixed(3) + "%");
                };
                updateBar($enduranceBar, endurance);
                updateBar($staminaBar, stamina);

                subject.tickleDelay = Math.max(0, subject.tickleDelay - manager.updateTime);

                manager.updateImage($card, subject);
            });
        }, this.updateTime);
    };

    manager.setup = function() {
        this.setupSubjects();
        this.setupInterval();
    }

    manager.initialize = function() {
        manager.load();

        setInterval(function() {
            manager.autosave();
        }, manager.autosaveTime);

        $("#chkAutosave").click(function() {
            if (game.data) {
                game.data.autosave = $(this).is(":checked");
            }
        });

        $("#btnSave").click(function() {
            manager.save();
        });

        $(window).on("beforeunload", function() {
            manager.autosave();
        });
    };

    manager.viewSubject = function(id) {
        id = Number(id);

        var data = game.data;
        if (!data) {
            return;
        }
        var subject = $(data.subjects || []).filter(function(i, el) {
            return el.id == id;
        }).get(0);
        if (!subject) {
            return;
        }

        var $modal = $("#subjectInfoModal");

        $modal.find("[data-stat='profile']").removeClass().addClass(game.db.getSubjectProfile(subject));

        $modal.find("[data-stat='id']").text(subject.id);
        $modal.find("[data-stat='name']").text(subject.name);
        $modal.find("[data-stat='species']").text(subject.species);

        var buyUpgrade = function(stat) {
            var value = 0;
            if (stat.indexOf(".") > -1) {
                var aux = stat.split(".");
                var stat1 = aux[0];
                var stat2 = aux[1];
                value = subject[stat1][stat2];
            }
            else {
                value = subject[stat];
            }

            var upgrade = game.db.getStatUpgrade(stat, value);
            game.data.laffs.current = Math.max(0, game.data.laffs.current - upgrade.cost);
            if (stat.indexOf(".") > -1) {
                var aux = stat.split(".");
                var stat1 = aux[0];
                var stat2 = aux[1];
                subject[stat1][stat2] = upgrade.nextValue;
            }
            else {
                subject[stat] = upgrade.nextValue;
            }
        };

        var updateStats = function() {
            $modal.find("[data-stat='endurance.max']").text(subject.endurance.max);
            $modal.find("[data-stat='endurance.regen']").text(subject.endurance.regen);
            $modal.find("[data-stat='stamina.max']").text(subject.stamina.max);
            $modal.find("[data-stat='stamina.regen']").text(subject.stamina.regen);
            $modal.find("[data-stat='laffs']").text(subject.laffs);
            $modal.find("[data-stat='power']").text(subject.power);
        
            $modal.find("[data-target-stat]").each(function(i, el) {
                var $btn = $(el);
                var stat = $btn.attr("data-target-stat");

                $btn.off("click").click(function() {
                    if ($(this).is(".disabled")) {
                        return;
                    }
                    buyUpgrade(stat);
                    updateStats();
                });

                var value = 0;
                if (stat.indexOf(".") > -1) {
                    var aux = stat.split(".");
                    var stat1 = aux[0];
                    var stat2 = aux[1];
                    value = subject[stat1][stat2];
                }
                else {
                    value = subject[stat];
                }

                var upgrade = game.db.getStatUpgrade(stat, value);

                $btn.attr("data-cost", upgrade.cost);

                if (upgrade.cost > game.data.laffs.current) {
                    $btn.addClass("disabled");
                }
                else {
                    $btn.removeClass("disabled");
                }

                var diffText = game.util.prettifyNumber(upgrade.diff);
                if (stat == "endurance.regen" || stat == "stamina.regen" || stat == "power") {
                    if (upgrade.diff < 10) {
                        diffText = upgrade.diff.toString();
                    }
                    else if (upgrade.diff < 100) {
                        var aux = upgrade.diff.toString().split(".");
                        diffText = aux[0] + (aux[1] ? "." + aux[1][0] : "");
                    }
                    else if (upgrade.diff < 1000) {
                        var aux = upgrade.diff.toString().split(".");
                        diffText = aux[0];
                    }
                }

                var costText = game.util.prettifyNumber(upgrade.cost);

                $btn.text("+" + diffText + "/" + costText + " laffs");
            });
        };
        updateStats();

        var nature = game.db.getNature(subject);
        $modal.find("[data-stat='nature']").text(nature);

        $modal.modal("show");
    };

    $(function() {
        manager.initialize();
    });
})();
