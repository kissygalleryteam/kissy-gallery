/**
 * Decorate ui effect to huabao.
 *
 * @author  fahai
 */
KISSY.add("huabao/ui", function (S, Switchable) {

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
    ui.decorate = function (uiType, huabao, config) {
        return _decorators[uiType](huabao, config);
    };

    /**
     * Add new decorator method.
     *
     * @param uiType
     * @param decorator
     */
    ui.add = function (uiType, decorator) {
        _decorators[uiType] = decorator;
    };

    ui.add("slide-content", function (huabao, config) {

        config = S.merge({
            panels: huabao.get("panels"),
            hasTriggers: false
        }, config);

        var newUI = new Slide(huabao.get("srcNode"), config);

        // default index init
        var defaultIndex = config.activeIndex || 0;
        huabao.set("activeIndex", defaultIndex);
        return newUI;
    });

    ui.add("carousel-nav", function (huabao, config) {

        config = S.merge({
            panels: huabao.get("triggers")
        }, config);

        var newUI = new Carousel(huabao.get("srcNode"), config);

        // default index init
        var defaultIndex = config.activeIndex || 0;
        huabao.set("pageIndex", defaultIndex);
        return newUI;
    });

    return ui;
}, {
    requires: ["switchable"]
});