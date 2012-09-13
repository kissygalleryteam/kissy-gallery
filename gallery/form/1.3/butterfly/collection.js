KISSY.add('gallery/form/1.3/butterfly/collection',function (S, Base, Node,Field) {
    var EMPTY = '';
    /**
     * 表单的数据模块
     * @class Collection
     * @constructor
     * @extends Base
     */
    function Collection(){
        Collection.superclass.constructor.apply(this, arguments);
    }
    S.extend(Collection, Base,{
        add:function(data){
            if(!S.isObject(data)) return false;
            var name = data.name;
            if(!name){
                S.log('add():第一个参数缺少name值！');
                return false;
            }
            var self = this;
            var Field = self.get('Field');
            var fields = self.get('fields');
            var field = self.field(name);
            if(field == EMPTY){
                field = new Field(data);
                fields.push(field);
            }
            return field;
        },
        remove: function(){

        },

        field:function(name,data){
            if(!S.isString(name)) return false;
            var self = this;
            var fields = self.get('fields');
            var field = EMPTY;
            if(!fields.length) return EMPTY;
            S.each(fields,function(f){
                if(f.get('name') == name){
                    field = f;
                    return true;
                }
            });
            if(S.isString(data)){
                field.set('value',data);
                field.get('value');
            }
            else if(S.isObject(data)){
                S.each(data,function(v,k){
                    field.set(k,v);
                })
            }
            return field;
        }
    },{
        ATTRS:{
            Field:{value:Field},
            fields:{
                value:[]
            },
            data:{value:EMPTY}
        }
    });
    return Collection;
},{requires:['base', 'node','./field']});