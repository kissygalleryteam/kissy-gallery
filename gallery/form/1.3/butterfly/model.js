/**
 * 快速构建表单工具
 * @module butterfly
 */

/**
 *  模块名：gallery/form/1.3/butterfly/model，表单数据层模块，当数据发生变化时会自动更新表单视图
 *
 * @module butterfly
 * @submodule butterfly-model
 */

KISSY.add('gallery/form/1.3/butterfly/model',function (S, Base, Node,mvc) {
    var EMPTY = '';
    /**
     * 表单field的数据模块
     * @class Model
     * @constructor
     * @extends mvc.Model
     */
    function Model(){
        Model.superclass.constructor.apply(this, arguments);
    }
    S.extend(Model, mvc.Model,{ATTRS:{
        target:{
            value:EMPTY,
            getter:function(v){
                return S.Node.all(v);
            }
        },
        type:{value:EMPTY},
        name:{value:EMPTY},
        value:{
            value:EMPTY,
            setter:function(v){
                debugger;
                var self = this;
                var target = self.get('target');
                if(target && target.length > 0){
                    target.val(v);
                }
                return v;
            }
        },
        isGroup:{value:false},
        group:{value:[]}
    }});
    return Model;
},{requires:['base', 'node','mvc']});