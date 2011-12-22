/**
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
	