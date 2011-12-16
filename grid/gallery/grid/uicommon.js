/** @fileOverview 对KISSY进行扩展的一些帮助函数
* 包括：屏蔽层，格式化函数，Form帮助类，数据缓冲类
* @author <a href="mailto:dxq613@gmail.com">董晓庆 旺旺：dxq613</a>  
* @version 1.0.1  
*/
KISSY.add("gallery/grid/uicommon",function(S){
	
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
            S.LP.unmaskElement(this.el);
        },

        /**
		* @private 开始加载，屏蔽当前元素
		*/ 
        onBeforeLoad: function () {
            if (!this.disabled) {
                S.LP.maskElement(this.el, this.msg, this.msgCls);

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
            return this.rowCount;
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
				   _self.fire('exception',{error:textStatus,responseText:errorThrown.responseText});
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
				/*dir = 0;
			field = field || _self.sortInfo.field;
			direction = direction || _self.sortInfo.direction;
			//如果未定义排序字段，则不排序
			if(!field || !direction){
				return;
			}function(obj1,obj2){
				var v = 0;
				if(obj1[field] > obj2[field]){
					v = 1;
				}else if(obj1[field] == obj2[field]){
					v = 0;
				}else{
					v = -1;
				}
				return v * dir;
			}
			dir = direction === 'ASC' ? 1 : -1;*/
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

	S.LP.Store = Store;
	
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
		
}, {
    requires: ["core","calendar","./assets/uicommon.css"]
});