$(function () {
    //$("#btnViewHelpers").click(function () {
    //    $("#helpers").slideToggle();
    //});

    //$("#btnViewSlots").click(function () {
    //    $("#slots").slideToggle();
    //});

    //var $test = $("#test_character");
    //$test.data({
    //    state: "idle",
    //    stamina: {
    //        max: 20,
    //        current: 20,
    //        stages: [
    //            { at: 1, when: "idle", src: "img/lil demon - idle.png" },
    //            { at: 1, when: "tickled", src: "img/lil demon - wink.png" },
    //            { min: 0.75, max: 1, when: "idle", src: "img/lil demon - smile.png" },
    //            { min: 0.75, max: 1, when: "tickled", src: "img/lil demon - wink.png" },
    //            { min: 0.5, max: 0.75, when: "idle", src: "img/lil demon - smile.png" },
    //            { min: 0.5, max: 0.75, when: "tickled", src: "img/lil demon - grin.png" },
    //            { min: 0.25, max: 0.5, when: "idle", src: "img/lil demon - open mouth.png" },
    //            { min: 0.25, max: 0.5, when: "tickled", src: "img/lil demon - grin.png" },
    //            { min: 0, max: 0.25, when: "idle", src: "img/lil demon - laugh 2.png" },
    //            { min: 0, max: 0.25, when: "tickled", src: "img/lil demon - laugh.png" }
    //        ]
    //    }
    //}).on("dragstart", function () {
    //    return false;
    //}).mousedown(function () {
    //    $test.data("state", "tickled");
    //}).mouseup(function () {
    //    $test.data("state", "idle");
    //}).mouseleave(function () {
    //    $test.data("state", "idle");
    //}).mousemove(function () {
    //    var state = $test.data("state");
    //    if (state == "tickled") {
    //        var stamina = $test.data("stamina");
    //        stamina.current = Math.max(0, stamina.current - 0.02);
    //        $test.data("stamina", stamina);
    //    }
    //}).click(function () {
    //    var stamina = $test.data("stamina");
    //    stamina.current = Math.max(0, stamina.current - 0.1);
    //    $test.data("stamina", stamina);
    //});

    //setInterval(function () {
    //    var character = $("#test_character");
    //    var state = character.data("state");
    //    var stamina = character.data("stamina");
    //    var img = character.find("img");

    //    if (state == "idle") {
    //        stamina.current = Math.min(stamina.max, stamina.current + 0.01);
    //        character.data("stamina", stamina);
    //    }

    //    var stage = stamina.stages.filter(function (el, i, arr) {
    //        var perc = stamina.current / stamina.max;
    //        return state == el.when && (perc == el.at || perc >= el.min && perc < el.max);
    //    })[0];

    //    if (stage) {
    //        img.attr("src", stage.src);
    //    }

    //    var progress = $("#stamina_test_character")[0];
    //    progress.max = stamina.max;
    //    progress.value = stamina.current;
    //}, 50);
});
