/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add(function(S, D, JSON, Field){
    var Validation = function(el, config) {
        var form = D.get(el),
            self = this;
        if(!form) {
            S.log('[validation]:form element not exist');
        } else {
            self._init(el, config);
        }
    };

    S.extend(Validation, Base, {
        _init: function(el, config) {
            var forms = el.elements,
                self = this;

            //init
            self.storages = {};

            if(forms && forms.length) {
                for (var idx in forms) {
                    self.storages[forms[idx].name || forms[idx].id] = new Field(forms[idx], config);
                }
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
        'dom',
        'json',
        'form/validation/field/field'
    ]
});