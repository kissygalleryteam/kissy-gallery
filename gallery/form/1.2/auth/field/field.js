/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/form/1.2/auth/field/field', function (S, Event, Base, JSON, DOM, Factory,
                                                         Rule, PropertyRule, Msg, Utils, undefined) {

    var EMPTY = '',
        CONFIG_NAME = 'data-valid';

    /**
     * field默认配置
     * @type {Object}
     */
    var defaultConfig = {
        event:'blur',
        style:{
            'success':'ok',
            'error':'error'
        }
    };

    var Field = function (el, config) {
        var self = this;

        self._validateDone = {};
        //储存上一次的校验结果
        self._cache = {};

        /**
         * 配置有3个地方，属性，new的参数，默认参数
         */
        //初始化json配置
        if (el && DOM.attr(el, CONFIG_NAME)) {
            var cfg = DOM.attr(el, CONFIG_NAME);

            cfg = Utils.toJSON(cfg);
            //把所有伪属性都当作rule处理
            var propertyConfig = {
                rules:cfg
            };

            config = S.merge(propertyConfig, config);
        }

        config = S.merge(defaultConfig, config);

        self._cfg = config || {};
        //保存rule的集合
        self._storage = {};

        self._init(el);

        Field.superclass.constructor.call(self);

        return self;
    };

    S.extend(Field, Base, {
        _init:function (el) {
            var self = this,
                _cfg = self._cfg,
                _el = S.one(el),
                _ruleCfg = S.merge({}, _cfg.rules);


            //如果为checkbox/radio则保存为数组
            if (S.inArray(_el.attr('type'), ['checkbox','radio'])) {
                var form = _el.getDOMNode().form, elName = _el.attr('name');
                var els = [];
                S.each(document.getElementsByName(elName), function(item) {
                    if (item.form == form) {
                        els.push(item);
                    }
                });
                self.set('el', els);
            } else {
                self.set('el', el);
            }

            var resetAfterValidate = function () {
                self.fire('afterFieldValidation');
            };

            //msg init
            if (self._cfg.msg) {
                self._msg = new Msg(_el, self._cfg.msg);
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

            //add html property
            S.each(Factory.HTML_PROPERTY, function (item) {

                if (_el.hasAttr(item)) {
                    //从工厂中创建属性规则
                    var rule = Factory.create(item, {
                        //属性的value必须在这里初始化
                        propertyValue:_el.attr(item),
                        el:self.get('el'), //bugfix for change value
                        msg:_ruleCfg[item]
                    });

                    self.add(item, rule);
                }
            });

            //add custom rule
            S.each(_ruleCfg, function(ruleCfg, name){
                if(!self._storage[name] && Factory.rules[name]) {
                    //如果集合里没有，但是有配置，可以认定是自定义属性，入口为form.add
                    var rule = Factory.create(name, {
                        el:self.get('el'), //bugfix for change value
                        msg:ruleCfg
                    });

                    self.add(name, rule);
                }
            });

            //element event bind
            if (_cfg.event != 'none') {
                Event.on(self.get('el'), _cfg.event || Utils.getEvent(_el), function (ev) {
                    self.validate();
                });
            }

        },

        add:function (name, rule, cfg) {
            var self = this,
                _storage = self._storage;

            if (rule instanceof PropertyRule || rule instanceof Rule) {
                _storage[name] = rule;
            } else if(S.isFunction(rule)) {
                _storage[name] = new Rule(name, rule, {
                    el:self._el
                    //TODO args
                });
            }

            if(_storage[name]) {
                _storage[name].on('validate', function (ev) {
                    S.log('[after rule validate]: name:' + ev.name + ',result:' + ev.result + ',msg:' + ev.msg);
                    //set cache
                    self._cache[ev.name]['result'] = ev.result;
                    self._cache[ev.name]['msg'] = ev.msg;
                });
            }

            this._cache[name] = {};

            return self;
        },

        remove:function (name) {
            var _storage = this._storage;
            delete _storage[name];
            delete this._cache[name];

            return this;
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
                cfg = cfg||{},
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
            el:{}
        }
    });

    return Field;
}, {
    requires:[
        'event',
        'base',
        'json',
        'dom',
        '../rule/ruleFactory',
        '../rule/rule',
        '../rule/html/propertyRule',
        '../msg/base',
        '../utils'
    ]
});