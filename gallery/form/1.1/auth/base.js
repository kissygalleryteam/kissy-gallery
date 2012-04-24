/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/form/1.1/auth/base', function(S, JSON, Base, Field){
    var Validation = function(el, config) {
        var form = S.get(el),
            self = this;
        if(!form) {
            S.log('[validation]:form element not exist');
        } else {
            self._init(form, config);
        }

        Validation.superclass.constructor.call(self);
    };

    S.extend(Validation, Base, {
        _init: function(el, config) {
            var forms = el.elements,
                self = this;

            //init
            self.storages = {};

            if(forms && forms.length) {
                S.each(forms, function(el, idx){
                    self.storages[el.name || el.id] = new Field(el, config);
                });
            }
        },
        add: function(field){
            self.storages[forms[idx].name || forms[idx].id] = new Field(forms[idx], config);
        },
        getField: function(name){
            return self.storages[name];
        }
    }, {
        ATTRS:{

        }
    });

    return Validation;
}, {
    requires:[
        'json',
        'base',
        './field/field'
    ]
});