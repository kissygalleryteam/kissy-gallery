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