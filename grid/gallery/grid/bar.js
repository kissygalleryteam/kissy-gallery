/**
	工具栏、状态栏
	create by dxq 2011-10-12
*/
KISSY.add("gallery/grid/bar",function(S){
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
		CLS_BTN_CUSTOM = "bar-btn-custom",//自定义按钮，不应用一般按钮的悬浮效果
		CLS_ITEM_BTN = 'bar-item-btn',
		CLS_ITEM_OVER = 'bar-item-over',
		CLS_ITEM_SEPERATOR = 'bar-item-separator';
		CLS_ITEM_INPUT = 'pb-item-input',
		CLS_INPUT_CONTAINER = 'pb-input-container',
		CLS_IEXT_CONTAINER = 'pb-text-container',
		CLS_TEXT_COUNT = 'pb-total-count',
		CLS_TEXT_PAGE = 'pb-total-page',
		CLS_FIRST = 'pb-page-first',
		CLS_LAST = 'pb-page-last',
		CLS_NEXT = 'pb-page-next',
		CLS_PREV = 'pb-page-prev',
		CLS_OK = 'pb-page-ok',
		CLS_PAGGING_BAR = 'pagging-bar',
		CLS_BAR_ICON = 'bar-icon',
		CLS_BUTTON_BAR = "button-bar";

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
			return ['<div id="',_self.id,'"  class="', CLS_IEXT_CONTAINER, _self.css ,'">',_self.text,'</div>'].join('');
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
			return ['<div id="',_self.id,'"  class="', CLS_IEXT_CONTAINER, '"><a class="',_self.css,'" href = "',_self.href,'">',_self.text,'</a></div>'].join('');
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

	//分页栏、工具栏、状态栏的基类
	function bar(config){
		var _self = this;
		config = config || {};
		
		bar.superclass.constructor.call(_self, config);
		_self._init();
	}

	
	S.extend(bar, S.Base);
	S.augment(bar,{
		CLS_BAR : '',//Bar 的样式
		_findItem : function (element) {
			if (DOM.hasClass(element, CLS_BTN_CONTAINER)) {
				return element;
			} else {
				return DOM.parent(element, '.' + CLS_BTN_CONTAINER);
			}
		},
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
		_initEvent : function(){
			var items = this.get('items');
			S.each(items,function (item){
				item.attachEvent();
			});
		}
	});
	
	
	
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
		//查找按钮项
		_findItem : function(element){
			if (DOM.hasClass(element, CLS_BTN_CONTAINER)) {
				return element;
			} else {
				return DOM.parent(element, '.' + CLS_BTN_CONTAINER);
			}
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
	S.LP.Bar = bar;

	/**
	* 按钮栏
	* @description 用于显示按钮，其中配置参数config的构成：<br>
	* 1) items（别名 buttons） 按钮项配置其中<br>
	*    text: 按钮上的文本 <br>
	*	 handler：按钮的事件 <br>
	*	 css:应用的按钮的样式 <br>
	* @class 按钮栏控件
	* @param {Object} config 配置参数
	* @example 
	*  tbar: {items:[{id:' ',text:'添加一项',handler:function(event){},css:'bar-btn-add'}]
	* 或者
	* tbar: {buttons:[{id:' ',text:'添加一项',handler:function(event){},css:'bar-btn-add'}]
	* 
	*/
	S.LP.ButtonBar = buttonBar;

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

	S.LP.BarItem = barItem;
	S.LP.ButtonBarItem = buttonBarItem;
	S.LP.TextBarItem = textBarItem;
	S.LP.LinkBarItem = linkBarItem;
	S.LP.CustomBarItem = customBarItem;
	S.LP.SeperatorBarItem = seperatorBarItem;

}, {requires : ["core","./uicommon","./assets/bar.css"]});