/**
 * 淘宝旅行通用日历组件
 * Author: Angtian
 * E-mail: Angtian.fgm@taobao.com
 */

KISSY.add('gallery/calendar/1.0/index', function (S, Node, Base) {

    /**
     * 淘宝旅行通用日历组件是一个UI控件。可让用户选择所需时间
     * 可用做输入框选择日期，也可以直接显示在指定位置
     * 可配置显示节假日信息
     * 可自动匹配节假日前1~3天，后1~3天日期信息
     *
     * @module trip-calendar
     */

    var $ = Node.all,
        each = S.each,
        toHTML = S.substitute,

        IE = S.UA.ie,
        REG = /\d+/g,
        RDATE = /^((19|2[01])\d{2})-(0?[1-9]|1[012])-(0?[1-9]|[12]\d|3[01])$/,

        BODY = $(document.body),
        WIN = $(window),
        DOC = $(document);

    /**
     * 创建日历构造函数
     *
     * @class   Calendar
     * @extends {Base}
     * @param   {Object} config 配置对象 (详情见API)
     * @constructor
     */
    function Calendar() {
        Calendar.superclass.constructor.apply(this, arguments);
        this.initializer();
    }

    return S.TripCalendar = S.extend(Calendar, Base, {

            /**
             * 日历初始化
             *
             * @method initializer
             */
            initializer: function () {
                this._setUniqueTag().renderUI();
                this._minDateCache = this.get('minDate');
                this._clickoutside = function (e) {
                    var target = S.one(e.target);
                    target.hasClass(this._triggerNodeClassName) || target.hasClass(this._triggerNodeIcon) || target.parent('#' + this._calendarId) || this.hide();
                };
                this.get('container') || this.hide();
            },

            /**
             * 渲染日历结构
             *
             * @method renderUI
             */
            renderUI: function () {
                var container = S.one(this.get('container'));

                (container || BODY).append(this._initCalendarHTML(this.get('date')));

                this.boundingBox = S.one('#' + this._calendarId).css('position', container ? 'relative' : 'absolute');
                this._dateBox = this.boundingBox.one('.date-box');
                this._contentBox = this.boundingBox.one('.content-box');
                this._messageBox = this.boundingBox.one('.message-box');

                container || (this._inputWrap()._setDefaultValue(), this.boundingBox.css('top', '-9999px'));

                this.set('boundingBox', this.boundingBox);

                this.bindUI()._fixSelectMask()._setWidth()._setBtnStates()._setDateStyle();
            },

            /**
             * 事件绑定
             *
             * @method bindUI
             */
            bindUI: function () {
                this.on('afterMessageChange', this._setMessage);

                this.boundingBox.delegate('click', '.' + this._delegateClickClassName, this._DELEGATE.click, this);
                this.boundingBox.delegate('change', '.' + this._delegateChangeClassName, this._DELEGATE.change, this);

                if (this.get('container')) return this;

                this.boundingBox.delegate('mouseenter mouseleave', 'a', this._DELEGATE.mouse, this);

                DOC.delegate('focusin', '.' + this._triggerNodeClassName, this._DELEGATE.focusin, this);
                DOC.delegate('keyup', '.' + this._triggerNodeClassName, this._DELEGATE.keyup, this);
                DOC.delegate('keydown', '.' + this._triggerNodeClassName, this._DELEGATE.keydown, this);
                DOC.delegate('click', '.' + this._triggerNodeIcon, this._DELEGATE.iconClick, this);
                DOC.delegate('click', '.' + this._triggerNodeClassName, this._DELEGATE.triggerNodeClick, this);

                WIN.on('resize', this._setPos, this);

                return this;
            },

            /**
             * 同步UI，主要用于动态创建触发元素后使用
             *
             * @method syncUI
             */
            syncUI: function () {
                !this.get('container') && this.get('triggerNode') && this._inputWrap();
            },

            /**
             * 渲染方法
             *
             * @method render
             */
            render: function () {
                this._dateBox.html(this._dateHTML());
                this._setWidth()._setDateStyle()._setBtnStates();
                this.fire('render');
                return this;
            },

            /**
             * 渲染下月日历
             *
             * @method nextMonth
             */
            nextMonth: function () {
                this.set('date', Calendar.DATE.siblingsMonth(this.get('date'), 1));
                this.render();
                this.fire('nextmonth');
                return this;
            },

            /**
             * 渲染上月日历
             *
             * @method prevMonth
             */
            prevMonth: function () {
                this.set('date', Calendar.DATE.siblingsMonth(this.get('date'), -1));
                this.render();
                this.fire('prevmonth');
                return this;
            },

            /**
             * 显示日历
             *
             * @method show
             */
            show: function () {
                DOC.on('click', this._clickoutside, this);

                this.boundingBox.show();
                this._setDefaultDate().render();
                this.fire('show', {'node': this.currentNode});
                return this;
            },

            /**
             * 隐藏日历
             *
             * @method hide
             */
            hide: function () {
                DOC.detach('click', this._clickoutside, this);

                this.boundingBox.hide();
                this.hideMessage();
                this.currentNode && (this.currentNode.getDOMNode()._selected = null);
                this._cacheNode = null;
                this.fire('hide', {'node': this.currentNode});
                return this;
            },

            /**
             * 显示提示信息
             *
             * @method showMessage
             */
            showMessage: function () {
                (function (that) {
                    that.fire('showmessage');
                    setTimeout(function () {
                        that._messageBox.addClass('visible');
                    }, 5);
                })(this);
                return this;
            },

            /**
             * 隐藏提示信息
             *
             * @method hideMessage
             */
            hideMessage: function () {
                this._messageBox.removeClass('visible');
                this.fire('hidemessage');
                return this;
            },

            /**
             * 获取选择的日期
             *
             * @method getSelectedDate
             * @return {String} 日期字符串
             */
            getSelectedDate: function () {
                return this.get('selectedDate');
            },

            /**
             * 获取当前触发元素节点
             *
             * @method getCurrentNode
             * @return {Node} 节点对象
             */
            getCurrentNode: function () {
                return this.currentNode;
            },

            /**
             * 获取指定日期相关信息
             *
             * @method getDateInfo
             * @param  {String} v 日期字符串
             * @return {String} 日期信息
             */
            getDateInfo: function (v) {
                var iDiff = -1,
                    sNowDate = Calendar.DATE.stringify(new Date),
                    sDateName = ['今天', '明天', '后天'];
                switch (true) {
                    case v == sNowDate:
                        iDiff = 0;
                        break;
                    case v == Calendar.DATE.siblings(sNowDate, 1):
                        iDiff = 1;
                        break;
                    case v == Calendar.DATE.siblings(sNowDate, 2):
                        iDiff = 2;
                        break;
                }
                !this._dateMap && this.get('isHoliday') && (this._dateMap = this._createDateMap());
                return this._dateMap && this._dateMap[v] || sDateName[iDiff] || Calendar.DATE.week(v);
            },

            /**
             * 获取指定的日期状态
             *
             * @method _getDateStatus
             * @param {String} v 日期字符串
             * @private
             * @return {Boolean}
             */
            _getDateStatus: function (v) {
                return (this.get('minDate') && Calendar.DATE.parse(v) < Calendar.DATE.parse(this.get('minDate'))) ||
                    (this.get('maxDate') && Calendar.DATE.parse(v) > Calendar.DATE.parse(this.get('maxDate')));
            },

            /**
             * 获取指定日期className
             *
             * @method _getHolidaysClass
             * @param {String} v 日期字符串
             * @param {Boolean} b 日期是否可用
             * @private
             * @return {String} 样式名
             */
            _getHolidaysClass: function (v, b) {
                var oHolidays = Calendar.HOLIDAYS;
                switch (true) {
                    case b:
                    case !this.get('isHoliday'):
                        return '';
                    case v == Calendar.DATE.stringify(new Date):
                        return 'today';
                    case true:
                        for (var property in oHolidays) {
                            if (S.inArray(v, oHolidays[property])) return property;
                        }
                    default:
                        return '';
                }
            },

            /**
             * 获取nodeList中匹配自定义属性的node
             *
             * @method _getAttrNode
             * @param {Object} nodeList
             * @param {String} attr 自定义属性
             * @param {String} value 自定义属性值
             * @return node
             */
            _getAttrNode: function (nodeList, attr, value) {
                var node = null;
                each(nodeList, function (o) {
                    if (S.one(o).attr(attr) === value) {
                        return node = S.one(o);
                    }
                });
                return node;
            },

            /**
             * 设置日历容器宽度
             *
             * @method _setWidth
             * @private
             */
            _setWidth: function () {
                (function (that, boundingBox, contentBox) {
                    boundingBox.all('.inner, h4').css('width', boundingBox.one('table').outerWidth());
                    boundingBox.css('width',
                        boundingBox.one('.inner').outerWidth() * that.get('count') +
                            parseInt(contentBox.css('borderLeftWidth')) +
                            parseInt(contentBox.css('borderRightWidth')) +
                            parseInt(contentBox.css('paddingLeft')) +
                            parseInt(contentBox.css('paddingRight')));
                    if (IE !== 6) return this;
                    boundingBox.one('iframe').css({
                        width: boundingBox.outerWidth(),
                        height: boundingBox.outerHeight()
                    });
                })(this, this.boundingBox, this._contentBox);
                return this;
            },

            /**
             * 触发元素赋值
             *
             * @method _setValue
             */
            _setValue: function (v) {
                this.set('selectedDate', v);
                if (this.get('container')) return this;
                this._isInput(this.currentNode) && this.currentNode.val(v);
                switch (true) {
                    case this.boundingBox.hasClass('calendar-bounding-box-style'):
                        this.set('endDate', v);
                        break;
                    case !this.boundingBox.hasClass('calendar-bounding-box-style') && !!this.get('finalTriggerNode'):
                        this.set('startDate', v);
                        var finalTriggerNode = S.one(this.get('finalTriggerNode'));
                        if (finalTriggerNode && this.get('isAutoSwitch')) {
                            finalTriggerNode.getDOMNode().select();
                        }
                        break;
                    default:
                        this.set('selectedDate', v);
                        break;
                }
                return this;
            },

            /**
             * 设置日期信息
             *
             * @method _setDateInfo
             * @param {String} v 日期字符串
             */
            _setDateInfo: function (v) {
                if (this.get('container') || !this.get('isDateInfo') || !this._isInput(this.currentNode)) return this;
                this.currentNode.prev().html(RDATE.test(v) ? this.getDateInfo(v) : '');
                return this;
            },

            /**
             * 设置触发元素默认值对应的日期信息
             *
             * @method _setDefaultValue
             */
            _setDefaultValue: function () {
                var triggerNode = $(this.get('triggerNode')).item(0),
                    finalTriggerNode = $(this.get('finalTriggerNode')).item(0),
                    startValue = triggerNode && triggerNode.val(),
                    endValue = finalTriggerNode && finalTriggerNode.val();
                if (startValue && RDATE.test(startValue)) {
                    this.get('isDateInfo') && triggerNode.prev().html(this.getDateInfo(startValue));
                    this.set('startDate', startValue);
                }
                if (endValue && RDATE.test(endValue)) {
                    this.get('isDateInfo') && finalTriggerNode.prev().html(this.getDateInfo(endValue));
                    this.set('endDate', endValue);
                }
                return this;
            },

            /**
             * 设置触发元素默认值对应的日期
             *
             * @method _setDefaultDate
             */
            _setDefaultDate: function () {
                if (this.get('container')) return this;

                if (this.get('startDate')) {
                    this.set('minDate', this.boundingBox.hasClass('calendar-bounding-box-style') ? this.get('startDate') : this._minDateCache);
                    this.render();
                }

                if (this.boundingBox.hasClass('calendar-bounding-box-style') && Calendar.DATE.parse(this.get('startDate')) > Calendar.DATE.parse(this.get('endDate'))) {
                    this.set('date', this.get('startDate') || this.get('date'));
                    return this;
                }

                this.set('date', this.currentNode.val() || this.get('date'));

                return this;
            },

            /**
             * 设置时间样式
             *
             * @method _setDateStyle
             */
            _setDateStyle: function () {
                var boundingBox = this.boundingBox,
                    startDate = this.get('startDate'),
                    endDate = this.get('endDate'),
                    selectedDate = this.get('selectedDate'),
                    iDiff = Calendar.DATE.differ(startDate, endDate),
                    aTd = boundingBox.all('td'),
                    oTd = null,
                    oStartDate = startDate && this._getAttrNode(aTd, 'data-date', startDate),
                    oEndDate = endDate && this._getAttrNode(aTd, 'data-date', endDate),
                    oSelectedDate = selectedDate && this._getAttrNode(aTd, 'data-date', selectedDate);

                aTd.removeClass('start-date').removeClass('end-date').removeClass('selected-range').removeClass('selected-date');

                oStartDate && oStartDate.addClass('start-date');

                oEndDate && oEndDate.addClass('end-date');

                oSelectedDate && oSelectedDate.addClass('selected-date');

                if (!startDate || !endDate || Calendar.DATE.parse(startDate) > Calendar.DATE.parse(endDate)) return this;

                for (var i = 0; i < iDiff - 1; i++) {
                    startDate = Calendar.DATE.siblings(startDate, 1);
                    oTd = this._getAttrNode(aTd, 'data-date', startDate);
                    oTd && oTd.addClass('selected-range');
                }

                return this;
            },

            /**
             * 设置上月/下月/关闭按钮状态
             *
             * @method _setBtnStates
             * @private
             */
            _setBtnStates: function () {
                var curDate = +Calendar.DATE.siblingsMonth(this.get('date'), 0),
                    maxDate = this.get('maxDate'),
                    minDate = this.get('minDate'),
                    prevBtn = this.boundingBox.one('.prev-btn'),
                    nextBtn = this.boundingBox.one('.next-btn'),
                    closeBtn = this.boundingBox.one('.close-btn');
                if (minDate) {
                    minDate = +Calendar.DATE.parse(minDate);
                }
                if (maxDate) {
                    maxDate = +Calendar.DATE.siblingsMonth(Calendar.DATE.parse(maxDate), 1 - this.get('count'));
                }
                curDate <= (minDate || Number.MIN_VALUE) ? prevBtn.addClass('prev-btn-disabled') : prevBtn.removeClass('prev-btn-disabled');
                curDate >= (maxDate || Number.MAX_VALUE) ? nextBtn.addClass('next-btn-disabled') : nextBtn.removeClass('next-btn-disabled');
                this.get('container') && closeBtn.hide();
                return this;
            },

            /**
             * 设置日历提示信息
             *
             * @method _setMessage
             * @private
             */
            _setMessage: function () {
                this._messageBox.html(this.get('message'));
                return this;
            },

            /**
             * 设置唯一标记
             *
             * @method _setUniqueTag
             * @private
             */
            _setUniqueTag: function () {
                (function (that, guid) {
                    that._calendarId = 'calendar-' + guid;
                    that._delegateClickClassName = 'delegate-click-' + guid;
                    that._delegateChangeClassName = 'delegate-change-' + guid;
                    that._triggerNodeIcon = 'trigger-icon-' + guid;
                    that._triggerNodeClassName = 'trigger-node-' + guid;
                })(this, S.guid());
                return this;
            },

            /**
             * 设置日历显示位置
             *
             * @method _setPos
             * @private
             */
            _setPos: function () {
                (function (that, currentNode) {
                    if (!currentNode) return;
                    setTimeout(function () {
                        var iLeft = currentNode.offset().left,
                            iTop = currentNode.offset().top + currentNode.outerHeight(),
                            iBoundingBoxWidth = that.boundingBox.outerWidth(),
                            iBoundingBoxHeight = that.boundingBox.outerHeight(),
                            iCurrentNodeWidth = currentNode.outerWidth(),
                            iCurrentNodeHeight = currentNode.outerHeight(),
                            iMaxLeft = DOC.width() - iBoundingBoxWidth,
                            iMaxTop = DOC.height() - iBoundingBoxHeight;
                        (function (t, l) {
                            if (iTop > iMaxTop) iTop = t < 0 ? iTop : t;
                            if (iLeft > iMaxLeft) iLeft = l < 0 ? iLeft : l;
                        })(iTop - iBoundingBoxHeight - iCurrentNodeHeight, iLeft + iCurrentNodeWidth - iBoundingBoxWidth);
                        that.boundingBox.css({
                            top: iTop,
                            left: iLeft
                        });
                    }, 10);
                })(this, this.currentNode);
                return this;
            },

            /**
             * 创建触发元素外容器
             *
             * @method _inputWrap
             * @private
             */
            _inputWrap: function () {
                (function (that, triggerNodeList, finalTriggerNodeList) {
                    triggerNodeList.each(function (o) {
                        if ((that.get('isDateInfo') || that.get('isDateIcon')) && that._isInput(o) && !o.parent('.calendar-input-wrap')) {
                            var wrap = $(Calendar.INPUT_WRAP_TEMPLATE);
                            o.after(wrap);
                            wrap.append(toHTML(Calendar.START_DATE_TEMPLATE, {'delegate_icon': that._triggerNodeIcon})).append(o);
                            that.get('isDateIcon') || o.prev().removeClass('calendar-start-icon');
                        }
                        o.addClass(that._triggerNodeClassName);
                        that._isInput(o) && o.attr('autocomplete', 'off');
                    });
                    finalTriggerNodeList.each(function (o) {
                        if ((that.get('isDateInfo') || that.get('isDateIcon')) && that._isInput(o) && !o.parent('.calendar-input-wrap')) {
                            var wrap = $(Calendar.INPUT_WRAP_TEMPLATE);
                            o.after(wrap);
                            wrap.append(toHTML(Calendar.END_DATE_TEMPLATE, {'delegate_icon': that._triggerNodeIcon})).append(o);
                            that.get('isDateIcon') || o.prev().removeClass('calendar-end-icon');
                        }
                        o.addClass(that._triggerNodeClassName);
                        that._isInput(o) && o.attr('autocomplete', 'off');
                    });
                })(this, $(this.get('triggerNode')), $(this.get('finalTriggerNode')));
                return this;
            },

            /**
             * 修复ie6下日历无法遮挡select的bug
             *
             * @method _fixSelectMask
             * @private
             */
            _fixSelectMask: function () {
                IE === 6 && this.boundingBox.append('<iframe />');
                return this;
            },

            /**
             * 鼠标移入事件
             *
             * @method _mouseenter
             * @param {Event} oTarget 事件对象
             * @private
             */
            _mouseenter: function (oTarget) {
                var boundingBox = this.boundingBox,
                    startDate = this.get('startDate'),
                    curDate = oTarget.attr('data-date'),
                    iDiff = Calendar.DATE.differ(startDate, curDate),
                    aTd = boundingBox.all('td'),
                    oTd = null;

                clearTimeout(this.leaveTimer);

                boundingBox.all('td').removeClass('hover');

                if (Calendar.DATE.parse(startDate) > Calendar.DATE.parse(curDate)) return this;

                for (var i = 0; i < iDiff - 1; i++) {
                    startDate = Calendar.DATE.siblings(startDate, 1);
                    oTd = boundingBox.one('td[data-date="' + startDate + '"]');
                    oTd && oTd.addClass('hover');
                }
            },

            /**
             * 鼠标移出事件
             *
             * @method _mouseleave
             * @private
             */
            _mouseleave: function () {
                (function (that) {
                    clearTimeout(that.leaveTimer);
                    that.leaveTimer = setTimeout(function () {
                        that.boundingBox.all('td').removeClass('hover');
                    }, 30);
                })(this);
            },

            /**
             * 事件代理
             *
             * @type {Object}
             */
            _DELEGATE: {
                // 日历点击事件处理函数
                'click': function (e) {
                    e.preventDefault();

                    var target = S.one(e.currentTarget),
                        date = target.attr('data-date');

                    switch (!0) {
                        case target.hasClass('prev-btn') && !target.hasClass('prev-btn-disabled'):
                            this.prevMonth();
                            break;
                        case target.hasClass('next-btn') && !target.hasClass('next-btn-disabled'):
                            this.nextMonth();
                            break;
                        case target.hasClass('close-btn'):
                            this.hide();
                            break;
                        case target && target.hasClass(this._delegateClickClassName) && this.boundingBox.hasClass('calendar-bounding-box-style') && date == this.get('minDate'):
                            break;
                        case !!date && !target.hasClass('disabled'):
                            this.get('container') || this.hide();
                            this._setValue(date)
                                ._setDateInfo(date)
                                ._setDateStyle()
                                .fire('dateclick', {
                                    date: date,
                                    dateInfo: this.getDateInfo(date)
                                });
                            break;
                    }
                },

                // select元素日期选择事件处理函数
                'change': function (e) {
                    var selectList = this.boundingBox.all('.' + this._delegateChangeClassName);
                    this.set('date', selectList.item(0).val() + '-' + selectList.item(1).val() + '-01');
                    this.render();
                },

                // 鼠标移入/移出事件处理函数
                'mouse': function (e) {
                    var target = S.one(e.currentTarget).parent('td');
                    if (target.hasClass('disabled')) return;
                    switch (e.type) {
                        case 'mouseenter':
                            this.boundingBox.hasClass('calendar-bounding-box-style') && !!this.get('startDate') &&
                            this._mouseenter(target);
                            break;
                        case 'mouseleave':
                            this._mouseleave();
                            break;
                    }
                },

                // 触发元素获取焦点处理函数
                'focusin': function (e) {
                    var target = this.currentNode = S.one(e.currentTarget);

                    // 标记入住日历/离店日历。离店日历有className[check-out]
                    this.boundingBox[this._inNodeList(target, $(this.get('triggerNode'))) ? 'removeClass' : 'addClass']('calendar-bounding-box-style');

                    this.hideMessage();

                    // 当缓存触发节点与当前触发节点不匹配时，调用一次hide方法
                    this._cacheNode && this._cacheNode.getDOMNode() != target.getDOMNode() && this.hide();

                    // 当日历隐藏时，调用show方法
                    this.boundingBox.css('display') == 'none' && this.show()._setWidth()._setPos();

                    // 重新设置缓存触发节点
                    this._cacheNode = target;
                },

                // 输入框输入事件处理函数
                'keyup': function (e) {
                    if (!this.get('isKeyup')) return;

                    clearTimeout(this.keyupTimer);

                    var that = this,
                        target = S.one(e.currentTarget);

                    if (!this._isInput(target)) return;

                    var v = target.val();

                    that._setDateInfo(v);

                    if (!RDATE.test(v)) return;

                    this.keyupTimer = setTimeout(function () {
                        v = Calendar.DATE.stringify(Calendar.DATE.parse(v));
                        that._setValue(v);
                        that.set('date', v);
                        that.render();
                    }, 200);
                },

                // 输入框Tab事件处理函数
                'keydown': function (e) {
                    if (e.keyCode != 9) return;
                    this.hide();
                },

                // icon点击事件处理函数
                'iconClick': function (e) {
                    var target = S.one(e.target).parent('.calendar-input-wrap').one('.' + this._triggerNodeClassName),
                        _target = target ? target.getDOMNode() : null;
                    var currentNode = this.currentNode ? this.currentNode.getDOMNode() : null;

                    if (_target != currentNode || this.boundingBox.css('display') == 'none') {
                        _target.focus();
                    }
                },

                // 触发元素点击事件处理函数
                'triggerNodeClick': function (e) {
                    var target = e.target;

                    if (target._selected || !this._isInput(S.one(target))) return;

                    target.select();
                    target._selected = true;
                }
            },

            /**
             * 获取同排显示的日历中最大的单元格数
             *
             * @method _maxCell
             * @private
             * @return {Number} 返回最大数
             */
            _maxCell: function () {
                var oDate = this.get('date'),
                    iYear = oDate.getFullYear(),
                    iMonth = oDate.getMonth() + 1,
                    aCell = [];
                for (var i = 0; i < this.get('count'); i++) {
                    aCell.push(new Date(iYear, iMonth - 1 + i, 1).getDay() + new Date(iYear, iMonth + i, 0).getDate());
                }
                return Math.max.apply(null, aCell);
            },

            /**
             * 判断node是不是input
             *
             * @method _isInput
             * @param {Object} v node
             * @private
             */
            _isInput: function (v) {
                return v.getDOMNode().tagName.toUpperCase() === 'INPUT' && (v.attr('type') === 'text' || v.attr('type') === 'date');
            },

            _inNodeList: function (node, nodeList) {
                var bIn = false
                each(nodeList, function (o) {
                    if (node.equals(o)) {
                        bIn = true;
                    }
                });
                return bIn;
            },

            /**
             * 创建年/月选择器
             *
             * @method _createSelect
             * @private
             * @return {String}
             */
            _createSelect: function () {
                var curDate = this.get('date'),
                    minDate = this.get('minDate'),
                    maxDate = this.get('maxDate'),
                    curYear = curDate.getFullYear(),
                    curMonth = Calendar.DATE.filled(curDate.getMonth() + 1),
                    minYear = minDate && minDate.substr(0, 4) || 1900,
                    maxYear = maxDate && maxDate.substr(0, 4) || new Date().getFullYear() + 3,
                    minMonth = minDate && minDate.substr(5, 2) || 1,
                    maxMonth = maxDate && maxDate.substr(5, 2) || 12,
                    selected = ' selected="selected"',
                    select_template = {};
                select_template['delegate_change'] = this._delegateChangeClassName;
                select_template['year_template'] = '';
                select_template['month_template'] = '';
                curYear == minYear || curYear == maxYear || (minMonth = 1, maxMonth = 12);
                for (var i = maxYear; i >= minYear; i--) {
                    select_template['year_template'] +=
                        '<option' + (curYear == i ? selected : '') + ' value="' + i + '">' + i + '</option>';
                }
                for (var i = minMonth; i <= maxMonth; i++) {
                    select_template['month_template'] +=
                        '<option' + (curMonth == i ? selected : '') + ' value="' + Calendar.DATE.filled(i) + '">' + Calendar.DATE.filled(i) + '</option>';
                }
                return toHTML(Calendar.SELECT_TEMPLATE, select_template);
            },

            /**
             * 创建2012——2020年节假日数据（包括节假日前1~3天/后1~3天）
             *
             * @method _createDateMap
             * @private
             * @return {Object} 节假日数据
             */
            _createDateMap: function () {
                var oTmp = {};
                for (var propety in Calendar.HOLIDAYS) {
                    var curHoliday = Calendar.HOLIDAYS[propety];
                    for (var i = 0; i < curHoliday.length; i++) {
                        var sDate = curHoliday[i],
                            sName = Calendar.DATENAME[propety];
                        for (var j = 0; j < 7; j++) {
                            var curDate = Calendar.DATE.siblings(sDate, j - 3);
                            (function (j, v) {
                                oTmp[curDate] = oTmp[curDate] ? j > 2 ? v : oTmp[curDate] : v;
                            })(j, sName + (j != 3 ? (j < 3 ? '前' : '后') + Math.abs(j - 3) + '天' : ''));
                        }
                    }
                }
                return oTmp;
            },

            /**
             * 生成日历模板
             *
             * @method _initCalendarHTML
             * @param {String} date 日期字符串yyyy-mm-dd
             * @private
             * @return {String} 返回日历字符串
             */
            _initCalendarHTML: function () {
                var calendar_template = {};
                calendar_template['delegate_click'] = this._delegateClickClassName;
                calendar_template['bounding_box_id'] = this._calendarId;
                calendar_template['message_template'] = this.get('message');
                calendar_template['date_template'] = this._dateHTML();
                return toHTML(Calendar.CALENDAR_TEMPLATE, calendar_template);
            },

            /**
             * 生成多日历模板
             *
             * @method _dateHTML
             * @param {Date} date 日期对象
             * @private
             * @return {String} 返回双日历模板字符串
             */
            _dateHTML: function (date) {
                var date = this.get('date'),
                    iYear = date.getFullYear(),
                    iMonth = date.getMonth(),
                    date_template = '';
                for (var i = 0; i < this.get('count'); i++) {
                    date_template +=
                        toHTML(Calendar.DATE_TEMPLATE, this._singleDateHTML(new Date(iYear, iMonth + i)));
                }
                return date_template;
            },

            /**
             * 生成单日历模板
             *
             * @method _singleDateHTML
             * @param {Date} date 日期对象
             * @private
             * @return {Object} 返回单个日历模板对象
             */
            _singleDateHTML: function (date) {
                var iYear = date.getFullYear(),
                    iMonth = date.getMonth() + 1,
                    firstDays = new Date(iYear, iMonth - 1, 1).getDay(),
                    monthDays = new Date(iYear, iMonth, 0).getDate(),
                    weekdays = [
                        {wd: '日', weekend: 'weekend'},
                        {wd: '一'},
                        {wd: '二'},
                        {wd: '三'},
                        {wd: '四'},
                        {wd: '五'},
                        {wd: '六', weekend: 'weekend'}
                    ];
                //week template string
                var weekday_template = '';
                each(weekdays, function (v) {
                    weekday_template +=
                        toHTML(Calendar.HEAD_TEMPLATE, {weekday_name: v.wd, weekend: v.weekend || ''});
                });
                //tbody template string
                var body_template = '',
                    days_array = [];
                for (; firstDays--;) days_array.push(0);
                for (var i = 1; i <= monthDays; i++) days_array.push(i);
                days_array.length = this._maxCell();
                var rows = Math.ceil(days_array.length / 7),
                    oData = this.get('data');
                for (var i = 0; i < rows; i++) {
                    var calday_row = '';
                    for (var j = 0; j <= 6; j++) {
                        var days = days_array[j + 7 * i] || '';
                        var date = days ? iYear + '-' + Calendar.DATE.filled(iMonth) + '-' + Calendar.DATE.filled(days) : '';
                        calday_row +=
                            toHTML(Calendar.DAY_TEMPLATE,
                                {
                                    'day': days,
                                    'date': date,
                                    'disabled': this._getDateStatus(date) || !days ? 'disabled' : this._delegateClickClassName,
                                    'date_class': this._getHolidaysClass(date, this._getDateStatus(date) || !days)
                                }
                            )
                    }
                    body_template +=
                        toHTML(Calendar.BODY_TEMPLATE, {calday_row: calday_row})
                }
                //table template object
                var table_template = {};
                //thead string
                table_template['head_template'] = weekday_template;
                //tbody string
                table_template['body_template'] = body_template;
                //single Calendar object
                var single_calendar_template = {};
                single_calendar_template['date'] = this.get('isSelect') ? this._createSelect() : iYear + '年' + iMonth + '月';
                single_calendar_template['table_template'] = toHTML(Calendar.TABLE_TEMPLATE, table_template);
                //return single Calendar template object
                return single_calendar_template;
            }
        },
        {
            /**
             * 日间处理表态方法
             * @type {Object}
             */
            DATE: {
                /**
                 * 将日期字符串转为日期对象
                 *
                 * @method parse
                 * @param {String} v 日期字符串
                 * @private
                 * @return {Date} 日期对象
                 */
                parse: function (v) {
                    v = v.match(REG);
                    return v ? new Date(v[0], v[1] - 1, v[2]) : null;
                },

                /**
                 * 将日期对象转为日期字符串
                 *
                 * @method stringify
                 * @param {Date} v 日期对象
                 * @private
                 * @return {String} 日期字符串
                 */
                stringify: function (v) {
                    if (!S.isDate(v)) return null;
                    return v.getFullYear() + '-' + this.filled(v.getMonth() * 1 + 1) + '-' + this.filled(v.getDate());
                },

                /**
                 * 获取指定日期的兄弟日期
                 *
                 * @method siblings
                 * @param {String} v 日期字符串
                 * @param {Number} n 间隔天数，支持负数
                 * @private
                 * @return {String} 日期字符串
                 */
                siblings: function (v, n) {
                    v = v.match(REG);
                    return this.stringify(new Date(v[0], v[1] - 1, v[2] * 1 + n * 1));
                },

                /**
                 * 获取指定日期的兄弟月份
                 *
                 * @method siblingsMonth
                 * @param {Date} v 日期对象
                 * @param {Number} n 间隔月份，支持负数
                 * @private
                 * @return {String} 日期对象
                 */
                siblingsMonth: function (v, n) {
                    return new Date(v.getFullYear(), v.getMonth() * 1 + n);
                },

                /**
                 * 数字不足两位前面补0
                 *
                 * @method filled
                 * @param {Number} v 要补全的数字
                 * @private
                 * @return {String} 补0后的字符串
                 */
                filled: function (v) {
                    return String(v).replace(/^(\d)$/, '0$1');
                },

                /**
                 * 获取两个日期的间隔天数
                 *
                 * @method differ
                 * @param {String} v1 日期对象
                 * @param {String} v2 日期对象
                 * @private
                 * @return {Number} 间隔天数
                 */
                differ: function (v1, v2) {
                    return parseInt(Math.abs(this.parse(v1) - this.parse(v2)) / 24 / 60 / 60 / 1000);
                },

                /**
                 * 验证指定日期子符串是否合法
                 *
                 * @method isDate
                 * @package {String} v 日期字符串
                 * @private
                 * @return {Boolean} true/false
                 */
                isDate: function (v) {
                    if (!RDATE.test(v)) return false;
                    var o = this.parse(v);
                    return o.getMonth() * 1 + 1 == v.match(REG)[1];
                },
                /**
                 * 获取指定日期是星期几
                 *
                 * @method week
                 * @param {String} v 日期字符串
                 * @private
                 * @return {String} 星期几
                 */
                week: function (v) {
                    return '星期' + ['日', '一', '二', '三', '四', '五', '六'][Calendar.DATE.parse(v).getDay()];
                }
            },
            /**
             * 日历模板
             *
             * @property CALENDAR_TEMPLATE
             * @type String
             * @static
             */
            CALENDAR_TEMPLATE: '<div id="{bounding_box_id}" class="calendar-bounding-box">' +
                '<div class="calendar-container">' +
                '<div class="message-box">' +
                '{message_template}' +
                '</div>' +
                '<div class="content-box">' +
                '<div class="arrow">' +
                '<span class="close-btn {delegate_click}" title="关闭">close</span>' +
                '<span class="prev-btn {delegate_click}" title="上月">prev</span>' +
                '<span class="next-btn {delegate_click}" title="下月">next</span>' +
                '</div>' +
                '<div class="date-box">' +
                '{date_template}' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>',

            DATE_TEMPLATE: '<div class="inner">' +
                '<h4>' +
                '{date}' +
                '</h4>' +
                '{table_template}' +
                '</div>',

            SELECT_TEMPLATE: '<select class="{delegate_change}">' +
                '{year_template}' +
                '</select>' +
                '年' +
                '<select class="{delegate_change}">' +
                '{month_template}' +
                '</select>' +
                '月',

            TABLE_TEMPLATE: '<table>' +
                '<thead>' +
                '<tr>' +
                '{head_template}' +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                '{body_template}' +
                '</tbody>' +
                '</table>',

            HEAD_TEMPLATE: '<th class="{weekend}">{weekday_name}</th>',

            BODY_TEMPLATE: '<tr>' +
                '{calday_row}' +
                '</tr>',

            DAY_TEMPLATE: '<td data-date="{date}" class="{disabled}">' +
                '<a href="javascript:;" class="{date_class}">' +
                '{day}' +
                '</a>' +
                '</td>',

            INPUT_WRAP_TEMPLATE: '<div class="calendar-input-wrap" />',

            START_DATE_TEMPLATE: '<span class="calendar-start-icon {delegate_icon}" />',

            END_DATE_TEMPLATE: '<span class="calendar-end-icon {delegate_icon}" />',

            /**
             * 日期名字
             *
             * @property DATENAME
             * @type Object
             * @static
             */
            DATENAME: {
                "today": "今天",
                "yuandan": "元旦",
                "chuxi": "除夕",
                "chunjie": "春节",
                "yuanxiao": "元宵节",
                "qingming": "清明",
                "wuyi": "劳动节",
                "duanwu": "端午节",
                "zhongqiu": "中秋节",
                "guoqing": "国庆节"
            },

            /**
             * 节假日时间
             *
             * @property HOLIDAYS
             * @type Object
             * @static
             */
            HOLIDAYS: {
                yuandan: ["2012-01-01", "2013-01-01", "2014-01-01", "2015-01-01", "2016-01-01", "2017-01-01", "2018-01-01", "2019-01-01", "2020-01-01"],
                chuxi: ["2012-01-22", "2013-02-09", "2014-01-30", "2015-02-18", "2016-02-07", "2017-01-27", "2018-02-15", "2019-02-04", "2020-01-24"],
                chunjie: ["2012-01-23", "2013-02-10", "2014-01-31", "2015-02-19", "2016-02-08", "2017-01-28", "2018-02-16", "2019-02-05", "2020-01-25"],
                yuanxiao: ["2012-02-06", "2013-02-24", "2014-2-14", "2015-03-05", "2016-02-22", "2017-02-11", "2018-03-02", "2019-02-19", "2020-02-8"],
                qingming: ["2012-04-04", "2013-04-04", "2014-04-05", "2015-04-05", "2016-04-04", "2017-04-04", "2018-04-05", "2019-04-05", "2020-04-04"],
                wuyi: ["2012-05-01", "2013-05-01", "2014-05-01", "2015-05-01", "2016-05-01", "2017-05-01", "2018-05-01", "2019-05-01", "2020-05-01"],
                duanwu: ["2012-06-23", "2013-06-12", "2014-06-02", "2015-06-20", "2016-06-09", "2017-05-30", "2018-06-18", "2019-06-07", "2020-06-25"],
                zhongqiu: ["2012-09-30", "2013-09-19", "2014-09-08", "2015-09-27", "2016-09-15", "2017-10-04", "2018-09-24", "2019-09-13", "2020-10-01"],
                guoqing: ["2012-10-01", "2013-10-01", "2014-10-01", "2015-10-01", "2016-10-01", "2017-10-01", "2018-10-01", "2019-10-01", "2020-10-01"]
            },

            /**
             * 日历组件标识
             *
             * @property NAME
             * @type String
             * @default 'TripCalendar'
             * @readOnly
             * @protected
             * @static
             */
            NAME: 'TripCalendar',

            /**
             * 默认属性配置
             *
             * @property ATTRS
             * @type {Object}
             * @protected
             * @static
             */
            ATTRS: {

                /**
                 * 日历外容器
                 *
                 * @attribute boundingBox
                 * @type {Node}
                 */
                boundingBox: {
                    readOnly: true
                },

                /**
                 * 日历初始日期
                 *
                 * @attribute date
                 * @type {Date|String}
                 * @default new Date()
                 */
                date: {
                    value: new Date(),
                    setter: function (v) {
                        if (!S.isDate(v)) {
                            v = RDATE.test(v) ? v : new Date();
                        }
                        return v;
                    },
                    getter: function (v) {
                        if (S.isDate(v)) return v;
                        if (S.isString(v)) {
                            v = v.match(REG);
                            return new Date(v[0], v[1] - 1);
                        }
                    }
                },

                /**
                 * 日历个数
                 *
                 * @attribute count
                 * @type {Number}
                 * @default 2
                 */
                count: {
                    value: 2,
                    getter: function (v) {
                        if (this.get('isSelect')) v = 1;
                        return v;
                    }
                },

                /**
                 * 选择的日期
                 *
                 * @attribute selectedDate
                 * @type {String}
                 * @default ''
                 */
                selectedDate: {
                    value: null,
                    setter: function (v) {
                        if (S.isDate(v)) {
                            v = Calendar.DATE.stringify(v);
                        }
                        return RDATE.test(v) ? v : null;
                    },
                    getter: function (v) {
                        if (S.isString(v)) {
                            v = Calendar.DATE.stringify(Calendar.DATE.parse(v));
                        }
                        return v || '';
                    }
                },

                /**
                 * 允许操作的最小日期
                 *
                 * @attribute minDate
                 * @type {Date|String}
                 * @default null
                 */
                minDate: {
                    value: null,
                    setter: function (v) {
                        if (S.isDate(v)) {
                            v = Calendar.DATE.stringify(v);
                        }
                        return RDATE.test(v) ? v : null;
                    },
                    getter: function (v) {
                        if (S.isString(v)) {
                            v = Calendar.DATE.stringify(Calendar.DATE.parse(v));
                        }
                        return v || '';
                    }
                },

                /**
                 * 允许操作的最大日期
                 *
                 * @attribute maxDate
                 * @type {Date|String}
                 * @default null
                 */
                maxDate: {
                    value: null,
                    setter: function (v) {
                        if (S.isDate(v)) {
                            v = Calendar.DATE.stringify(v);
                        }
                        return RDATE.test(v) ? v : null;
                    },
                    getter: function (v) {
                        if (S.isString(v)) {
                            v = Calendar.DATE.stringify(Calendar.DATE.parse(v));
                        }
                        return v || '';
                    }
                },

                /**
                 * 开始时间
                 *
                 * @attribute startDate
                 * @type {String}
                 * @default ''
                 */
                startDate: {
                    value: ''
                },

                /**
                 * 结束时间
                 *
                 * @attribute endDate
                 * @type {String}
                 * @default ''
                 */
                endDate: {
                    value: ''
                },

                /**
                 * 等价于设置minDate和maxDate，minDate未设置时取当前日期
                 *
                 * @attribute afterDays
                 * @type {Number}
                 * @default 0
                 */
                afterDays: {
                    value: 0,
                    setter: function (v) {
                        if (v > 0) {
                            this.set('maxDate', Calendar.DATE.siblings(this.get('minDate') || Calendar.DATE.stringify(new Date), v));
                        }
                        return v;
                    },
                    getter: function (v) {
                        v && (this.get('minDate') || this.set('minDate', new Date()));
                        return v;
                    }
                },

                /**
                 * 提示信息
                 *
                 * @attribute message
                 * @type {String}
                 * @default ''
                 */
                message: {
                    value: ''
                },

                /**
                 * 触发节点，支持批量设置，用半角逗号分隔。弹出式日历必选配置。例('#ID, .className, ...')
                 *
                 * @attribute triggerNode
                 * @type {String}
                 * @default ''
                 */
                triggerNode: {
                    value: '',
                    getter: function (v) {
                        if (/\,/.test(v)) {
                            v = v.replace(/\s+/g, '');
                            v = v.split(new RegExp('\\s+' + v + '+\\s', 'g'));
                            v = v.join().replace(/^,+|,+$/g, '');
                        }
                        return v
                    }
                },

                /**
                 * 最后触发节点，用于选择起始时间和结束时间互动，支持批量设置，用半角逗号分隔。例('#ID, .className, ...')
                 *
                 * @attribute finalTriggerNode
                 * @type {String}
                 * @default ''
                 */
                finalTriggerNode: {
                    value: '',
                    getter: function (v) {
                        if (/\,/.test(v)) {
                            v = v.replace(/\s+/g, '');
                            v = v.split(new RegExp('\\s+' + v + '+\\s', 'g'));
                            v = v.join().replace(/^,+|,+$/g, '');
                        }
                        return v
                    }
                },

                /**
                 * 放置日历的容器。非弹出式日历必选配置
                 *
                 * @attribute container
                 * @type {String}
                 * @default null
                 */
                container: {
                    value: null,
                    getter: function (v) {
                        if (/\,/.test(v)) {
                            v = v.replace(/\s+/g, '');
                            v = v.split(new RegExp('\\s+' + v + '+\\s', 'g'));
                            v = v.join().replace(/^,+|,+$/g, '');
                        }
                        return v
                    }
                },

                /**
                 * 是否开启下拉列表选择日期
                 *
                 * @attribute isSelect
                 * @type {Boolean}
                 * @default false
                 */
                isSelect: {
                    value: false
                },

                /**
                 * 是否开启键盘输入关联
                 *
                 * @attribute isKeyup
                 * @type {Boolean}
                 * @default true
                 */
                isKeyup: {
                    value: true
                },

                /**
                 * 是否显示日期信息
                 *
                 * @attribute isDateInfo
                 * @type {Boolean}
                 * @default true
                 */
                isDateInfo: {
                    value: true
                },

                /**
                 * 是否显示日期图标
                 *
                 * @attribute isDateIcon
                 * @type {Boolean}
                 * @default true
                 */
                isDateIcon: {
                    value: true
                },

                /**
                 * 是否显示节假日信息
                 *
                 * @attribute isHoliday
                 * @type {Boolean}
                 * @default true
                 */
                isHoliday: {
                    value: true,
                    setter: function (v) {
                        if (!v) this._dateMap = null;
                        return v;
                    }
                },

                /**
                 * 是否自动切换到结束时间
                 *
                 * @attribute isAutoSwitch
                 * @type Boolean
                 * @default false
                 */
                isAutoSwitch: {
                    value: false
                }
            }
        });

}, {requires: ['node', 'base', 'sizzle', './assets/index.css']});
