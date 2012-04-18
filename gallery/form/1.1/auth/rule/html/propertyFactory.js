/**
 * @fileoverview html 属性规则工厂
 * @author 张挺 <zhangting@taobao.com>
 *
 */
KISSY.add(function (S, Base, PropertyRule, undefined) {
    var RuleFactory = function () {
        var self = this;
        RuleFactory.superclass.constructor.call(self);
    };

    //第一个参数一定是属性的value，后面的才是真正的参数
    S.mix(RuleFactory, {
        required:function (pv, value) {
            return !!value;
        },
        pattern:function (pv, value) {
            return new RegExp(pv).test(value);
        },
        max:function (pv, value) {
            if (!S.isNumber(value)) {
                return false;
            }
            return value <= pv;
        },
        min:function (pv, value) {
            if (!S.isNumber(value)) {
                return false;
            }
            return value >= pv;
        },
        step:function (pv, value) {
            if (!S.isNumber(value)) {
                return false;
            }
            if(value == 0 || pv == 1) return true;

            return value % pv;
        },
        //添加1个特殊的属性
        equalTo:function(pv, value){
            //number same
            if (S.isNumber(value)) {
                return pv === value;
            }

            //selector same
            if(S.one(pv)) {
                return S.one(pv).val() === value;
            }

            //string same
            return pv === value;
        }
    });


    S.extend(RuleFactory, Base, {
        create:function (ruleName, cfg) {
            return new PropertyRule(ruleName, RuleFactory[ruleName], cfg);
        }
    });

    return RuleFactory;

}, {
    requires:[
        'base',
        './propertyRule'
    ]
});