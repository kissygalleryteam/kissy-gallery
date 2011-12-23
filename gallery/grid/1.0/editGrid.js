KISSY.add("gallery/grid/1.0/editGrid",function (S,Grid,GridEditor) {
	var DOM = S.DOM,
		UA = S.UA,
        Node = S.Node;

	/** 
		@exports S.LP as KISSY.LP
	*/
	var ATTR_COLUMN_NAME = 'data-column-name',
		DATA_ELEMENT = 'row-element',
		CLS_CELL_TEXT = 'grid-body-cell-text',
		CLS_GRID_CELL = 'grid-body-cell',
		CLS_GRID_CELL_INNER = 'grid-body-cell-inner',
		KEY_COLUMN_PREFIX = 'col',
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
				cls = GridEditor.types[editor.type||'text'];
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

	S.namespace('LP');

	S.LP.EditGrid = EditGrid;

	return EditGrid;
}, {
    requires : ["./grid",'./gridEditor']
});