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