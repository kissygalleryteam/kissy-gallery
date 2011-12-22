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
});KISSY.add("gallery/grid/1.0/gridEditor",function (S) {

	var DOM = S.DOM,
		UA = S.UA,
        Node = S.Node;

	var	CLS_EDITOR_ERROR = 'grid-error-editor',
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
			S.use('gallery/grid/1.0/calendar',function(S,Calendar){
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

	return gridEditor;
}, {
    requires : []
});