/**
 * Huabao widget, the interface wrapper.
 *
 * @author  fahai
 */
KISSY.add("huabao", function (S, DOM, Base, Template, Poster, Pic, ui) {

    var CLS_PREFIX = "ks-huabao-";

    var TEMPLATE = {
        CONTENT: '{{#each pics as pic}}' +
                '<li>' +
                '<img src="{{pic.picUrl}}" width="{{pic.width}}" height="{{pic.height}}">' +
                '</li>' +
                '{{/each}}',
        NAV: '{{#each pics as pic}}' +
                '<li>' +
                '<img src="{{pic.picUrl}}_100x100.jpg"' +
                '</li>' +
                '{{/each}}'
    };

    var body = S.get("body");

    /**
     * The Poster widget.
     *
     * @constructor
     * @param container {HTMLElement}
     * @param config    {Object}
     */
    function Huabao(container, config) {

        // dirty-and-quick overload
        switch (arguments.length) {
            case 2:
                config = S.merge(config, { srcNode: S.get(container) });
                break;
            case 1:
                config = container;
                break;
            default:
                break;
        }

        this.constructor.superclass.constructor.call(this, config);

        // auto data-binding
        this.get("autoDataBinding") && this.bindData();

        // auto rendering
        if (this.get("autoRendering")) {
            var content = this.get("content"),
                    nav = this.get("nav");
            content && this.render(content, TEMPLATE.CONTENT);
            nav && this.render(nav, TEMPLATE.NAV);
        }
    }

    S.extend(Huabao, Base, {

        /**
         * Bind data for poster and pics. They'll be attached to the "model" attr.
         */
        bindData: function () {

            var data = this.get("dataSource"),
                    poster,
                    pics = [];

            // In this method, the data structure is fixed, not flexible...
            poster = new Poster(data.poster);
            S.each(data.pics, function (pic) {
                pics.push(new Pic(pic));
            }, undefined);

            this.set("model", {
                poster: poster,
                pics: pics
            });
        },
        /**
         * Alias for rendering.
         *
         * @param container
         * @param template
         */
        render: function (container, template) {

            var data = this.get("rawData"),
                    output;

            // attach a current pic raw data
            data.pic = data.pics[this.get("activeIndex")];

            output = Template(template).render(data);
            DOM.html(container, output);
        },
        /**
         * Decorate ui to huabao.
         *
         * @param uiType
         * @param config
         */
        decorate: function (uiType, config) {
            return ui.decorate(uiType, this, config);
        },
        /**
         * Alias for getting model poster.
         */
        getPoster: function () {
            return this.get("model").poster;
        },
        /**
         * Alias for getting model pics.
         */
        getPics: function () {
            return this.get("model").pics;
        },
        /**
         * Alias for getting model pic by id.
         *
         * @param id
         */
        getPic: function (id) {
            var pics = this.getPics();
            for (var i = 0, l = pics.length; i < l; i++) {
                var pic = pics[i];
                if (pic.get("id") == id) {
                    return pic;
                }
            }
        },
        switchTo: function (index) {
            this.set("activeIndex", index);
        },
        prev: function () {
            this.set("activeIndex", -1 + this.get("activeIndex"));
        },
        next: function () {
            this.set("activeIndex", 1 + this.get("activeIndex"));
        }
    }, {
        /**
         * Add new custom decorator.
         *
         * @static
         * @param uiType
         * @param decorator
         */
        addDecorator: function (uiType, decorator) {
            ui.add(uiType, decorator);
        }
    });

    Huabao.ATTRS = {
        autoDataBinding: {
            value: true
        },
        autoRendering: {
            value: false
        },
        autoDecorating: {
            value: false
        },
        /**
         * TODO
         */
        dataSource: {
            value: undefined
        },

        /**
         * Reference to specific models.
         * The format is like:
         * <code>
         * {
         *     poster: new Poster,
         *     pics: [new Pic]
         * }
         * </code>
         *
         * @property    model
         */
        model: {
            value: {}
        },

        /**
         * Index of current highlight pic, used for switchable, etc.
         *
         * @property    activeIndex
         */
        activeIndex: {
            value: -1,
            valueFn: function () {
                // TODO
            },
            setter: function (v) {
                var length = this.get("length"), v = v - 0;
                return (v < 0) ? 0 : (v > length ? length : v);
            }
        },
        /**
         * Index of current nav page, used for switchable, etc.
         *
         * @property    pageIndex
         */
        pageIndex: {
            value: -1
        },
        /**
         * Length of pics.
         *
         * @property    length
         */
        length: {
            valueFn: function () {
                // TODO
            }
        },

        /**
         * Container node of huabao, body by default.
         *
         * @property    srcNode
         */
        srcNode: {
            value: body
        },
        /**
         * Class of nav pics' container node.
         *
         * @property    navCls
         */
        navCls: {
            value: CLS_PREFIX + "nav"
        },
        /**
         * Class of content pics' container node.
         *
         * @property    contentCls
         */
        contentCls: {
            value: CLS_PREFIX + "content"
        },
        /**
         * Container node of nav pics.
         *
         * @property    nav
         */
        nav: {
            valueFn: function () {
                var container = this.get("srcNode");
                return S.get("." + this.get("navCls"), container);
            }
        },
        /**
         * Container node of content pics.
         *
         * @property    content
         */
        content: {
            valueFn: function () {
                var container = this.get("srcNode");
                return S.get("." + this.get("contentCls"), container);
            }
        },
        /**
         * Class of nav pic node.
         *
         * @property    triggerCls
         */
        triggerCls: {
            value: CLS_PREFIX + "trigger"
        },
        /**
         * Class of content pic node.
         *
         * @property    panelCls
         */
        panelCls: {
            value: CLS_PREFIX + "panel"
        },
        /**
         * Nodes of nav pics.
         *
         * @property    triggers
         */
        triggers: {
            value: [],
            getter: function () {
                var container = this.get("srcNode"),
                        nav = this.get("nav"),
                        triggers;
                triggers = S.query("." + this.get("triggerCls"), container);
                if ((!triggers || triggers.length <= 0) && (nav && nav !== null)) {
                    triggers = DOM.children(nav);
                }
                return triggers;
            }
        },
        /**
         * Nodes of content panels.
         *
         * @property    panels
         */
        panels: {
            value: [],
            getter: function () {
                var container = this.get("srcNode"),
                        content = this.get("content"),
                        panels;
                panels = S.query("." + this.get("panelCls"), container);
                if ((!panels || panels.length <= 0) && (content && content !== null)) {
                    panels = DOM.children(content);
                }
                return panels;
            }
        },

        rawData: {
            valueFn: function () {
                var posterData = this.getPoster().get("rawData"),
                        picsData = [];
                S.each(this.getPics(), function (pic) {
                    picsData.push(pic.get("rawData"));
                }, undefined);

                return {
                    poster: posterData,
                    pics: picsData
                };
            }
        }
    };

    return S.Huabao = Huabao;
}, {
    requires: [
        "dom",
        "base",
        "template",
        "huabao/model/poster",
        "huabao/model/pic",
        "huabao/ui"
    ]
});
