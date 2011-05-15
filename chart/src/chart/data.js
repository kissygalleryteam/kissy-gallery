KISSY.add("gallery/chart/data",function(S){
    var P = S.namespace("Gallery.Chart");

    /**
     * 图表默认配置
     */
    var defaultConfig= {
        left : 20,
        right : 20,
        bottom : 20,
        showLabels : true,
        colors : [],
        drawbg : -1,
        animationDuration : .5,
        animationEasing : "easeInStrong"
    };

    /**
     * 特定图标配置
     */
    var specificConfig = {
        'line' : { },
        'bar' : { },
        'pie' : {
            animationDuration : 2,
            animationEasing : "bounceOut"
        }
    };

    /**
     * 数据默认配置
     */
    var defaultChartConfig = {
        'default' : {
            format : "0",
            label : "{name} -  {data}"
        },
        'line':{
        },
        "pie" : {
            format : "0.00"
        },
        "bar" : {
            format : "0"
        }
    };

    /**
     * 图表数据
     * @constructor
     * @param {Object} 输入的图表JSON数据
     */
    function Data(data){
        if(!data || !data.type) return;
        if(!this instanceof Data) return new Data(data);
        var self = this;

        self.origin = data;
        data = S.clone(data);
        self.type = data.type.toLowerCase();
        self._elements = self._initElement(data);
        self._elements = self._expandElement(self._elements);
        self._initElementItem();
        self._axis = data.axis;
        self._design = data.design;
        self.config = S.merge(defaultConfig, specificConfig[self.type], data.config);
    }

    S.augment(Data, /**@lends Data.protoptype*/{
        /**
         * get the AxisData
         */
        axis : function(){
            return this._axis;
        },

        /**
         * get the Element Data
         */
        elements : function(){
            return this._elements;
        },

        /**
         * get the the max length of each Element
         */
        maxElementLength: function(){
            var ml = 0;
            S.each(this._elements, function(elem,idx){
                if(S.isArray(elem.items)){
                    ml = Math.max(ml, elem.items.length);
                }
            });
            return ml;
        },


        /**
         * Get the color for the Element
         * from the user config or the default
         * color
         * @param {Number} the index of the element
         * @param {String} type of Chart
         */
        getColor : function(idx,type){
            var length = this._elements.length;
            var usercolor = this.config.colors
            if(S.isArray(usercolor) && usercolor[idx]){
                return usercolor[idx];
            }

            //getColor frome user defined function
            if(S.isFunction(usercolor)){
                return usercolor(idx);
            }

            //get color from default Color getter
            return this.getDefaultColor(idx,length,type);
        },

        /**
         * return the sum of all Data
         */
        sum: function(){
            var d = 0;
            this.eachElement(function(item){
                d += item.data;
            });
            return d;
        },

        /**
         * Get the Biggest Data from element
         */
        max : function(){
            return this._max;
        },

        /**
         * get the default color depending on idx and length, and types of chart 
         * @param {Number} index of element
         * @param {Number} length of element
         */
        getDefaultColor : function (idx,length){
            //在色相环上取色
            var colorgap = 1/3,
                //h = Math.floor(idx/3)/length + 1/(idx%3 + 1)*colorgap,
                h = colorgap * idx, //h of color hsl
                s = .6, // s of color hsl
                b = 1,//b of  color hsb
                l = b - s*.5, //l of color hsl
                i, j, k;

            if(idx < 3){
                h = colorgap * idx;
            }else{
                //防止最后一个颜色落在第3区间
                if(length % 3 == 0){
                    if(idx === length -1){
                        idx = length -2;
                    }else
                    if(idx === length - 2){
                        idx = length - 1;
                    }
                }
                i = idx % 3;
                j = Math.ceil(length/3);
                k = Math.ceil((idx + 1)/3);
                h = i*colorgap + colorgap/j * (k-1);
            }

            return P.Color.hsl(h,s,l).hexTriplet();
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
            self._max = null;

            self.eachElement(function(elem,idx,idx2){
                if(idx === 0 && (!idx2) )self._max = elem.data || 0;

                var defaultElem = S.merge(defaultChartConfig['default'], defaultChartConfig[self.type]||{});
                elem.data = S.isNumber(elem.data) ? elem.data : 0;
                elem.format = elem.format || defaultElem.format;
                elem.label = elem.label || defaultElem.label;
                elem.label = S.substitute(
                    elem.label,
                    {
                        name : elem.name,
                        data : P.format(elem.data, elem.format)
                    }
                );
                self._max = Math.max(self._max, elem.data);
            });
        },

        /**
         * expand the sub element
         * @param {Object} the Element Object
         * @private
         */
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
                        };
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
                        format : self._getLabel(elem.format,n)
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

    return Data;
},{requires : ["./color"]});
