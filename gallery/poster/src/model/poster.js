/**
 * Model Poster.
 *
 * @author  fahai
 */
KISSY.add("huabao/model/poster", function (S, Base) {

    function Poster(config) {
        config = this.parse(config);
        this.constructor.superclass.constructor.call(this, config);
        this.set("rawData", config);
    }

    S.extend(Poster, Base, {
        /**
         * Data-source adaptor. This method can be override to customise.
         * It parses huabao detail data by default.
         *
         * @param dataSource
         */
        parse: function (dataSource) {
            return  {
                id: dataSource.posterId,
                title: dataSource.title,
                shortTitle: dataSource.shortTitle,
                tags: dataSource.tags,
                coverPicUrl: dataSource.coverPicPath
            };
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
        coverPicUrl: {
            value: ""
        },
        channelId: {
            value: 0
        },
        hits: {
            value: 0
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

    return Poster;

}, {
    requires: ["base"]
});