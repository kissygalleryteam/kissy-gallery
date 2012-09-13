/**
 * @fileoverview  radio
 * @author 伯方<bofang.zxj@taobao.com>
 **/
KISSY.add('gallery/form/1.3/radio/index', function(S, Node, Base) {
    var $ = Node.all;
    /**
     * @name Radio
     * @class Radio美化组件,checkbox将会继承radio
     * @constructor
     * @extends Base
     * @param {String} target 目标元素
     * @param {Object} config 配置
     * @example
     * var r = new Radio('#J_Radio input');
       r.render();
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
            self._replaceKfbtn();
            //事件绑定
            self._bindEvent();
//            self.fire(self.get('events').RENDER);
            return self;
        },
        /**
         * 还原Kfbtn为原生的input
         * @return {Object} return self
         */
        recoverKfbtn: function() {
            var self = this,
                elLabel,
                targets = self.get('target'),
                kfbtns = self.get('kfbtn'),
                findLabel = self.get('getLabelFunc');


            $(kfbtns).each(function(value, key) {
                value.hide();
                $(targets[key]).show();
                elLabel = findLabel ? findLabel($(targets[key])) : value.next('label');
                elLabel.detach('hover').detach('click');
            })
            //self.set('radio',[]);// = null;
            return self;
        },
        /**
         * 用span替换替换原生的input，关键步骤
         */
        _replaceKfbtn: function() {
            var self = this,
                target = self.get('target'),
                html = self._getHtml(0),
                disabledHTML = self._getHtml(2),
                selectedHTML = self._getHtml(1),
                kfbtn, kfbtnArr = [],
                accessible = self.get('accessible'),
                getLabelFunc = self.get('getLabelFunc'),
                labelText;
            if (target.length === 0) {
                return false;
            }
            //遍历
            target.each(function(value) {
                value.hide();
                if (self._isDisabled(value)) {
                    kfbtn = $(disabledHTML).insertBefore(value).attr('ks-kfbtn-disabled', 'disabled').removeAttr('tabindex');
                } else {
                    // 如果本身是选中的状态
                    kfbtn = self._isSelected(value) ? $(selectedHTML) : $(html);
                    kfbtn.insertBefore(value);
                }
                // 无障碍
                if (accessible) {
                    try {
                        //优先选择函数提供的查询
                        labelText = getLabelFunc ? getLabelFunc(value).text() : value.next('label').text();
                        kfbtn.attr('aria-label', labelText);
                    } catch (e) {
                        S.log('html结构不符合');
                        return false;
                    }
                }
                kfbtnArr.push(kfbtn);
            })
            self.set('kfbtn', kfbtnArr);
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
         * @return {String} 返回html的字符串
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
        },
        /**
         * 如果需要有label-for，事件处理：click ,hover
         * @return {[type]} [description]
         */
        _labelHandler: function(key, value) {
            var self = this,
                targets = self.get('target'),
                radios = $(self.get('kfbtn')),
                oClass = self.get('cls'),

                selectedClass = oClass.selected,
                disabledClass = oClass.disabled,
                hoverClass = oClass.hover,


                findLabel = self.get('getLabelFunc'),
                elLabel = findLabel ? findLabel($(targets[key])) : value.next('label');

            //将label绑定和radio一样的事件
            elLabel.on('click', function() {
                if (self._isDisabled(radios[key]) || self._isSelected(radios[key])) return;
                //判断label是否包含了radio
                if (elLabel.contains(value)) {
                    value.detach('click');
                }
                radios.each(function(v) {
                    v.removeClass(selectedClass);
                })
                value.addClass(selectedClass);
                $(targets[key]).prop('checked', true);
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
         * 单击事件
         * @param  {Number} targetIndex 数组radio的索引
         */
        _clickHandler: function(targetIndex) {
            var that = this,
                targets = that.get('target'),
                kfbtns = $(that.get('kfbtn'));
            kfbtn = $(that.get('kfbtn')[targetIndex]), getCls = this.get('cls'), selectedClass = getCls.selected, hoverClass = getCls.hover;
            //触发原生dom节点的点击事件
            $(targets[targetIndex]).fire('click');
            kfbtns.each(function(value, key) {
                value.removeClass(selectedClass).removeClass(hoverClass);
            })
            kfbtn.addClass(selectedClass);
        },
        /**
         * 判断是否处于禁用状态
         * @param  {HTMLElement | KISSY Node | String}  原生的dom节点，Nodelist，或者是选择器字符串
         * @return {Boolean}
         */
        _isDisabled: function(target) {
            var protoDisabled = $(target).attr('disabled'),
                modifyDisabled = $(target).attr('ks-kfbtn-disabled');
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
                kfbtns = self.get('kfbtn'),
                kfbtn, targets = self.get('target'),
                target, getClass = this.get('cls'),
                selectedClass = getClass.selected,
                disabledClass = getClass.disabled,
                hoverClass = getClass.hover;
            //如果传递的是数字索引
            if (typeof targetElement === 'number') {
                kfbtn = $(kfbtns[targetElement]);
                target = $(targets[targetElement]);
                kfbtn.attr('ks-kfbtn-disabled', 'disabled').removeClass(selectedClass + ' ' + hoverClass).addClass(disabledClass);
                target.attr('disabled', 'disabled');
                kfbtn.removeAttr('tabindex');
            }
            return self;
        },
        /**
         * 根据索引恢复单个radio
         * @param {Number} targetElement 数组radio的索引
         */
        setAvailabe: function(targetElement) {
            var self = this,
                kfbtns = self.get('kfbtn'),
                kfbtn, targets = self.get('target'),
                target, disabledClass = this.get('cls').disabled;
            //如果传递的是数字索引
            if (S.isNumber(targetElement)) {
                kfbtn = $(kfbtns[targetElement]);
                target = $(targets[targetElement]);
                kfbtn.removeAttr('ks-kfbtn-disabled', 'disabled').removeClass(disabledClass);
                target.removeAttr('disabled', 'disabled');
                kfbtn.attr('tabindex', '0');
            }
            return self;
        },
        /**
         * 获取选中的Kfbtn索引
         * @return {Array | Number} 选中的Kfbtn
         */
        getSelected: function(isCheckbox) {
            var self = this,
                target = self.get('target'),
                value, checkArr = [];
            for (i = 0, len = target.length; i < len; i++) {
                value = $(target[i]);
                if (self._isDisabled(value)) continue;
                if (self._isSelected(value)) {
                    if (!isCheckbox) {
                        return i;
                    }
                    checkArr.push(i);
                }
            }
            return isCheckbox ? checkArr : null;
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
            kfbtn: {
                value: []
            },
            /**
             * 一组样式名
             * @type {Object}
             * @default {init: 'ks-radio',selected: 'ks-radio-selected',disabled: 'ks-radio-disabled',hover: 'ks-radio-hover'}
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
             * @default gallery/form/1.1/radio/themes/default/style2.css
             */
            cssUrl: {
                value: 'gallery/form/1.3/radio/themes/default/style.css'
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
