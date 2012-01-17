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
});