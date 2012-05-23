/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/form/1.2/auth/base', function (S, JSON, Base, Field,
                                                  Factory, Utils, undefined) {

    /**
     * 默认配置
     * @type {Object}
     */
    var defaultConfig = {
        autoBind:true
    };

    var AUTH_MODE = {
        FORM:'form',
        OBJECT:'object'
    };

    var Auth = function (el, config) {
        var form = S.get(el),
            self = this;
        if (!form) {
            S.log('[Auth]:form element not exist');
        } else {
            self.mode = AUTH_MODE.FORM;
            self._init(form, S.merge(defaultConfig, config));
        }

        Auth.superclass.constructor.call(self);

        return self;
    };

    S.extend(Auth, Base, {
        _init:function (el, config) {
            var forms = el.elements,
                self = this;

            //init
            self._storages = {};

            //如果是form模式，需要屏蔽html5本身的校验
            if(self.mode === AUTH_MODE.FORM) {
                S.one(el).attr('novalidate', 'novalidate');
            }

            if (forms && forms.length) {
                S.each(forms, function (el, idx) {
                    var filedConfig = S.merge(config, {event:config.autoBind ? Utils.getEvent(el):'none'});
                    var f = new Field(el, filedConfig);
                    f.addTarget(self);
                    f.publish('validate', {
                        bubble:1
                    });

                    self.add(f);
                });
            }

            //save config
            self.AuthConfig = config;
        },
        add:function (field, config) {
            var el, key, self = this;

            if (field instanceof Field) {
                //add field
                el = field.get('el');
                key = S.one(el).attr('id') || S.one(el).attr('name');
                self._storages[key || Utils.guid()] = field;
            } else {
                //add html element
                el = S.one(field);
                if (el) {
                    key = S.one(el).attr('id') || S.one(el).attr('name');
                    var filedConfig = S.merge(self.AuthConfig, {event:self.AuthConfig.autoBind ? Utils.getEvent(el):'none'}, config);
                    self._storages[key || Utils.guid()] = new Field(el, filedConfig);
                }
            }

            return self;
        },
        getField:function (name) {
            return this._storages[name];
        },
        /**
         * 对Auth注册一个新的规则，当前上下文可用
         * @param name
         * @param rule
         */
        register:function (name, rule) {
            Factory.register(name, rule);

            return this;
        },
        validate:function (group) {
            var self = this;

            self.fire('beforeValidate');

            var result = true;

            S.each(self._storages, function (field, idx) {
                var r = field.validate();
                result = result && r;
            });

            self.fire('afterValidate');

            return result;
        }
    }, {
        ATTRS:{

        }
    });

    S.mix(Auth, {
        Field:Field
    });

    return Auth;
}, {
    requires:[
        'json',
        'base',
        './field/field',
        './rule/ruleFactory',
        './utils'
    ]
});