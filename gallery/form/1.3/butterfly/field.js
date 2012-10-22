/**
 *  模块名：gallery/form/1.3/butterfly/field，表单数据层模块，当数据发生变化时会自动更新表单视图
 *
 * @module butterfly
 * @submodule butterfly-model
 */

KISSY.add('gallery/form/1.3/butterfly/field',function (S, Base, Node) {
    var EMPTY = '';
    /**
     * 表单field的数据模块
     * @class Field
     * @constructor
     * @extends mvc.Field
     */
    function Field(config){
        Field.superclass.constructor.call(this, config);
    }
    S.extend(Field, Base,{ATTRS:{
        /**
         * 目标表单字段
         */
        target:{
            value:EMPTY,
            getter:function(v){
                return S.Node.all(v);
            }
        },
        /**
         * 字段类型
         */
        type:{value:EMPTY},
        /**
         * 字段名
         */
        name:{value:EMPTY},
        /**
         * 值
         */
        value:{
            value:EMPTY,
            getter:function(v){
                alert(3);
                return v;
            },
            setter:function(v){
                alert(2);
                return v;
            }
        },
        test:{value:false,
            setter:function(v){
                alert(2);
                return v;
            }
        },
        isGroup:{value:false},
        group:{value:[]}
    }});
    return Field;
},{requires:['base', 'node']});