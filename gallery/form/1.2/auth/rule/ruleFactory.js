/**
 * @fileoverview html 属性规则工厂
 * @author 张挺 <zhangting@taobao.com>
 *
 */
KISSY.add('gallery/form/1.2/auth/rule/ruleFactory', function (S, Base, PropertyRule, Rule, undefined) {
    var RuleFactory = function () {
        var self = this;

        RuleFactory.superclass.constructor.call(self);
    };

    RuleFactory.rules = {};

    //第一个参数一定是属性的value，后面的才是真正的参数
    S.mix(RuleFactory.rules, {
        required:function (pv, value) {
            if(S.isArray(value)) {
                return value.length>0;
            }

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

    S.mix(RuleFactory, {
        HTML_PROPERTY:['required', 'pattern', 'max', 'min', 'step', 'equalTo'],
        register:function(name, rule) {
            RuleFactory.rules[name] = rule;
        },
        create:function (ruleName, cfg) {
            if(S.inArray(ruleName, RuleFactory.HTML_PROPERTY)) {
                return new PropertyRule(ruleName, RuleFactory.rules[ruleName], cfg);
            } else if(RuleFactory.rules[ruleName]) {
                return new Rule(ruleName, RuleFactory.rules[ruleName], cfg);
            }
            return undefined;
        }
    });

    return RuleFactory;

}, {
    requires:[
        'base',
        './html/propertyRule',
        './rule'
    ]
});