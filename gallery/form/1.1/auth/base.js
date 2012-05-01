/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/form/1.1/auth/base', function (S, JSON, Base, Field, Factory) {

    /**
     * 默认配置
     * @type {Object}
     */
    var defaultConfig = {
        fields:{},
        initTrigger:false,
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
    };

    S.extend(Auth, Base, {
        _init:function (el, config) {
            var forms = el.elements,
                self = this;

            //init
            self.storages = {};

            //如果是form模式，需要屏蔽html5本身的校验
            if(self.mode === AUTH_MODE.FORM) {
                S.one(el).attr('novalidate', 'novalidate');
            }

            if (forms && forms.length) {
                S.each(forms, function (el, idx) {
                    var f = new Field(el, config);
                    f.addTarget(self);
                    f.publish('validate', {
                        bubble:1
                    });

                    self.storages[el.name || el.id] = f;
                });
            }

            //save config
            self.AuthConfig = config;
        },
        add:function (field, config) {
            var el;
            if (field instanceof Field) {
                //add field
                el = field.get('el');
                self.storages[S.one(el).attr('id') || S.one(el).attr('name')] = el;
            } else {
                //add html element
                el = S.one(field);
                if (el) {
                    self.storages[el.attr('id') || el.attr('name')] = new Field(el, config);
                }
            }
        },
        getField:function (name) {
            return this.storages[name];
        },
        /**
         * 对Auth注册一个新的规则，当前上下文可用
         * @param name
         * @param rule
         */
        register:function (name, rule) {
            Factory.register(name, rule);
        },
        validate:function (group) {
            var self = this;

            self.fire('beforeValidate');

            var result = true;

            S.each(self.storages, function (field, idx) {
                result = result && field.validate();
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
        './field/field'
    ]
});