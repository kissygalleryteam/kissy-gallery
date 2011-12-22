KISSY.add("gallery/grid/1.0/barItem",function(S){
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
}, {requires : []});