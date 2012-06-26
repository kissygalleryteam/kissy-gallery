/**
 * @fileoverview  radio
 * @author 伯方<bofang.zxj@taobao.com>
 **/
KISSY.add('gallery/form/1.2/radio/index', function(S, Node, Base) {
    var  $ = Node.all;
    /**
     * @name Radio
     * @class Radio美化组件
     * @constructor
     * @extends Base
     * @param {String} target 目标元素
     * @param {Object} config 配置
     * @example
     * var r = new Radio('#J_Radio input');
     * r.render();
     */
    function Radio(target, config) {
        var self = this;
        config = S.merge({
            target: target
        }, config);
        //调用父类构造函数
        Radio.superclass.constructor.call(self, config);
    }
    //方法
    S.extend(Radio, Base, /** @lends Radio.prototype*/ {
        /**
         * 开始执行
         */
        render: function() {
            var self = this;
            //加载css
            self._loadCss();
            //开始替换
            self._replaceRadio();
            //事件绑定
            self._bindEvent();
        },
        /**
         * 还原radio为原生的radio
         * @return {Object} return self
         */
        recoverRadio: function() {
            var self = this,
                targets = self.get('target'),
                radio = self.get('radio');
            $(radio).each(function(value, key) {
                value.hide();
                $(targets[key]).show();
            })
            //self.set('radio',[]);// = null;
            return self;
        },
        /**
         * 用span替换radio，关键步骤
         */
        _replaceRadio: function() {
            var self = this,
                target = self.get('target'),
                html = self._getHtml(0),
                disabledHTML = self._getHtml(2),
                selectedHTML = self._getHtml(1),
                radio, radioArr = [],
                accessible = self.get('accessible'),
                getLabelFunc = self.get('getLabelFunc'),
                labelText;
            if (target.length === 0) {
                return false;
            }
            //遍历
            target.each(function(value, key) {
                value.hide();
                if (self._isDisabled(value)) {
                    radio = $(disabledHTML).insertBefore(value).attr('ks-radio-disabled', 'disabled').removeAttr('tabindex');
                } else {
                    // 如果本身是选中的状态
                    radio = self._isSelected(value) ? $(selectedHTML) : $(html);
                    radio.insertBefore(value);
                }
                // 无障碍
                if (accessible) {
                    try {
                        //优先选择函数提供的查询
                        labelText = getLabelFunc ? getLabelFunc(value).html() : value.next('label').html();
                        radio.attr('aria-label', labelText);
                    } catch (e) {
                        S.log('html结构不符合');
                    }

                }
                radioArr.push(radio);
            })
            self.set('radio', radioArr);
        },
        /**
         * 加载css
         */
        _loadCss: function() {
            var self = this,
                cssUrl = self.get('cssUrl');
            //加载css文件
            if (cssUrl !== '') {
                S.use(cssUrl, function(S) {});
            }
        },
        /**
         * 根据样式返回html字符串
         * @param  {Number} key 0→DEFAULT;1→selected;2→DISABLED
         * @return {String} 返回html
         */
        _getHtml: function(key) {
            var self = this,
                getClass = self.get('cls'),
                defaultClass = getClass.init,
                selectedClass = getClass.selected,
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
                obj.secondName = selectedClass;
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
                radio = $(self.get('radio')),
                hoverClass = this.get('cls').hover,
                hasLabel = self.get('hasLabel'),
                targets = self.get('target'),
                getLabelFunc = self.get('getLabelFunc'),
                nextLabel;
            radio.each(function(value, key) {
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
                    try {
                        nextLabel = getLabelFunc ? getLabelFunc($(targets[key])) : value.next('label');
                        //将label绑定和radio一样的事件
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
         * @param  {Number} targetIndex 数组radio的索引
         */
        _clickHandler: function(targetIndex) {
            var that = this,
                targets = that.get('target'),
                radios = $(that.get('radio'));
            radio = $(that.get('radio')[targetIndex]), getCls = this.get('cls'), selectedClass = getCls.selected, hoverClass = getCls.hover;
            //触发原生dom节点的点击事件
            $(targets[targetIndex]).fire('click');
            radios.each(function(value, key) {
                value.removeClass(selectedClass).removeClass(hoverClass);
            })
            radio.addClass(selectedClass);
        },
        /**
         * 判断是否处于禁用状态
         * @param  {HTMLElement | KISSY Node | String}  原生的dom节点，Nodelist，或者是选择器字符串
         * @return {Boolean}
         */
        _isDisabled: function(target) {
            var protoDisabled = $(target).attr('disabled'),
                modifyDisabled = $(target).attr('ks-radio-disabled');
            return protoDisabled === 'disabled' || modifyDisabled === 'disabled';
        },
        /**
         * 判断是否处于禁用状态
         * @param  {HTMLElement | KISSY Node | String}  原生的dom节点，Nodelist，或者是选择器字符串
         * @return {Boolean}
         */
        _isSelected: function(target) {
            var protoselected = $(target).prop('checked'),
                hasselectedClass = $(target).hasClass(this.get('cls').selected);
            return protoselected || hasselectedClass;
        },
        /**
         * 根据索引禁用单个radio
         * @param {Number} targetElement 数组radio的索引
         */
        setDisabled: function(targetElement) {
            var self = this,
                radio = self.get('radio'),
                targets = self.get('target'),
                target, getClass = this.get('cls'),
                selectedClass = getClass.selected,
                disabledClass = getClass.disabled,
                hoverClass = getClass.hover;
            //如果传递的是数字索引
            if (typeof targetElement === 'number') {
                radio = $(radio[targetElement]);
                target = $(targets[targetElement]);
                radio.attr('ks-radio-disabled', 'disabled').removeClass(selectedClass + ' ' + hoverClass).addClass(disabledClass);
                target.attr('disabled', 'disabled');
            }
            radio.removeAttr('tabindex');
            return self;
        },
        /**
         * 根据索引恢复单个radio
         * @param {Number} targetElement 数组radio的索引
         */
        setAvailabe: function(targetElement) {
            var self = this,
                radio = self.get('radio'),
                targets = self.get('target'),
                target, disabledClass = this.get('cls').disabled;
            //如果传递的是数字索引
            if (S.isNumber(targetElement)) {
                radio = $(radio[targetElement]);
                target = $(targets[targetElement]);
                radio.removeAttr('ks-radio-disabled', 'disabled').removeClass(disabledClass);
                target.removeAttr('disabled', 'disabled');
            }
            radio.attr('tabindex', '0');
            return self;
        },
        /**
         * 获取所有选中的radio索引
         * @return {Array} 选中的radio索引数组集合
         */
        getSelected: function() {
            var self = this,
                target = self.get('target'),
                value;
            for (i = 0, len = target.length; i < len; i++) {
                value = $(target[i]);
                if (self._isDisabled(value)) {
                    continue;
                }
                if (self._isSelected(value)) {
                    return i;
                }
            }
            return null;
        }
    }, {
        ATTRS: /** @lends radio.prototype*/
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
             * 美化后的radio数组
             * @type {Array}
             * @default []
             */
            radio: {
                value: []
            },
            /**
             * 一组样式名
             * @type {Object}
             * @default cls:{init: 'ks-radio',selected: 'ks-radio-selected',disabled: 'ks-radio-disabled',hover: 'ks-radio-hover'}
             */
            cls: {
                value: {
                    init: 'ks-radio',
                    selected: 'ks-radio-selected',
                    disabled: 'ks-radio-disabled',
                    hover: 'ks-radio-hover'
                }
            },
            /**
             * css模块路径
             * @default gallery/form/1.2/radio/themes/default/style2.css
             */
            cssUrl: {
                value: 'gallery/form/1.2/radio/themes/default/style.css'
            },
            /**
             * 是否需要label for的对应
             * @default false
             */
            hasLabel: {
                value: false
            },
            /**
             * 通过radio查找对应label的函数
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
    return Radio;
}, {
    requires: ['node', 'base']
});
