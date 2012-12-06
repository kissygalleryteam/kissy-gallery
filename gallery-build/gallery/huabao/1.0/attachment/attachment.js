/**
 * Interface Attachment.
 * TODO
 *
 * @author  fahai
 */
KISSY.add("huabao/attachment", function (S, Base) {

    function Attachment(config) {
        this.constructor.superclass.constructor.call(this, config);
    }

    S.extend(Attachment, Base);

    Attachment.ATTRS = {
        picId: {
            value: 0
        }
    };

    return Attachment;

}, {
    requires: ["base"]
});
