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
        this._elements = this._initElement(data);
        this._elements = this.element_normalize(this._elements);

        this._axis = data.axis;

        this._design = data.design;
    }

    S.mix( Data, {
        DEFAULT_LABEL : "{d}",
        DEFAULT_FORMAT: "0"
    });

    S.augment(Data, {
        axis : function(){},

        elements : function(){
            return this._elements;
        },
        look: function(){

        },

        /**
         * normalize the data
         * @argument {Object} the data of chart elements
         */
        element_normalize : function(elements){
            var label,newlabel,
                length = 0,
                fmt;

            S.each(elements, function(element){
                if(!element.label){
                    element.label = Data.DEFAULT_LABEL;
                }
                element.format = (S.isString(element.format)) ? element.format : Data.DEFAULT_FORMAT;
                length = Math.max(element.data.length, length);
                if(S.isString(element.label)){
                    label = element.label;
                    element.label = [];
                    //format number
                    if(S.isArray(element.data)){
                        S.each(element.data, function(d,idx){
                            fmt = '';
                            if(S.isNumber(d)){
                                fmt = P.format(d,element.format);
                            }else{
                                fmt = "null";
                                element.data[idx] = 0;
                            }
                            newlabel = S.substitute(label,{"d" : fmt,"name":element.name});
                            element.label.push(newlabel);
                        });
                    }
                }
            });

            this.maxlength = length;
            return elements;
        },

        /**
         * 初始化Element 元素
         * @private
         */
        _initElement : function(data){
            var elements = [],
                elem,
                self = this;

            if(!data.elements && data.element && (data.element.names instanceof Array)){
                elem = data.element;
                S.each(elem.names, function(d,n){
                    elements.push({
                        name   : d,
                        label  : self._getLabel(elem.labels, n, Data.DEFAULT_LABEL),
                        data   : self._getLabel(elem.datas, n, 0),
                        format : self._getLabel(elem.format,Data.DEFAULT_FORMAT)
                    });
                });

                return elements;
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
        _getLabel : function(labels, n, default){
            if(S.isArray(labels)){
                return (n < labels.length)?labels[n]:null;
            }else{
                return labels;
            }
        }
    });
    P.Data = Data;
});
