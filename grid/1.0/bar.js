/**
	工具栏、状态栏的基类
	create by dxq 2011-10-12
*/
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

}, {requires : ["./barItem"]});