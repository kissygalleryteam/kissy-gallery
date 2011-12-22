KISSY.add("gallery/grid/1.0/paggingBar",function(S,bar){	

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
}, {requires : ["./bar"]});