/**
 * Decorate huabao-detail ui effect to a Huabao instance.
 *
 * @author  fahai
 */
KISSY.add("gallery/huabao/1.0/ui/detail", function (S, Switchable, DOM, Event) {

    var Slide = Switchable.Slide,
            Carousel = Switchable.Carousel;

    var ui = {},
            _decorators = {};

    /**
     * A specific decorate method for given ui-type.
     *
     * @param uiType
     * @param huabao
     * @param config
     */
    ui.decorate = function (huabao, config) {
        var target = config.target || "content";

        return _decorators[target](huabao, config);
    };

    /**
     * Add new decorator method.
     *
     * @param target
     * @param decorator
     */
    ui.add = function (target, decorator) {
        _decorators[target] = decorator;
    };

    ui.add("content", function (huabao, config) {

        config = S.merge({
            panels: huabao.get("panels"),
            activeIndex: 0,
            activeTriggerCls: "ks-active",
            hasTriggers: false,
            prevBtnCls: "ks-switchable-prev-btn",
            nextBtnCls: "ks-switchable-next-btn"
        }, config);

        var slide = new Slide(huabao.get("srcNode"), config);

        // actions by default
        huabao.on("afterActiveIndexChange", function (e) {
            var i = e.newVal,
                    prevI = e.prevVal;

            S.log("activeIndex: " + prevI + " -> " + i);

            // switch to the index
            slide.switchTo(i);

            // activate selected item
            DOM.removeClass(huabao.get("triggers")[prevI], config.activeTriggerCls);
            DOM.addClass(huabao.get("triggers")[i], config.activeTriggerCls);
        });

        // additional ui event
        var prevBtn = S.get("." + config.prevBtnCls, huabao.get("srcNode")),
                nextBtn = S.get("." + config.nextBtnCls, huabao.get("srcNode"));
        prevBtn && Event.on(prevBtn, "click", function () {
            huabao.prev();
        });
        nextBtn && Event.on(nextBtn, "click", function () {
            huabao.next();
        });

        // default index init
        huabao.set("activeIndex", config.activeIndex);

        return slide;
    });

    ui.add("nav", function (huabao, config) {

        config = S.merge({
            panels: huabao.get("triggers"),
            steps: 1,
            activeIndex: 0
        }, config);

        var carousel = new Carousel(huabao.get("srcNode"), config);

        // actions by default
        huabao.on("afterPageIndexChange", function (e) {
            var i = e.newVal,
                    prevI = e.prevVal;

            S.log("pageIndex: " + prevI + " -> " + i);

            // switch to the page
            carousel.switchTo(i);
        });

        // additional ui event
        var prevBtn = S.get("." + config.prevBtnCls, huabao.get("srcNode")),
                nextBtn = S.get("." + config.nextBtnCls, huabao.get("srcNode"));
        prevBtn && Event.detach(prevBtn) && Event.on(prevBtn, "click", function() {
            huabao.prevPage();
        });
        nextBtn && Event.detach(nextBtn) && Event.on(nextBtn, "click", function() {
            huabao.nextPage();
        });

        carousel.on("itemSelected", function (e) {
            var target = e.item;

            var i = 0;
            while (target = DOM.prev(target)) {
                i++;
            }
            huabao.switchTo(i);
        });

        // page size init
        huabao.set("pageSize", config.steps);

        // default index init
        huabao.set("pageIndex", config.activeIndex);

        return carousel;
    });

    return ui;
}, {
    requires: ["switchable", "dom", "event"]
});
