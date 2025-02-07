class GameManager {
    static autoSaveTime = 1000 * 60 * 5;
    static updateTime = 50;
    static updateHandle = null;

    static clearUpdateHandle() {
        if (GameManager.updateHandle) {
            clearInterval(GameManager.updateHandle);
            GameManager.updateHandle = null;
        }
    }

    static start() {
        GameManager.clearUpdateHandle();
        Storage.initialize();
        GameManager.load();
    }

    static load() {
        Storage.load();
        if (Storage.data) {
            if (Storage.data.version != VersionHistory.latest) {
                $("#versionInfoModal").modal("show");
            }

            GameManager.setup();

            $("#chkAutoSave").prop("checked", Storage.data.autoSave);
            $("#lastSaved").html("last saved: <br/>" + Util.prettifyDate(Storage.data.lastSaveTime));

            $("[data-page]").hide();
            $("[data-page='game']").show();
        }
        else {
            $("[data-page]").hide();
            $("[data-page='intro']").show();
        }
    };

    static save() {
        if (Storage.data) {
            Storage.data.lastSaveTime = new Date().getTime();
            Storage.data.version = VersionHistory.latest;
            Storage.save();
            $("#lastSaved").html("last saved: <br/>" + Util.prettifyDate(Storage.data.lastSaveTime));
        }
    };

    static autoSave() {
        if (Storage.data && Storage.data.autoSave) {
            Storage.save();
        }
    };

    static doOver() {
        GameManager.clearUpdateHandle();
        Storage.delete();

        $("#testSubjects").html("");

        $("[data-page]").hide();
        $("[data-page='intro']").show();
    };

    static updateImage($card, subject) {
        var $img = $card.findByField(Fields.STATE);
        $img.removeClass().addClass(Database.getSubjectImage(subject));
    }

    static setupSubjectCard($card, subject) {
        if (!$card || !subject) {
            return;
        }
        
        var $name = $card.findByField(Fields.NAME);
        $name.text(subject.name);

        GameManager.updateImage($card, subject);

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
            var power = Storage.data.laffs.power;

            subject.endurance = Math.max(0, subject.endurance - power * multiplier);
            subject.stamina = Math.max(0, subject.stamina - power * multiplier);

            var speciesStats = Database.stats[subject.species];
            var subjectLaffs = speciesStats.laffs + subject.upgrades.laffs * Database.costs.laffs.unit;

            if (subject.endurance <= 0 && subject.stamina > 0) {
                var laffs = Storage.data.laffs;
                var earned = (subjectLaffs + laffs.modifier) * laffs.factor * multiplier;
                Storage.data.laffs.current += earned;
            }

            if (subject.stamina <= 0) {
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

    static setupSubjects() {
        var $destination = $("#testSubjects");
        var $template = $("#templateSubject");

        var $ddlSubjects = $("#ddlSubjects").empty();
        for (var subject of Storage.data.subjects) {
            var $card = $template.clone();
            $card.attr("data-subject", subject.id);
            $card.css("display", "");
            $card.findByField(Fields.NAME).text(subject.name);
            $card.findByField(Fields.VIEW_STATS).click(_ => GameManager.viewSubject(subject.id));

            $destination.append($card);

            $("<a/>").addClass("dropdown-item").text(`#${subject.id}: ${subject.name}`)
                .click(_ => GameManager.viewSubject(subject.id)).appendTo($ddlSubjects);

            GameManager.setupSubjectCard($card, subject);
        }
    };

    static setupRooms() {
        var $ddlRooms = $("#ddlRooms").empty();
        for (var room of Storage.data.rooms) {
            $("<a/>").addClass("dropdown-item").text(`#${room.id}: ${room.name} (${Util.capitalize(room.type)})`)
                .click(_ => $("#roomInfoModal").modal("show")).appendTo($ddlRooms);
        }
    }

    static setupUpdate() {
        GameManager.updateHandle = setInterval(function() {
            $("#fundsText").each(function(i, el) {
                var $text = $(el);
                var current = Storage.data.laffs.current;
                var pretty = Util.prettifyNumber(current);
                $text.text(pretty);
            });

            $(".btn-upgrade[data-cost]").each(function(i, el) {
                var $btn = $(el);
                var cost = Number($btn.attr("data-cost"));
                if (cost > Storage.data.laffs.current) {
                    $btn.addClass("disabled");
                }
                else {
                    $btn.removeClass("disabled");
                }
            });

            $(".card[data-subject]").each(function() {
                var $card = $(this);
                var id = Number($card.attr("data-subject"));
    
                var data = Storage.data;
                if (!data) {
                    return;
                }
                var subject = $(data.subjects || []).filter(function(i, el) {
                    return el.id == id;
                }).get(0);
                if (!subject) {
                    return;
                }

                var speciesStats = Database.stats[subject.species];
                var staminaMax = speciesStats.stamina.max + subject.upgrades.stamina.max * Database.costs.stamina.max.unit;
                var staminaRegen = speciesStats.stamina.regen + subject.upgrades.stamina.regen * Database.costs.stamina.regen.unit;
                var enduranceMax = speciesStats.endurance.max;
                var enduranceRegen = speciesStats.endurance.regen;

                if (subject.state != TickledStates.TICKLED && subject.autostate != TickledStates.TICKLED) {
                    if (subject.stamina < staminaMax) {
                        subject.stamina = Math.min(staminaMax, subject.stamina + staminaRegen);
                    } else {
                        subject.endurance = Math.min(enduranceMax, subject.endurance + enduranceRegen);
                    }

                    if (subject.state == TickledStates.FAINTED && subject.stamina == staminaMax && subject.endurance == enduranceMax) {
                        subject.state = TickledStates.IDLE;
                    }
                }

                var $enduranceBar = $card.findByField(Fields.ENDURANCE).find(".progress-bar");
                var $staminaBar = $card.findByField(Fields.STAMINA).find(".progress-bar");

                var updateBar = function($bar, current, max) {
                    $bar.attr({
                        "aria-valuenow": current,
                        "aria-valuemin": 0,
                        "aria-valuemax": max
                    });
                    $bar.css("width", (current / max * 100).toFixed(3) + "%");
                };
                updateBar($enduranceBar, subject.endurance, enduranceMax);
                updateBar($staminaBar, subject.stamina, staminaMax);

                subject.tickleDelay = Math.max(0, subject.tickleDelay - GameManager.updateTime);

                GameManager.updateImage($card, subject);
            });
        }, this.updateTime);
    };

    static setup() {
        GameManager.setupSubjects();
        GameManager.setupRooms();
        GameManager.setupUpdate();
    }

    static initialize() {
        GameManager.load();

        setInterval(function() {
            GameManager.autoSave();
        }, GameManager.autoSaveTime);

        $("#chkAutoSave").click(function() {
            if (Storage.data) {
                Storage.data.autoSave = $(this).is(":checked");
            }
        });

        $("#btnSave").click(function() {
            GameManager.save();
        });

        $(window).on("beforeunload", function() {
            GameManager.autoSave();
        });
    };

    static viewSubject(id) {
        id = Number(id);

        var data = Storage.data;
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

        $modal.findByField(Fields.PROFILE).removeClass().addClass(Database.getSubjectProfile(subject));

        $modal.findByField(Fields.ID).text(subject.id);
        $modal.findByField(Fields.NAME).text(subject.name);
        $modal.findByField(Fields.SPECIES).text(Util.capitalize(subject.species));
        $modal.findByField(Fields.ROLE).text(Util.capitalize(subject.role));

        var buyUpgrade = function(stat, amount) {
            var currUpgrades = 0;
            if (stat.indexOf(".") > -1) {
                var aux = stat.split(".");
                var stat1 = aux[0];
                var stat2 = aux[1];
                currUpgrades = subject.upgrades[stat1][stat2];
            }
            else {
                currUpgrades = subject.upgrades[stat];
            }

            var purchase = Database.getStatUpgrade(stat, currUpgrades, amount);
            if (purchase.cost > Storage.data.laffs.current)
                return;

            Storage.data.laffs.current -= purchase.cost;

            if (stat.indexOf(".") > -1) {
                var aux = stat.split(".");
                var stat1 = aux[0];
                var stat2 = aux[1];
                subject.upgrades[stat1][stat2] += amount;
                if (stat2 == Fields.MAX && typeof subject[stat1] === "number") {
                    subject[stat1] += Database.costs[stat1].max.unit * amount;
                }
            }
            else {
                subject.upgrades[stat] += amount;
            }
        };

        var updateStats = function() {
            var speciesStats = Database.stats[subject.species];
            
            var enduranceMax = speciesStats.endurance.max;
            $modal.findByField(Fields.ENDURANCE_MAX).text(enduranceMax);

            var enduranceRegen = speciesStats.endurance.regen;
            $modal.findByField(Fields.ENDURANCE_REGEN).text(enduranceRegen);

            var staminaMax = speciesStats.stamina.max + subject.upgrades.stamina.max * Database.costs.stamina.max.unit;
            $modal.findByField(Fields.STAMINA_MAX).text(staminaMax);

            var staminaRegen = speciesStats.stamina.regen + subject.upgrades.stamina.regen * Database.costs.stamina.regen.unit;
            $modal.findByField(Fields.STAMINA_REGEN).text(staminaRegen);

            var laffs = speciesStats.laffs + subject.upgrades.laffs * Database.costs.laffs.unit;
            $modal.findByField(Fields.LAFFS).text(laffs);

            var power = speciesStats.power + subject.upgrades.power * Database.costs.power.unit;
            $modal.findByField(Fields.POWER).text(power);
        
            $modal.find(".btn-multiplier").each(function(i, el) {
                var $btn = $(el);
                var amount = $btn.attr("data-amount");
                amount = Number(amount) || "max";

                $btn.removeClass("btn-primary btn-secondary")
                    .addClass(amount == Storage.data.choices.subjectMultiplier ? "btn-primary" : "btn-secondary")
                    .off("click").click(function() {
                        Storage.data.choices.subjectMultiplier = amount;
                        GameManager.viewSubject(id);
                    });
            });

            $modal.find("[data-target-stat]").each(function(i, el) {
                var $btn = $(el);
                var stat = $btn.attr("data-target-stat");

                var currUpgrades = 0;
                if (stat.indexOf(".") > -1) {
                    var aux = stat.split(".");
                    var stat1 = aux[0];
                    var stat2 = aux[1];
                    currUpgrades = subject.upgrades[stat1][stat2];
                }
                else {
                    currUpgrades = subject.upgrades[stat];
                }

                var amount = Storage.data.choices.subjectMultiplier;
                if (amount == "max") {
                    amount = Database.getMaxAmount(stat, currUpgrades);
                }

                $btn.off("click").click(function() {
                    if ($(this).is(".disabled")) {
                        return;
                    }
                    buyUpgrade(stat, amount);
                    updateStats();
                });

                var upgrade = Database.getStatUpgrade(stat, currUpgrades, amount);

                if (upgrade.cost > Storage.data.laffs.current) {
                    $btn.removeClass("btn-primary");
                    $btn.addClass("btn-secondary disabled");
                }
                else {
                    $btn.removeClass("btn-secondary disabled");
                    $btn.addClass("btn-primary");
                }

                var diffText = Util.prettifyNumber(upgrade.diff);
                var costText = Util.prettifyNumber(upgrade.cost);

                $btn.text("+" + diffText + " for " + costText + " laffs");
            });
        };
        updateStats();

        var nature = Database.getNature(subject);
        $modal.findByField(Fields.NATURE).text(nature);

        $modal.modal("show");
    };
}
