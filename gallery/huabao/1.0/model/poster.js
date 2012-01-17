/**
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
});