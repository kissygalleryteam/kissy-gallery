/**
 * Model Pic.
 *
 * @author  fahai
 */
KISSY.add("huabao/model/pic", function (S, Base) {

    function Pic(config) {
        config = this.parse(config);
        this.constructor.superclass.constructor.call(this, config);
        this.set("rawData", config);
    }

    S.extend(Pic, Base, {
        /**
         * Data-source adaptor. This method can be override to customise.
         * It parses huabao detail data by default.
         *
         * @param dataSource
         */
        parse: function (dataSource) {
            return {
                id: dataSource.picId,
                picUrl: dataSource.picSrc,
                width: dataSource.picSize[0] - 0,
                height: dataSource.picSize[1] - 0,
                desc: dataSource.picDesc
            };
        }
    }, {});

    Pic.ATTRS = {
        id: {
            value: 0
        },
        picUrl: {
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
        createDate: {
            value: "2000-01-01 00:00:00"
        },
        modifiedDate: {
            value: "2000-01-01 00:00:00"
        },
        rawData: {
            value: null
        }
    };

    return Pic;

}, {
    requires: ["base"]
});