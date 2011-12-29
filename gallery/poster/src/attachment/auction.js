/**
 * Model Auction.
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
        }
    };

    return Auction;

}, {
    requires: ["huabao/attachment"]
});