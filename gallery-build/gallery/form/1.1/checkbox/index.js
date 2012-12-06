/**
 * @fileoverview 多选框美化
 * @author 伯方<bofang.zxj@taobao.com>
 *
 **/
KISSY.add('gallery/form/1.1/checkbox/index', function(S, Base, Node, Radio) {
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
    S.extend(Checkbox,Base, /** @lends Checkbox.prototype*/ {
        /**
         * 模拟的checkbox全选
         * @return {Object} return self
         */
        selectAll: function() {
            var self = this,
                kfbtns = self.get('kfbtn');
            $(kfbtns).each(function(value, key) {
                if (self._isSelected(value)) return;
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
                kfbtns = self.get('kfbtn'),
                hoverClass = self.get('cls').hover;
            $(kfbtns).each(function(value, key) {
                if (!self._isSelected(value)) return;
                value.fire('click').removeClass(hoverClass);
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
        }
    }, {
        ATTRS: /** @lends Checkbox.prototype*/{
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
    requires: ['base', 'node', 'gallery/form/1.1/radio/index']
});
