/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/form/1.3/auth/msg/base', function (S, Base) {

    /**
     * msg cls
     * @type {String}
     */
    var AUTH_MSG_CLS = 'kf-msg';

    var Msg = function (srcNode, cfg) {
        var self = this;

        self._init(srcNode, cfg);

        Msg.superclass.constructor.call(self);
    };


    S.extend(Msg, Base, {
        /**
         * init msg
         * @param srcNode {htmlElement|String}
         * @param cfg {Object}
         * @private
         */
        _init:function (srcNode, cfg) {
            var self = this;
            self._el = S.one(srcNode);
            self.set('tpl', cfg.tpl);
            self.set('args', cfg.args);

            self._msgContainer = S.one('.' + AUTH_MSG_CLS, self._el.parent());

            if(!self._msgContainer) {
                self._msgContainer = S.one('<div class="' + AUTH_MSG_CLS +'" style="display: none"></div>');
                self._el.parent().append(self._msgContainer);
            }

        },
        hide:function () {
            this._msgContainer.hide();
        },
        show:function (o) {
            var self = this;
            o = S.merge(self.get('args'), o);

            S.buffer(function () {
                self._msgContainer.html(S.substitute(self.get('tpl'), o));
                self._msgContainer.show();
            }, 50)();
        }
    }, {
        ATTRS:{
            tpl:{
                value:''
            },
            args:{
                value:{}
            }
        }
    });

    return Msg;

}, {
    requires:[
        'base'
    ]
});