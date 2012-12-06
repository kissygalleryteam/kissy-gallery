/**
 * Model Pic.
 *
 * @author  fahai
 */
KISSY.add("gallery/huabao/1.0/model/pic", function (S, Base) {

    function Pic(config) {
        config = this.parse(config);
        this.constructor.superclass.constructor.call(this, config);
        this.set("rawData", config);
    }

    S.extend(Pic, Base, {
        /**
         * Data-source adaptor. This method can be override to customise.
         *
         * @param dataSource
         */
        parse: function (dataSource) {
            return dataSource;
        }
    }, {});

    Pic.ATTRS = {
        id: {
            value: 0
        },
        picSrc: {
            value: ""
        },
        width: {
            value: 0
        },
        height: {
            value: 0
        },
        desc: {
            value: ""
        },
        tags: {
            value: []
        },
        rawData: {
            value: null
        }
    };

    return Pic;

}, {
    requires: ["base"]
});/**
 * Model Poster.
 *
 * @author  fahai
 */
KISSY.add("gallery/huabao/1.0/model/poster", function (S, Base) {

    /**
     * @constructor Poster
     * @param config
     */
    function Poster(config) {
        config = this.parse(config);
        this.constructor.superclass.constructor.call(this, config);
        this.set("rawData", config);
    }

    S.extend(Poster, Base, {
        /**
         * Data-source adaptor. This method can be override to customise.
         *
         * @param dataSource
         */
        parse: function (dataSource) {
            return  dataSource;
        }
    }, {});

    Poster.ATTRS = {
        id: {
            value: 0
        },
        title: {
            value: ""
        },
        shortTitle: {
            value: ""
        },
        tags: {
            value: []
        },
        weight: {
            value: 0
        },
        coverPicSrc: {
            value: ""
        },
        channelId: {
            value: 0
        },
        hits: {
            value: 0
        },
        rawData: {
            value: null
        }
    };

    return Poster;

}, {
    requires: ["base"]
});/**
 * @fileOverview    Huabao.
 * @desc            Huabao widget, the interface wrapper.
 * @author          fahai<fahai@taobao.com>
 */
KISSY.add("gallery/huabao/1.0/huabao", function (S, DOM, Base, Template, Poster, Pic) {

    var CLS_PREFIX = "ks-huabao-";

    var TEMPLATE = {
        CONTENT: '{{#each pics as pic}}' +
                '<li>' +
                '<img src="{{pic.picSrc}}" width="{{pic.width}}" height="{{pic.height}}">' +
                '</li>' +
                '{{/each}}',
        NAV: '{{#each pics as pic}}' +
                '<li>' +
                '<img src="{{pic.picSrc}}_100x100.jpg"' +
                '</li>' +
                '{{/each}}'
    };

    var body = S.get("body");

    /**
     * The Huabao widget.
     *
     * @constructor
     * @param container {HTMLElement}   Element container of the huabao.
     * @param config    {Object}        The config object, part of huabao attributes.
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
         *
         * @return  {Boolean}   Whether data-binding is successful.
         */
        bindData: function () {

            var data = this.get("dataSource"),
                    poster,
                    pics = [];

            // In this method, the data structure is fixed, not flexible...
            // like { poster: {}, pics: [] }
            poster = new Poster(data.poster);
            S.each(data.pics, function (pic) {
                pics.push(new Pic(pic));
            }, undefined);

            return this.set("data", {
                poster: poster,
                pics: pics
            });
        },
        /**
         * Alias for rendering.
         *
         * @param container {HTMLElement}   The container to render templates.
         * @param template  {String}        Template with format in kissy template.
         * @return          {String}        Rendered template.
         */
        render: function (container, template) {

            var data = this.get("rawData"),
                    output;

            // attach a current pic raw data
            data.pic = data.pics[this.get("activeIndex")];

            output = Template(template).render(data);
            DOM.html(container, output);
            return output;
        },

        /**
         * Alias for getting model poster.
         *
         * @return  {Poster}    The model poster.
         */
        getPoster: function () {
            return this.get("data").poster;
        },
        /**
         * Alias for getting model pics.
         *
         * @return  {Array.<Pic>}   The collection of model pic.
         */
        getPics: function () {
            return this.get("data").pics;
        },
        /**
         * Alias for getting model pic by id.
         *
         * @param id    {Number}    The pic id.
         * @return      {Pic}       The model pic.
         */
        getPic: function (id) {
            var pics = this.getPics();
            for (var i = 0, l = pics.length; i < l; i++) {
                var pic = pics[i];
                if (pic.get("id") == id) {
                    return pic;
                }
            }
            return null;
        },

        /**
         * Alias for setting activeIndex.
         *
         * @param index {Number}    The wanted active index.
         */
        switchTo: function (index) {
            this.set("activeIndex", index);
        },
        /**
         * Alias for setting activeIndex - next index.
         */
        prev: function () {
            this.set("activeIndex", -1 + this.get("activeIndex"));
        },
        /**
         * Alias for setting activeIndex - previous index.
         */
        next: function () {
            this.set("activeIndex", 1 + this.get("activeIndex"));
        },
        /**
         * Alias for setting pageIndex.
         *
         * @param index {Number}    The wanted page index.
         */
        pageTo: function (index) {
            this.set("pageIndex", index);
        },

        prevPage: function () {
            this.set("pageIndex", -1 + this.get("pageIndex"));
        },
        nextPage: function () {
            this.set("pageIndex", 1 + this.get("pageIndex"));
        }
    }, {
        /**
         * Img element onload handler.
         *
         * @param img       {HTMLImageElement}
         * @param callback  {Function}
         * @static
         */
        attachImgOnload: function(img, callback) {

            if ((img && img.complete && img.clientWidth)) {
                callback();
                return;
            }
            img.onload = function () {
                setTimeout(callback, 100);
            }
        },
        model: {
            Poster: Poster,
            Pic: Pic
        }
    });

    Huabao.ATTRS = {
        /**
         * Whether bind data while new an instance.
         *
         * @property autoDataBinding
         */
        autoDataBinding: {
            value: true
        },
        /**
         * Whether render while new an instance.
         *
         * @property autoRendering
         */
        autoRendering: {
            value: false
        },

        /**
         * This is where data from.
         *
         * @property dataSource
         */
        dataSource: {
            value: null
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
         * @property model
         */
        data: {
            value: {
                poster: null,
                pics: []
            }
        },
        /**
         * Plain json of this model object.
         *
         * @property rawData
         */
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
        },

        /**
         * Container node of huabao, body by default.
         *
         * @property srcNode
         */
        srcNode: {
            value: body
        },
        /**
         * Class of nav pics' container node.
         *
         * @property navCls
         */
        navCls: {
            value: CLS_PREFIX + "nav"
        },
        /**
         * Class of content pics' container node.
         *
         * @property contentCls
         */
        contentCls: {
            value: CLS_PREFIX + "content"
        },
        /**
         * Container node of nav pics.
         *
         * @property nav
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
         * @property content
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
         * @property triggerCls
         */
        triggerCls: {
            value: CLS_PREFIX + "trigger"
        },
        /**
         * Class of content pic node.
         *
         * @property panelCls
         */
        panelCls: {
            value: CLS_PREFIX + "panel"
        },
        /**
         * Nodes of nav pics.
         *
         * @property triggers
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
         * @property panels
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

        /**
         * Index of current highlight pic, used for switchable, etc.
         *
         * @property activeIndex
         */
        activeIndex: {
            value: -1,
            setter: function (v) {
                var i = this.get("length") - 1;
                v = v - 0;
                return (v < 0) ? 0 : (v > i ? i : v);
            },
            validator: function (v) {
                var i = this.get("length") - 1,
                        prev = this.get("activeIndex");
                v = v - 0;
                return !((v < 0 && prev == 0) || (v > i && prev == i));
            }
        },
        /**
         * Index of current nav page, used for switchable, etc.
         *
         * @property pageIndex
         */
        pageIndex: {
            value: -1,
            setter: function (v) {
                var i = this.get("pageLength") - 1;
                v = v - 0;
                return (v < 0) ? 0 : (v > i ? i : v);
            },
            validator: function (v) {
                var i = this.get("pageLength") - 1,
                        prev = this.get("pageIndex");
                v = v - 0;
                return !((v < 0 && prev == 0) || (v > i && prev == i));
            }
        },
        /**
         * Length of pics.
         *
         * @property length
         */
        length: {
            getter: function () {
                return this.get("data").pics.length;
            }
        },
        /**
         * Page size.
         *
         * @property pageSize
         */
        pageSize: {
            value: 1
        },
        /**
         * Page length.
         *
         * @property pageNum
         */
        pageLength: {
            getter: function () {
                return Math.ceil(this.get("length") / this.get("pageSize"));
            }
        }
    };

    return Huabao;
}, {
    requires: [
        "dom",
        "base",
        "template",
        "./model/poster",
        "./model/pic"
    ]
});
/**
 * @fileOverview    Huabao.
 * @desc            Facade for gallery huabao.
 * @author          fahai<fahai@taobao.com>
 */
KISSY.add("gallery/huabao/1.0/index",function(S, Huabao){
    return Huabao;
}, {
    requires:["./huabao"]
});
