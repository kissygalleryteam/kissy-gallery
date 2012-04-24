/**
 * @fileoverview 多选框美化
 * @author 伯方<bofang.zxj@taobao.com>
 *
 **/
KISSY.add('gallery/form/1.1/checkbox/index', function(S, Base, Node) {
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
		//调用父类构造器
		var self = this;
		Checkbox.superclass.constructor.call(self, config);
		self.set('target', target);
	}
	//方法
	S.extend(Checkbox, Base, /** @lends Checkbox.prototype*/ {
		/**
		 * 开始执行
		 */
		render: function() {
			var self = this;
			//alert(typeof self.get('getLabelFunc') );
			//加载css
			self._loadCss();
			//开始替换
			self._replaceCheckbox();
			//事件绑定
			self._bindEvent();
		},
		/**
		 * 还原checkbox为原生的checkbox
		 * @return {Object} return self
		 */
		recoverCheckbox: function() {
			var self = this,
				targets = self.get('target'),
				checkboxs = self.get('checkboxs');
			$(checkboxs).each(function(value, key) {
				value.hide();
				$(targets[key]).show();
			})
			//self.set('checkboxs',[]);// = null;
			return self;
		},
		/**
		 * 用span替换checkbox，关键步骤
		 */
		_replaceCheckbox: function() {
			var self = this,
				target = self.get('target'),
				html = self._getHtml(0),
				disabledHTML = self._getHtml(2),
				checkedHTML = self._getHtml(1),
				checkbox, checkboxArr = [],
				hasLabel = self.get('hasLabel'),
				accessible = self.get('accessible'),
				getLabelFunc = self.get('getLabelFunc'),
				labelText;
			if (target.length === 0) {
				return false;
			}
			target.each(function(value, key) {
				value.hide();
				if (self._isDisabled(value)) {
					checkbox = $(disabledHTML).insertBefore(value).attr('ks-checkbox-disabled', 'disabled').removeAttr('tabindex');
				} else {
					// 如果本身是选中的状态
					checkbox = self._isChecked(value) ? $(checkedHTML) : $(html);
					checkbox.insertBefore(value);
				}
				// 无障碍访问
				try {
					if (accessible) {
						//优先选择函数提供的查询										
						labelText = getLabelFunc ? getLabelFunc(value).html() : value.next('label').html();
						checkbox.attr('aria-label', labelText);
					}
				} catch (e) {
					S.log('html结构不符合');
					return false;
				}
				checkboxArr.push(checkbox);
			})
			self.set('checkboxs', checkboxArr);
		},
		/**
		 * 加载css
		 */
		_loadCss: function() {
			var self = this,
				isUseCss = self.get('isUseCss'),
				cssUrl = self.get('cssUrl');
			//加载css文件
			if (cssUrl !== '') {
				S.use(cssUrl, function(S) {});
			}
		},
		/**
		 * 根据样式返回html字符串
		 * @param  {Number} key 0→DEFAULT;1→CHECKED;2→DISABLED
		 * @return {String} 返回html
		 */
		_getHtml: function(key) {
			var self = this,
				getClass = self.get('cls'),
				defaultClass = getClass.init,
				checkedClass = getClass.checked,
				disabledClass = getClass.disabled,
				htmlStr = '<span tabindex="0" class="{defalutName} {secondName}"></span>',
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
				checkboxs = $(self.get('checkboxs')),
				hoverClass = this.get('cls').hover,
				hasLabel = self.get('hasLabel'),
				targets = self.get('target'),
				getLabelFunc = self.get('getLabelFunc'),
				nextLabel;
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
					//单击				
				}).on('click', function() {
					if (self._isDisabled(value)) return;
					self._clickHandler.call(self, key);
					//按键 enter
				}).on('keyup', function(ev) {
					if (ev.keyCode === 13) {
						value.fire('click');
					}
				});
				//如果需要 label-for
				if (hasLabel) {
					try {
						nextLabel = getLabelFunc ? getLabelFunc($(targets[key])) : value.next('label');
						//将label绑定和checkbox一样的事件
						nextLabel.on('click', function() {
							value.fire('click');
						}).on('mouseenter', function() {
							value.fire('mouseenter');
						}).on('mouseleave', function() {
							value.fire('mouseleave');
						})
					} catch (e) {
						S.log('html结构不符合');
						return false;
					}
				}
			})
		},
		/**
		 * 单击事件
		 * @param  {Number} targetIndex 数组checkboxs的索引
		 */
		_clickHandler: function(targetIndex) {
			var that = this,
				targets = that.get('target'),
				checkbox = $(that.get('checkboxs')[targetIndex]),
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
		 * 根据索引禁用单个checkbox
		 * @param {Number} targetElement 数组checkboxs的索引
		 */
		setDisabled: function(targetElement) {
			var self = this,
				checkboxs = self.get('checkboxs'),
				targets = self.get('target'),
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
			checkbox.removeAttr('tabindex');
			return self;
		},
		/**
		 * 根据索引恢复单个checkbox
		 * @param {Number} targetElement 数组checkboxs的索引
		 */
		setAvailabe: function(targetElement) {
			var self = this,
				checkboxs = self.get('checkboxs'),
				targets = self.get('target'),
				checkbox, target, disabledClass = this.get('cls').disabled;
			//如果传递的是数字索引
			if (typeof targetElement === 'number') {
				checkbox = $(checkboxs[targetElement]);
				target = $(targets[targetElement]);
				checkbox.removeAttr('ks-checkbox-disabled', 'disabled').removeClass(disabledClass);
				target.removeAttr('disabled', 'disabled');
			}
			checkbox.attr('tabindex', '0');
			return self;
		},
		/**
		 * 模拟的checkbox全选
		 * @return {Object} return self
		 */
		selectAll: function() {
			var self = this,
				checkboxs = self.get('checkboxs');
			$(checkboxs).each(function(value, key) {
				if (self._isChecked(value)) return;
				value.fire('click');
			})
			return self;
		},
		/**
		 * 清空模拟的checkbox
		 * @return {Object} return self
		 */
		resetAll: function() {
			var self = this,
				checkboxs = self.get('checkboxs'),
				hoverClass = self.get('cls').hover;
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
				target = self.get('target'),
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
		ATTRS: /** @lends Checkbox.prototype*/
		{
			/**
			 * 配置的目标,选择器的字符串
			 * @type {String}
			 */
			target: {
				value: '',
				setter: function(v) {
					return $(v);
				},
				getter: function(v) {
					return $(v);
				}
			},
			/**
			 * 美化后的checkbox数组
			 * @type {Array}
			 * @default []
			 */
			checkboxs: {
				value: []
			},
			/**
			 * 一组样式名
			 * @type {Object}
			 * @default cls:{init: 'ks-checkbox',checked: 'ks-checkbox-checked',disabled: 'ks-checkbox-disabled',hover: 'ks-checkbox-hover'}
			 */
			cls: {
				value: {
					init: 'ks-checkbox',
					checked: 'ks-checkbox-checked',
					disabled: 'ks-checkbox-disabled',
					hover: 'ks-checkbox-hover'
				}
			},
			/**
			 * css模块路径
			 * @default gallery/form/1.1/checkbox/themes/default/style2.css
			 */
			cssUrl: {
				value: 'gallery/form/1.1/checkbox/themes/default/style.css'
			},
			/**
			 * 是否需要label for的对应
			 * @default false
			 */
			hasLabel: {
				value: false
			},
			/**
			 * 通过checkbox查找对应label的函数
			 * @default undefined			 
			 * @type {Function}
			 */
			getLabelFunc: {
				value: undefined,
				setter: function(v) {
					return v;
				},
				getter: function(v) {
					return v;
				}
			},
			/**
			 * 无障碍，建立在label的基础上,查找label里面的innerHTML
			 * @default false
			 */
			accessible: {
				value: false
			}
		}
	})
	return Checkbox;
}, {
	requires: ['base', 'node']
});
