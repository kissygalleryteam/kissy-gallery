/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/form/1.1/auth/msg/base', function (S, Base) {
    var Msg = function (cfg) {
        var self = this;

        self._init(cfg);

        Msg.superclass.constructor.call(self);
    };


    S.extend(Msg, Base, {
        _init:function (cfg) {

        }
    }, {
        ATTRS:{
            tpl:{
                value:''
            }
        }
    });
}, {
    requires:[
        'base'
    ]
});