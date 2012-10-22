/**
 * @fileoverview 表单验证类
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/form/1.3/auth/base', function (S, JSON, Base, Field, Factory, Utils, undefined) {

    /**
     * 默认配置
     * @type {Object}
     */
    var defaultConfig = {
        autoBind:true,
        stopOnError:false
    };

    var AUTH_MODE = {
        FORM:'form',
        OBJECT:'object'
    };

    /**
     * @name Auth
     * @class Auth组件入口，表明
     * @version 1.2
     * @param el {selector|htmlElement} form元素
     * @param config {object}
     * @return Auth
     * @constructor
     */
    var Auth = function (el, config) {
        var form = S.get(el),
            self = this;

        self._storages = {};

        if (!form) {
            S.log('[Auth]:form element not exist');
        } else {
            self.mode = AUTH_MODE.FORM;
            self._init(form, S.merge(defaultConfig, config));
        }

        Auth.superclass.constructor.call(self);

        return self;
    };

    S.extend(Auth, Base, /** @lends Auth.prototype*/ {
        /**
         * 初始化auth
         * @param el
         * @param config
         * @private
         */
        _init:function (el, config) {
            var forms = el.elements,
                self = this;

            if (forms && forms.length) {
                S.each(forms, function (el, idx) {
                    var filedConfig = S.merge(config, {event:config.autoBind ? Utils.getEvent(el) : 'none'});
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

            //如果是form模式，需要屏蔽html5本身的校验，放在最后是为了html5的校验能生效
            if (self.mode === AUTH_MODE.FORM) {
                S.one(el).attr('novalidate', 'novalidate');
            }

        },
        /**
         * 添加一个需要校验的表单域
         *
         * @param field {Field|string|htmlElement} 表单域对象或html表单元素
         * @param config {object} 可选的配置，如果传的是field对象，就无需此配置
         * @return {*}
         */
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
                    var filedConfig = S.merge(self.AuthConfig, {event:self.AuthConfig.autoBind ? Utils.getEvent(el) : 'none'}, config);
                    self._storages[key || Utils.guid()] = new Field(el, filedConfig);
                }
            }

            return self;
        },
        /**
         * 根据key返回field对象
         * @param name
         * @return {*}
         */
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

            var result = true, currentField;

            S.each(self._storages, function (field, idx) {
                var r = field.validate();
                result = result && r;
                currentField = field;

                //stop on error
                if (self.AuthConfig.stopOnError && !result) {
                    return false;
                }
            });

            self.fire('validate', {
                result:result,
                lastField:currentField
            });

            self.set('result', result);

            self.fire('afterValidate');

            return result;
        }
    }, {
        ATTRS:{
            result:{}
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