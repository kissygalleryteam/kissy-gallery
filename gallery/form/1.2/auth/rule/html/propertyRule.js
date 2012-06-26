/**
 * @fileoverview 基于html属性的规则抽象类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/form/1.2/auth/rule/html/propertyRule', function(S, BaseRule, Utils, undefined) {

    /**
     * 属性规则
     *
     * @param {String} ruleName
     * @param {Function} ruleBody
     * @param {Object} rule params and msg
     * @constructor
     */
    var ProPertyRule = function() {
        var self = this;
        var args = [].slice.call(arguments);
        if(!args.length) {
            S.log('please use a name to define property');
            return;
        }
        self._name = args[0];
        var cfg = args[2]||{args:[]};

        self._initArgs = cfg.args;
        //_propertyValue和_el如果要修改必须通过属性的修改
        self._propertyValue = cfg.propertyValue;
        self._el = cfg.el;
        ProPertyRule.superclass.constructor.apply(self, args.slice(1));
    };

    S.extend(ProPertyRule, BaseRule, /** @lends BaseRule.prototype*/{
        validate:function () {
            var self = this;
            if(S.isUndefined(arguments[0])) {
                return ProPertyRule.superclass.validate.apply(this, [self._propertyValue, Utils.getValue(self._el)].concat(self._initArgs));
            } else {
                //bugfix for no args input
                var args = [].slice.call(arguments);
                //一旦传入过值之后，表示复写初始化的参数
                self._initArgs = args;
                //将属性的value作为第一个参数传进去，将当前元素的值当成第二个参数传入
                return ProPertyRule.superclass.validate.apply(this, [self._propertyValue, Utils.getValue(self._el)].concat(args));
            }
        }
    });

    return ProPertyRule;
}, {
    requires:[
        '../base',
        '../../utils'
    ]
});