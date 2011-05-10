KISSY.add("gallery/chart/data",function(S){
    var P = S.namespace("Gallery.Chart");
    /**
     * 图表数据
     * @constructor
     */
    function Data(data){
        if(!data || !data.type) return;
        if(!this instanceof Data) return new Data(data);

        this.origin = data;
        this.type = data.type.toLowerCase();
        this._element = this._initElement();

        this._axis = data.axis;

        this._design = data.design;
    }
    S.augment(Data,{
        axis : function(){},
        elements : function(){},
        look: function(){},
        /**
         * 初始化Element 元素
         */
        _initElement : function(){
            var elements = [],
                elem;
            if(!data.elements && data.element && (data.name instanceof Array)){
                S.each(data.names, function(d,n){
                    elements.push({
                        name : d,
                        label : self._getLabel(labels, n),
                        data : self._getLabel(datas, n),
                    });
                })
            }else{
                return null;
            }
        },
        /**
         * 如果是数组，返回label[n]
         * 否则返回labels
         * @private
         * @param {Any}
         * @param {Number} offset
         */
        _getLabel : function(labels, n){
            if(S.isArray(labels)){
                return (n < labels.length)?labels[n]:null;
            }else{
                return labels;
            }
        }
    });
    P.Data = Data;
});
