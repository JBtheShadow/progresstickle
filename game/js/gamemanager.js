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
        Storage.save(game.data);
        manager.load();
    };

    manager.load = function() {
        game.data = Storage.load();
        if (game.data) {
            game.data = game.db.normalizeGameData(game.data);

            if (game.data.version != VersionHistory.latest) {
                $("#versionInfoModal").modal("show");
            }

            manager.setup();

            $("#chkAutosave").prop("checked", game.data.autosave);
            $("#lastSaved").html("last saved: <br/>" + Util.prettifyDate(game.data.lastSaveTime));

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
            Storage.save(game.data);
            $("#lastSaved").html("last saved: <br/>" + Util.prettifyDate(game.data.lastSaveTime));
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

        Storage.delete();
        game.data = null;

        $("#testSubjects").html("");

        $("[data-page]").hide();
        $("[data-page='intro']").show();
    };

    manager.updateImage = function($card, subject) {
        var $img = $card.findByField(Fields.STATE);
        $img.removeClass().addClass(game.db.getSubjectImage(subject));
    }

    manager.setupSubjectCard = function($card, subject) {
        if (!$card || !subject) {
            return;
        }
        
        var $name = $card.findByField(Fields.NAME);
        $name.text(subject.name);

        manager.updateImage($card, subject);

        var $clickable = $card.findByField(Fields.CLICKABLE);
        $clickable.on("dragstart", function () {
            return false;
        });
        $clickable.mousedown(function () {
            if (subject.state == TickledStates.IDLE) {
                subject.state = TickledStates.TICKLED;
                subject.tickleDelay = 750;
            }
        });
        $clickable.mouseup(function () {
            if (subject.state == TickledStates.TICKLED) {
                subject.state = TickledStates.IDLE;
                subject.tickleDelay = 750;
            }
        });
        $clickable.mouseleave(function() {
            if (subject.state == TickledStates.TICKLED) {
                subject.state = TickledStates.IDLE;
                subject.tickleDelay = 750;
            }
        });

        var tickleSubject = function(multiplier) {
            multiplier = multiplier || 1;
            var endurance = subject.endurance;
            var stamina = subject.stamina;
            var power = game.data.laffs.power;

            endurance.current = Math.max(0, endurance.current - power * multiplier);
            stamina.current = Math.max(0, stamina.current - power * multiplier);

            if (endurance.current <= 0 && stamina.current > 0) {
                var laffs = game.data.laffs;
                var earned = (subject.laffs + laffs.modifier) * laffs.factor * multiplier;
                game.data.laffs.current += earned;
            }

            if (stamina.current <= 0) {
                subject.state = TickledStates.FAINTED;
            }
        };

        $clickable.mousemove(function() {
            if (subject.state == TickledStates.TICKLED) {
                tickleSubject(0.1);
            }
        });
        $clickable.click(function() {
            if (subject.state != TickledStates.FAINTED) {
                subject.tickleDelay = 750;
                tickleSubject();
            }
        });
    };

    manager.setupSubjects = function() {
        var $destination = $("#testSubjects");
        var $template = $("#templateSubject");

        for (subject of game.data.subjects) {
            var $card = $template.clone();
            $card.attr("data-subject", subject.id);
            $card.css("display", "");
            $card.findByField(Fields.NAME).text(subject.name);
            $card.findByField(Fields.VIEW_STATS).click(_ => manager.viewSubject(subject.id));

            $destination.append($card);

            subject.state = TickledStates.IDLE;
            subject.tickleDelay = 0;

            manager.setupSubjectCard($card, subject);
        }
    };

    manager.setupInterval = function() {
        this.updateInterval = setInterval(function() {
            $("#fundsText").each(function(i, el) {
                var $text = $(el);
                var current = game.data.laffs.current;
                var pretty = Util.prettifyNumber(current);
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

                if (subject.state != TickledStates.TICKLED && subject.autostate != TickledStates.TICKLED) {
                    var stat = stamina.current < stamina.max ? stamina : endurance;
                    stat.current = Math.min(stat.max, stat.current + stat.regen);

                    if (subject.state == TickledStates.FAINTED && stamina.current == stamina.max && endurance.current == endurance.max) {
                        subject.state = TickledStates.IDLE;
                    }
                }

                var $enduranceBar = $card.findByField(Fields.ENDURANCE).find(".progress-bar");
                var $staminaBar = $card.findByField(Fields.STAMINA).find(".progress-bar");

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

        $modal.findByField(Fields.PROFILE).removeClass().addClass(game.db.getSubjectProfile(subject));

        $modal.findByField(Fields.ID).text(subject.id);
        $modal.findByField(Fields.NAME).text(subject.name);
        $modal.findByField(Fields.SPECIES).text(Util.capitalize(subject.species));

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
                if (stat2 == Fields.MAX && typeof subject[stat1].current !== "undefined") {
                    subject[stat1].current += upgrade.nextValue - value;
                }
            }
            else {
                subject[stat] = upgrade.nextValue;
            }
        };

        var updateStats = function() {
            $modal.findByField(Fields.ENDURANCE_MAX).text(subject.endurance.max);
            $modal.findByField(Fields.ENDURANCE_REGEN).text(subject.endurance.regen);
            $modal.findByField(Fields.STAMINA_MAX).text(subject.stamina.max);
            $modal.findByField(Fields.STAMINA_REGEN).text(subject.stamina.regen);
            $modal.findByField(Fields.LAFFS).text(subject.laffs);
            $modal.findByField(Fields.POWER).text(subject.power);
        
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

                var diffText = Util.prettifyNumber(upgrade.diff);
                if (stat == Fields.ENDURANCE_REGEN || stat == Fields.STAMINA_REGEN || stat == Fields.POWER) {
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

                var costText = Util.prettifyNumber(upgrade.cost);

                $btn.text("+" + diffText + "/" + costText + " laffs");
            });
        };
        updateStats();

        var nature = game.db.getNature(subject);
        $modal.findByField(Fields.NATURE).text(nature);

        $modal.modal("show");
    };

    $(function() {
        manager.initialize();
    });
})();
