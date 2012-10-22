/**
 * @fileoverview 美化的选择框
 * @author: 剑平（明河）<minghe36@126.com>
 *
 **/
KISSY.add('gallery/form/1.3/select/index', function (S, DOM, Event, Base, Anim, Button, List) {
    var EMPTY = '', $ = KISSY.all, LOG_PREFIX = '[nice-select]:';

    /**
     * @name Select
     * @class 美化的选择框
     * @constructor
     * @param {String} target 目标
     * @param {Object} config 配置对象
     * @property {HTMLElement} target 目标选择框元素
     * @property {HTMLElement} selectContainer 模拟选择框容器
     * @property {Array} data 从选择框提取的数据集合
     * @property {Object} curSelData 当前选择框的数据
     * @property {Object} button 选择框按钮实例
     * @property {Object} list 数据列表实例
     */
    function Select(target, config) {
        var self = this;
        self.target = S.get(target);
        self.selectContainer = EMPTY;
        self.data = [];
        self.curSelData = {};
        self.button = EMPTY;
        self.list = EMPTY;
        //超类初始化
        Select.superclass.constructor.call(self, config);
    }

    //继承于KISSY.Base
    S.extend(Select, Base);
    //静态属性和方法
    S.mix(Select, /**@lends Select*/{
        /**
         * 模板
         */
        tpl:{
            DEFAULT:'<div class="ks-select" tabindex="0" aria-label="点击tab进入选项选择，点击esc退出选择">' +

                '</div>'
        },
        /**
         * 组件支持的事件
         */
        event:{
            //显示下拉列表后
            SHOW_LIST:'showList',
            //隐藏下拉列表后
            HIDE_LIST:'hideList'
        },
        INDEX : 1000
    });
    //组件参数
    Select.ATTRS = {
        /**
         * 是否自动运行
         * @type Boolean
         */
        autoRender:{
            value:false,
            setter:function (v) {
                v && this.render();
                return v;
            }
        },
        /**
         * 模拟选择框容器模板
         * @type String
         */
        tpl:{
            value:Select.tpl.DEFAULT
        },
        /**
         * 设置模拟选择框的宽度
         */
        width:{
            value:'auto',
            setter:function (v) {
                S.isNumber(v) && this._setWidth(v);
                return v;
            }
        },
        /**
         * 是否开启下拉列表动画（显示/隐藏）
         */
        isAnim:{
            value:true
        },
        /**
         * 动画时长，只有参数isAmin为true时才有效
         */
        duration:{
            value:0.2
        },
        /**
         * 下拉列表数据源，如果为一空数组，那么从目标选择框提取数据
         */
        data:{
            value:[]
        }
    };
    //组件方法
    S.augment(Select,
        /**@lends Select.prototype */
        {
            /**
             * 运行
             */
            render:function () {
                var self = this, target = self.target, width, button;
                if (!target) {
                    S.log(LOG_PREFIX + '目标元素不存在！');
                    return false;
                }
                DOM.hide(target);
                self._getData();
                self._createWrapper();
                self._initButton();
                width = self.get('width');
                self._setWidth(width);
                button = self.button;
                //监听按钮的单击事件
                button.on(Button.event.CLICK, self._btnClickHanlder, self);
            },
            /**
             * 显示下列列表
             * return {Select} Select的实例
             */
            showList:function () {
                var self = this, button = self.button;
                //如果下拉列表不存在，实例化List
                if (self.list == EMPTY) {
                    self._initList();
                    self._setWidth(self.get('width'));
                }
                //显示下拉列表
                self.animRun(true);
                //设置按钮的点击样式
                button.setClickCls();
                self._setZindex();
                return self;
            },
            /**
             * 隐藏下拉列表
             * return {Select} Select的实例
             */
            hideList:function () {
                var self = this, button = self.button;
                self.animRun(false);
                //设置按钮的点击样式
                button.setClickCls();
                self._resetZindex();
                return self;
            },
            /**
             * 改变选择框的值
             */
            change:function (index) {
                var self = this, button = self.button, data = self.get('data'),
                    //指定索引值的数据
                    itemData = data[index], text, value,
                    $target = $(self.target);
                if (S.isEmptyObject(itemData)) return false;
                text = itemData.text;
                value = itemData.value;
                //改变按钮的文案
                button.set('text', text);
                //TODO:IE6存在bug，无法选中，所以加个延迟
                S.later(function(){
                    $target.val(value);
                    self.curSelData = itemData;
                    //触发change事件
                    self.isSelect() && Event.fire(self.target, 'change');
                    self.hideList();
                },10);
            },
            /**
             * 目标元素是不是选择框，如果不是则当模拟选择框的容器
             * @return {Boolean}
             */
            isSelect:function () {
                var self = this, target = self.target, b = false;
                if (target.nodeName == 'SELECT') b = true;
                return b;
            },
            /**
             * 创建模拟选择框容器
             * @return {HTMLElement} 选择框容器
             */
            _createWrapper:function () {
                var self = this, target = self.target, tpl = self.get('tpl'), selectContainer;
                if (!S.isString(tpl)) {
                    S.log(LOG_PREFIX + '容器模板不合法！', 'error');
                    return false;
                }
                selectContainer = DOM.create(tpl);
                //如果是选择框，那么将模拟选择框插在选择框后面，否则插入到目标元素内部
                DOM.insertAfter(selectContainer, target);
                return self.selectContainer = selectContainer;
            },
            /**
             * 生成选择框按钮
             * @return {Button} Button的实例
             */
            _initButton:function () {
                var self = this, container = self.selectContainer, button = EMPTY,
                    curSelData = self.curSelData;
                if (!S.isFunction(Button) | S.isEmptyObject(curSelData)) return false;
                //实例化按钮
                button = new Button(container, {text:curSelData.text});
                button.render();
                return self.button = button;
            },
            /**
             * 生成数据列表
             * @return {List} List的实例
             */
            _initList:function () {
                var self = this, selectContainer = self.selectContainer, list,
                    data = self.get('data');
                if (!S.isFunction(List) || !data.length) return false;
                //实例化List，data（列表数据）参数必不可少
                list = new List(selectContainer, {data:data});
                list.render();
                list.on(List.event.CLICK, self._listItemClickHanlder, self);
                return self.list = list;
            },
            /**
             * 如果目标元素是选择框，那么将其的选项转换成一个数组数据，如果不是返回配置中data数据源
             * @return {Array} 用于模拟选择框的数据
             */
            _getData:function () {
                var self = this, target = self.target, data = self.get('data'), options = DOM.children(target), dataItem = {};
                //如果存在数据源，直接取数据源
                if (S.isArray(data) && data.length > 0) {
                    //设置当前选中数据
                    self.curSelData = data[0];
                    return data;
                }
                //如果目标元素不是选择框或者选择框无数据直接返回数据源
                if (!self.isSelect() || options.length == 0) return data;
                //遍历选择框的option标签
                S.each(options, function (option) {
                    dataItem = {text:DOM.text(option), value:DOM.val(option)};
                    data.push(dataItem);
                    if (DOM.prop(option, 'selected')) self.curSelData = dataItem;
                });
                self.set('data', data);
                return data;
            },
            /**
             * 设置模拟选择框的宽度
             * @param {Number | String} width 宽度，值为‘auto’时自动获取原生选择框的宽度
             * @return {Number} 宽度
             */
            _setWidth:function (width) {
                var self = this, target = self.target, container = self.selectContainer,
                    button = self.button, list = self.list;
                //自动设置宽度
                if (width == 'auto') width = DOM.width(target);
                //设置模拟选择框容器的宽度
                DOM.width(container, width);
                //设置选择框按钮部分的宽度
                if (button != EMPTY) {
                    button.set('style', {width:width});
                }
                //设置下拉列表的宽度
                if (list != EMPTY) {
                    list.set('style', {width:width});
                }
                return width;
            },
            /**
             * 按钮点击后触发的事件监听器
             * @param {Object} ev 事件对象
             */
            _btnClickHanlder:function (ev) {
                var self = this, list = self.list, elList = list.list;
                //不存在list实例，说明是第一次点击下拉按钮，显示下拉列表
                if (list == EMPTY) {
                    self.showList();
                    return false;
                }
                //如果列表显示则隐藏之，否则显示之
                self[DOM.css(elList, 'display') == 'none' && 'showList' || 'hideList']();
            },
            /**
             * 点击列表的选项时触发的事件监听器
             * @param {Object} ev 事件对象
             */
            _listItemClickHanlder:function (ev) {
                var self = this, target = self.target;
                //改变选择框的值
                self.change(ev.index);
                //触发原生选择框的click事件
                self.isSelect() && Event.fire(target, 'click');
            },
            /**
             * 动画显示/隐藏下拉列表
             * @param {Boolean} isShow 是否显示下拉列表
             */
            animRun:function (isShow) {
                var self = this, isAnim = self.get('isAnim'), duration = self.get('duration'),
                    elList = $(self.list.list);
                if (!elList.length) return false;
                //用户开启了动画
                if (isAnim && S.isNumber(duration)) {
                    elList[isShow && 'slideDown' || 'slideUp'](duration, function () {
                        _fireEvent();
                    });
                } else {
                    elList[isShow && 'show' || 'hide']();
                    _fireEvent();
                }
                /**
                 * 触发显示/隐藏下拉框事件
                 */
                function _fireEvent() {
                    self.fire(Select.event[isShow && 'SHOW_LIST' || 'HIDE_LIST'], {elList:elList});
                }
            },
            /**
             * 重置选择框的z-index
             */
            _resetZindex : function(){
                var self = this,wrapper = self.selectContainer,list = self.list;
                $(wrapper).css('zIndex',Select.INDEX);
                $(list.list).css('zIndex',Select.INDEX + 1);
            },
            /**
             * 设置选择框的z-index
             */
            _setZindex: function(){
                var self = this,wrapper = self.selectContainer,list = self.list;
                $(wrapper).css('zIndex',Select.INDEX +1);
                $(list.list).css('zIndex',Select.INDEX + 2);
            }
        });
    return Select;
}, {requires:['dom', 'event', 'base', 'anim', './button', '../list/index']});