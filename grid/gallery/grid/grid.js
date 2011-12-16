/** @fileOverview 表格控件
* 包括：表格，可编辑表格，表格编辑器
* @author <a href="mailto:dxq613@gmail.com">董晓庆 旺旺：dxq613</a>  
* @version 1.0.1  
*/
KISSY.add("gallery/grid/grid",function (S) {
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
				loadMask = new S.LP.LoadMask(gridEl, {msg : 'Loading...'});
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
				return new S.LP.PaggingBar(barconfig);
			}

			/**
			* @private
			*/
			function createButtonBar(config,renderTo){
				var btnConfig = S.merge(config,{renderTo : renderTo});
				return new S.LP.ButtonBar(btnConfig);
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

	var KEY_COLUMN_PREFIX = 'col',
		CLS_EDITOR_FIELD = 'lp-editor-field',
		CLS_CELL_EDITABLE = 'grid-editable-cell',
		CLS_CELL_ERROR = 'grid-error-cell',
		CLS_CELL_ERROR_ICON = 'grid-cell-error-icon',
		PREFIX_CLS_CELL = 'grid-body-td-';

	/**
	* 可编辑表格控件
	* @memberOf S.LP
	* @description 编辑表格数据
	* @class 可编辑的表格类
	* @augments KISSY.LP.Grid 
	* @param {Object} conifg 配置项,同父类{@link KISSY.LP.Grid},差别在于列的配置上
	* @param {Object} conifg.showError 是否直接在列表中显示错误提示
	* @param {Object} conifg.columns[0].editor 列上的编辑器配置<br>
	* 1) type 编辑器的类型，目前支持 "text","number","select"<br>
	* 2) items 当类型为 "select"时，items中包含下拉列表中的键值对<br>
	* 3) validator ,函数原型 Function(value,obj)验证器，当返回值为字符串时，将其显示成错误信息<br>
	* 4) editableFun 函数原型 Function(value,obj) 决定当前单元格是否可以编辑，如果返回值为true 则可以编辑。否则不可以编辑
	*  默认值为返回 function(){return true};
	* @example 
	* //数字编辑器，并附加验证
	* { title: '总花费', sortable: true,  dataIndex: 'TotalCost',editor:{type:'number',validator:function(value,obj){
	*		if(value > 100){
	*			return '总花费不大于100';
	*		}
	*	}}
	* }
	* //下拉列表编辑器
	* { title: '选择', sortable: true,  dataIndex: 'check',editor:{type:'select',items:[{name:'选择1',value:'1'},{name:'选择2',value:'2'}]}}
	* @see KISSY.LP.Grid
	*/
	function EditGrid(config) {
		EditGrid.superclass.constructor.call(this, config);
	}

	S.extend(EditGrid, Grid, 
	/** @lends S.LP.EditGrid.prototype */	
	{
		/**
		* 清除错误，如果还处于编辑状态，则取消编辑状态
		*/
		clearError : function(){
			var _self = this,
				result = false,
				showError = _self.get('showError'),
				columns = null,
				tbody = null;
			if(showError){
				/*tbody = _self.get('tbody');
				S.one(tbody).all('.' + CLS_CELL_ERROR).removeClass(CLS_CELL_ERROR);*/
			}
			_self.cancelEdit();
		},
		/**
		* 取消编辑状态，隐藏所有的编辑器，无论是否当前编辑器内的数据通过验证
		*/
		cancelEdit : function(){
			var _self = this,
				columns = _self.get('columns');
			S.each(columns,function(column){
					var editor = column.editor;
				if(editor && !editor.isHide()){
					editor.hide();
				}
			});
		},
		/**
		* 是否包含错误
		*/
		hasError : function(){
			var _self = this,
				result = false,
				showError = _self.get('showError'),
				columns = null,
				tbody = null;
			if(showError){
				tbody = _self.get('tbody');
				result = !! S.one(tbody).one('.' + CLS_CELL_ERROR);
			}
			if(!result){
				columns = _self.get('columns')
				S.each(columns,function(column){
					var editor = column.editor;
					if(editor && !editor.isHide() && editor.hasError()){
						result = true;
						return false;
					}
				});
			}
			return result;
		},
		/**
		* 设置单元格进入编辑状态
		* @param {Object} record 编辑的记录
		* @param {String} field 编辑的字段
		*/
		setCellToEdit : function(record,field){
			var _self = this,
				cell = _self._getCell(record,field),
				editor = _self._getEditor(field);
			if(DOM.hasClass(cell,CLS_CELL_EDITABLE)){
				_self._showEditor(editor,cell, record[field],record);
			}
		},
		//初始化编辑事件
		_attachEditEvent : function(column){
			var _self = this,
				editor = column.editor;
			editor.on('change',_self._getChangeEvent(column));

			editor.on('hide',function(event){
				_self.set('editRecord',null);
				_self.set('editor',null);
			});
		},
		//数据改变触发的事件
		_getChangeEvent : function(column){
			var _self = this;
			return function(event){
				var value = event.value,
					record = event.record,
					field = column.dataIndex,
					store = _self.get('store');
				if(record[field] !== value){
					store.setValue(record, field, value);
				}
			}
		},
		//展示错误信息
		_addError : function (cell, msg) {
			var innerEl = cell.one('.' + CLS_GRID_CELL_INNER),
				errorEl = cell.one('.' + CLS_CELL_ERROR_ICON),
				temp = ['<span class="', CLS_CELL_ERROR_ICON, '" title="', msg, '"></span>'].join('');
			if(!errorEl){
				innerEl.addClass(CLS_CELL_ERROR);
				errorEl = new Node(temp).appendTo(innerEl);
			}else{
				errorEl.attr('title',msg);
			}
		},
		//清除错误
		_clearError : function(cell){
			var innerEl = cell.one('.' + CLS_GRID_CELL_INNER),
				errorEl = cell.one('.' + CLS_CELL_ERROR_ICON);
			innerEl.removeClass(CLS_CELL_ERROR);
			if(errorEl){
				errorEl.remove();
			}
		},
		//获取编辑器
		_getEditor : function (field) {
			var _self = this
				columns = _self.get('columns'),
				editor = null;
			S.each(columns, function(column){
				if(column.dataIndex === field){
					editor = column.editor; 
					return false;
				}
			});
			return editor;
		},
		//获取单元格的模版/**/
		_getCellTemplate : function (colindex, column, text,value,obj) {
			var _self = this,
				dataIndex = column.dataIndex,
				width = column.width,
				tipText = column.showTip ? 'title = "' + (value||'') + '"' : '',
				hideText = column.hide ? 'ks-hidden' : '',
				editor = column.editor,
				eitable = editor ? (editor.editableFun && !editor.editableFun(value,obj) ? '' : CLS_CELL_EDITABLE) : '',
				showError = _self.get('showError'),
				validText = showError ? (editor && editor.validator ? editor.validator(value,obj) : ''): '',
				errorText = validText ?  '<span class="' + CLS_CELL_ERROR_ICON + '" title="' + validText + '"></span>' : '',
				errorCls =  validText ? CLS_CELL_ERROR : '',
				template = ['<td  class="grid-body-cell grid-body-td-', dataIndex, ' ', hideText, ' ', eitable ,'" data-column-name="', dataIndex, '" colindex="', colindex, '" width="', width, 'px">',
						'<div class="',CLS_GRID_CELL_INNER,' ', errorCls ,'" style="width : ', width, 'px"><span class="', CLS_CELL_TEXT, ' " ' , tipText, '>', text, '</span>', errorText, '</div></td>'].join('');
			return template;
		},
		//获取编辑器模版
		_getTextEditorTemplate : function (width) {
			width = width || 80;
			var temp = ['<div class="lp-text-editor grid-editor" style="position : absolute; z-index : 1000; visibility : hidden; left : -10000px; top : -10000px; overflow : auto;">',
				'<input type="text" name=""autocomplete="off" size="20" class="lp-form-text-field lp-editor-field" style="width : ', width, 'px; height : 20px;">'].join('');
			return temp;
		},
		//获取行数据
		_getRowDataByCell : function (cell){
			var _self = this,
				row = _self._findRow(cell),
				obj = DOM.data(row, DATA_ELEMENT);
			return obj;
		},
		//获取单元格
		_getCell : function(record,field){
			var _self = this,
				row = _self._findRowByRecord(record),
				cls = PREFIX_CLS_CELL + field,
				cell = S.one('.' + cls, row);
			return cell;
		},
		//获取单元格上文本信息
		_getCellValue : function (cell, field) {
			var _self = this,
				row = _self._findRow(cell),
				obj = DOM.data(row, DATA_ELEMENT),
				value = obj ? obj[field] : null;
			return value;
		},
		_hasEditor : function (field) {
			return this.hasAttr(KEY_COLUMN_PREFIX + field);
		},
		_hideEditor : function (editor) {
			editor.css({visibility : 'hidden', left : -10000, top : -10000});
		},
		//初始化
		_init : function () {
			EditGrid.superclass._init.call(this);
			var _self = this,
				columns = _self.get('columns');
			S.each(columns, function (column) {
				var editor = column.editor,
					cls = null;
				if (!editor || editor.isEditor) {
					return;
				}
				cls = gridEditor.types[editor.type||'text'];
				column.editor = new cls(editor);
				_self._attachEditEvent(column);
				//_self._createEitor(column);
			});
		},
		_initEvent : function(){
			var _self = this;
			S.Event.on(document,'click',function(event){
				var editor = _self.get('editor'),
					sender = event.target,
					cell = _self._findCell(event.target);
				if(!cell && editor && !editor.isHide() && !editor.hasError() && !editor.isContains(sender)){
					editor.hide();
				}
			});/**/
			_self.constructor.superclass._initEvent.call(_self);
		},
		_initDataEvent : function () {

			var _self = this,
				store = _self.get('store');
			store.on('updaterecord', function (event) {
				var record = event.record;
				_self._setRowValue(record);
			});
			_self.on('rowremoved',function(event){
				var record = _self.get('editRecord'),
					editor = _self.get('editor');
				if(record && editor){
					if(record == event.data && !editor.isHide()){
						editor.hide();
					}
				}
			});
			_self.constructor.superclass._initDataEvent.call(this);
		},
		//点击行事件，决定是否显示编辑器
		_rowClickEvent : function (target) {
			var _self = this,
				cell = _self._findCell(target),
				field = null,
				editor = null,
				formerEditor = null,
				record = null;
			if (cell) {
				field = DOM.attr(cell, ATTR_COLUMN_NAME);
				editor = _self._getEditor(field);
				formerEditor = _self.get('editor');
				if(formerEditor && formerEditor != editor){
					if(!formerEditor.isHide() && !formerEditor.hasError()){
						formerEditor.hide();
					}
				}
				if (field && editor) {
					
					if(!editor.isHide() && editor.hasError()){
						editor._focus();
						return;
					}
					record = _self._getRowDataByCell(cell);
					if(record){
						//验证是否可以编辑，如果不可编辑则不显示编辑器
						if(!DOM.hasClass(cell,CLS_CELL_EDITABLE))
						{
							return ;
						}
						var result =_self.fire('beforeedit',{cell : cell , field : field , data : record});
						if(result !== false){
							
							_self._showEditor(editor,cell, record[field],record);
						}
					}
					return;
				}
			}
			_self.constructor.superclass._rowClickEvent.call(this, target);
		},
		_setRowValue : function (obj) {
			var _self = this,
				row = _self._findRowByRecord(obj),
				columns = _self.get('columns');
			if (row) {
				S.each(columns, function (column) {
					var field = column.dataIndex,
						cls = PREFIX_CLS_CELL + field,
						cell = S.one('.' + cls, row),
						textEl = cell.one('.' + CLS_CELL_TEXT),
						editor = column.editor,
						validText = editor && editor.validator ? editor.validator(obj[field],obj) : '',
						text = null,
						showError = _self.get('showError');
					if (textEl) {
						text =  column.renderer ? column.renderer(obj[field], obj) : obj[field];
						text = text === undefined ? '' : text;
						textEl.html(text);
						if(!showError){
							return;
						}
						if(validText){
							_self._addError(cell,validText);
						}else{
							_self._clearError(cell);
						}
					}
				});
			}
		},
		_showEditor : function (eidtor,cell, value,record) {
			var _self = this,
				offset = DOM.offset(cell),
				width = DOM.width(cell),
				inner = DOM.get('.' + CLS_GRID_CELL_INNER,cell),
				height = DOM.height(inner),
				preEidtor = _self.get('editor');
				
			
			if(preEidtor && !preEidtor.isHide() && !preEidtor.hasError()){
				preEidtor.hide();
			}
			_self.set('editRecord',record);
			_self.set('editor',editor);
			if(UA.ie == 7){
				eidtor.setWidth(width - 4);
			}else{
				eidtor.setWidth(width - 2);
			}
			//eidtor.setHeight(height - 2);
			eidtor.setValue(value,record);
			//eidtor.show(offset);
			eidtor.show({container:inner,left:0,top:2});
		}
	});

	var CLS_EDITOR_ERROR = 'grid-error-editor',
		CLS_EDITOR_ERROR_ICON = 'grid-error-editor-icon';
	var gridEditor = function(config){
		var _self = this;
		config = S.merge({isEditor:true},config);
		S.mix(_self,config);
		gridEditor.superclass.constructor.call(_self, config);
		_self._init();
		_self.events = ['beforechange','change'];
	};

	S.extend(gridEditor, S.Base);
	S.augment(gridEditor,{
		/**
		* 触发改变的事件
		*/
		CHANGE_EVENT : 'blur',
		/**
		* 初始化值
		*/
		INIT_VALUE : '',
		hasError : function(){
			var _self = this,
				el = _self.get('el');
			return el.hasClass(CLS_EDITOR_ERROR);
		},
		/**
		* 隐藏编辑器
		*/
		hide : function(){
			var _self = this,
				el = _self.get('el');
			_self._clearError();
			el.css({visibility : 'hidden', left : -10000, top : -10000});
			_self.fire('hide',{record : _self.get('record'),editor : _self});
			//隐藏数据前清空数据
			_self._setValue(_self.INIT_VALUE);
			S.one('body').append(el);
		},
		/**
		* 获取值
		* @return {Object} 任意类型的数据，可能为空
		*/
		getValue : function(){
			var _self = this,
				editEl = _self.get('editEl');
			
			return editEl ? _self._getValue() : _self.INIT_VALUE;
		},
		/**是否隐藏*/
		isHide : function(){
			var _self = this,
				el = _self.get('el');
			return el.css('visibility') === 'hidden' || el.width() == 0;
		},
		/**
		* 是否包含元素
		*/
		isContains : function(element){
			var _self = this,
				el = _self.get('el');
			return el.contains(element);
		},
		/**
		* 设置值
		*/
		setValue : function(value,record){
			var _self = this;

			_self.set('record',record);
			if(editEl){
				_self._setValue(value);
				_self._validate(value,record);
			}
		},
		/**
		* 显示编辑器
		* @param {Object} offset 相对页面的位置
		* @param {Number} offset.left 相对页面的 left位置
		* @param {Number} offset.top 相对页面的 top 位置
		*/
		show : function(offset){
			var _self = this,
				el = _self.get('el'),
				container = offset.container;
			if(container){
				S.one(container).append(el);
			}
			el.css({visibility : 'visible', left : offset.left, top : offset.top});
			_self._focus();
			_self.fire('show',{record : _self.get('record'),editor : _self});
		},
		/**
		* 设置编辑器宽度
		* @param {Number} width 编辑器宽度
		*/
		setWidth : function(width){
			var _self = this,
				editEl = _self.get('editEl');
			editEl.width(width);
		},
		/**
		* 设置编辑器宽度
		* @param {Number} height 编辑器高度
		*/
		setHeight :function(height){
			var _self = this,
				editEl = _self.get('editEl');
			editEl.height(height);
		},
		//基本的验证
		_basicValidator : function(value,obj){
			var _self = this;
			if(_self.required && (value === undefined || value ===null || S.trim(value.toString()) === '')){
				return '不能为空';
			}
			return '';
		},
		//基本的格式化
		_basicFormat : function(value){
			if(value === undefined || S.trim(value.toString()) === ''){
				return undefined;
			} 
			return value;
		},
		//清除错误信息
		_clearError : function(){
			var _self = this,
				el = _self.get('el'),
				errorEl = el.one('.'+CLS_EDITOR_ERROR_ICON);
			el.removeClass(CLS_EDITOR_ERROR);
			errorEl.attr('title','');
		},
		//编辑器设置焦点
		_focus : function(){
			var _self = this,
				editEl = _self.get('editEl');
			editEl[0].focus();
		},
		//获取编辑器的模版
		_getTemplate : function(){
			var temp = ['<input type="text" name=""autocomplete="off" size="20" class="lp-form-text-field lp-editor-field"  style="height : 20px;">',
				'<s class="', CLS_EDITOR_ERROR_ICON, '"></s>'].join('');
			return temp;
		},
		//获取输入文本的区域
		_getEditElemnt : function(){
			var _self = this,
				el = _self.get('el'),
				children = el.children();
			if(children.length){
				return S.one(children[0]);
			}
			return null;
		},
		_getValue : function(editElemnt){
			var _self = this;
			editElemnt = editElemnt || _self.get('editEl');

			return editElemnt.val();
		},
		//初始化
		_init : function(){
			var _self = this;
			_self._initDom();
			_self._initEvent();
			_self._initHideEvent();
		},
		//初始化Dom
		_initDom : function(){
			var _self = this,
				el = null,
				temp = ['<div class="grid-editor" style="position : absolute; z-index : 1000; visibility : hidden; left : -10000px; top : -10000px; overflow : auto;">',_self._getTemplate(),'</div>'].join(''),
				container = _self.get('container') || DOM.get('body');
			el = new Node(temp).appendTo(container);
			

			_self.set('container',container);
			_self.set('el',el);

			editEl = _self._getEditElemnt();
			_self.set('editEl',editEl);

		},
		//初始化事件
		_initEvent : function(){
			var _self = this,
				el = _self.get('el'),
				editEl = _self.get('editEl');
			
			el.on('click',function(event){
				event.stopPropagation();
			});
			editEl.on(_self.CHANGE_EVENT,function(event){
				var sender = S.one(this),
					valid = _self._valueChange(sender);
					if (!valid) {
						event.preventDefault();
					}else{
						//_self._setValue(_self.INIT_VALUE,sender)
						//_self.hide();
					}
			});
		},
		_initHideEvent : function(){
			
		},
		//值改变后，返回验证结果
		_valueChange : function(sender,value){
			var _self = this,
				record = _self.get('record'),
				valid = null;
			value = value || _self._getValue(sender);
			valid = _self._validate(value,record);
			value = _self._basicFormat(value);
			value = _self.format ? _self.format(value) : value;
			if (valid) {
				_self.fire('change',{value : value,record : record});
				return true;
			}
			return false;
		},
		//设置错误
		_setError : function(msg){
			var _self = this,
				el = _self.get('el'),
				errorEl = el.one('.'+CLS_EDITOR_ERROR_ICON);
			el.addClass(CLS_EDITOR_ERROR);
			errorEl.attr('title',msg);
		},
		_setValue : function(value,editElemnt){
			var _self = this;
			editElemnt = editElemnt || _self.get('editEl');
			editElemnt.val(value)
		},
		//验证编辑器
		_validate : function(value,obj){
			var _self = this,
				errorText = null, 
				valid = true;
			errorText = _self._basicValidator(value) || (_self.validator && _self.validator(value,obj));
			valid = errorText ? false : true ;
			if(valid){
				_self._clearError();
			}else{
				_self._setError(errorText);
			}
			return valid;
		},
		destroy : function(){
			var _self = this,
				el = _self.get('el');
			
			el.remove();
			_self.detach();
			_self.__attrVals = {};
		}
	});

	
	var textGridEditor = function(config){
		textGridEditor.superclass.constructor.call(this, config);
	}
	S.extend(textGridEditor, gridEditor);
	S.augment(textGridEditor, {
		
	});

	var numberGridEditor = function(config){
		numberGridEditor.superclass.constructor.call(this, config);
	}
	S.extend(numberGridEditor, gridEditor);
	S.augment(numberGridEditor, {
		_basicFormat : function(value){
			if(value === undefined || S.trim(value.toString()) === ''){
				return undefined;
			} 
			return parseFloat(value);
		},
		_basicValidator : function(value){
			var validText = this.constructor.superclass._basicValidator.call(this,value);
			if(!validText && value && isNaN(value)){
				validText = '请输入数字';
			}
			return validText;
		}
	});
	
	/**
	* checkBox 编辑器
	*/
	var checkGridEditor = function(config){
		checkGridEditor.superclass.constructor.call(this, config);
	}
	S.extend(checkGridEditor, gridEditor);
	S.augment(checkGridEditor,{
		CHANGE_EVENT : 'change',
		INIT_VALUE : false,
		setHeight :function(height){
			return ;
		},
		//获取编辑器的模版
		_getTemplate : function(){
			var temp = ['<input type="checkbox" name="" class="lp-form-checkbox-field lp-editor-field"  style="height : 20px;">',
				'<s class="', CLS_EDITOR_ERROR_ICON, '"></s>'].join('');
			return temp;
		},
		_getValue : function(editElemnt){
			editElemnt = editElemnt || this.get('editEl');
			var _self = this,
				checked = editElemnt.attr('checked');
			
			return checked ? true : false;
		},
		_setValue : function(value,editElemnt){
			var _self = this;
			editElemnt = editElemnt || _self.get('editEl');
			editElemnt.attr('checked', value)
		}
	});

	//下拉选择框
	var selectGridEditor = function(config){
		selectGridEditor.superclass.constructor.call(this, config);
	}
	S.extend(selectGridEditor, gridEditor);
	S.augment(selectGridEditor,{
		
		_getTemplate : function(){
            var temp = [ '<select class="lp-form-select-field lp-editor-field"  style="height : 20px;"></select>',
                '<s class="', CLS_EDITOR_ERROR_ICON, '"></s>'].join('');
               
            return temp;
        },
		_initDom : function(){
			this.constructor.superclass._initDom.call(this);

			var _self = this,
				editEl = _self.get('editEl'),
				items = _self.items;
			if(!_self.required){
				_self._createItem('请选择',_self.INIT_VALUE, editEl);
			}
			if(S.isArray(items)){
				S.each(items,function(item){
					_self._createItem(item.name, item.value, editEl);
				});	
			}else{
				for(var id in items){
					if(items.hasOwnProperty(id)){
						_self._createItem(items[id],id,  editEl);
					}
				}
			}
		},
		_createItem : function(name,value,container){
			var temp = '<option value="' + value + '">' + name + '</option>';
			new Node(temp).appendTo(container);
		}
	});

	//日期选择器
	var dateGridEditor = function(config){
		dateGridEditor.superclass.constructor.call(this, config);
	}
	S.extend(dateGridEditor, gridEditor);
	S.augment(dateGridEditor,{
		CHANGE_EVENT : 'select',
		//是否包含此元素
		isContains : function(element){
			var _self = this;
				
			return _self.constructor.superclass.isContains.call(this,element) || S.one(element).parent('.ks-cal-box');
		},
		//覆盖设置宽度的函数
		setHeight : function(){
			return;
		},
		setWidth :function(width){
			this.constructor.superclass.setWidth.call(this,width - 15);
		},
		_basicFormat : function(value){
			return new Date(value).getTime();
		},
		_getTemplate : function(){
            var temp = ['<input type="text" name=""autocomplete="off" size="20" class="lp-form-text-field lp-editor-field"  style="height : 20px;">',
                '<s class="', CLS_EDITOR_ERROR_ICON, '"></s>'].join('');
                
            return temp;
        },
		_init : function(){
			var _self = this;
			S.use('gallery/grid/calendar',function(S,Calendar){
				_self.set('Calendar',Calendar);
				_self.constructor.superclass._init.call(_self)
			})
			
		},
		_initDom : function(){
			this.constructor.superclass._initDom.call(this);

			var _self = this,
				editEl = _self.get('editEl'),
				Calendar = _self.get('Calendar'),
				id = 'grid-date'+S.guid(),
				datepicker = null;
			editEl.attr('id',id);

			datepicker =new Calendar([
				{selector:"#"+id}
			]);

			_self.set('datepicker',datepicker["#"+id]);
			
		},
		_initEvent : function(){
			var _self = this,
				datepicker = _self.get('datepicker'),
				el = _self.get('el'),
				editEl = _self.get('editEl');

			editEl.on('change',function(){
				S.log('change');
			});

			datepicker.on(_self.CHANGE_EVENT,function(ev){
				var valid = _self._valueChange(null,ev.date);

				if(valid){
					//_self._setValue(_self.INIT_VALUE,null)
					//_self.hide();
				}
			});
		},
		_setValue : function(value,editElemnt){
			var _self = this,
				editElemnt = editElemnt || _self.get('editEl'),
				valueText = S.LP.Format.dateRenderer(value),
				datepicker = _self.get('datepicker');

			editElemnt.val(valueText);
			if(value && value !== _self.INIT_VALUE){
				datepicker.render({selected : new Date(value),date : new Date(value)});
			}
		},
		_getValue : function(sender){
			var _self = this;
			if(sender){
				return sender.date;
			}else{
				S.log('error');
			}
		}
	});

	var multipleSelectEditor = function(config){
		multipleSelectEditor.superclass.constructor.call(this, config);
	};

	S.extend(multipleSelectEditor, gridEditor);
	S.augment(multipleSelectEditor,{
		//隐藏，如果选择器仍然处于显示状态，同时隐藏
		hide : function(){
			var _self = this,
				hideEvent = _self.get('hideEvent');
			if(_self._isSelectShow()){
				_self._hideSelect();
			}

			//S.Event.detach(document,'click',hideEvent);
			_self.constructor.superclass.hide.call(this);
			
		},
		//是否包含此元素
		isContains : function(element){
			var _self = this;
				
			return _self.constructor.superclass.isContains.call(this,element) || S.one(element).parent('.lp-multiple-wrap');
		},
		//设置值，覆盖父类，当value 为 undefined 时，用空数组代替
		setValue : function(value,record){
			var _self = this;
			value = value || [];
			_self.constructor.superclass.setValue.call(this,value,record);
		},
		setWidth :function(width){
			this.constructor.superclass.setWidth.call(this,width - 17);
		},
		//阻止设置高度
		setHeight : function(){
			return;
		},
		//创建元素
		_createItem : function(text,value,container){
			var temp = '<li class="multiple-item"> <input class="multiple-item-checkbox"  type="checkbox" name="' + value + '" />' + text + '</li>';
			new Node(temp).appendTo(container);
		},
		//获取选择器的坐标
		_getSelectOffset : function(){
			var _self = this,
				editEl = _self.get('editEl'),
				offset = editEl.offset();
			offset.top += editEl.height() + 2;
			return offset;
		},
		_getText : function(value){
			var _self = this,
				value = value || _self._getValue(),
				items = _self.items,
				renderer = _self.get('renderer');
			if(!renderer){
				renderer = S.LP.Format.multipleItemsRenderer(items);
				_self.set('renderer',renderer);
			}

			return renderer(value)
		},
		//选择选中的值
		_getValue : function(){
			var _self = this,
				results = [],
				listEl = _self.get('listEl'),
				checks = listEl.all('.multiple-item-checkbox');
		
			S.each(checks,function(checkbox){
				if(checkbox.checked){
					results.push(checkbox.name);
				}
			});

			return results;	
		},
		//模板
		_getTemplate : function(){
			var temp = ['<input type="text" readonly = "true" name=""autocomplete="off" size="20" class="lp-form-multiple-field lp-editor-field"  style="height : 20px;">',
				'<s class="', CLS_EDITOR_ERROR_ICON, '"></s>'].join('');
			return temp;
		},
		//隐藏选择器
		_hideSelect : function(){
			var _self = this,
				selectEl = _self.get('selectEl');
			selectEl.css({visibility : 'hidden', left : -10000, top : -10000});
		},
		//选择器是否显示
		_isSelectShow : function(){
			var _self = this,
				selectEl = _self.get('selectEl');
			return	selectEl.css('visibility') !== 'hidden' && selectEl.width() != 0;
		},
		//初始化选择列表
		_initDom : function(Calendar){
			this.constructor.superclass._initDom.call(this);

			var _self = this,
				editEl = _self.get('editEl'),
				items = _self.get('items'),
				temp = '<div class="lp-multiple-wrap"  style="position : absolute; z-index : 1200; visibility : hidden; left : -10000px; top : -10000px; overflow : auto;"><ul class="multiple-list ks-clear"></ul><div class="multiple-footer" style="text-align:center"><span class="x-btn x-btn-default-small"><button autocomplete="off" hidefocus="true" type="button" style="width:74px;"><span class="x-btn-inner">确认</span></button></span></div></div>',
				wraperEl = new Node(temp).appendTo('body'),
				listEl = wraperEl.one('.multiple-list'),
				btnEl =  wraperEl.one('button');
			_self.set('selectEl',wraperEl);
			_self.set('listEl',listEl);
			_self.set('btnEl',btnEl);
			
			if(S.isArray(items)){
				S.each(items,function(item){
					_self._createItem(item.name, item.value, listEl);
				});	
			}else{
				for(var id in items){
					if(items.hasOwnProperty(id)){
						_self._createItem(items[id],id,  listEl);
					}
				}
			}
		},		
		//初始化事件，当点击确定时，获取选中的值
		_initEvent : function(){
			var _self = this,
				listEl = _self.get('listEl'),
				editEl = _self.get('editEl'),
				btnEl = _self.get('btnEl');
			
			
			editEl.on('click',function(event){
				event.stopPropagation();

				_self._toggleSelect();
			});
			listEl.on('click',function(event){
				event.stopPropagation();
			});
			btnEl.on('click',function(event){
				event.stopPropagation();

				var value = _self.getValue();
				_self._setText( _self._getText(value));
				_self._hideSelect();
				_self._valueChange(editEl,value);
			});

			
		},
		//设置输入框的文本
		_setText : function(text){
			var _self = this,
				editEl = _self.get('editEl');
			editEl.val(text);
		},
		//设置选择器选中的选项
		_setSelectValue : function(value){
			var _self = this,
				listEl = _self.get('listEl'),
				checks = listEl.all('.multiple-item-checkbox');
			checks.attr('checked',false);
			var selectChecks = S.filter(checks,function(checkbox){
				return S.inArray(checkbox.name,value);
			});

			S.all(selectChecks).attr('checked','checked')
		},
		//设置编辑器值，覆盖父类
		_setValue : function(value){
			var _self = this,
				text = _self._getText(value);
			_self._setText(text);
			_self._setSelectValue(value);
		},
		//显示选择器
		_showSelect : function(offset){
			var _self = this,
				selectEl = _self.get('selectEl'),
				offset = offset || _self._getSelectOffset();

			selectEl.css({visibility : 'visible', left : offset.left, top : offset.top});
		},
		//交替显示隐藏选择器
		_toggleSelect : function(){
			var _self = this;
			if(_self._isSelectShow()){
				_self._hideSelect();
			}else{
				_self._showSelect();
			}
		}
	});


	gridEditor.types = {
		text : textGridEditor,
		number : numberGridEditor,
		check : checkGridEditor,
		select : selectGridEditor,
		date : dateGridEditor,
		multipleSelect : multipleSelectEditor
	};

	S.namespace('LP');

	
	S.LP.Grid = Grid;

	S.LP.EditGrid = EditGrid;
}, {
    requires : ["core", "./uicommon","./bar", "./assets/grid.css"]
});