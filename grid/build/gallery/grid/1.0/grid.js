/** @fileOverview 对KISSY进行扩展的一些帮助函数
* 包括：屏蔽层，格式化函数，Form帮助类，数据缓冲类
* @author <a href="mailto:dxq613@gmail.com">董晓庆 旺旺：dxq613</a>  
* @version 1.0.1  
*/
KISSY.add("gallery/grid/1.0/util",function(S){
	
	var DOM = S.DOM, Event = S.Event,
        win = window, doc = document,UA=S.UA;

	/** 
		@namespace 良权限控件命名控件
		@exports S.LP as KISSY.LP
		@description 所有良权限控件库的命名控件
	*/
	S.LP = S.namespace('LP');

	S.mix(S.LP,
	/** @lends  S.LP */
	{
		/**
		* @description 屏蔽整个页面: <br> 1）ie 6,ie 7下设置100%无效 <br> 2) 兼容浏览器的可视区域和内容区域
		* @example 
		*	S.LP.mask();	//屏蔽窗口
		*	S.LP.unmask();	//解除屏蔽窗口
		*/
		mask : function(){
			var bodyEl = S.one('body'),
				bodyHeight = bodyEl.height(),
				viewHeight = DOM.viewportHeight(),
				height = bodyHeight > viewHeight ?bodyHeight :viewHeight,
				maskEl = S.LP.maskElement(bodyEl);
			
			maskEl.height(height);
			Event.on(win,'resize',resizeEvent);
			maskEl.data('reszieFunc',resizeEvent);
			var funcId =null;
			function resizeEvent(){

				if(funcId)
				{
					clearTimeout(funcId);
				}
				funcId = setTimeout(setHeight,300);
			}

			function setHeight(){
				var viewHeight = DOM.viewportHeight(),
					height = bodyHeight > viewHeight ?bodyHeight :viewHeight;
				maskEl.height(height);
			}
		},
		/**
			@description 取消屏蔽整个页面
		*/
		unmask :function(){
			var bodyEl = S.one('body'),
				maskEl = bodyEl.children('.lp-el-mask'),
				func = maskEl.data('reszieFunc');
			if(func){
				Event.remove(win,'resize',func);
				maskEl.data('reszieFunc',null);
			}
			S.LP.unmaskElement(bodyEl);
		},
		/**
		* @description 屏蔽指定元素
		* @param {[String|DOM|Node]} element 屏蔽的元素，可以使用选择器、Dom元素，Node元素
		* @param {String} msg 屏蔽层上显示的信息，可以为空
		* @param {String} msgCls 屏蔽信息上应用的CSS,可以为空，此项仅在 msg有效时起作用
		* @example 
		*	S.LP.maskElement('#domId');	//屏蔽元素，暂时只屏蔽选择器的第一个元素
		*/
		maskElement: function (element, msg, msgCls) {
			var maskedEl = S.one(element),
				maskedNode = maskedEl.getDOMNode(),
				maskDiv = S.one('.lp-el-mask',maskedNode);
			if (!maskDiv) {
				var maskDiv = S.one(DOM.create('<div class="lp-el-mask"></div>')).appendTo(maskedNode);
				maskedEl.addClass('x-masked-relative x-masked');
				if(UA.ie == 6){
					maskDiv.height(maskedEl.height());
				}
				if (msg) {
					var template = ['<div class="lp-el-mask-msg"><div>', msg, '</div></div>'].join(''),
						msgDiv = S.one(DOM.create(template)).appendTo(maskedNode);
					if (msgCls) {
						msgDiv.addClass(msgCls);
					}
					try{
						var left = (maskedEl.width()- msgDiv.width()) / 2,
							top = (maskedEl.height() - msgDiv.height()) / 2;
						msgDiv.css({ left: left, top: top });
					}catch(ex){
						S.log('width error!');
					}
				}
			}
			return maskDiv;
		},
		/**
		* @description 解除对应元素的屏蔽
		* @param {[String|DOM|Node]} element 屏蔽的元素，可以使用选择器、Dom元素，Node元素
		* @example 
		*	S.LP.unmaskElement('#domId');	//解除屏蔽元素，暂时只支持选择器的第一个元素
		*/ 
		unmaskElement: function (element) {
			var maskedEl = S.one(element),
				maskedNode = maskedEl.getDOMNode(),
				msgEl = maskedEl.children('.lp-el-mask-msg'),
				maskDiv = maskedEl.children('.lp-el-mask');
			if(msgEl){
				msgEl.remove();
			}
			if(maskDiv){
				maskDiv.remove();
			}
			maskedEl.removeClass('x-masked-relative x-masked');

		}
	});
	
	/**
		格式化数据的帮助方法
		@description 用于格式化文本，常用于表格
		@class 格式化帮助类
	*/
	S.LP.Format = function(){
		/** @lends  S.LP.Format */	
		return {
			/**
				@description 日期格式化函数
				@param {Number|Date} date 格式话的日期，一般为1970 年 1 月 1 日至今的毫秒数 
				@return {String} 格式化后的日期格式为 2011-10-31
				@example
			* 一般用法：<br> 
			* S.LP.Format.dateRenderer(1320049890544);输出：2011-10-31 <br>
			* 表格中用于渲染列：<br>
			* {title:"出库日期",dataIndex:"date",renderer:S.LP.Format.dateRenderer}
			*/
			dateRenderer: function (d) {
				if(!d){
					 return "";
				}
                try {
                    var date =new Date(d);// eval(d.replace(/\/Date\((\d+)\)\//gim, "new Date($1)"));
                } catch (e) {
                    return "";
                }
                if (!date || !date.getFullYear)
                    return "";
                return S.Date.format(d,"yyyy-mm-dd");
            },
			/**
				@description 日期时间格式化函数
				@param {Number|Date} date 格式话的日期，一般为1970 年 1 月 1 日至今的毫秒数 
				@return {String} 格式化后的日期格式时间为 2011-10-31 16 : 41 : 02
			*/
			datetimeRenderer: function (d) {
				if(!d){
					 return "";
				}
                try {
                    var date =new Date(d);// eval(d.replace(/\/Date\((\d+)\)\//gim, "new Date($1)"));
                } catch (e) {
                    return "";
                }
                if (!date || !date.getFullYear)
                    return "";
				var dateString = S.Date.format(d,"yyyy-mm-dd HH:MM:ss");
				//var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + ' ' + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                return dateString;//.replace(/(\s)(\d):/,' 0$2:').replace(/:(\d):/,':0$1:').replace(/:(\d)$/,':0$1'));
			},
			/**
				@description 文本截取函数，当文本超出一定数字时，会截取文本，添加...
				@param {Number} length 截取多少字符
				@return {String} 返回截取后的字符串，如果本身小于指定的数字，返回原字符串。如果大于，则返回截断后的字符串，并附加...
			*/
			cutTextRenderer : function(length){
				return function(value){
					value = value || '';
					if(value.toString().length > length){
						return value.toString().substring(0,length)+"...";
					}
					return value;
				}
			},
			/**
			* @description 枚举格式化函数
			* @param {Object} enumObj 键值对的枚举对象 {"1":"大","2":"小"}
			* @return {Function} 返回指定枚举的格式化函数
			* @example 
			* //Grid 的列定义
			*  {title:"状态",dataIndex:"status",renderer:S.LP.Format.enumRenderer({"1":"入库","2":"出库"})}
			*/
			enumRenderer : function(enumObj){
				return function(value){
					return enumObj[value] || '';
				}
			},
			/*
			* @description 将多个值转换成一个字符串
			* @param {Object} enumObj 键值对的枚举对象 {"1":"大","2":"小"}
			* @return {Function} 返回指定枚举的格式化函数
			* @example 
			* //Grid 的列定义
			*  {title:"状态",dataIndex:"status",renderer:S.LP.Format.multipleItemsRenderer({"1":"入库","2":"出库","3":"退货"})}
			*  //数据源是[1,2] 时，则返回 "入库,出库"
			*/
			multipleItemsRenderer : function(enumObj){
				var enumFun = S.LP.Format.enumRenderer(enumObj);
				return function(values){
					if(!values)
						return '';
					var result = [];
					if(S.isArray(values)){
						values = values.toString().split(',');
					}
					S.each(values,function(value){
						result.push(enumFun(value));
					});
					
					return result.join(',');
				}
			}
		};
	}();
	
	/**
	* 表单的一些工具方法
	* @class 表单帮助类
	*/
	S.LP.FormHelpr={
		/**
		* 将表单数据序列化成为字符串
		* @param {HTMLForm} form 表单元素
		* @return {String} 序列化的字符串
		*/
		serialize:function(form){
			return S.param(S.LP.FormHelpr.serializeToObject(form));
		},
		/**
		* 将表单数据序列化成对象
		* @param {HTMLForm} form 表单元素
		* @return {Object} 表单元素的
		*/
		serializeToObject:function(form){
			var elements = S.makeArray(form.elements);
			elements = S.filter(elements,function(item){
				return (item.id ||item.name) && !item.disabled &&
					(this.checked || /select|textarea/i.test(item.nodeName) ||
						/text|hidden|password/i.test(item.type));
			});
			var arr =[];
			S.each(elements,function(elem){
				var val = S.one(elem).val(),
					obj = val == null ? null : S.isArray(val) ?
					S.map( val, function(val, i){
							return {name: elem.name||elem.id, value: val};
					}) :
					{name:  elem.name||elem.id, value: val};
				if(obj){
					arr.push(obj);
				}
			});
			var result={};
			S.each(arr,function(elem){
				var prop = result[elem.name];
				if(!prop){
					result[elem.name] = elem.value;
				}else if(S.isArray(prop)){
					prop.push(elem.value);
				}else{
					var a = [];
					a.push(prop);
					a.push(elem.value);
					result[elem.name]=a;
				}
			});
			return result;
		}
	};
		
	return S.LP;
}, {
    requires: ["core","calendar"]
});
KISSY.add("gallery/grid/1.0/bar",function(S,barItem){
	var DOM = S.DOM,Node = S.Node;

	var CLS_BTN_CONTAINER = 'bar-btn-container';

	//分页栏、工具栏、状态栏的基类
	function bar(config){
		var _self = this;
		config = config || {};
		
		bar.superclass.constructor.call(_self, config);
		_self._init();
	}

	
	S.extend(bar, S.Base);
	S.augment(bar,{
		//Bar 的自定义样式
		CLS_BAR : '',
		//查找 子元素的DOM
		_findItem : function (element) {
			if (DOM.hasClass(element, CLS_BTN_CONTAINER)) {
				return element;
			} else {
				return DOM.parent(element, '.' + CLS_BTN_CONTAINER);
			}
		},
		//提供的默认模板
		_getBarTemplate : function(){
			return '<div></div>';
		},
		//初始化配置项
		_init : function(){
			var _self = this,
				items = _self.get('items'),
				defaults = _self.get('defaults'),
				item = null,//配置项
				cls = null; //配置项类型
			for(var i = 0,count = items.length;i < count;i++){
				item = S.merge(defaults, items[i]);
				if(S.isUndefined(item.id)){
					item.id = i;
				}
				if(!item.isBarItem){
					cls = barItem.types[item.type||'text'];
					if(!cls){
						cls = barItem.types['text'];
					}
					items[i] = new cls(item);
				}
			}
			_self._initDOM();
			_self._initEvent();
		},
		//初始化Dom元素
		_initDOM : function(){
			var _self = this,
				barTemplate = _self._getBarTemplate(),
				renderTo = _self.get('renderTo'),
				container = DOM.get('#'+renderTo),
				items = _self.get('items'),
				barEl = new Node(barTemplate).appendTo(container),
				tableEl = new Node('<table style="border-spacing: 0;"><tr></tr></table>').appendTo(barEl),
				tr = DOM.get('tr',tableEl[0]);
			_self.set('bar', barEl);
			
			//创建bar各个子项的Dom
			S.each(items,function (item,index){
				var cell = tr.insertCell(index);
				item.renderTo(cell);
			});
			DOM.addClass(container,_self.CLS_BAR);
			DOM.show(container);
		},
		//初始化各个子项的事件
		_initEvent : function(){
			var items = this.get('items');
			S.each(items,function (item){
				item.attachEvent();
			});
		}
	});
	return bar;

}, {requires : ["./barItem"]});KISSY.add("gallery/grid/1.0/barItem",function(S){
	var DOM = S.DOM,Node = S.Node;

	/*帮助函数*/
	function capitalFirst(s) {
        s += '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

	/**
	* @exports S.LP as KISSY.LP
	*/

	//常量
	var UI_SET = '_uiSet',
		ATTR_BUTTON_DISABLED = 'disabled',//禁用按钮属性
		CLS_DISABLE = 'lp-item-disabled',//禁用按钮样式
		CLS_BTN_CONTAINER = 'bar-btn-container',
		CLS_TEXT_CONTAINER = 'pb-text-container',
		CLS_BTN_CUSTOM = "bar-btn-custom",//自定义按钮，不应用一般按钮的悬浮效果
		CLS_ITEM_BTN = 'bar-item-btn',
		CLS_ITEM_OVER = 'bar-item-over',
		CLS_ITEM_SEPERATOR = 'bar-item-separator';
		CLS_ITEM_INPUT = 'pb-item-input',
		CLS_BAR_ICON = 'bar-icon';
		

	//所有 bar 元素的基类
	function barItem(config){
		var _self = this;
		config = S.merge({isBarItem:true,css:''},config);
		S.mix(_self,config);
		barItem.superclass.constructor.call(_self, config);
		_self._init();
	}

	S.extend(barItem, S.Base);
	S.augment(barItem,{
		/**
		* 附加事件
		*/
		attachEvent : function(){
			var _self = this,
				el = _self.get('el');
			if(el){
				if(_self.handler){
					el.on('click',_self.handler);
				}
			}
			
		},
		/**
		* 将该项附加到 Bar上
		* @return {Node}
		*/
		renderTo : function(barEl){
			if(this.get('el')){
				return this.get('el');
			}
			var _self = this,
				temp = _self._getItemTemplate(),
				node = new S.Node(temp).appendTo(barEl);;
			_self.set('el',node);
			return node;
		},
		/**
		 * 根据属性变化设置 UI
		 */
		_bindUI: function() {
			var self = this,
				attrs = self.__attrs,
				attr, m;

			for (attr in attrs) {
				if (attrs.hasOwnProperty(attr)) {
					self.on('after' + capitalFirst(attr) + 'Change', function(ev) {
							self[attr] = ev.newVal;
					});
					m = UI_SET + capitalFirst(attr);
					if (self[m]) {
						// 自动绑定事件到对应函数
						(function(attr, m) {
							self.on('after' + capitalFirst(attr) + 'Change', function(ev) {
								self[m](ev.newVal, ev);
							});
						})(attr, m);
					}
				}
			}
		},
		//获取元素的模版
		_getItemTemplate : function(){
			return '';
		},
		//初始化
		_init : function(){
			var _self = this;
			_self._bindUI();
		},
		/**
		* 释放控件资源
		*/
		destroy : function(){
			var _self = this,
				el = _self.get('el');
			
			el.remove();
			_self.detach();
			_self.__attrVals = {};

		}

	});

	//按钮元素
	function buttonBarItem(config){
		var _self = this;
			
		buttonBarItem.superclass.constructor.call(_self, config);
		
	}

	S.extend(buttonBarItem, barItem);
	S.augment(buttonBarItem,{
		/**
		* 附加事件，所有的按钮 添加鼠标事件
		*/
		attachEvent : function(){
			var _self = this,
				el = _self.get('el');
			_self.constructor.superclass.attachEvent.call(_self);
			if(el){
				el.on('mouseover', function (event) {
					if (!el.hasClass(CLS_DISABLE)) {//禁用状态下，hover效果不起效
						el.addClass(CLS_ITEM_OVER);
					}
				}).on('mouseout', function (event) {
					el.removeClass(CLS_ITEM_OVER);
				});
			}
		},
		_getItemTemplate : function(){
			var _self = this,
				clsDisable =  _self.disabled ? CLS_DISABLE : '',
				disabledText = _self.disabled ? 'disabled="disabled"' : '',
				clsCustom = _self.text ? CLS_BTN_CUSTOM : '',
				temp = ['<div id="',_self.id,'" class="', CLS_BTN_CONTAINER, ' ', clsDisable, ' ', _self.containerCss,'"><button class="', CLS_ITEM_BTN, ' ', _self.css, '" autocomplete="off" hidefocus="true" ', disabledText, ' type="button">', _self.text, '</button></div>'].join('');
			return temp;
		},
		_uiSetDisabled : function(disabled){
			var _self = this,
				el = _self.get('el'),
				button = el.one('button');
			if(disabled){
				el.addClass(CLS_DISABLE);
				button.attr(ATTR_BUTTON_DISABLED,'');
				el.removeClass(CLS_ITEM_OVER);
			}else{
				el.removeClass(CLS_DISABLE);
				button.removeAttr(ATTR_BUTTON_DISABLED);
				
			}
		}
	});
	
	//文本元素
	function textBarItem(config){
		var _self = this;
		textBarItem.superclass.constructor.call(_self, config);
	}

	S.extend(textBarItem, barItem);
	S.augment(textBarItem,{
		_getItemTemplate : function(){
			var _self = this;
			return ['<div id="',_self.id,'"  class="', CLS_TEXT_CONTAINER, _self.css ,'">',_self.text,'</div>'].join('');
		}
	});
	
	//分割符元素
	function seperatorBarItem(config){
		var _self = this;
		seperatorBarItem.superclass.constructor.call(_self, config);
	}

	S.extend(seperatorBarItem, barItem);
	S.augment(seperatorBarItem,{
		_getItemTemplate : function(){
			var _self = this;
			return '<div class="' + CLS_ITEM_SEPERATOR + '"></div>';
		}
	});
	
	//链接元素
	function linkBarItem(config){
		var _self = this;
		linkBarItem.superclass.constructor.call(_self, config);
	}

	S.extend(linkBarItem, barItem);
	S.augment(linkBarItem,{
		_getItemTemplate : function(){
			var _self = this;
			return ['<div id="',_self.id,'"  class="', CLS_TEXT_CONTAINER, '"><a class="',_self.css,'" href = "',_self.href,'">',_self.text,'</a></div>'].join('');
		}
	});

	//自定义模版
	function customBarItem(config){
		var _self = this;
		customBarItem.superclass.constructor.call(_self, config);
	}

	S.extend(customBarItem, barItem);
	S.augment(customBarItem,{
		_getItemTemplate : function(){
			var _self = this;
			return S.substitute(_self.template,_self);
		}
	});
	
	//bar 元素的类型
	barItem.types = {
		button : buttonBarItem, //按钮类型
		text : textBarItem,		//文本类型
		link : linkBarItem,		//链接类型
		custom : customBarItem,	//自定义类型
		seperator : seperatorBarItem //分割信息栏
	};
	
	return barItem;
}, {requires : []});/**
	工具栏、状态栏的基类
	create by dxq 2011-10-12
*/
KISSY.add("gallery/grid/1.0/buttonBar",function(S,bar){

	var CLS_BUTTON_BAR = "button-bar";
	//按钮栏
	function buttonBar(config){
		var _self = this;
		config = _self._formatConfig(config || {});
		
		buttonBar.superclass.constructor.call(_self, config);
		//_self._init();
	}
	S.extend(buttonBar, bar);

	S.augment(buttonBar,{
		CLS_BAR : CLS_BUTTON_BAR,
		//格式化配置
		_formatConfig : function (config){
			var result ={renderTo : config.renderTo,items:[]},
				items = config.buttons || config.items;
			
			S.each(items, function (button){
				var item = S.merge({type:'button'},button);
				result.items.push(item);
			});

			return result;
		}
	});

	return buttonBar;
}, {requires : ["./bar"]});
	
KISSY.add("gallery/grid/1.0/calendar",function(S){
	function calendar(list){
		var DOM = S.DOM 
			Event = S.Event,
			date = {} ;
		S.each(list,function(item){
			var node = DOM.get(item.selector);
			if(!node) return ;
			
			//给时间控件添加小按钮，设置长度,取消只读
			var timeInput = S.one(item.selector);
			if(timeInput.hasAttr('readonly')){
				timeInput.removeAttr('readonly');
			}
			if(!timeInput.hasClass('ks-select-calendar')){
				timeInput.addClass('ks-select-calendar');
			}
			if(item.showTime){
				if(!timeInput.hasClass('calendar-time')){
					timeInput.addClass('calendar-time');
				}
			}
			var datatime ,
				method = item.showTime ? "timeSelect" : "select" ,
				format = item.showTime ? "yyyy-mm-dd HH:MM:ss" : "yyyy-mm-dd",
				min = item.min ? showdate(item.min, new Date()) : (item.min == 0 ? new Date() : null ) ,
				max = item.max ? showdate(item.max, new Date()) : (item.max == 0 ? new Date() : null );
				
			if(item.config){
				datatime = new S.Calendar(item.selector,item.config) ;
			}
			else{
				var selected = Date.parse(DOM.val(item.selector).replace(/\-/g,"/"));
				datatime = new S.Calendar(item.selector,{
					minDate:min,
					maxDate:max,
					selected:selected ? new Date(selected) : null ,
					showTime:item.showTime,
					popup:true,
					triggerType:['click']
				});
			}
			datatime.on(method,function(ev){
				var p = DOM.get(item.selector) ;
				DOM.val(p,getDate(ev.date)) ;
				this.hide();
				p.focus();
			});

			Event.on(item.selector,"valuechange",function(ev){
				if(!(ev.keyCode == 8 || ev.keyCode == 46)){
					DOM.val(this,"");
				}
			});

			function getDate(date){
				return S.Date.format(date,format)
			}

			date[item.selector] = datatime ;
		});

		return date;
	}

	var showdate = function(n, d) {//计算d天的前几天或者后几天，返回date,注：chrome下不支持date构造时的天溢出
        var uom = new Date(d - 0 + n * 86400000);
        uom = uom.getFullYear() + "/" + (uom.getMonth() + 1) + "/" + uom.getDate();
        return new Date(uom);
	}

	return calendar;

},{requires: ["core","calendar"]});KISSY.add("gallery/grid/1.0/loadMask",function(S,util){	

	/** 
		@exports S.LP as KISSY.LP
	*/

	/**
	* 屏蔽指定元素，并显示加载信息
	* @memberOf S.LP
	* @class 加载屏蔽类
	* @property {String|DOM|Node} el 要屏蔽的元素，选择器、Dom元素或Node元素
	* @param {String|DOM|Node} element 要屏蔽的元素，选择器、Dom元素或Node元素
	* @param {Object} config 配置信息<br>
	* 1) msg :加载时显示的加载信息<br>
	* 2) msgCls : 加载时显示信息的样式
	*/
    var LoadMask = function (element, config) {
		var _self = this;
		
        _self.el = element;
		LoadMask.superclass.constructor.call(_self, config);
		_self._init();
    };

	S.extend(LoadMask, S.Base);
    //对象原型
    S.augment(LoadMask, 
	/** @lends S.LP.LoadMask.prototype */	
	{
		/**
		* 加载时显示的加载信息
		* @field 
		* @default Loading...
		*/
        msg: 'Loading...',
		/**
		* 加载时显示的加载信息的样式
		* @field
		* @default x-mask-loading
		*/
        msgCls: 'x-mask-loading',
		/**
		* 加载控件是否禁用
		* @type Boolean
		* @field
		* @default false
		*/
        disabled: false,
		_init:function(){
			var _self =this;
			_self.msg = _self.get('msg')|| _self.msg;
		},
        /**
		* @description 设置控件不可用
		*/
        disable: function () {
            this.disabled = true;
        },
        /**
		* @private 设置控件可用
		*/
        enable: function () {
            this.disabled = false;
        },

        /**
		* @private 加载已经完毕，解除屏蔽
		*/ 
        onLoad: function () {
            util.unmaskElement(this.el);
        },

        /**
		* @private 开始加载，屏蔽当前元素
		*/ 
        onBeforeLoad: function () {
            if (!this.disabled) {
                util.maskElement(this.el, this.msg, this.msgCls);

            }
        },
        /**
        * 显示加载条，并遮盖元素
        */
        show: function () {
            this.onBeforeLoad();
        },

        /**
        * 隐藏加载条，并解除遮盖元素
        */
        hide: function () {
            this.onLoad();
        },

        /*
		* 清理资源
		*/
        destroy: function () {
			this.el = null;   
        }
    });

	S.LP.LoadMask = LoadMask;

	return LoadMask;
}, {requires : ["./util"]});KISSY.add("gallery/grid/1.0/paggingBar",function(S,bar){	

	/** 
		@exports S.LP as KISSY.LP
	*/

	var CLS_BTN_CUSTOM = "bar-btn-custom",//自定义按钮，不应用一般按钮的悬浮效果
		CLS_INPUT_CONTAINER = 'pb-input-container',
		CLS_IEXT_CONTAINER = 'pb-text-container',
		CLS_TEXT_COUNT = 'pb-total-count',
		CLS_TEXT_PAGE = 'pb-total-page',
		CLS_FIRST = 'pb-page-first',
		CLS_LAST = 'pb-page-last',
		CLS_NEXT = 'pb-page-next',
		CLS_PREV = 'pb-page-prev',
		CLS_OK = 'pb-page-ok',
		CLS_PAGGING_BAR = 'pagging-bar';
	
	//分页栏
	/**
	* 翻页时触发
	* @name S.LP.PaggingBar#beforepagechange
	* @event  
	* @param {event} e  事件对象
	* @param {event} e.from  起始页
	* @param {event} e.to  目标页
	* @return {Boolean} 如果返回false则，取消翻页
	*/
	function paggingBar(config){
		var _self = this;
		config = _self._formatConfig(config || {});
		S.mix(_self, {
			start : 0,  //页面的起始记录
            end : 0,    //页面的结束记录
            totalCount : 0, //记录的总数
            curPage : 1,    //当前页
            totalPage : 1  //总页数
		});
		paggingBar.superclass.constructor.call(_self, config);
	}
	
	S.extend(paggingBar, bar);
	S.augment(paggingBar,
	/** @lends S.LP.PaggingBar.prototype */	
	{
		CLS_BAR : CLS_PAGGING_BAR,
		//数据加载完成后，更新状态
		_afterStoreLoad : function (store, params) {
			var _self = this,
				pageSize = _self.get('pageSize'),
				start = 0,  //页面的起始记录
				end = 0,    //页面的结束记录
				totalCount = 0, //记录的总数
				curPage = 1,    //当前页
				totalPage = 1;//总页数;
            if (params) {
                start = params.start || 0;
            } else {
                start  = 0;
            }
            //设置加载数据后翻页栏的状态
            totalCount = store.getTotalCount();
            end = totalCount - start > pageSize ? start + store.getCount() : totalCount;
            totalPage = parseInt((totalCount + pageSize - 1) / pageSize, 10);
            totalPage = totalPage > 0 ? totalPage : 1;
            curPage = parseInt(start / pageSize, 10) + 1;

			_self.start = start;
			_self.end = end;
			_self.totalCount = totalCount;
			_self.curPage = curPage;
			_self.totalPage = totalPage;

            //设置按钮状态
            _self._setAllButtonsState();
            _self._setNumberPages();
        },
		//分页栏的模版（容器）
		_getBarTemplate : function() {
			return '<div class="fr"></div>';
		},
		//获取按钮的配置
		_getButtonConfig : function(id,buttonClass, disabled,text){
			var _self = this;
			return {
				id : id,
				type : 'button',
				css : buttonClass,
				text : text,
				containerCss : text ? CLS_BTN_CUSTOM : '',
				disabled : !!disabled,
				handler : function(event){
					var item = _self._findItem(event.target),
						btn = S.one('button',item);
					if(!DOM.hasClass(item,CLS_DISABLE)){
						_self._pageAction(btn);
					}
				}
			};
		},
		//获取分页配置
		_getPageInfoConfig : function(){
			var temp = ['<span class="', CLS_IEXT_CONTAINER, '">第</span><span class="', CLS_INPUT_CONTAINER, '"><input type="text" autocomplete="off" class="', CLS_ITEM_INPUT, '" size="20" name="inputItem"></span><span class="', CLS_IEXT_CONTAINER, ' ', CLS_TEXT_PAGE, '">页 共 0 页</span>'].join('');
			return {type:'custom',template : temp};
		},
		//获取总页数配置
		_getCountInfoConfig : function(){
			var temp = ['<div class="', CLS_IEXT_CONTAINER, '">共 <span class="', CLS_TEXT_COUNT, '">0</span> 条记录</div>'].join('');
			return {type:'custom',template : temp};
		},
		//格式化参数，提供分页栏的各个配置项
		_formatConfig : function (config){
			var _self = this,
				items = [],
				result =S.merge(config,{items:items});
			//保存 按钮（首页、最后一页、下一页、前一页）
			items.push(_self._getButtonConfig('btnfirst',CLS_FIRST,true));
			items.push(_self._getButtonConfig('btnpre',CLS_PREV,true));

			//分割条
			items.push({type:'seperator'});
			//分页信息
			items.push(_self._getPageInfoConfig());
			
			items.push({type:'seperator'});
			items.push(_self._getButtonConfig('btnnext',CLS_NEXT,true));
			items.push(_self._getButtonConfig('btnlast',CLS_LAST,true));
			items.push(_self._getButtonConfig('btnok',CLS_OK,false,'跳转'));//确定按钮

			items.push({type:'seperator'});
            items.push(_self._getCountInfoConfig());//总计多少条

			return result;
		},
		//初始化事件
		_initEvent : function (){
			//调用基类的初始化事件
			this.constructor.superclass._initEvent.call(this);

			var _self = this,
				store = _self.get('store'),
				bar  = _self.get('bar');

			if (store) {
				store.on('load', function (params) {
					_self._afterStoreLoad(store, params);
				});
			}

			bar.one('.' + CLS_ITEM_INPUT).on('keyup', function (event) {
				event.stopPropagation();
				if (event.keyCode === 13) {
					var sender = S.one(this),
						enterValue = parseInt(sender.val(), 10);
					if (_self._isPageAllowRedirect(enterValue)) {
						_self.skipToPage(enterValue);
					} else {
						sender.val(_self.curPage);
					}
				}
			});
		},
		//是否允许跳转，若已经在当前页或者不在有效页范围内，不允许跳转
		_isPageAllowRedirect : function(value) {
			var _self = this;
			return value && value > 0 && value <= _self.totalPage && value !== _self.curPage;
		},
		//分页栏上的按钮事件
		_pageAction : function (btnEl) {
			var _self = this,
				page = 1;
			if (btnEl.hasClass(CLS_FIRST)) {
				page = 1;
			} else if (btnEl.hasClass(CLS_NEXT)) {
				page = _self.curPage + 1;
			} else if (btnEl.hasClass(CLS_PREV)) {
				page = _self.curPage - 1;
			} else if (btnEl.hasClass(CLS_LAST)) {
				page = _self.totalPage;
			} else if (btnEl.hasClass(CLS_OK)) {
				var bar = _self.get('bar');
					inputEl = bar.one('.' + CLS_ITEM_INPUT),
					value = parseInt(inputEl.val(), 10);
				if(_self._isPageAllowRedirect(value)){
					page = value;
				}else{
					inputEl.val(_self.curPage);
					return;
				}
			}
			_self.skipToPage(page);

		},
		/**
		* 跳到指定页
		* @param {Number} page 目标页
		*/
		skipToPage : function (page) {
			var _self = this,
				store = _self.get('store'),
				pageSize = _self.get('pageSize'),
				index = page - 1,
				start = index * pageSize;
			var reslut = _self.fire('beforepagechange', {from : _self.curPage, to : page});
			if(store && reslut !== false){
				store.load({ start : start, limit : pageSize, pageIndex : index });
			}
		},
		//设置按钮状态
		_setAllButtonsState : function () {
			var _self = this,
				store = _self.get('store'),
				items = _self.get('items');
			
			/**
			* @private
			*/
			function enableButtons(btnNames, enable) {
				S.each(items, function (item) {
					if(S.inArray(item.id,btnNames)){
						item.set('disabled',!enable);
					}
				});
			}
			if (store) {
                enableButtons(['btnpre', 'btnnext', 'btnfirst', 'btnlast', 'btnok'], true);
            }

            if (_self.curPage === 1) {
                enableButtons(['btnpre', 'btnfirst'], false);
            }
            if (_self.curPage === _self.totalPage) {
                enableButtons(['btnnext', 'btnlast'], false);
            }
		},
		//显示页码和总页数
		_setNumberPages : function () {
			var _self = this,
				bar = _self.get('bar'),
				input = bar.one('.' + CLS_ITEM_INPUT),
				text = bar.one('.' + CLS_TEXT_PAGE),
				totalEl = bar.one('.' + CLS_TEXT_COUNT);
			if (input && text) {
				input.val(_self.curPage);
				text.text('页 共 ' + _self.totalPage + ' 页');
			}
			if (totalEl) {
				totalEl.text(_self.totalCount);
			}
		}
	});
	
	S.namespace('LP');
	
	/**
	* 分页栏
	* @description 用于分页，配置项config:<br>
	* 1) pageSize : 单页记录数<br>
	* 2) store : 数据源<br>
	* 3) renderTo :附加到容器的编号<br>
	* @class 分页控件
	* @param {Object} config 配置参数
	* @example
	* //应用于表格、列表时，会默认添加表格、列表的数据源，添加容器的编号
	* tbar : {pageSize:20}
	* //独立生成分页栏
	* new S.LP.PaggingBar({renderTo:'pbar',store:store,pageSize:20});
	*/
	S.LP.PaggingBar = paggingBar;

	return paggingBar;
}, {requires : ["./bar"]});KISSY.add("gallery/grid/1.0/store",function(S){
	
	/** 
		@exports S.LP as KISSY.LP
	*/

	/**
	* 数据缓冲类，缓存数据在浏览器中
	* @memberOf S.LP
	* @class 数据缓冲类
	* @param {Object} config 配置项，store上面的field字段可以传入配置项中
	* @property {String} url 是字段 proxy.url的简写方式，可以直接写在配置信息中
	* @example 
	* var store = new S.LP.Store({
	*	url : 'data.php',
	*	autoLoad : true
	*});
	*/
	function Store(config){
		var _self = this;

		config = config || {};

		config = S.merge(
		/** @lends S.LP.Store.prototype */	
		{
			/**
			* 加载数据时，返回数据的根目录
			* @field
			* @type String
			* @default  "rows"
			* @example 
			* '{"rows":[{"name":"abc"},{"name":"bcd"}],"results":100}'
			*/
			root: 'rows', 
			/**
			* 加载数据时，符合条件的数据总数，用于分页
			* @field
			* @type String
			* @default  "results"
			* @example
			*
			* '{"rows":[{"name":"abc"},{"name":"bcd"}],"results":100}'
			*/
			totalProperty: 'results', 
			/**
			* 加载数据时，返回的格式,目前只支持"json","data"格式<br>
			* @field
			* @type String
			* @default "json"
			*/
			dataType: 'json', 
			/**
			* 创建对象时是否自动加载
			* @field
			* @type Boolean
			* @default false
			*/
			autoLoad: false,
			/**
			* 排序信息
			* @field 
			* @type Object
			* @default { field: '', direction: 'ASC' }
			* @example 
			* var store = new S.LP.Store({
			*		url : 'data.php',
			*		autoLoad : true,
			*		sortInfo: { field: 'name', direction: 'DESC' }//按照'name' 字段降序排序
			*	});
			*/
			sortInfo: { field: '', direction: 'ASC' },
			/**
			* 连接信息，包含2个字段:<br>
			* url : 加载数据的地址<br>
			* method : 加载数据的方式"get","post"，默认值为"post"
			* @field 
			* @type Object
			* @default { method: 'post' }
			* @example 
			* var store = new S.LP.Store({
			*		autoLoad : true,
			*		proxy: {url : 'data.php', method: 'get' }//按照'name' 字段降序排序
			*	});
			*/
			proxy: { method: 'post' },
			/**
			* 自定义参数，用于加载数据时发送到后台
			* @field
			* @type Object
			* @example
			* var store = new S.LP.Store({
			*		url :'data',
			*		autoLoad : true,
			*		params: {id:'124',type:1}//自定义参数
			*	});
			*/
			params:{},
			/**
			* 是否后端排序，如果为后端排序，每次排序发送新请求，否则，直接前端排序
			* @field
			* @type Boolean
			* @default false
			*/
			remoteSort: false,
			/**
			* 对象的匹配函数，验证两个对象是否相当
			* @field
			* @type Function
			* @default function(obj1,obj2){return obj1==obj2};
			* 
			*/
			matchFunction : function(obj1,obj2){
				return obj1 == obj2;
			},
			/**
			*
			*
			*/
			compareFunction : function(obj1,obj2){
				if(obj1 == undefined)
				{
					obj1 = '';
				}
				if(obj2 == undefined){
					obj2 = '';
				}
				if(S.isString(obj1)){
					return obj1.localeCompare(obj2);
				}

				if(obj1 > obj2){
					return 1;
				}else if(obj1 === obj2){
					return 0;
				}else{
					return  -1;
				}
			}
		},config);
		S.mix(_self,config,	{
			hasLoad : false,
			resultRows : [],
			rowCount : 0,
			totalCount : 0
		});
		//声明支持的事件
		_self.events = [
			/**  
			* 当数据加载完成后
			* @name S.LP.Store#load  
			* @event  
			* @param {event} e  事件对象，包含加载数据时的参数
			*/
			'load',

			/**  
			* 当数据加载前
			* @name S.LP.Store#beforeload
			* @event  
			*/
			'beforeload',

			/**  
			* 发生在，beforeload和load中间，数据已经获取完成，但是还未触发load事件，用于获取返回的原始数据
			* @name S.LP.Store#beforeProcessLoad
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 从服务器端返回的数据
			*/
			'beforeProcessLoad',
			
			/**  
			* 当添加数据时触发该事件
			* @name S.LP.Store#addrecords  
			* @event  
			* @param {event} e  事件对象
			* @param {Array} e.data 添加的数据集合
			*/
			'addrecords',
			/**
			* 
			*/
			'exception',
			/**  
			* 当删除数据是触发该事件
			* @name S.LP.Store#removerecords  
			* @event  
			* @param {event} e  事件对象
			* @param {Array} e.data 删除的数据集合
			*/
			'removerecords',
			
			/**  
			* 当更新数据指定字段时触发该事件
			* @name S.LP.Store#updaterecord  
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.record 更新的数据
			* @param {Object} e.field 更新的字段
			* @param {Object} e.value 更新的值
			*/
			'updaterecord',
			/**  
			* 前端发生排序时触发
			* @name S.LP.Store#localsort
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.field 排序的字段
			* @param {Object} e.direction 排序的方向 'ASC'，'DESC'
			*/
			'localsort'
		];
		_self._init();
	}
	S.augment(Store,S.EventTarget);

	S.augment(Store, 
	/** @lends S.LP.Store.prototype */	
	{
		/**
		* 添加记录
		* @param {Array|Object} data 添加的数据，可以是数组，可以是单条记录
		* @param {Boolean} [noRepeat = false] 是否去重,可以为空，默认： false 
		* @param {Function} [match] 匹配函数，可以为空，默认是：<br>
		*  function(obj1,obj2){
		*	 return obj1 == obj2;
		*  }
		* 
		*/
		add :function(data,noRepeat,match){
			var _self=this,
				newData=[];
			match = match || _self._getDefaultMatch();
			if(!S.isArray(data)){
				data = [data];
			}

			S.each(data,function(element){
				if(!noRepeat || !_self.contains(element,match)){
					_self._addRecord(element);
					newData.push(element);
				}
			});
			_self.fire('addrecords',{data:newData});
		},
		/**
		* store的比较函数
		* @param {Object} obj1 进行比较的记录1
		* @param {Object} obj2 进行比较的记录2
		* @param {String} [field] 进行排序的字段,默认为 sortInfo.field
		* @param {String} [direction] 进行排序的方向,默认为 sortInfo.direction 包括‘ASC’，‘DESC'
		* @return {Number} 
		* 当 obj1 > obj2 时返回 1
		* 当 obj1 = obj2 时返回 0 
		* 当 obj1 < obj2 时返回 -1
		*/
		compare : function(obj1,obj2,field,direction){

			var _self = this,
				dir = 1;
			field = field || _self.sortInfo.field;
			direction = direction || _self.sortInfo.direction;
			//如果未指定排序字段，或方向，则按照默认顺序
			if(!field || !direction){
				return 1;
			}
			dir = direction === 'ASC' ? 1 : -1;

			return this.compareFunction(obj1[field],obj2[field]) * dir;
		},
		/**
		* 验证是否存在指定记录
		* @param {Object} record 指定的记录
		* @param {Function} [match = function(obj1,obj2){return obj1 == obj2}] 默认为比较2个对象是否相同
		* @return {Boolean}
		*/
		contains :function(record,match){
			return this.findIndexBy(record,match)!==-1;
		},
		/**
		* 查找数据所在的索引位置,若不存在返回-1
		* @param {Object} target 指定的记录
		* @param {Function} [func = function(obj1,obj2){return obj1 == obj2}] 默认为比较2个对象是否相同
		* @return {Number}
		*/
		findIndexBy :function(target,func){
			var position = -1,
				records = this.resultRows;
			func = func || _self._getDefaultMatch();
			if(S.isUndefined(target)||S.isNull(target))
				return -1;
			S.each(records,function(record,index){
				if(func(target,record)){
					position = index;
					return false;
				}
			});
			return position;
		},
		/**
		* 查找记录，仅返回第一条
		* @param {String} field 字段名
		* @param {String} value 字段值
		* @return {Object|null}
		*/
		find : function(field,value){
			var result = null,
				records = this.resultRows;
			S.each(records,function(record,index){
				if(record[name] === value){
					result = record;
					return false;
				}
			});
			return result;
		},
		/**
		* 查找记录，返回所有符合查询条件的记录
		* @param {String} field 字段名
		* @param {String} value 字段值
		* @return {Array}
		*/
		findAll : function(field,value){
			var result = [],
				records = this.resultRows;
			S.each(records,function(record,index){
				if(record[name] === value){
					result.push(record);
				}
			});
			return result;
		},
		/**
		* 加载数据,若不提供参数时，按照上次请求的参数加载数据
		* @param {Object} [params] 自定义参数以对象形式提供
		* @example 
		* store.load({id : 1234, type : 1});
		*/
		load :function (params){
			//_self.hasLoad = true;
			this._loadData(params);
		},
		/**
		* 获取加载完的数据
		* @return {Array}
		*/
		getResult : function(){
			return this.resultRows;
		},
		/**
		* 获取加载完的数据的数量
		* @return {Number}
		*/
		getCount : function () {
            return this.resultRows.length;
        },
		/**
		* 获取表格源数据的总数
		* @return {Number}
		*/
        getTotalCount : function () {
            return this.totalCount;
        },
		/**
		* 删除记录触发 removerecords 事件.
		* @param {Array|Object} data 添加的数据，可以是数组，可以是单条记录
		* @param {Function} [match = function(obj1,obj2){return obj1 == obj2}] 匹配函数，可以为空
		*/
		remove :function(data,match){
			var _self =this,
				delData=[];
			match = match || _self._getDefaultMatch();
			if(!S.isArray(data)){
				data = [data];
			}
			S.each(data,function(element){
				var index = _self.findIndexBy(element,match),
				    record = _self._removeAt(index);
				delData.push(record);
			});
			_self.fire('removerecords',{data:delData});
		},
		/**
		* 设置数据，在不自动加载数据时，可以自动填充数据，会触发 load事件
		* @param {Array} data 设置的数据集合，是一个数组
		*/
		setResult:function(data){
			data= data||[];
			var _self =this;
			_self.resultRows = data;
			_self.rowCount = data.length;
			_self.totalCount = data.length;
			_self.fire('load',_self.oldParams);
		},
		/**
		* 设置记录的值 ，触发 updaterecord 事件
		* @param {Object} obj 修改的记录
		* @param {String} field 修改的字段名
		* @param {Any Type} value 修改的值
		* @param {Boolean} [isMatch = false] 是否需要进行匹配，检测指定的记录是否在集合中
		*/
		setValue : function(obj,field,value,isMatch){
			var record = obj,
				_self =this;
			if(isMatch){
				var match =  _self._getDefaultMatch(),
					index = _self.findIndexBy(obj,match);
				if(index >=0){
					record = this.resultRows[index];
				}
			}
			record[field]=value;
			_self.fire('updaterecord',{record:record,field:field,value:value});
		},
		/**
		* 排序，根据Store的配置进行，前端排序或发送请求重新加载数据
		* 远程排序，触发load事件，前端排序触发localsort事件
		* @param {String} field 排序字段
		* @param {String} direction 排序方向
		*/
		sort : function(field,direction){
			var _self =this;
			_self.sortInfo.field = field || _self.sortInfo.field;
			_self.sortInfo.direction = direction || _self.sortInfo.direction;
			if(_self.remoteSort){	//如果远程排序，重新加载数据
				this.load();
			}else{
				_self._sortData(field,direction);
				_self.fire('localsort',{field : field , direction : direction});
			}
		},
		/**
		* 更新记录 ，触发 updaterecord 事件
		* @param {Object} obj 修改的记录
		* @param {Boolean} [isMatch = false] 是否需要进行匹配，检测指定的记录是否在集合中
		*/
		update : function(obj,isMatch){
			var record = obj,
				_self =this;
			if(isMatch){
				var match =  _self._getDefaultMatch(),
					index = _self.findIndexBy(obj,match);
				if(index >=0){
					record = this.resultRows[index];
				}
			}
			record = S.mix(record,obj);
			_self.fire('updaterecord',{record:record});
		},
		//添加记录
		_addRecord :function(record,index){
			var records = this.resultRows;
			if(S.isUndefined(index)){
				index = records.length;
			}
			records[index] = record;
			//_self.fire('recordadded',{record:record,index:index});
		},
		//加载数据
		_loadData : function(params){
			var _self = this,
				loadparams = params || {};
			_self.fire('beforeload');

			loadparams = S.merge(_self.oldParams, _self.sortInfo,loadparams);
			_self.oldParams = loadparams;
			var data = _self.proxy.method === 'post' ? loadparams : (loadparams ? S.param(loadparams) : '');
			S.ajax({
				cache: false,
                url: _self.proxy.url,
                dataType: _self.dataType,
                type: _self.proxy.method,
                data: data,
                success : function (data, textStatus, XMLHttpRequest) {
					_self.fire('beforeProcessLoad',{data:data});
					var resultRows=[],
						rowCount = 0,
						totalCount = 0;
					if(data.hasError){
						setResult(resultRows,rowCount,totalCount);
						_self.fire('exception',{error:data.error});
						return;
					}
                    if (_self.dataType === 'json') {
						if(S.isArray(data)){
							resultRows = data;// S.JSON.parse(data);
							rowCount = resultRows.length;
							totalCount = rowCount;
						}else if (data != null) {
                            resultRows = data[_self.root];
                            if (!resultRows) {
                                resultRows = [];
                            }
                            rowCount = resultRows.length;
                            totalCount = parseInt(data[_self.totalProperty]);
                        } 
                    } 
					setResult(resultRows,rowCount,totalCount);
                    if (!_self.remoteSort) {
                        _self._sortData();
                    } 
					
					_self.fire('load',loadparams);
                },
                error : function (XMLHttpRequest, textStatus, errorThrown) {
                   setResult([],0,0);
				   _self.fire('exception',{error:textStatus,responseText:errorThrown.responseText,XMLHttpRequest : XMLHttpRequest});
                }
			});
			
			/**
			* @private 设置结果
			*/
			function setResult(resultRows,rowCount,totalCount){
				_self.resultRows=resultRows;
				_self.rowCount=rowCount;
				_self.totalCount=totalCount;

			}
		},
		//移除数据
		_removeAt:function(index){
			if(index < 0) return;
			var _self = this,
				records = this.resultRows,
				record = records[index];
			records.splice(index,1);
			return record;
			//_self.fire('recordremoved',{record:record,index:index});
		},
		//排序
		_sortData : function(field,direction){
			var _self = this;

			field = field || _self.sortInfo.field;
			direction = direction || _self.sortInfo.direction;
			//如果未定义排序字段，则不排序
			if(!field || !direction){
				return;
			}
			_self.resultRows.sort(function(obj1,obj2){
				return _self.compare(obj1,obj2,field,direction);
			});
		},
		//获取默认的匹配函数
		_getDefaultMatch :function(){
			return this.matchFunction;
		},
		//初始化
		_init : function(){
			var _self =this;

			_self.oldParams =_self.params ||{};
			if (!_self.proxy.url) {
                _self.proxy.url = _self.url;
            }
			_self.resultRows = [];
			/*if(_self.autoLoad){
				_self._loadData();
			}*/
		}
	});

	S.namespace('LP');
	S.LP.Store = Store;

	return Store;

}, {requires : []});
	/** @fileOverview 表格控件
* 包括：表格，可编辑表格，表格编辑器
* @author <a href="mailto:dxq613@gmail.com">董晓庆 旺旺：dxq613</a>  
* @version 1.0.1  
*/
KISSY.add("gallery/grid/1.0/grid",function (S,ButtonBar,PaggingBar,LoadMask) {
	/** 
		@exports S.LP as KISSY.LP
	*/

	var DOM = S.DOM,
		UA = S.UA,
        Node = S.Node;
		
	//常量	
	var	ATTR_COLUMN_NAME = 'data-column-name',
		CLS_HEADER_TH = 'grid-header-th',
		CLS_HEADER_TH_EMPTY = 'grid-header-th-empty',
		CLS_HEADER_TH_INNER = 'grid-header-th-inner',
        CLS_HEADER_TITLE = 'grid-header-inner-title',
		CLS_CELL_TEXT = 'grid-body-cell-text',
		CLS_CHECKBOX = 'grid-checkbox',
		CLS_GRID_ROW = 'grid-row',
		CLS_GRID_ROW_SELECTED = 'grid-row-selected',
		CLS_GRID_ROW_OVER = 'grid-row-over',
		CLS_GRID_CELL = 'grid-body-cell',
		CLS_GRID_CELL_INNER = 'grid-body-cell-inner',
		CLS_HOVER = 'hover',
		CLS_SORT = 'sortable',
		CLS_SORT_ASC = 'sorted-asc',
		CLS_SORT_DESC = 'sorted-desc',
		CLS_ROW_ODD = 'grid-row-odd',
		CLS_ROW_EVEN = 'grid-row-even',
		DATA_ELEMENT = 'row-element',
		COLUMN_DEFAULT_WIDTH = 80,
		HEADER_HIGHT = 25,
		BAR_HIGHT = 25,
		COLUMN_WIDTH_CHECKED = 30,
		COLUMN_WIDTH_DEFAULT = 80,
		COLUMN_WIDTH_EMPTY = 15;
	/**
	* 表格控件
	* @memberOf S.LP
	* @description 用于展示数据
	* @class 表格控件类
	* @param {Object} config 配置项
	* @param {String} config.renderTo 渲染到目标的Id
	* @param {Array} config.columns 列的配置项
	* @param {String} config.columns[0].title 标题
	* @param {Number} [config.columns[0].width=80] 列宽度
	* @param {String} config.columns[0].dataIndex 对应的列字段
	* @param {Boolean} [config.columns[0].sortable=false] 此列是否可排序
	* @param {Boolean} [config.columns[0].hide = false] 是否隐藏此列
	* @param {Function} [config.columns[0].renderer] 一个格式化函数，将数据转换成对应的格式显示，或者提供具体的Dom结构。
	* @param {Boolean} [config.columns[0].showTip=false]  显示完整信息，截断文本时使用
	* @param {String} [config.columns[0].cls]  表头应用的样式，多个样式用 “,” 分割
	* @example 
	* //列配置
	* columns:[
	*      { title: '点击', sortable: true,  dataIndex: 'Clicks',  showTip: true,renderer:function(value,obj){
    *               return value + obj.TotalCost;
    *      } },
    *      { title: '总花费', sortable: true,  dataIndex: 'TotalCost',cls :'custom1,custom2'}
    *      
	* },
	* @param {Number} [config.width] 表格宽度，默认下表格的宽度等于父元素的宽度，如果内容宽度超过设置的宽度，会出现横向滚动条
	* @param {Number} [config.height] 表格高度，默认状态表格高度根据内容自动扩展，如果内容高度超过设置的宽度，会出现纵向滚动条
	* @param {S.LP.Store} [config.store] 数据缓冲对象，对数据的操作集成在此对象中 @see S.LP.Store
	* @param {Bar} [config.tbar] 表格上部的按钮栏，如果内部包含 pageSize属性则为分页栏，否则为普通按钮栏
	* @param {Number} [config.tbar.pageSize] 分页栏的单页记录条数，用于计算分页
	* @param {Array} [config.tbar.buttons] 按钮栏的按钮配置
	* @example
	* //分页栏配置
	* tbar:{pageSize : 30}
	* //按钮栏配置
	* tbar:{buttons:[{id:' ',text:'添加一项',handler:function(event){},css:'bar-btn-add'}]
	* @param {Bar} config.bbar 同 config.tbar
	* @param {Boolean} [config.loadMask = true] 加载数据时，是否显示屏蔽,
	* @param {Boolean} [config.checkable = false]: 是否多选，显示选择框,
	* @param {Boolean} [config.forceFit=false]: 当指定了表格宽度时，有时候会出现横向滚动条，此配置项强制列适应表格宽度
	* @example 
	* 表格配置项
	* var config = {
	* 	renderTo:'mygrid', //容器Id
	* 	width:500,// 宽度
	* 	height:300,//高度
	* 	checkable:true,//是否允许多选
	* 	columns: [//列定义
	* 			   { title: ' ', width: 30, sortable: false, dataIndex: 'SearchEngine',hide : true, renderer: function(data){
	* 						if(data===4){
	* 								 return '百度';
	* 						}else{
	* 								 return '谷歌';
	* 						}
	* 			   }
	* 			   },
	* 			   { title: '编号', width: 100, sortable: true, dataIndex: 'AccountId', selectable: true },
	* 	 
	* 			   { title: '账户', width: 200, sortable: false, dataIndex: 'AccountName', selectable: true,renderer:function(value){
	* 						if(S.isArray(value)){
	* 								 return value.join('');
	* 						}
	* 						return value;
	* 			   } },
	* 			   { title: '点击', sortable: true,  dataIndex: 'Clicks',  showTip: true,renderer:function(value,obj){
	* 						return value + obj.TotalCost;
	* 			   } },
	* 			   { title: '总花费', sortable: true,  dataIndex: 'TotalCost',editor:{type:'number'}
	* 			   },
	* 			   { title: '总花费', sortable: true,  dataIndex: 'sum',renderer:function(value,obj){
	* 								 return obj.TotalCost *2;
	* 						}
	* 			   }       
	* 			  
	* 	],
	* 	forceFit:true,//强制列自适应，使表格无滚动条
	* 	store:store,//数据缓冲对象
	* 	tbar:{buttons:[{id:' ',text:'添加一项',handler:function(event){},css:'bar-btn-add'}]
	* 	},//上面按钮栏
	* 	bbar:{pageSize:30},//下面翻页栏
	* 	loadMask:true//是否显示加载，当加载数据时，会屏蔽表格并显示，Loading...信息
	* 	};
	*/
	function Grid(config) {
		var _self = this;
		config = config || {};
		if (!config.renderTo) {
			throw 'please assign the id of rendered Dom!';
		}
		config = S.merge(Grid.config, config);

		Grid.superclass.constructor.call(_self, config);
		//支持的事件
		_self.events = [
			/**  
			* 开始附加数据
			* @name S.LP.Grid#beginappend 
			* @event  
			* @param {event} e  事件对象
			* @param {Array} e.data 附加显示的数据
			*/
			'beginappend',
			/**  
			* 附加数据完成
			* @name S.LP.Grid#afterappend 
			* @event  
			* @param {event} e  事件对象
			* @param {Array} e.data 附加显示的数据
			* @param {Array} e.rows 附加显示的数据行DOM结构
			*/
			'afterappend',
			/**  
			* 开始显示数据，一般是数据源加载完数据，开始在表格上显示数据
			* @name S.LP.Grid#beginshow
			* @event  
			* @param {event} e  事件对象
			*/
			'beginshow',
			/**  
			* 显示数据完成，一般是数据源加载完数据，并在表格上显示完成
			* @name S.LP.Grid#aftershow
			* @event  
			* @param {event} e  事件对象
			*/
			'aftershow',
			/**  
			* 移除行，一般是数据源移除数据后，表格移除对应的行数据
			* @name S.LP.Grid#rowremoved
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 行对应的DOM对象
			*/
			'rowremoved',
			/**  
			* 添加行，一般是数据源添加数据、加载数据后，表格显示对应的行后触发
			* @name S.LP.Grid#rowcreated
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 行对应的DOM对象
			*/
			'rowcreated',
			/**  
			* 翻页前触发，可以通过 return false ,阻止翻页
			* @name S.LP.Grid#beforepagechange
			* @event  
			* @param {event} e  事件对象
			* @param {Number} e.from 当前页
			* @param {Number} e.to 目标页
			*/
			'beforepagechange',
			/**  
			* 行点击事件
			* @name S.LP.Grid#rowclick
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 行对应的DOM对象
			* 
			*/
			'rowclick',
			/**  
			* 单元格点击事件
			* @name S.LP.Grid#cellclick
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 点击行对应的DOM对象
			*/
			'cellclick',
			/**  
			* 行选中事件
			* @name S.LP.Grid#rowselected
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 行对应的DOM对象
			* @param {DOM} e.cell 点击的单元格对应的DOM对象
			* @param {DOM} e.domTarget 触发事件的DOM对象 等同浏览器事件中的e.target
			* @param {String} field 此单元格对应的字段名
			*/
			'rowselected',
			/**  
			* 行取消选中事件
			* @name S.LP.Grid#rowunselected
			* @event  
			* @param {event} e  事件对象
			* @param {Object} e.data 行对应的记录
			* @param {Object} e.row 行对应的DOM对象
			*/
			'rowunselected'
		];
		_self._init();

	}

	Grid.config = {
	};
	S.extend(Grid, S.Base);
	S.augment(Grid, 
	/** @lends  S.LP.Grid.prototype */		
	{
		/**
		* 附加数据
		* @private
		* @param {Array} data 添加到表格上的数据
		*/
		appendData : function (data) {
			var _self = this,
				rows = [];
			_self.fire('beginappend',{data : data});
			S.each(data, function (obj, index) {
				var row = _self._createRow(obj, index);
				rows.push(row);
			});
			_self.fire('afterappend', {rows : rows, data : data});
		},
		/**
		* 添加汇总数据
		* @param {Object} summary 汇总数据
		*/
		addSummary : function (summary){
			var _self = this,
				foot = _self.get('tfoot');
			S.all(foot.rows).remove();
			this._createSummaryRow(summary);
		},
		/**
		* 清空表格
		*/
		clearData : function () {
			var _self = this,
				body = _self.get('tbody');
			_self._setHeaderChecked(false);
			S.all(body.rows).remove();
			//DOM.text(body, '');
		},
		/**
		* 取消选中的记录
		*/
		clearSelection : function () {
			this._setAllRowsSelected(false);
		},
		/**
		* 过滤显示数据，根据字段名和字段值过滤数据
		* @param {String} field 字段名 
		* @param {Object|Function} 过滤字段的值，或者匹配函数
		* @example 
		*	grid.filter('id',124); //仅显示 id ==124的行
		*	
		*	grid.filter('id',function(value){
		*		if(value>124)
		*			return true;//返回true显示
		*		return false;	//返回false 不显示
		*	});
		*/
		filter : function (field, value) {
			var _self = this,
				body = _self.get('tbody'),
				rows = S.makeArray(body.rows),
				func = typeof value === 'function' ? value : function (val) {return val === value; };
			S.each(rows, function (row) {
				var rowEl = S.one(row),
					obj = DOM.data(row, DATA_ELEMENT);
				if (value === null) {
					rowEl.show();
				} else if (!obj || !func(obj[field])) {
					rowEl.hide();
				} else {
					rowEl.show();
				}
			});
		},
		/**
		* 获取表格宽度
		* @return {Number}
		*/
		getWidth : function () {
			var _self = this;
			return _self.get('width') || _self.get('gridEl').width();
		},
		/**
		* 获取选中的数据
		* @return {Array} 返回选中的数据
		*/
		getSelection : function () {
			var _self = this,
				tbody = _self.get('tbody'),
				selectedRows = S.all('.' + CLS_GRID_ROW_SELECTED, tbody),
				objs = [];

			S.each(selectedRows, function (row) {
				var obj = DOM.data(row, DATA_ELEMENT);
				if (obj) {
					objs.push(obj);
				}
			});
			return objs;
		},
		/**
		* 获取选中的第一条数据
		* @return {Object} 返回选中的第一条数据
		*/
		getSelected : function () {
			var _self = this,
				tbody = _self.get('tbody'),
				row = S.one('.' + CLS_GRID_ROW_SELECTED, tbody);

			return row ? DOM.data(row, DATA_ELEMENT) : null;
		},
		/**
		* 设置选中的数据
		* @param {String} field 字段名称 
		* @param {Array} values 选中行的对应字段的值
		* @example
		*	grid.setSelection('id',['123','22']);
		*/
		setSelection : function (field, values) {
			var _self = this,
				tbody = _self.get('tbody'),
				rows = tbody.rows;
            S.each(rows, function (row) {
                var obj = DOM.data(row, DATA_ELEMENT);
                if (obj && S.inArray(obj[field], values)) {
					_self._setRowSelected(row, true);
                }
            });
		},
		/**
		* 设置表格高度
		* @param {Number} 设置表格的高度
		*/
		setHeight : function(height){
			var _self = this,
				gridEl = _self.get('gridEl'),
				subHeight = HEADER_HIGHT,
				body = _self.get('body'),
				bodyEl = S.one(body);
			gridEl.height(height);
			if (_self.get('tbar')) {
				subHeight += (BAR_HIGHT + 2);
				if(_self.get('tbar').buttons){
					subHeight += 4;
				}
			}
			if (_self.get('bbar')) {
				subHeight += (BAR_HIGHT + 2);
			}
			if (height - subHeight > 0) {
				bodyEl.height(height - subHeight);
				bodyEl.css('overflow-y','scroll');
			}
		},
		/**
		* @private
		* 设置表格宽度
		*/
		setWidth : function (width) {
			var _self = this,
				body = _self.get('body'),
				gridEl = _self.get('gridEl');
			gridEl.width(width);
			S.one(body).width(width - 2);
			gridEl.children('.grid-view').width(width - 2);

		},
		/**
		* 
		* 排序 
		* @private
		* @param {String|Object} column 排序的字段名或者配置项
		* @param {String} sortDirection 排序方向 ASC、DESC
		* @example
		* grid.sort('id','ASC');//表格按 id 字段升序排列
		*/
		sort : function (column, sortDirection) {
			var _self = this,
				field,
				store = _self.get('store'),
				direct = sortDirection === 1 ? 'ASC' : 'DESC';
			if (typeof column === 'string') {
				field = column;
			} else {
				field = column.dataIndex;
			}

			if (store) {
				store.sort(field, direct);
			}else{
				_self._localSort(field, sortDirection);
			}
		},
		/**
		* 显示数据
		* @param {Array} data 显示的数据
		* 
		*/
		showData : function (data) {
			var _self = this;
			_self.fire('beginshow');
			_self.clearData();
			S.each(data, function (obj, index) {
				_self._createRow(obj, index);
			});
			_self._afterShow();
			_self.fire('aftershow');
		},
		/**
		* 移除数据
		* @private
		* @param {Array} data 移除的数据
		* 
		*/
		removeData : function (data) {
			var _self = this,
				tbody = _self.get('tbody'),
				rows = S.makeArray(tbody.rows);
            S.each(rows, function (row) {
                var obj = DOM.data(row, DATA_ELEMENT);
                if (obj && S.inArray(obj, data)) {
					_self.fire('rowremoved',{data : obj,row : row});
					DOM.remove(row);
                }
            });
		},
		//添加列表显示数据区域的事件
		_addBodyEvent : function (tbody) {
			var _self = this,
				head = _self.get('head'),
				body = _self.get('body'),
				bodyEl = S.one(body);
			S.one(tbody).on('click', function (event) {
				_self._rowClickEvent(event.target);
			}).on('mouseover', function (event) {
				_self._rowOverEvent(event.target);
			}).on('mouseout', function (event) {
				_self._rowOutEvent(event.target);
			});
			bodyEl.on('scroll', function (event) {
				var left = bodyEl.scrollLeft();
				S.one(head).scrollLeft(left);
			});
		},
		_afterShow : function () {
			var _self = this,
				tbody = _self.get('tbody'),
				body = _self.get('body'),
				bodyEl = S.one(body),
				height,
				bodyWidth,
				bodyScroolWidth;
			if (UA.ie === 6 || UA.ie === 7) {
				height = _self.get('height');
				if (!height) {
					bodyWidth = bodyEl.width();
					bodyScroolWidth = body.scrollWidth;
					if (bodyScroolWidth > bodyWidth) {
						tbodyHeight = S.one(tbody).height();
						bodyEl.height(tbodyHeight + 17);
					}else{
						bodyEl.css('height','auto');
					}
				}
			}
		},
		_createRow : function (element, index) {
			var _self = this,
				body = _self.get('tbody'),
				rowTemplate = _self._getRowTemplate(index, element),
				rowEl = new Node(rowTemplate).appendTo(body),
				dom = rowEl.getDOMNode(),
				lastChild = dom.lastChild;
			DOM.data(dom, DATA_ELEMENT, element);
			DOM.addClass(lastChild, 'lp-last');
			_self.fire('rowcreated',{data : element,row : dom});
            return rowEl;
		},
		_createSummaryRow : function (summary) {
			var _self = this,
				foot = _self.get('tfoot'),
				rowTemplate = _self._getSummaryTemplate(summary),
				rowEl = new Node(rowTemplate).appendTo(foot);
			return rowEl;
		},
		_lookupByClass : function (element, css) {
			if (DOM.hasClass(element, css)) {
				return element;
			}
			return DOM.parent(element, '.' + css);
		},
		_findRowByRecord : function (record) {
			var _self = this,
				tbody = _self.get('tbody'),
				rows = tbody.rows,
				result = null;
            S.each(rows, function (row) {
                var obj = DOM.data(row, DATA_ELEMENT);
                if (obj === record) {
					result = row;
					return false;
                }
            });
			return result;
		},
		_findRow : function (element) {
			return this._lookupByClass(element, CLS_GRID_ROW);
		},
		_findCell : function (element) {
			return this._lookupByClass(element, CLS_GRID_CELL);
		},
		//强制列自适应表格宽度
		_forceFitColumns : function (columns) {
			var _self = this,
				gridWidth = _self.getWidth(),
				setHeight = _self.get('height'),
				columnsWidth = 0,
				showCount = 0,
				checkWidth = _self.get('checkable') ? COLUMN_WIDTH_CHECKED + 1 : 0,
				extraWidth = 0,
				times = 1,
				realWidth = 0,
				count = 0,
				appendWidth = 0;
			columns = columns || _self.get('columns');
			count = columns.length;
			S.each(columns, function (column) {
				column.width = column.width || COLUMN_WIDTH_DEFAULT;
				var colWidth = column.originWidth || column.width;
				if (!column.hide) {
					columnsWidth += colWidth;
					showCount += 1;
				}
			});

			extraWidth = showCount * 2 + 2 + checkWidth + (setHeight ? COLUMN_WIDTH_EMPTY + 2 : 0);
			times = (gridWidth - extraWidth) / columnsWidth;
			realWidth = 0;
			if (times !== 1) {
				S.each(columns, function (column) {
					if (!column.hide) {
						column.originWidth = column.originWidth || column.width;
						column.width = Math.floor(column.originWidth * times);
						realWidth += column.width;
					}
				});
				appendWidth = gridWidth - (realWidth + extraWidth);
				if (count) {
					columns[count - 1].width += appendWidth;
				}
			}
		},
		_getCheckedCellTemplate : function (clsCheck, clscell) {
			return ['<td width="30px" align="center" class="', clsCheck, ' ', clscell, '"><div class="', clscell, '-inner"><span class="gwt-CheckBox"><input type="checkbox" class="', CLS_CHECKBOX, '" tabindex="0"></span></div></td>'].join('');
		},
		_getColumn : function(field){
			var _self = this,
				columns = _self.get('columns'),
				result = null;
			S.each(columns,function(column){
				if(column.dataIndex == field){
					result = column;
					return false;
				}
			});
			return result;
		},
		//获取行的模版
		_getRowTemplate : function (index, obj) {
			var _self = this,
				cells = _self.get('columns'),
				oddCls = index % 2 === 0 ? CLS_ROW_ODD : CLS_ROW_EVEN,
				cellTempArray = [],
				rowTemplate = null,
				cellTemp = null,
				emptyTd = '',
				checkable = _self.get('checkable');
			if (checkable) {
				cellTemp =  _self._getCheckedCellTemplate('grid-row-checked-column', CLS_GRID_CELL);
				cellTempArray.push(cellTemp);
			}
			S.each(cells, function (column, colindex) {
				var value = obj[column.dataIndex],
					text = column.renderer ? column.renderer(value, obj) : value,
					temp = _self._getCellTemplate(colindex, column, text,value,obj);
				cellTempArray.push(temp);
			});

			rowTemplate = ['<tr rowIndex="', index, '" class="', CLS_GRID_ROW, ' ',oddCls,'">', cellTempArray.join(''), emptyTd, '</tr>'].join('');
			return rowTemplate;
		},
		//获取汇总行的记录
		_getSummaryTemplate : function (summary) {
			var _self = this,
				cells = _self.get('columns'),
				cellTempArray = [],
				prePosition = -1,	//上次汇总列的位置
				currentPosition = -1,//当前位置
				checkable = _self.get('checkable');
			if(checkable){
				currentPosition += 1;
			}
			
			/**
			* @private
			*/
			function getEmptyCellTemplate(colspan){
				if(colspan > 0) {
					return '<td class="' + CLS_GRID_CELL + '" colspan="' + colspan + '"></td>';
				} else {
					return '';
				}
			}
			S.each(cells, function (column, colindex) {
				if(!column.hide){
					currentPosition += 1;
					if(column.summary){
						cellTempArray.push(getEmptyCellTemplate(currentPosition-prePosition - 1));
						var value = summary[column.dataIndex],
							text = '总计：' + (column.renderer ? column.renderer(value, summary) : value),
							temp = _self._getCellTemplate(colindex, column, text,summary);
						cellTempArray.push(temp);
						prePosition = currentPosition;
					}
				}
			});
			if(prePosition !== currentPosition){
				cellTempArray.push(getEmptyCellTemplate(currentPosition-prePosition));
			}

			rowTemplate = ['<tr class="', CLS_GRID_ROW, '">', cellTempArray.join(''), '</tr>'].join('');
			return rowTemplate;

		},
		//获取单元格的模版
		_getCellTemplate : function (colindex, column, text,value,obj) {
			var dataIndex = column.dataIndex,
				width = column.width,
				tipText = column.showTip ? 'title = "' + (value||'') + '"' : '',
				hideText = column.hide ? 'ks-hidden' : '',
				template = ['<td  class="grid-body-cell grid-body-td-', dataIndex, ' ', hideText, '" data-column-name="', dataIndex, '" colindex="', colindex, '" width="', width, 'px">',
						'<div class="', CLS_GRID_CELL_INNER ,'" style="width : ', width, 'px"><span class="', CLS_CELL_TEXT, ' " ' , tipText, '>', text, '</span></div></td>'].join('');
			return template;
		},
		//获取列的累加宽度，包含列的Border
		_getColumnsWidth : function () {
			var _self = this,
				columns = _self.get('columns'),
				checkable = _self.get('checkable'),
				totalWidth = 0;
			if (checkable) {
				totalWidth += 31;
			}
			S.each(columns, function (column) {
				if (!column.hide) {
					totalWidth += column.width + 2;
				}
			});
			return totalWidth;
		},
		//初始化Grid
		_init : function () {
			var _self = this,
				gridId = _self.get('gridId'),
				container = _self.get('container'),
				renderTo = _self.get('renderTo'),
				gridTemp = null,
				gridEl = null,
				header = null,
				headerTable = null,
				body = null,
				table = null,
				width = 0,
				height = _self.get('height'),
				subHeight = 0;//内部显示数据部分的高度
			if (!container) {
				container = DOM.get('#' + renderTo);
				_self.set('container', container);
			}
			if (!gridId) {
                gridId =  renderTo + 'grid';
				_self.set('gridId', gridId);
            }
			gridTemp = ['<div id="', gridId, '" class="grid-panel"><div id="', gridId + 'tbar', '" class="grid-tbar" style="display : none;"></div><div class="grid-view"><div class="grid-header"><table  cellspacing="0" cellpadding="0" class="grid-table"><thead></thead></table></div><div class="grid-body grid-body-scroll"><table  cellspacing="0" cellpadding="0" class="grid-table"><tbody><tfoot></tfoot></tbody></table></div></div><div id="', gridId + 'bbar', '" class="grid-bbar" style="display : none;"></div></div>'].join('');
			//创建表格的框架
            gridEl = new Node(gridTemp);
			gridEl.appendTo(container);
			_self.set('gridEl', gridEl);
			//table元素，展现表头、表格
			header = DOM.get('.grid-header', container);
			headerTable = DOM.get('.grid-table', header);
			body = DOM.get('.grid-body', container);
			table = DOM.get('.grid-table', body);
			_self.set('head', header);
			_self.set('body', body);
			_self.set('tbody', table.tBodies[0]);
			_self.set('tfoot', table.tFoot);
			_self.set('thead', headerTable.tHead);
			if (!_self._isAutoFitWidth()) {//如果设置了宽度，则使用此宽度
				width = _self.get('width');
				_self.setWidth(width);
			} else {						//根据所有列的宽度设置Grid宽度
				width = _self._getColumnsWidth();
				_self.setWidth(width + 2);
			}
			//如果设置了高度，设置Grid Body的高度，
			if (height) {
				_self.setHeight(height);
			}
			_self._initListeners();
			_self._initHeader();
			_self._initPaggingBar();
			_self._initData();
			_self._initEvent();
		},
		//初始化事件
		_initEvent : function () {
			this._initHeaderEvent();
			this._initBodyEvent();
			this._initDataEvent();
			this._initPaggingBarEvent();
		},
		//列表内容的事件初始化
		_initBodyEvent : function () {
			var _self = this,
				body = _self.get('tbody');
			_self._addBodyEvent(body);
		},
		//初始化数据，如果设置了Store，则根据情况自动加载数据
		_initData : function () {
			var _self = this,
				store = _self.get('store'),
				loadMask = _self.get('loadMask'),
				gridEl = _self.get('gridEl');
			if (loadMask) {
				loadMask = new LoadMask(gridEl, {msg : 'Loading...'});
				_self.set('loadMask', loadMask);
			}
			if (store && store.autoLoad) {
				//if(!sotre.hasLoad){
					store.load();
				//}
			}
		},
		//初始化Store相关的事件
		_initDataEvent : function () {
			var _self = this,
				store = _self.get('store');
			if (store) {
				store.on('beforeload', function () {
					var loadMask = _self.get('loadMask');
					if (loadMask) {
						loadMask.show();
					}
				});
				store.on('load', function () {
					var results = store.getResult(),
						loadMask = _self.get('loadMask');
					_self.showData(results);
					if (loadMask) {
						loadMask.hide();
					}
				});
				store.on('localsort', function (event) {
					var direct = event.direction === 'ASC' ? 1 : -1;
					_self._localSort(event.field , direct);
				});
				store.on('addrecords', function (event) {
					var data = event.data;
					_self.appendData(data);
					//TODO
				});
				store.on('removerecords', function (event) {
					var data = event.data;
					_self.removeData(data);
					//TODO
				});
				store.on('exception', function () {
					var loadMask = _self.get('loadMask');
					if (loadMask) {
						loadMask.hide();
					}
				});
			}
		},
		//初始化表头事件
		_initHeaderEvent : function () {
			var _self = this,
				header = _self.get('thead'),
				checkable = _self.get('checkable'),
				thCollections = S.all('.' + CLS_HEADER_TH_INNER, header);

			/**
			* @private
			*/
			function headMouseOver(event) {
				S.one(this).parent().addClass(CLS_HOVER);
			}

			/**
			* @private
			*/
			function headClick(event) {
				var sender = S.one(this),
					parentEl = sender.parent(),
					filed = null,
					sortDirect = null,
					sortNum = null;
				if (parentEl.hasClass(CLS_SORT)) {
					filed = parentEl.attr(ATTR_COLUMN_NAME);
					sortDirect = sender.hasClass(CLS_SORT_ASC) ? CLS_SORT_DESC : CLS_SORT_ASC;
					sortNum = sortDirect === CLS_SORT_ASC ? 1 : -1;
					thCollections.removeClass(CLS_SORT_ASC).removeClass(CLS_SORT_DESC);
					sender.addClass(sortDirect);
					_self.sort(filed, sortNum);
				}
			}

			/**
			* @private
			*/
			function headMouseOut(event) {
				S.one(this).parent().removeClass(CLS_HOVER);
			}

			thCollections.on('mouseover', headMouseOver)
				.on('mouseout', headMouseOut)
				.on('click', headClick);
			if (checkable) {
				S.one('.' + CLS_CHECKBOX, header).on('click', function () {
					_self._setAllRowsSelected(S.one(this).attr('checked'));
				});
			}
		},
		//初始化表头
		_initHeader : function () {
			var _self = this,
				columns = _self.get('columns'),
				header = _self.get('thead'),
				tr = header.insertRow(0),
				checkable = _self.get('checkable'),
				totalWidth = 0,
				checkColumnTemplate = null,
				emptyWidth = 0,
				emptyTh = null;

			
			/**
			* 内部函数，只在次函数内有用
			* @private
			*/
			function createColumn(column) {
				var sortable = column.sortable ? CLS_SORT : '',
					sortIcon = sortable ? '<span class="grid-header-sort-icon">&nbsp;</span>' : '',
					hideText = column.hide ? 'ks-hidden' : '',
					width = column.width,
					cls = column.cls,
					temp = ['<th align="left" class="', CLS_HEADER_TH, ' ', hideText, ' grid-header-column-', column.dataIndex, ' ', sortable, '" data-column-name="', column.dataIndex, '">',
                                                '<div class ="', CLS_HEADER_TH, '-inner ',cls,' "><span class="', CLS_HEADER_TITLE, '">', column.title, '</span>',
                                                sortIcon , '</div>',
                                            '</th>'].join(''),
					thEl = new Node(temp);
				thEl.width(width);
				thEl.appendTo(tr);
			}

			if (checkable) {
				checkColumnTemplate = _self._getCheckedCellTemplate('grid-header-checked-column', CLS_HEADER_TH);
                new Node(checkColumnTemplate).appendTo(tr);
			}
			if (_self.get('forceFit')) {
				_self._forceFitColumns();
			}
			//创建列头，计算宽度
			S.each(columns, function (column) {
				var width =  column.width || COLUMN_DEFAULT_WIDTH;
				column.width = width;
				createColumn(column);
			});
			if (!_self._isAutoFitWidth()) {
				emptyTh = new Node('<th class="' + CLS_HEADER_TH + ' grid-header-th-empty"><div class ="' + CLS_HEADER_TH + '-inner"></div></th>');
				emptyTh.appendTo(tr);
				_self._autoSetInnerWidth();
			}
		},
		//初始化事件处理函数
		_initListeners : function () {
			var _self = this,
				listeners = _self.get('listeners');
			if(listeners){
				for(var name in listeners){
					if(listeners.hasOwnProperty(name)) {
						_self.on(name, listeners[name]);
					}
				}
			}
		},
		//添加表头额外的宽度，适应横向、纵向滚动条
		_setEmptyHeadCellWidth : function (emptyWidth) {
			var _self = this,
				header = _self.get('thead'),
				emptyEl = S.one('.' + CLS_HEADER_TH_EMPTY, header);
			if (emptyWidth <= 0) {
				emptyEl.hide();
			} else {
				emptyEl.attr('width', emptyWidth + 'px');
				emptyEl.show();
			}
		},
		//设置表头、和表格内容的宽度，如果超出，会出现滚动条
		_autoSetInnerWidth : function () {
			var _self = this,
				header = _self.get('thead'),
				body = _self.get('tbody'),
				height = _self.get('height'),
				width = _self._getColumnsWidth(),
				headerWidth = 0,
				forceFit = _self.get('forceFit'),
				gridWidth = _self.getWidth(),
				emptyWidth = forceFit ? COLUMN_WIDTH_EMPTY : gridWidth < (width + 2) ? COLUMN_WIDTH_EMPTY : gridWidth - (width + 2);

			if(emptyWidth > 0 && emptyWidth < COLUMN_WIDTH_EMPTY){
				emptyWidth = COLUMN_WIDTH_EMPTY;
			}
			_self._setEmptyHeadCellWidth(emptyWidth);
			headerWidth = width + (emptyWidth ? emptyWidth + 2 : 0);
			S.one(header).parent().width(headerWidth);
			if (height) {
				width -= (COLUMN_WIDTH_EMPTY + 2);
			}
			S.one(body).parent().width(width);
		},
		_initPaggingBar : function () {
			var _self = this,
				gridId = _self.get('gridId'),
				tbarConfig = _self.get('tbar'),
				bbarConfig = _self.get('bbar'),
				store = _self.get('store'),
				pageSize = 0,
				tpbar = null,//上面的分页栏
				tbbar = null,//上面的按钮栏
				bpbar = null,
				params = null;
			/**
			* @private
			*/
			function createPaggingBar(config, renderTo) {
				var barconfig = S.merge(config, {renderTo : renderTo});
				if (store && !barconfig.store) {
					barconfig.store = store;
				}
				return new PaggingBar(barconfig);
			}

			/**
			* @private
			*/
			function createButtonBar(config,renderTo){
				var btnConfig = S.merge(config,{renderTo : renderTo});
				return new ButtonBar(btnConfig);
			}

			if (tbarConfig) {
				if(tbarConfig.pageSize){
					tpbar = createPaggingBar(tbarConfig, gridId + 'tbar');
					_self.set('tpaggingBar', tpbar);
					pageSize = tbarConfig.pageSize;
				}
				if(tbarConfig.buttons){
					tbbar = createButtonBar(tbarConfig, gridId + 'tbar');
					_self.set('tbuttonBar', tbbar);
				}
			}
			if (bbarConfig) {
				bpbar = createPaggingBar(bbarConfig, gridId + 'bbar');
				_self.set('bpaggingBar', bpbar);
				pageSize = bbarConfig.pageSize;
			}
			if (pageSize && store) {
				params = store.params;
				if (!params.start) {
                    params.start = 0;
					params.pageIndex = 0;
				}
				if (!params.limit || params.limit !== pageSize) {
					params.limit = pageSize;
				}
			}
		},
		_initPaggingBarEvent : function () {
			var _self = this,
				tbar = _self.get('tpaggingBar'),
				bbar = _self.get('bpaggingBar');
			if (tbar) {
				tbar.on('beforepagechange', function (event) {
					_self.fire('beforepagechange', event);
				});
			}

			if (bbar) {
				bbar.on('beforepagechange', function (event) {
					_self.fire('beforepagechange', event);
				});
			}
		},
		_isAutoFitWidth : function () {
			return !this.get('width');
		},
		_isRowSelected : function (row) {
			return S.one(row).hasClass(CLS_GRID_ROW_SELECTED);
		},
		_localSort : function (field, sortDirection) {
			var _self = this,
				tbody = _self.get('tbody'),
				store = _self.get('store'),
				rows = S.makeArray(tbody.rows);
			
			/**
			* @private
			*/
			function getCellValue(row, field) {
				var obj = DOM.data(row, DATA_ELEMENT);
				return obj ? obj[field] : '';
			}
			if(store){
				rows.sort(function (a, b) {
					var obj1 = DOM.data(a, DATA_ELEMENT),
						obj2 = DOM.data(b, DATA_ELEMENT);;
					return store.compare(obj1,obj2);
				});
			}else{
				rows.sort(function (a, b) {
					var aText = getCellValue(a, field),
						bText = getCellValue(b, field);
					if (aText < bText) {
						return -sortDirection;
					}
					if (aText > bText) {
						return sortDirection;
					}
					return 0;
				});
			}

			S.each(rows, function (row) {
				var rowEl = S.one(row);
				rowEl.appendTo(tbody);
			});
		},
		//行的 click 事件
		_rowClickEvent : function (target) {
			var _self = this,
				row = _self._findRow(target),
				cell = _self._findCell(target),
				rowCheckable = _self.get('checkable'),
				data = null;
			if (row) {
				data = DOM.data(row, DATA_ELEMENT);
				_self.fire('rowclick', {data : data, row : row});
				if (cell) {
					_self.fire('cellclick', {data : data, row : row, cell : cell, field : DOM.attr(cell, ATTR_COLUMN_NAME), domTarget : target});
				}
				if (rowCheckable) {
					if (!_self._isRowSelected(row)) {
						_self._setRowSelected(row, true);
					} else {
						_self._setRowSelected(row, false);
					}
				} else {
					S.all('.' + CLS_GRID_ROW_SELECTED, row.parentNode).removeClass(CLS_GRID_ROW_SELECTED);
					DOM.addClass(row, CLS_GRID_ROW_SELECTED);
				}
			}
		},
		//行的 mouseover 事件
		_rowOverEvent : function (target) {
			var _self = this,
				row = _self._findRow(target);
			if (row) {
				S.one(row).addClass(CLS_GRID_ROW_OVER);
			}
		},
		//行的 mouseout 事件
		_rowOutEvent : function (target) {
			var _self = this,
				row = _self._findRow(target);
			if (row) {
				S.one(row).removeClass(CLS_GRID_ROW_OVER);
			}
		},
		//设置列宽
		_setColumnWidth : function(column,width){

			if(typeof(column) ==='string'){
				column = this._getColumn(column);
			}
			var _self = this,
				field = column.dataIndex,
				clsTh = '.grid-header-column-' + field,
				clsTd = '.grid-body-td' + field,
				thead = _self.get('thead'),
				tbody = _self.get('tbody');
			if(column.width != width){
				column.width = width;
				S.one(clsTh,thead).width(width);
				S.all(clsTd,tbody).width(width).children('.grid-body-cell-inner').width(width);
			}
		},
		//设置表头选中状态
		_setHeaderChecked : function (checked) {
			var _self = this,
				header = _self.get('thead'),
				checkEl = S.one('.' + CLS_CHECKBOX, header);
			if (checkEl) {
				checkEl.attr('checked', checked);
			}
		},
		//设置行选择
		_setRowSelected : function (row, selected) {
			var _self = this,
				rowEl = S.one(row),
				checkbox = DOM.get('.' + CLS_CHECKBOX, row),
				data = DOM.data(row, DATA_ELEMENT),
				hasSelected = DOM.hasClass(row, CLS_GRID_ROW_SELECTED);
			if (hasSelected === selected) {
				return;
			}
			if (checkbox) {
				checkbox.checked = selected;
			}
			if (selected) {
				DOM.addClass(row, CLS_GRID_ROW_SELECTED);
				_self.fire('rowselected', {data : data});
			} else {
				DOM.removeClass(row, CLS_GRID_ROW_SELECTED);
				_self._setHeaderChecked(false);
				_self.fire('rowunselected', {data : data, row : row});
			}
			_self.fire('rowselectchanged', {data : data, row : row});
		},
		//设置全选
		_setAllRowsSelected : function (selected) {
			var _self = this,
				body = _self.get('tbody');
			//_self._setHeaderChecked(true);
			S.each(body.rows, function (row) {
				_self._setRowSelected(row, selected);
			});
		},
		destory : function () {
		}
	});

	S.namespace('LP');
	S.LP.Grid = Grid;

	return Grid;
}, {
    requires : ["./buttonBar","./paggingBar","./loadMask"]
});