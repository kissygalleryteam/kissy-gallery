/**
 * @fileoverview 数字文本框
 * @author 易敛<yilian.wj@taobao.com>
 * @date 12-4-22
 */
KISSY.add('gallery/form/1.2/number/index', function(S, Node, Base){
	var $ = Node.all, D = S.DOM;
	/**
	 * @name Number
	 * @class 数字文本框
	 * @constructor
	 * @extends Base
	 * @param {String} target 目标
	 * @param {Object} config 组件配置
	 * @example
	 * var ck = new Number('#J_Content input',{trigger:{plus:'#J_Plus',minus:'#J_Minus'}})
	 */
	function Number(target, config) {
		
		var self = this;
		config = S.merge({target: $(target)},config);
		//调用父类构造器
		Number.superclass.constructor.call(self, config);
	}

	S.extend(Number, Base,  /** @lends Number.prototype*/{
		/*
		* 运行
		*/
		render: function(){
			var self = this,$target = self.get('target');
            if(!$target.length) return false;
            self.addHTML();
            self.eventOnChangeNum();
            self.eventOnValide();
		},
		/**
		 * 对input组件进行包装
		 */
		addHTML: function(){
			var self = this, $target = self.get('target'), getCls = this.get('cls'), accessible = self.get('accessible');
			//创建元素
			var $parent = $target.parent(),
			$containerEl = $(D.create('<span class="'+ getCls.container + '">')),
			$plusEl = $(D.create('<a>',{href: '#!/price/plus', text: '-'})),
			$minusEl = $(D.create('<a>',{href: '#!/price/minus', text: '+'}));
			$plusEl.addClass(getCls.plus);
			$minusEl.addClass(getCls.minus);

			if(accessible){
				$target.addAttr('aria-label','出价框，请输入价格');
			}

			//建立元素之间关系
			$containerEl.append($minusEl).append($target).append($plusEl);
			$parent.append($containerEl);

		},

		eventOnChangeNum: function(){
			var self = this, $target = self.get('target'), inputValue, range = +$target.attr('data-range') || 1,
			getTrigger = self.get('trigger'), $plus = $(getTrigger.plus), $minus = $(getTrigger.minus),
			limitRange = self.limitRange;
			$plus.on('click', function(){	
				inputValue = +$target.val();
				inputValue += range;
				limitRange.call(self,  inputValue);
			});
			$minus.on('click',function(){
				
				inputValue = +$target.val();
				inputValue -= range;
				limitRange.call(self, inputValue);
			})
		},
		eventOnValide: function(){
			var self = this, $target = self.get('target'),formatNum = self.formatNum, limitRange = self.limitRange;
			$target.on('blur',function(){
				formatNum.call(self, $target);
				limitRange.call(self, +$target.val());
			})
		},

		toFloat: function(value){
            return parseFloat(value, 10);			
		},

        /**
		 * [numValidation 校正输入框格式，屏蔽非法字符]
		 * @param  {[HTMLELement]} $target [文本框节点]
		 */
        formatNum : function($target){
    		var self = this, min = +$target.attr('data-min') || 1,
    		inputValue = self.toFloat($target.val().replace(/[^\d\.]/g, ''));
    		inputValue = isNaN(inputValue) ? min : Math.max(inputValue, min);
    		$target.val(inputValue.toFixed(2));
        },
        /**
         * [limitRange 控制输入数值的大小在最大值与最小值之间]
         * @param  {[Number]} value [输入框的值]
         */
        limitRange : function(value){
        	var self = this, $target = self.get('target'), toFloat = self.toFloat,
        	min = toFloat($target.attr('data-min')) || 1,
			max = toFloat($target.attr('data-max')) || 1,
        	inputValue = min && Math.max(min, value);
			inputValue = max && Math.min(max, inputValue);
			$target.val(inputValue.toFixed(2));
        }
	},{
		ATTRS: /** @lends Number.prototype*/{
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

			/*
			* 触发加减的按钮
			*/
			trigger: {
				value: {
					plus: '.ks-number-plus',
					minus: '.ks-number-minus'
				}
			},
			/**
             * 一组样式名
             * @type {Object}
             * @default cls:{init: 'ks-radio',selected: 'ks-radio-selected',disabled: 'ks-radio-disabled',hover: 'ks-radio-hover'}
             */
            cls: {
                value: {
                    init: 'ks-price-input',
                    plus: 'ks-number-plus',
                    minus: 'ks-number-minus',
                    container: 'ks-plus-minus-operation'
                }
            },
            /**
             * 无障碍，设置aria属性
             * @default false
             */
            accessible: {
                value: false
            }
		}
	});
	return Number;
},{requires:['node','base','./index.css']});
