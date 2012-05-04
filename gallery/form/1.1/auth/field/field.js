/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/form/1.1/auth/field/field', function (S, Event, Base, JSON, Factory, Rule, PropertyRule, Msg, Utils, undefined) {

    var EMPTY = '',
        CONFIG_NAME = 'data-valid';

    var Field = function (el, validConfig) {
        var self = this;
        self._el = el = S.one(el);
        self._validateDone = {};
        //储存上一次的校验结果
        self._cache = {};

        //初始化json配置
        if (el && el.hasAttr(CONFIG_NAME)) {
            var cfg = el.attr(CONFIG_NAME);

            cfg = Utils.toJSON(cfg);
            var config = {
                rules:cfg
            };
            validConfig = S.merge(validConfig, config);
        }

        self._cfg = validConfig || {};
        //保存rule的集合
        self._storage = {};

        var resetAfterValidate = function () {
            self.fire('afterFieldValidation');
        };

        //msg init
        if (self._cfg.msg) {
            self._msg = new Msg(self._el, self._cfg.msg);
            var style = self._cfg.style;

            self.on('afterRulesValidate', function (ev) {
                var result = ev.result,
                    curRule = ev.curRule,
                    msg = self._cache[curRule].msg || EMPTY;

                //这里的value还没被当前覆盖
                if (self.get('result') !== result || self.get('msg') !== msg) {
                    if (msg) {
                        self._msg.show({
                            style:result ? style['success'] : style['error'],
                            msg:msg
                        });
                    } else {
                        self._msg.hide();
                    }
                }
            });
        }

        //监听校验结果
        self.on('afterRulesValidate', function (ev) {
            var result = ev.result,
                curRule = ev.curRule,
                msg = self._cache[curRule].msg || EMPTY;

            self.set('result', result);
            self.set('message', msg);

            self.fire('validate', {
                result:result,
                msg:msg,
                errRule:result ? '' : curRule
            });

            //校验结束
            self.fire('afterValidate');
            resetAfterValidate();
        });

        self._init();

        Field.superclass.constructor.call(self);
    };

    S.extend(Field, Base, {
        _init:function () {
            var self = this,
                _cfg = self._cfg,
                _el = self._el,
                _ruleCfg = S.merge({}, _cfg.rules);

            //add html property
            S.each(Factory.HTML_PROPERTY, function (item) {

                if (_el.hasAttr(item)) {
                    //从工厂中创建属性规则
                    var rule = Factory.create(item, {
                        //属性的value必须在这里初始化
                        propertyValue:_el.attr(item),
                        el:_el, //bugfix for change value
                        msg:_ruleCfg[item]
                    });

                    rule.on('validate', function (ev) {
                        S.log('[after rule validate]: name:' + ev.name + ',result:' + ev.result + ',msg:' + ev.msg);
                        //set cache
                        self._cache[ev.name]['result'] = ev.result;
                        self._cache[ev.name]['msg'] = ev.msg;
                    });

                    self.add(item, rule);
                }
            });

            //element event bind
            if (_cfg.autoBind) {
                Event.on(_el, _cfg.event || 'blur', function (ev) {
                    self.validate();
                });
            }

        },

        add:function (name, rule, cfg) {
            var _storage = this._storage;
            if (rule instanceof PropertyRule) {
                _storage[name] = rule;
            } else {
                _storage[name] = new Rule(name, rule, {
                    el:self._el
                    //TODO args
                });
            }

            this._cache[name] = {};
        },

        remove:function (name) {
            var _storage = this._storage;
            delete _storage[name];
        },

        /**
         *
         * @param name
         * @param cfg {Object}
         * @param cfg.args
         * @param cfg.msg
         *
         * @return {Boolean}
         */
        validate:function (name, cfg) {
            var result = true,
                self = this,
                _storage = self._storage,
                cfg = S.merge({}, cfg),
                curRule = EMPTY;

            if (name) {
                if (_storage[name]) {
                    //校验开始
                    self.fire('beforeValidate');

                    result = _storage[name].validate(cfg.args);
                    curRule = name;
                }
            } else {
                //校验开始
                self.fire('beforeValidate');

                for (var key in _storage) {
                    curRule = key;
                    if (!_storage[key].validate(cfg.args)) {
                        result = false;
                        break;
                    }
                }
            }

            // 保证有规则才触发
            if (curRule) {
                self.fire('afterRulesValidate', {
                    result:result,
                    curRule:curRule
                });
            }

            //TODO GROUPS

            return result;
        }
    }, {
        ATTRS:{
            message:{
                value:EMPTY
            },
            result:{},
            el:{
                value:this._el
            }
        }
    });

    return Field;
}, {
    requires:[
        'event',
        'base',
        'json',
        '../rule/html/propertyFactory',
        '../rule/rule',
        '../rule/html/propertyRule',
        '../msg/base',
        '../utils'
    ]
});