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
        this._elements = this._expandElement(this._elements);
        this._initElementItem();
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

        /**
         * return the sum of all Data
         */
        sumData : function(){
            var d = 0;
            this.eachElement(function(item){
                d += item.data;
            });
            return d;
        },

        look: function(){

        },
        /**
         * execuse fn on each Element item
         */
        eachElement : function(fn){
            var self = this;

            S.each(self._elements, function(item,idx){
                if(item.items){
                    S.each(item.items, function(i, idx2){
                        fn(i,idx,idx2);
                    });
                }else{
                    fn(item, idx, -1);
                }
            });
        },

        /**
         * Init the Element Item
         * parse the label
         */
        _initElementItem: function(){
            var self = this;

            self.eachElement(function(elem,idx,idx2){
                elem.data = S.isNumber(elem.data)? elem.data : 0;
                elem.format = elem.format || Data.DEFAULT_FORMAT;
                elem.label = elem.label || Data.DEFAULT_LABEL;
                elem.label = S.substitute(elem.label, elem);
            });
        },

        _expandElement : function(data){
            var datas,
                itemdata,
                self = this;

            S.each(data, function(item,idx){
                if(S.isArray(item.datas)){
                    item.items = item.items || [];

                    S.each(item.datas, function(d,n){
                        itemdata = {
                            name : item.name,
                            data : d
                        }

                        if(item.labels && S.isString(item.labels[n])){
                            itemdata.label = item.labels[n];
                        }
                        if(item.label){
                            itemdata.label = item.label;
                        }

                        if(item.formats && S.isString(item.formats[n])){
                            itemdata.format = item.labels[n];
                        }
                        if(item.format){
                            itemdata.format = item.label;
                        }
                        delete item.datas;
                        item.items.push(itemdata);
                    });
                };

            });
            return data;
        },

        /**
         * normalize Input Element
         * @private
         * @param {Object} input data
         */
        _initElement : function(data){
            var elements = null,
                elem,
                self = this,
                newe;
            var keys = ["name","names","data", "datas","label","labels","format","formats"];

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
                    newe = S.clone(e);

                    S.filter(newe,function(v,k){
                        return S.inArray(k, keys);
                    });

                    elements.push(newe);
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
