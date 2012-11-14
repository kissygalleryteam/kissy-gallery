/**
 * @fileOverview switchable
 */
KISSY.add("gallery/switchable/1.0/index", function (S, Switchable, Accordion, Carousel, Slide, Tabs) {
    var re = {
        Accordion: Accordion,
        Carousel: Carousel,
        Slide: Slide,
        Tabs: Tabs
    };
    S.mix(Switchable, re);

    return Switchable;
}, {
    requires: [
        "gallery/switchable/1.0/base",
        "gallery/switchable/1.0/accordion/base",
        "gallery/switchable/1.0/carousel/base",
        "gallery/switchable/1.0/slide/base",
        "gallery/switchable/1.0/tabs/base",
        "gallery/switchable/1.0/lazyload",
        "gallery/switchable/1.0/effect",
        "gallery/switchable/1.0/circular",
        "gallery/switchable/1.0/carousel/aria",
        "gallery/switchable/1.0/autoplay",
        "gallery/switchable/1.0/aria",
        "gallery/switchable/1.0/tabs/aria",
        "gallery/switchable/1.0/accordion/aria"
    ]
});
