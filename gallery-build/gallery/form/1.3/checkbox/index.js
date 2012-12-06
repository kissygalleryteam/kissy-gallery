/**
 * @fileoverview 多选框美化
 * @author 伯方<bofang.zxj@taobao.com>
 *
 **/
KISSY.add('gallery/form/1.3/checkbox/index', function(S, Base, Node, Radio) {
    var $ = Node.all;
    /**
     * @name Checkbox
     * @class 多选框美化，主要是继承Radio，添加了两个方法，即全选和取消全选，其他方法参见Radio
     * @constructor
     * @extends Base,Radio
     * @param {String} target 目标
     * @param {Object} config * ,组件配置
     * @param {Object} config.cls *，组件的样式
     * @example
     * var ck = new Checkbox('#J_Content input');
       ck.render();
     */
    function Checkbox(target, config) {
        var self = this;
        config = S.merge({
            target: target
        }, config);
        //调用父类构造函数
        Checkbox.superclass.constructor.call(self, config);
    }
    //继承于Radio
    S.extend(Checkbox, Radio);
    //方法
    S.extend(Checkbox, Base, /** @lends Checkbox.prototype*/ {
        /**
         * 模拟的checkbox全选
         * @return {Object} return self
         */
        selectAll: function() {
            var self = this,
                kfbtns = self.get('kfbtn'),
                targets = self.get('target');
            $(kfbtns).each(function(value, key) {
                if (self._isSelected(value) || self._isDisabled(value)) return;
                value.addClass(self.get('cls').selected);
                $(targets[key]).prop('checked',true);
            })
            return self;
        },
        /**
         * 清空模拟的checkbox
         * @return {Object} return self
         */
        resetAll: function() {
            var self = this,
                kfbtns = self.get('kfbtn'),
                oClass = self.get('cls'),
                selectedClass = oClass.selected,
                hoverClass = self.get('cls').hover,
                targets = self.get('target');
            $(kfbtns).each(function(value, key) {        
                //alert(selectedClass);        
                if (!self._isSelected(value)) return;
                value.removeClass(selectedClass)// +' ' + hoverClass);
                $(targets[key]).prop('checked',false);
            })
            return self;
        },
        /**
         * 重写click事件
         * @param  {Number} targetIndex 一组input的索引
         */
        _clickHandler: function(targetIndex) {
            var self = this,
                targets = self.get('target'),
                kfbtns = self.get('kfbtn'),
                checkedClass = self.get('cls').selected;
            $(targets[targetIndex]).fire('click');
            $(kfbtns[targetIndex]).toggleClass(checkedClass);
        },
        /**
         * 获取所有选中的key
         * @return {[Array]} 以数组的形式返回
         */
        getAllChecked: function() {
            var self = this,
                targets = self.get('target'),
                arr = [];
            for (i = 0, len = targets.length; i < len; i++) {

                if (self._isSelected($(targets[i])) && !self._isDisabled($(targets[i]))) {
                    arr.push(i);
                }
            }
            return arr;
        },
        /**
         * 如果需要有label-for，事件处理：click ,hover
         * @return {[type]} [description]
         */
        _labelHandler: function(key, value) {
            var self = this,
                elLabel, targets = self.get('target'),
                radios = $(self.get('kfbtn')),
                oClass = self.get('cls'),

                selectedClass = oClass.selected,
                disabledClass = oClass.disabled,
                hoverClass = oClass.hover,


                findLabel = self.get('getLabelFunc');
            elLabel = findLabel ? findLabel($(targets[key])) : value.next('label');

            //将label绑定和radio一样的事件
            elLabel.on('click', function() {
                if (self._isDisabled(radios[key])) return;
                //判断label是否包含了radio
                if (elLabel.contains(value)) {
                    value.detach('click');
                }               
                if (self._isSelected(targets[key])) {
                    value.removeClass(selectedClass);
                    $(targets[key]).prop('checked', false);
                } else {
                    value.addClass(selectedClass);
                    $(targets[key]).prop('checked', true);
                }

            }).on('mouseenter', function() {

                if (self._isDisabled(radios[key]) || self._isSelected(radios[key])) return;

                if (elLabel.contains(value)) {
                    value.detach('mouseenter');
                }
                value.addClass(hoverClass);
                //value.fire('mouseenter');
            }).on('mouseleave', function() {
                if (self._isDisabled(radios[key])) return;

                if (elLabel.contains(value)) {
                    value.detach('mouseleave');
                }
                value.removeClass(hoverClass);
                //value.fire('mouseleave');
            })
        },
        /**
         * 绑定事件，包括mouseenter mouseleave click
         */
        _bindEvent: function() {
            var self = this,
                kfbtns = $(self.get('kfbtn')),
                hoverClass = this.get('cls').hover,
                hasLabel = self.get('hasLabel'),
                targets = self.get('target'),
                getLabelFunc = self.get('getLabelFunc'),
                nextLabel;
            kfbtns.each(function(value, key) {
                value.on('mouseenter mouseleave', function(ev) {
                    //如果本身是选中状态或者是禁用状态，则不做处理
                    if (self._isSelected(value) || self._isDisabled(value)) {
                        return;
                    }
                    //value.toggleClass('ks-radio-hover') 在初始化的时候就已经选中的无效
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
                    self._labelHandler(key, value);
                }
            })
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
            kfbtn: {
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
                    selected: 'ks-checkbox-checked',
                    disabled: 'ks-checkbox-disabled',
                    hover: 'ks-checkbox-hover'
                }
            },
            /**
             * css模块路径
             * @default gallery/form/1.1/checkbox/themes/default/style2.css
             */
            cssUrl: {
                value: 'gallery/form/1.3/checkbox/themes/default/style.css'
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
    requires: ['base', 'node', 'gallery/form/1.3/radio/index']
});
