/**
 * @fileoverview 多选框美化
 * @author 伯方<bofang.zxj@taobao.com>
 *
 **/
KISSY.add('gallery/form/1.1/checkbox/base', function(S, Base, Node) {
	var $ = Node.all;
	/**
	 * @name Checkbox
	 * @class 多选框美化
	 * @constructor
	 * @extends Base
	 * @param {String} target 目标
	 * @param {Object} config * ,组件配置
	 * @param {Object} config.cls *，组件的样式
	 * @example
	 * var ck = new Checkbox('#J_Content input')
	 */
	function Checkbox(target, config) {
		if (!S.isString(target)) {
			S.log('请传入字符串格式的参数');
			return false;
		}
		this.target = $(target);
		this.checkboxs = [];
		Checkbox.superclass.constructor.call(this, config);
	}
	//方法
	S.extend(Checkbox, Base, {
		/**
		 * 运行
		 */
		render: function() {
			var self = this;
			//开始替换
			self._replaceCheckbox();
			//事件绑定
			self._bindEvent();
			//alert(self.get('cls').init);
		},
		/**
		 * 还原checkbox，成为原生的checkbox
		 * @return {Object} return self
		 */
		recoverCheckbox: function() {
			var self = this,
				targets = self.target,
				checkboxs = self.checkboxs;
			$(checkboxs).each(function(value, key) {
				value.hide();
				$(targets[key]).show();
			})
			self.checkboxs = null;
			return self;
		},
		/**
		 * 用span替换checkbox，关键步骤
		 */
		_replaceCheckbox: function() {
			var self = this,
				target = self.target,
				html = self._getHtml(0),
				disabledHTML = self._getHtml(2),
				checkedHTML = self._getHtml(1),
				ksGuid, checkbox, disabledArr = [];
			if (target.length === 0) {
				return false;
			}
			target.each(function(value, key) {
				value.hide();
				if (self._isDisabled(value)) {
					checkbox = $(disabledHTML).insertBefore(value).attr('ks-checkbox-disabled', 'disabled');
					disabledArr.push(key);
				} else {
					//如果本身是选中的状态
					if (self._isChecked(value)) {
						checkbox = $(checkedHTML).insertBefore(value);
					} else {
						checkbox = $(html).insertBefore(value);
					}
				}
				self.checkboxs.push(checkbox);
			})
		},
		/**
		 * 根据样式返回html字符串
		 * @param  {Number} key 0→DEFAULT;1→CHECKED;2→DISABLED
		 * @return {String} 返回html
		 */
		_getHtml: function(key) {
			//alert(this.get('cls').init);
			var self = this,
				getClass = self.get('cls'),
				defaultClass = getClass.init,
				checkedClass = getClass.checked,
				disabledClass = getClass.disabled,
				htmlStr = '<span class="{defalutName} {secondName}"></span>',
				obj = {
					defalutName: defaultClass
				};
			switch (key) {
			case 0:
				obj.secondName = '';
				break;
			case 1:
				obj.secondName = checkedClass;
				break;
			case 2:
				obj.secondName = disabledClass;
				break;
			default:
				break;
			}
			return S.substitute(htmlStr, obj);
		},
		/**
		 * 绑定事件，包括mouseenter mouseleave click
		 */
		_bindEvent: function() {
			var self = this,
				checkboxs = $(self.checkboxs),
				hoverClass = this.get('cls').hover;
			checkboxs.each(function(value, key) {
				value.on('mouseenter mouseleave', function(ev) {
					//如果本身是选中状态或者是禁用状态，则不做处理
					if (self._isChecked(value) || self._isDisabled(value)) {
						return;
					}
					//value.toggleClass('ks-checkbox-hover') 在初始化的时候就已经选中的无效
					switch (ev.type) {
					case 'mouseenter':
						value.addClass(hoverClass);
						break;
					case 'mouseleave':
						value.removeClass(hoverClass);
						break;
					default:
						break;
					}
				}).on('click', function() {

					if (self._isDisabled(value)) return;
					self._clickHandler.call(self, key);
					//return false;				
				})
			})
		},
		/**
		 * 单击事件
		 * @param  {Number} targetIndex 数组checkboxs的索引
		 */
		_clickHandler: function(targetIndex) {
			var that = this,
				targets = that.target,
				checkbox = $(that.checkboxs[targetIndex]),
				checkedClass = this.get('cls').checked;
			//触发原生dom节点的点击事件
			$(targets[targetIndex]).fire('click');
			checkbox.toggleClass(checkedClass);			
		},
		/**
		 * 判断是否处于禁用状态
		 * @param  {HTMLElement | KISSY Node | String}  原生的dom节点，Nodelist，或者是选择器字符串
		 * @return {Boolean}
		 */
		_isDisabled: function(target) {
			var protoDisabled = $(target).attr('disabled'),
				modifyDisabled = $(target).attr('ks-checkbox-disabled');
			return protoDisabled === 'disabled' || modifyDisabled === 'disabled';
		},
		/**
		 * 判断是否处于禁用状态
		 * @param  {HTMLElement | KISSY Node | String}  原生的dom节点，Nodelist，或者是选择器字符串
		 * @return {Boolean}
		 */
		_isChecked: function(target) {
			var protoChecked = $(target).prop('checked'),
				hasCheckedClass = $(target).hasClass(this.get('cls').checked);
			return protoChecked || hasCheckedClass;
		},
		/**
		 * 设置某个checkbox为disabled状态
		 * @param {Number} targetElement 数组checkboxs的索引
		 */
		setDisabled: function(targetElement) {
			var self = this,
				checkboxs = self.checkboxs,
				targets = self.target,
				checkbox, target, getClass = this.get('cls'),
				checkedClass = getClass.checked,
				disabledClass = getClass.disabled,
				hoverClass = getClass.hover;
			//如果传递的是数字索引
			if (typeof targetElement === 'number') {
				checkbox = $(checkboxs[targetElement]);
				target = $(targets[targetElement]);
				checkbox.attr('ks-checkbox-disabled', 'disabled').removeClass(checkedClass + ' ' + hoverClass).addClass(disabledClass);
				target.attr('disabled', 'disabled');
			}
			return self;
		},
		/**
		 * 全选
		 * @return {Object} return self
		 */
		selectAll: function() {
			var self = this,
				checkboxs = self.checkboxs;
			$(checkboxs).each(function(value, key) {
				if (self._isChecked(value)) return;
				value.fire('click');
			})
			return self;
		},
		/**
		 * 清空
		 * @return {Object} return self
		 */
		resetAll: function() {
			var self = this,
				checkboxs = self.checkboxs,
				hoverClass = this.get('cls').hover;
			$(checkboxs).each(function(value, key) {
				if (!self._isChecked(value)) return;
				value.fire('click').removeClass(hoverClass);
			})
			return self;
		},
		/**
		 * 获取所有选中的checkboxs索引
		 * @return {Array} 选中的checkboxs索引数组集合
		 */
		getAllChecked: function() {
			var self = this,
				target = this.target,
				checkedArr = [],
				value;
			for (i = 0, len = target.length; i < len; i++) {
				value = $(target[i]);
				if (self._isDisabled(value)) {
					continue;
				}
				if (self._isChecked(value)) {
					checkedArr.push(i);
				}
			}
			return checkedArr;
		}
	}, {
		ATTRS: {
			 /**
	         * 采用样式名
	         * @type Object
	         * @default cls:{init: 'ks-checkbox',checked: 'ks-checkbox-checked',disabled: 'ks-checkbox-disabled',hover: 'ks-checkbox-hover'}
	         */
			cls: {
				value: {
					init: 'ks-checkbox',
					checked: 'ks-checkbox-checked',
					disabled: 'ks-checkbox-disabled',
					hover: 'ks-checkbox-hover'
				}
			}
		}
	})
	return Checkbox;
}, {
	requires: ['base', 'node']
});
