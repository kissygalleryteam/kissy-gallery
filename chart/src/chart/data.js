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
         * parse the label
         * @argument {Object} the data of chart elements
         */
        element_normalize : function(elements){
            var label,
                newlabel,
                fmt;

            S.each(elements, function(elem){
                if(elem.labels){
                    elem.labels = self._makeLabels(elem.datas, elem.format, elem.names);
                }
            });
            S.each(elements, function(element){
                label = element.label;
                element.labels = [];
                //generate the labels
                if(S.isArray(element.datas)){
                    S.each(element.data, function(d,idx){
                        if(S.isNumber(d)){
                            fmt = P.format(d, element.format);
                        }else{
                            fmt = "null";
                            element.data[idx] = 0;
                        }
                        newlabel = S.substitute(label,{
                            'd' : d,
                            "data" : d,
                            "name" : element.name
                        });
                        element.labels.push(newlabel);
                    });
                }
            });
            return elements;
        },
        _makeLabels : function(labels, datas, formats, names){
            S.each(labels, function(s,n){
                labels[n] = S.substitute(s,{
                    'd': S.format(datas[n], formats),
                    ''
                })
            });
        }

        elementItemNormalize : function(elem){
            
        },

        /**
         * normalize Input Element
         * @private
         * @param {Object} input data
         */
        _initElement : function(data){
            var elements = null,
                elem,
                self = this;

            if(!data.elements && data.element && (data.element.names instanceof Array)){
                elements = [];
                elem = data.element;
                S.each(elem.names, function(d,n){
                    elements.push({
                        name   : d,
                        data   : self._getLabel(elem.datas, n),
                        label  : self._getLabel(elem.labels, n),
                        format : self._getLabel(elem.format,n) || Data.DEFAULT_FORMAT
                    });
                });
            }

            if(data.elements && S.isArray(data.elements)){
                elements = [];
                S.each(data.elements, function(e){
                    elements.push({
                        name : e.name,
                        data : e.data,
                        label : e.label,
                        format : e.format || Data.DEFAULT_FORMAT
                    });
                });
            }
            return elements;
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
