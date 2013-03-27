/**
* 城市选择器，支持国内和国际城市，也可以自定义城市数据
*
* @module city-selector
* @author freyaoo@gmail.com
* @version 1.0
*/
KISSY.add('gallery/city-selector/1.0/index',function(S,Node,Event,Overlay,Juicer,Richbase){
	'use strict';

    var CURCLS = 'ks-city-selector-cur',
        ALLCLS = 'ks-city-selector-all',
        WIDTH = 'width',
        HEIGHT = 'height',
        CHECKED = 'checked',
        PROVINCE = 'province',
        CITY = 'city',
        DISABLEDCLS = 'ks-city-selector-disabled',
        LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        TMPL = Juicer('<div class="${prefix}city-selector {@if provinceselect}ks-city-selector-province-select{@/if}" id="${prefix}city-selector${id}" style="width:${width}px;height:${height}px;">'+'<div class="ks-city-selector-content">'+
            '<div class="ks-city-selector-nav" id="ks-city-selector${id}-nav">'+
                '<span class="ks-city-selector-all ks-city-selector-cur ks-city-selector-letter-filter" id="ks-city-selector${id}-letter-all" data-value="all">全部</span>'+
                '{@each letters as item}<span id="ks-city-selector${id}-letter-${item.name}" data-value="${item.name}" class="ks-city-selector-letter-filter{@if item.disabled} ks-city-selector-disabled{@/if}">${item.name}</span>{@/each}'+
            '</div>' +
            '<div class="ks-city-selector-citylist" id="ks-city-selector${id}-citylist" style="height:${listheight}px;"><ul>' +
                '{@each data as item}<li class="ks-city-selector-province-${item.firstLetter}{@if !item.city} ks-city-selector-nocity{@/if}">'+
                    '<div class="ks-city-selector-province">'+
                        '<label for="ks-city-selector${id}-province-${item.id}">'+
                            '<span class="ks-city-selector-letter">${item.firstLetter}</span>'+
                            '<span class="ks-city-selector-province-name">{@if provinceselect}<input type="checkbox" class="ks-city-selector-select-province" id="ks-city-selector${id}-province-${item.id}" data-id="${item.id}" name="ks-city-selector-province" value="${item.name}">{@/if}${item.name}</span>'+
                        '</label>'+                     
                    '</div>'+
                    '{@if item.city}<div class="ks-city-selector-city">'+
                    '{@each item.city as subcity}<span>'+
                        '<input type="checkbox" id="ks-city-selector${id}-city-${subcity.id}" value="${subcity.name}" data-id="${subcity.id}" name="ks-city-selector-city" class="ks-city-selector-select-city">'+
                        '<label for="ks-city-selector${id}-city-${subcity.id}">${subcity.name}</label>'+
                    '</span>{@/each}'+
                    '</div>{@/if}'+
                '</li>{@/each}' +
            '</ul></div>'+
        '</div></div>');
    /**
    * 城市选择器constructor

        <input id="#foo" type="text">    
        KISSY.use('gallery/city-selector/1.0/domestic,gallery/city-selector/1.0/index',function(S,DomesticData,CitySelector){
        var city-selector = new CitySelector({
            data : DomesticData,
            node : '#foo'
        });

    *
    * @class CitySelector
    * @extends RichBase
    * @constructor   
    */

	var CitySelector = Richbase.extend({
    	initializer : function(){
            this._node = S.one(this.get('node'));
            this._renderNode = S.one(this.get('render'));
            if(!this._node && !this._renderNode){
                S.log('city-selector::node and render are not find,city-selector init failured!');
                return;
            }
            this._id = S.guid();
            this._selected = []; 
            this._selectedValues = [];   		
            this.render();
            this._checkCity();
            this._bind();
    	},
        destructor : function(){
            this._navEl.undelegate('click');
            this._listEl.undelegate('click');
            this._selected = undefined;
            this._selectedValues = undefined;
            this._formatData = undefined;
            this._provinces = undefined;
            this._citys = undefined;
            this._contentEl.remove();
        },
        /**
        * 绑定需要的事件
        *
        * @method _bind
        * @private
        */
        _bind : function(){
            var _ = this;
            this._navEl.delegate('click','.ks-city-selector-letter-filter',this._letterFilter,this);
            this._listEl.delegate('click','.ks-city-selector-province',this._toggleOrExpand,this);
            this._listEl.delegate('click','.ks-city-selector-select-city',this._selectCity,this);
            this._listEl.delegate('click','.ks-city-selector-select-province',this._selectProvince,this);
            if(this._overlay){
                Event.on('body','click',function(){
                    _._overlay.hide();
                });
                this._contentEl.on('click',function(e){
                    e.stopPropagation();
                });
                this._node.on('click',function(e){
                    e.stopPropagation();
                });
            }
        },
        /**
        * 预处理城市数据，主要是为了后面的dom操作方便
        *
        * @method _prepareData
        * @private
        */
        _prepareData : function(){
            var _ = this,
                letters = {};
            _._formatData = {};
            _._provinces = {};
            _._citys = {};
            S.each(_.get('data'),function(item){
                var firstLetter = item.pinyin.charAt(0).toUpperCase(),
                    city = [];
                item.firstLetter = firstLetter;
                item.id = S.guid();
                letters[firstLetter] = 1;
                S.each(item.city,function(val){
                    city.push(val.name);
                    val.id = S.guid();
                    _._citys[val.name] = val.id;
                    _._formatData[val.id] = S.merge(val,{
                        type : CITY,
                        province : item.name
                    });
                });
                _._provinces[item.name] = item.id;
                _._formatData[item.id] = S.merge(item,{
                    type : PROVINCE,
                    city : city
                })
            });
            return letters;
        },
        /**
        * 渲染城市选择器
        *
        * @method render
        * @return {CitySelector} this,当前实例
        * @chainable
        */
        render : function(){
            var _ = this,
                cityData = this.get('data'),
                ret = {},
                letters = _._prepareData(),
                w = this.get('autoWidth') ? this._node.width() : this.get(WIDTH),
                len = LETTERS.length,
                tmp = [];
            
            for(var i = 0;i < len;i++){
                var letter = LETTERS.charAt(i);
                tmp.push({
                    name : letter,
                    disabled : !letters[letter]
                });
            }

            var obj = {
                prefix : this.get('prefixCls'),
                provinceselect : this.get('canProvinceSelect'),
                letters : tmp,
                data : cityData,
                id : this._id,
                width : w,
                height : this.get(HEIGHT),
                listheight : this.get(HEIGHT) - 50
            };

            this._contentEl = S.one(TMPL.render(obj));
            this._navEl = this._contentEl.one('#ks-city-selector'+this._id+'-nav');
            this._listEl = this._contentEl.one('#ks-city-selector'+this._id+'-citylist');
            if(this._renderNode){
                this._renderNode.append(this._contentEl);
            }else{
                this._overlay = new Overlay.Popup({
                    prefixCls : 'ks-city-selector-',
                    width : w,
                    trigger : this._node,
                    visible : false,
                    align : {
                        node : this._node,
                        points : ['bl','tl'],
                        offset :[-1,0]
                    },
                    content : this._contentEl
                });
              
                this._overlay.on('show',function(){
                    _._checkCity();
                });
            }
            return this;
        },
        /**
        * 选择字母筛选触发的处理方法
        *
        * @method _letterFilter
        * @param {Event} e 
        * @private
        */
        _letterFilter : function(e){
            var tar = S.one(e.target),
                filter = tar.attr('data-value');
            if(tar.hasClass(CURCLS)){
                return;
            }
            this._setLetter(filter);
        },
        /**
        * 根据指定的字母处理dom
        *
        * @method _setLetter
        * @param {String} letter 指定的字母,26个字母加单词'all'
        * @private
        */
        _setLetter : function(letter){
            var curLetter = this._navEl.one('span.'+CURCLS),
                tar = S.one('#ks-city-selector'+this._id+'-letter-'+letter),
                list = this._listEl,
                provinces = list.all('li');
            if(tar.hasClass(DISABLEDCLS)){
                return;
            }
            curLetter.removeClass(CURCLS);
            tar.addClass(CURCLS);
            /**
            当用户切换首字母是触发
            @event letterchange
            @param {event} e 提供用户当前选择的首字母
            <dl>
            <dt>letter</dt><dd>用户选中的字母，如'x','a','all'</dd>
            </dl>
            */
            this.fire('letterchange',{
                letter : letter
            });
            if(tar.hasClass(ALLCLS)){
                provinces.show();
                return;
            }                   
            
            provinces.hide();
            this._listEl.all('li.ks-city-selector-province-'+letter).show();
        },
        /**
        * 收起或展开省下面的城市
        *
        * @method _toggleOrExpand
        * @param {event} e 
        * @private
        */
        _toggleOrExpand : function(e){
            var tar = S.one(e.target),
                li = tar.parent('li');
            li.toggleClass('ks-city-selector-expand');
        },
        /**
        * 根据输入框里已存在的城市选中城市选择器中的城市
        *
        * @method _checkCity
        * @private
        */
        _checkCity : function(){
            var _ = this,
                val = this._node.val().split(',');
            S.each(val,function(item){
                item && _.select(item);
            });
        },
        /**
        * 选中城市时的事件执行
        *
        * @method _selectCity
        * @param {event} e 
        * @private
        */
        _selectCity : function(e){
            var tar = S.one(e.target);
            if(tar.prop(CHECKED)){
                this.select(tar.val());                              
            }else{
                this.unSelect(tar.val());                
            }
        },
        /**
        * 选中省(国际对应国家)时的事件执行
        *
        * @method _selectProvince
        * @param {event} e 
        * @private
        */
        _selectProvince : function(e){
            var tar = S.one(e.target);
            if(tar.prop(CHECKED)){
                this.select(tar.val());
            }else{
                this.unSelect(tar.val());
            }           
        },
        /**
        * 根据传入的节点和类型填充input
        *
        * @method _fillInput
        * @param {Node} 触发事件的input[type=checkbox]节点 
        * @param {String} 类型{city|province}
        * @private
        */
        _fillInput : function(tar,type){
            var val = S.trim(this._node.val()),
                newVal = tar.val();
            if(val.indexOf(newVal) <= -1){
                if(this.get('mutiple')){
                    if(val && !/,$/.test(val)){
                        this._node.val(val + ',' + newVal);
                    }else{
                        this._node.val(val + newVal + ',');
                    }
                }else{
                    this._node.val(newVal);
                }                
            }
        },
        /**
        * 根据传入的节点取消城市选择
        *
        * @method _delCity
        * @param {Node} tar input节点 
        * @private
        */
        _delCity : function(tar){
            var oldVal = S.trim(this._node.val());
            this._node.val(oldVal.replace(new RegExp(tar.val()+',?','g'),''));
        },
        /**
        * 设置'autoWidth'属性时执行
        *
        * @method _onSetAutoWidth
        * @private
        */
        _onSetAutoWidth : function(){
            if(this.get('autoWidth')){
                this._contentEl.css(WIDTH,this._node.width());
            }else{
                this._onSetWidth();
            }            
        },
        /**
        * 设置'width'属性时执行
        *
        * @method _onSetWidth
        * @private
        */
        _onSetWidth : function(){
            this._contentEl.css(WIDTH,this.get(WIDTH));
        },
        /**
        * 设置'height'属性时执行
        *
        * @method _onSetAutoHeight
        * @private
        */
        _onSetHeight : function(){
            var h = this.get(HEIGHT);
            this._contentEl.css(HEIGHT,h);
            this._listEl.css(HEIGHT,h - 50);
        },
        /**
        * 根据指定的字母切换到相应字母filter
        *
        * @method setLetter
        * @param {String} letter 指定的字母,'abcdefghijklmnopqrstuvwxyz'加单词'all'
        * @return {CitySelector} this，当前实例
        * @example 

        city-selector.setLetter('x'); //选中所有以'X'为拼音首字母的省
        city-selector.setLetter('all'); //选中全部

        * @chainable
        */
        setLetter : function(letter){
            if(letter == 'all'){
                this._setLetter(letter);
                return this;
            }
            if(S.isString(letter) && letter.length == 1 && LETTERS.indexOf(letter) > -1){
                this._setLetter(letter);
            }
            return this;
        },
        /**
        * 显示城市选择器
        *
        * @method show
        * @return {CitySelector} this，当前实例
        * @chainable
        */
        show : function(){
            this._contentEl.show();
            return this;
        },
        /**
        * 隐藏城市选择器
        *
        * @method hide
        * @return {CitySelector} this，当前实例
        * @chainable
        */
        hide : function(){
            this._contentEl.hide();
            return this;
        },
        /**
        * 选中指定城市
        *
        * @method select
        * @param {Array|String} string 城市名称，如'北京'或['北京','太原']
        * @return {CitySelector} this，当前实例
        * @example

        var city-selector = new CitySelector(config);
        city-selector.select('北京'); //会选中北京
        city-selector.select(['北京','杭州']); //会选中北京和杭州

        * @chainable
        */
        select : function(string){
            var _ = this;
            if(S.isArray(string)){
                S.each(string,function(item){
                    _.select(item);
                });
            }else{
                var node,
                    type,
                    id,
                    city = S.one('#ks-city-selector'+this._id+'-city-'+this._citys[string]),
                    province = S.one('#ks-city-selector'+this._id+'-province-'+this._provinces[string]);
                if(city){
                    node = city;
                    type = CITY;
                    id = this._citys[string];
                }else if(province){
                    node = province;
                    type = PROVINCE;
                    id = this._provinces[string];
                }
                if(node){
                    node.prop(CHECKED,true);
                    /**
                    当用户选择时触发
                    @event select
                    @param {event} e 提供用户选择的一些信息
                    <dl>
                    <dt>type</dt><dd>用户选中的类型，'city'或'province'</dd>
                    <dt>value</dt><dd>用户选中的值，'北京'</dd>
                    <dt>raw</dt><dd>用户选中的值对应的元数据</dd>
                    </dl>
                    */
                    this.fire('select',{
                        data : {
                            type : type,
                            value : string,
                            raw : this._formatData[id]
                        }                    
                    });
                    if(this.get('mutiple')){
                        this._selected.push(node);
                        this._selectedValues.push(string);
                    }else{
                        this._selected[0] && this._selected[0].prop(CHECKED,false);
                        this._selected[0] = node;
                        node.prop(CHECKED,true);
                        this._selectedValues[0] = string;
                    }
                    this._fillInput(node,type);
                }
            }
            return this;
        },
        /**
        * 取消选中指定城市，与select相反
        *
        * @method unSelect
        * @param {Array|String} string 城市名称，如'北京'或['北京','太原']
        * @return {CitySelector} this，当前实例
        * @chainable
        */
        unSelect : function(string){
            var _ = this;
            if(S.isArray(string)){
                S.each(string,function(item){
                    _.unSelect(item);
                });
            }else{
                var node,
                    type,
                    id,
                    city = S.one('#ks-city-selector'+this._id+'-city-'+this._citys[string]),
                    province = S.one('#ks-city-selector'+this._id+'-province-'+this._provinces[string]);
                if(city){
                    node = city;
                    type = CITY;
                    id = this._citys[string];
                }else if(province){
                    node = province;
                    type = PROVINCE;
                    id = this._provinces[string];
                }
                if(node){
                    node.prop(CHECKED,false);
                    /**
                    当用户取消选择时触发
                    @event unselect
                    @param {event} e 提供用户取消的一些信息
                    <dl>
                    <dt>type</dt><dd>用户取消的类型，'city'或'province'</dd>
                    <dt>value</dt><dd>用户取消的值，'北京'</dd>
                    <dt>raw</dt><dd>用户取消的值对应的元数据</dd>
                    </dl>
                    */
                    this.fire('unselect',{
                        data : {
                            type : type,
                            value : string,
                            raw : this._formatData[id]
                        }                    
                    });
                    if(this.get('mutiple')){
                        var tmpNode = [],
                            tmpString = [],
                            selectedVal = _._selectedValues;
                        S.each(_._selected,function(item,index){
                            if(!item.equals(node)){
                                tmpNode.push(item);
                            }
                            if(selectedVal[index] != string){
                                tmpString.push(selectedVal[index]);
                            }
                        });
                        this._selected = tmpNode;
                        this._selectedValues = tmpString;
                    }else{
                        this._selected = [];
                        this._selectedValues = []; 
                    }
                    this._delCity(node,type);
                }
            }
            return this;
        },
        /**
        * 获取用户当前已经选中的城市列表
        *
        * @method getSelected
        * @return {Array} 选中的城市列表，['北京','太原']
        */
        getSelected : function(){
            return this._selectedValues;
        }
    },{
    	ATTRS : {
            /**
            设置城市选择器的触发方式，在不设置render的情况下有效，会以overlay的方式呈现

            @attribute triggerType
            @type string
            @default 'focus'
            @writeOnce
            @optional
            */
    		triggerType : {
    			value : 'focus'
    		}, 
            /**
            设置城市选择器的宽度

            @attribute width
            @type number
            @default 500
            @optional
            */   		
            width : {
                value : 500
            }, 
            /**
            设置城市选择器的高度

            @attribute height
            @type number
            @default 400
            @optional
            */           
    		height : {
    			value : 400
    		},
            /**
            城市选择器默认宽度与input一致

            @attribute autoWidth
            @type boolean
            @default false
            @optional
            */
            autoWidth : {
                value : false
            },
            /**
            是否支持多选

            @attribute mutiple
            @type boolean
            @default false
            @optional
            */
    		mutiple : {
    			value : false
    		},
            /**
            省是否可以选择

            @attribute canProvinceSelect
            @type boolean
            @default false
            @optional
            */
            canProvinceSelect : {
                value : false
            },
            /**
            设置城市选择器的class前缀，只设置了一个，如果需要自定义样式，可使用此命名空间重置

            @attribute prefixCls
            @type string
            @default 'ks-'
            @optional
            @writeOnce
            */
            prefixCls : {
                value : 'ks-'
            }
            /**
            城市选择器所需要绑定的input节点

            @attribute node
            @type HTMLElement|node|selector
            @writeOnce
            */
            /**
            城市选择器渲染的父容器，如果不提供则使用overlay方式

            @attribute render
            @type HTMLElement|node|selector
            @writeOnce
            @optional
            */
            /**
            城市选择器需要的数据

            @attribute data
            @type json
            @writeOnce
            */
    	}
    },'CitySelector');

    return CitySelector;

},{requires:['node','event','overlay','gallery/juicer/1.2/index','rich-base','./assets/index.css']});