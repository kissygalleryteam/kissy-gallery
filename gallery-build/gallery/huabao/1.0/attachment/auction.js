/**
 * Model Auction.
 * TODO
 *
 * @author  fahai
 */
KISSY.add("huabao/attachment/auction", function (S, Attachment) {

    function Auction(config) {
        this.constructor.superclass.constructor.call(this, config);
    }

    S.extend(Auction, Attachment);

    Auction.ATTRS = {
        id: {
            value: 0
        },
        picId: {
            value: 0
        },
        itemId: {
            value: 0
        },
        itemOwnerId: {
            value: 0
        },
        xy: {
            value: [0, 0]
        },
        status: {
            value: 0
        },
        title: {
            value: ""
        },
        desc: {
            value: ""
        },
        picSrc: {
            value: ""
        },
        link: {
            value: ""
        },
        price: {
            value: 0.0
        },
        huabaoPrice: {
            value: 0.0
        },
        saleVolumn: {
            value: 0
        },
        views: {
            value: 0
        },
        rawData: {
            value: null
        }
    };

    return Auction;

}, {
    requires: ["huabao/attachment"]
});
