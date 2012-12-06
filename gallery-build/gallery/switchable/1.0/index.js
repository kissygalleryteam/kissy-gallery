/**
 * @fileOverview common aria for switchable and stop autoplay if necessary
 * @author yiminghe@gmail.com
 */
KISSY.add("gallery/switchable/1.0/aria", function(S, DOM, Event, Switchable) {


    Switchable.addPlugin({
        name:'aria',
        init:function(self) {
            if (!self.config.aria) return;

            var container = self.container;

            Event.on(container, "focusin", _contentFocusin, self);

            Event.on(container, "focusout", _contentFocusout, self);
        }
    });


    function _contentFocusin() {
        this.stop && this.stop();
        /**
         * !TODO
         * tab 到时滚动到当前
         */
    }

    function _contentFocusout() {
        this.start && this.start();
    }

    var default_focus = ["a","input","button","object"];
    var oriTabIndex = "oriTabIndex";
    return {
        setTabIndex:function(root, v) {
            root.tabIndex = v;
            S.each(DOM.query("*", root),function(n) {
                var nodeName = n.nodeName.toLowerCase();
                // a 需要被禁止或者恢复
                if (S.inArray(nodeName, default_focus)) {
                    if (!DOM.hasAttr(n, oriTabIndex)) {
                        DOM.attr(n, oriTabIndex, n.tabIndex)
                    }
                    //恢复原来
                    if (v != -1) {
                        n.tabIndex = DOM.attr(n, oriTabIndex);
                    } else {
                        n.tabIndex = v;
                    }
                }
            });
        }
    };

}, {
    requires:['dom','event','./base']
});
/**
 * @fileOverview Switchable autoplay Plugin
 */
KISSY.add('gallery/switchable/1.0/autoplay', function (S, DOM, Event, Switchable, undefined) {
    var DURATION = 200,
        win = window,
        checkElemInViewport = function (elem) {
            // 只计算上下位置是否在可视区域, 不计算左右
            var scrollTop = DOM.scrollTop(),
                vh = DOM.viewportHeight(),
                elemOffset = DOM.offset(elem),
                elemHeight = DOM.height(elem);
            return elemOffset.top > scrollTop &&
                elemOffset.top + elemHeight < scrollTop + vh;
        };

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        // 当 Switchable 对象不在可视区域中时停止动画切换
        pauseOnScroll:false,
        autoplay:false,
        interval:5, // 自动播放间隔时间
        pauseOnHover:true  // triggerType 为 mouse 时，鼠标悬停在 slide 上是否暂停自动播放
    });


    /**
     * 添加插件
     * attached members:
     *   - this.paused
     */
    Switchable.addPlugin({

        name:'autoplay',

        init:function (host) {

            var cfg = host.config,
                interval = cfg.interval * 1000,
                timer;

            if (!cfg.autoplay) {
                return;
            }

            if (cfg.pauseOnScroll) {
                host.__scrollDetect = S.buffer(function () {
                    // 依次检查页面上所有 switchable 对象是否在可视区域内
                    host[checkElemInViewport(host.container) ? 'start' : 'stop']();
                }, DURATION);
                Event.on(win, "scroll", host.__scrollDetect);
            }

            function startAutoplay() {
                // 设置自动播放
                timer = S.later(function () {
                    if (host.paused) {
                        return;
                    }
                    // 自动播放默认 forward（不提供配置），这样可以保证 circular 在临界点正确切换
                    // 用户 mouseenter 不提供 forward ，全景滚动
                    host.next();
                }, interval, true);
            }

            // go
            startAutoplay();

            // 添加 stop 方法，使得外部可以停止自动播放
            host.stop = function () {

                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
                // paused 可以让外部知道 autoplay 的当前状态
                host.paused = true;
            };

            host.start = function () {

                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
                host.paused = false;
                startAutoplay();
            };

            // 鼠标悬停，停止自动播放
            if (cfg.pauseOnHover) {
                Event.on(host.container, 'mouseenter', host.stop, host);
                Event.on(host.container, 'mouseleave', host.start, host);
            }
        },

        destroy:function (host) {
            if (host.__scrollDetect) {
                Event.remove(win, "scroll", host.__scrollDetect);
                host.__scrollDetect.stop();
            }
        }
    });
    return Switchable;
}, { requires:["dom", "event", "./base"]});
/**
 * - 乔花 承玉：2012.02.08 support pauseOnScroll
 *  当 Switchable 对象不在可视区域中时停止动画切换
 *
 * - 承玉：2011.06.02 review switchable
 */
/**
 * @fileOverview Switchable
 */
KISSY.add('gallery/switchable/1.0/base', function (S, DOM, Event, undefined) {

    var DISPLAY = 'display',
        BLOCK = 'block',
        makeArray = S.makeArray,
        NONE = 'none',
        EventTarget = Event.Target,
        FORWARD = 'forward',
        BACKWARD = 'backward',
        DOT = '.',
        EVENT_INIT = 'init',
        EVENT_BEFORE_SWITCH = 'beforeSwitch',
        EVENT_SWITCH = 'switch',
        EVENT_BEFORE_REMOVE = 'beforeRemove',
        EVENT_ADDED = 'add',
        EVENT_REMOVED = 'remove',
        CLS_PREFIX = 'ks-switchable-',
        CLS_TRIGGER_INTERNAL = CLS_PREFIX + 'trigger-internal',
        CLS_PANEL_INTERNAL = CLS_PREFIX + 'panel-internal';

    /**
     * Switchable Widget
     * attached members：
     *   - this.container
     *   - this.config
     *   - this.triggers  可以为空值 []
     *   - this.panels    可以为空值 []
     *   - this.content
     *   - this.length
     *   - this.activeIndex
     *   - this.switchTimer
     */
    function Switchable(container, config) {
        var self = this;

        self._triggerInternalCls = S.guid(CLS_TRIGGER_INTERNAL);
        self._panelInternalCls = S.guid(CLS_PANEL_INTERNAL);

        // 调整配置信息
        config = config || {};

        if (!('markupType' in config)) {
            if (config.panelCls) {
                config.markupType = 1;
            } else if (config.panels) {
                config.markupType = 2;
            }
        }

        // init config by hierarchy
        var host = self.constructor;

        // 子类配置优先
        while (host) {
            config = S.merge(host.Config, config);
            host = host.superclass ? host.superclass.constructor : null;
        }

        /**
         * the container of widget
         * @type {HTMLElement}
         */
        self.container = DOM.get(container);

        /**
         * 配置参数
         * @type {Object}
         */
        self.config = config;

        /**
         * triggers
         * @type {HTMLElement[]}
         */
        //self.triggers

        /**
         * panels
         * @type {HTMLElement}
         */
        //self.panels

        /**
         * length = panels.length / steps
         * @type {Number}
         */
        //self.length

        /**
         * the parentNode of panels
         * @type {HTMLElement}
         */
        //self.content

        /**
         * 当前正在动画/切换的位置
         * @type {Number}
         */
        self.activeIndex = config.activeIndex;

        var willSwitch;

        // 设置了 activeIndex
        // 要配合设置 markup
        if (self.activeIndex > -1) {
        }
        //设置了 switchTo , activeIndex == -1
        else if (typeof config.switchTo == "number") {
            willSwitch = config.switchTo;
        }
        // 否则，默认都为 0
        // 要配合设置位置 0 的 markup
        else {
            self.activeIndex = 0;
        }

        self._init();
        self._initPlugins();
        self.fire(EVENT_INIT);

        if (willSwitch !== undefined) {
            self.switchTo(willSwitch);
        }


    }

    function getDomEvent(e) {
        var originalEvent = {};
        originalEvent.type = e.type;
        originalEvent.target = e.target;
        return {originalEvent:originalEvent};
    }

    Switchable.getDomEvent = getDomEvent;

    Switchable.addPlugin = function (cfg, Type) {

        Type = Type || Switchable;
        var priority = cfg.priority = cfg.priority || 0,
            i = 0,
            plugins = Type.Plugins = Type.Plugins || [];
        // 大的在前
        for (; i < plugins.length; i++) {
            if (plugins[i].priority < priority) {
                break;
            }
        }
        plugins.splice(i, 0, cfg);
    };

    // 默认配置
    Switchable.Config = {
        markupType:0, // markup 的类型，取值如下：

        // 0 - 默认结构：通过 nav 和 content 来获取 triggers 和 panels
        navCls:CLS_PREFIX + 'nav',
        contentCls:CLS_PREFIX + 'content',

        // 1 - 适度灵活：通过 cls 来获取 triggers 和 panels
        triggerCls:CLS_PREFIX + 'trigger',
        panelCls:CLS_PREFIX + 'panel',

        // 2 - 完全自由：直接传入 triggers 和 panels
        triggers:[],
        panels:[],

        // 是否有触点
        hasTriggers:true,

        // 触发类型
        triggerType:'mouse', // or 'click'

        // 触发延迟
        delay:.1, // 100ms

        /**
         * 如果 activeIndex 和 switchTo 都不设置，相当于设置了 activeIndex 为 0
         * 如果设置了 activeIndex ，则需要为对应的 panel html 添加 activeTriggerCls class
         */
        activeIndex:-1,

        activeTriggerCls:'ks-active',

        /**
         * 初始切换到面板，设置了 switchTo 就不需要设置 activeIndex
         * 以及为对应 html 添加 activeTriggerCls class.
         * 注意： activeIndex 和 switchTo 不要同时设置，否则 activeIndex 优先
         */
        switchTo:undefined,

        // 可见视图内有多少个 panels
        steps:1,

        // 可见视图区域的大小。一般不需要设定此值，仅当获取值不正确时，用于手工指定大小
        viewSize:[]
    };

    S.augment(Switchable, EventTarget, {

        _initPlugins:function () {
            // init plugins by Hierarchy
            var self = this,
                plugins = [],
                pluginHost = self.constructor;

            while (pluginHost) {
                if (pluginHost.Plugins) {
                    plugins.push.apply(plugins, ([].concat(pluginHost.Plugins)).reverse())
                }
                pluginHost = pluginHost.superclass ?
                    pluginHost.superclass.constructor :
                    null;
            }

            plugins.reverse();

            // 父类先初始化
            S.each(plugins, function (plugin) {
                if (plugin.init) {
                    plugin.init(self);
                }
            });

        },

        /**
         * init switchable
         */
        _init:function () {
            var self = this,
                cfg = self.config;

            // parse markup
            self._parseMarkup();

            // bind triggers
            if (cfg.hasTriggers) {
                self._bindTriggers();
            }
            // bind panels
            self._bindPanels();
        },

        /**
         * 解析 markup, 获取 triggers, panels, content
         */
        _parseMarkup:function () {
            var self = this,
                container = self.container,
                cfg = self.config,
                nav,
                content,
                triggers = [],
                panels = [],
                n;

            switch (cfg.markupType) {
                case 0: // 默认结构
                    nav = DOM.get(DOT + cfg.navCls, container);
                    if (nav) {
                        triggers = DOM.children(nav);
                    }
                    content = DOM.get(DOT + cfg.contentCls, container);
                    panels = DOM.children(content);
                    break;
                case 1: // 适度灵活
                    triggers = DOM.query(DOT + cfg.triggerCls, container);
                    panels = DOM.query(DOT + cfg.panelCls, container);
                    break;
                case 2: // 完全自由
                    triggers = cfg.triggers;
                    panels = cfg.panels;
                    break;
            }

            // get length
            n = panels.length;

            // fix self.length 不为整数的情况, 会导致之后的判断 非0, by qiaohua 20111101
            self.length = Math.ceil(n / cfg.steps);

            self.nav = nav || cfg.hasTriggers && triggers[0] && triggers[0].parentNode;

            // 自动生成 triggers and nav
            if (cfg.hasTriggers && (
                // 指定了 navCls，但是可能没有手动填充 trigger
                !self.nav || triggers.length == 0
                )) {
                triggers = self._generateTriggersMarkup(self.length);
            }

            // 将 triggers 和 panels 转换为普通数组
            self.triggers = makeArray(triggers);
            self.panels = makeArray(panels);

            // get content
            self.content = content || panels[0].parentNode;

        },

        /**
         * 自动生成 triggers 的 markup
         */
        _generateTriggersMarkup:function (len) {
            var self = this,
                cfg = self.config,
                ul = self.nav || DOM.create('<ul>'),
                li,
                i;

            ul.className = cfg.navCls;
            for (i = 0; i < len; i++) {
                li = DOM.create('<li>');
                if (i === self.activeIndex) {
                    li.className = cfg.activeTriggerCls;
                }
                li.innerHTML = i + 1;
                ul.appendChild(li);
            }

            self.container.appendChild(ul);
            self.nav = ul;
            return DOM.children(ul);
        },

        /**
         * 给 triggers 添加事件
         */
        _bindTriggers:function () {
            var self = this,
                cfg = self.config,
                _triggerInternalCls = self._triggerInternalCls,
                navEl = S.one(self.nav),
                triggers = self.triggers;
            // 给 trigger 添加class，使用委托
            S.each(triggers, function (trigger) {
                self._initTrigger(trigger);
            });

            navEl.delegate('click', '.' + _triggerInternalCls, function (e) {
                var trigger = e.currentTarget,
                    index = self._getTriggerIndex(trigger);
                self._onFocusTrigger(index, e);
            });

            if (cfg.triggerType === 'mouse') {
                navEl.delegate('mouseenter', '.' + _triggerInternalCls,
                    function (e) {
                        var trigger = e.currentTarget,
                            index = self._getTriggerIndex(trigger);
                        self._onMouseEnterTrigger(index, e);
                    }).delegate('mouseleave', '.' + _triggerInternalCls, function () {
                        self._onMouseLeaveTrigger();
                    });
            }
        },
        // 初始化 Trigger，添加样式
        _initTrigger:function (trigger) {
            DOM.addClass(trigger, this._triggerInternalCls);
        },

        _bindPanels:function () {
            var self = this,
                panels = self.panels;
            S.each(panels, function (panel) {
                self._initPanel(panel);
            });
        },

        // 初始化panel,添加class
        _initPanel:function (panel) {
            DOM.addClass(panel, this._panelInternalCls);
        },
        /**
         * click or tab 键激活 trigger 时触发的事件
         */
        _onFocusTrigger:function (index, e) {
            var self = this;
            // 重复点击
            if (!self._triggerIsValid(index)) {
                return;
            }
            this._cancelSwitchTimer(); // 比如：先悬浮，再立刻点击，这时悬浮触发的切换可以取消掉。
            self.switchTo(index, undefined, getDomEvent(e));
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         */
        _onMouseEnterTrigger:function (index, e) {
            var self = this;
            if (!self._triggerIsValid(index)) {
                return;
            }
            var ev = getDomEvent(e);
            // 重复悬浮。比如：已显示内容时，将鼠标快速滑出再滑进来，不必再次触发。
            self.switchTimer = S.later(function () {
                self.switchTo(index, undefined, ev);
            }, self.config.delay * 1000);
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         */
        _onMouseLeaveTrigger:function () {
            this._cancelSwitchTimer();
        },

        /**
         * 重复触发时的有效判断
         */
        _triggerIsValid:function (index) {
            return this.activeIndex !== index;
        },

        /**
         * 取消切换定时器
         */
        _cancelSwitchTimer:function () {
            var self = this;
            if (self.switchTimer) {
                self.switchTimer.cancel();
                self.switchTimer = undefined;
            }
        },

        /**
         * 获取trigger的索引
         */
        _getTriggerIndex:function (trigger) {
            var self = this;
            return S.indexOf(trigger, self.triggers);
        },
        //重置 length: 代表有几个trigger
        _resetLength:function () {
            this.length = this._getLength();
        },
        //获取 Trigger的数量
        _getLength:function (panelCount) {
            var self = this,
                cfg = self.config;
            if (panelCount === undefined) {
                panelCount = self.panels.length;
            }
            return Math.ceil(panelCount / cfg.steps);
        },
        // 添加完成后，重置长度，和跳转到新添加项
        _afterAdd:function (index, active, callback) {
            var self = this;

            // 重新计算 trigger 的数目
            self._resetLength();

            // 考虑 steps>1 的情况
            var page = self._getLength(index + 1) - 1;

            // 重置当前活动项
            if (self.config.steps == 1) {
                // step =1 时 ，相同的 activeIndex 需要拍后
                if (self.activeIndex >= page) {
                    self.activeIndex += 1;
                }
            } else {
                // step >1 时 ，activeIndex 不排后
            }

            // 保持原来的在视窗
            var n = self.activeIndex;


            // 设为 -1，立即回复到原来视图
            self.activeIndex = -1;
            self.switchTo(n);


            // 需要的话，从当前视图滚动到新的视图
            if (active) {
                // 放到 index 位置
                self.switchTo(page, undefined, undefined, callback);
            } else {
                callback();
            }
        },
        /**
         * 添加一项
         * @param {Object} cfg 添加项的配置
         * @param {String|Object} cfg.trigger 导航的Trigger
         * @param {String|Object} cfg.panel 内容
         * @param {Number} cfg.index 添加到得位置
         */
        add:function (cfg) {
            var callback = cfg.callback || S.noop,
                self = this,
                navContainer = self.nav,
                contentContainer = self.content,
                triggerDom = cfg.trigger, //trigger 的Dom节点
                panelDom = cfg.panel, //panel的Dom节点
                active = cfg['active'], //添加一项后是否跳转到对应的trigger
                count = self.panels.length,
                index = cfg.index != null ? cfg.index : count,
                triggers = self.triggers,
                panels = self.panels,
                beforeLen = self.length, //添加节点之前的 trigger个数，如果step>1时，trigger 的个数不等于panel的个数
                currentLen = null,
            //原先在此位置的元素
                nextTrigger = null;

            // 如果 index 大于集合的总数，添加到最后
            index = Math.max(0, Math.min(index, count));

            var nextPanel = panels[index] || null;
            panels.splice(index, 0, panelDom);
            // 插入content容器对应的位置
            contentContainer.insertBefore(panelDom, nextPanel);
            // 当trigger 跟panel一一对应时，插入对应的trigger
            if (self.config.steps == 1) {
                nextTrigger = triggers[index];
                // 插入导航对应的位置
                navContainer.insertBefore(triggerDom, nextTrigger);
                // 插入集合
                triggers.splice(index, 0, triggerDom);
            } else {
                // 否则，多个 panel 对应一个 trigger 时，在最后附加 trigger
                currentLen = self._getLength();
                if (currentLen != beforeLen) {
                    // 附加到导航容器
                    DOM.append(triggerDom, navContainer);
                    triggers.push(triggerDom);
                }
            }

            self._initPanel(panelDom);
            self._initTrigger(triggerDom);

            self._afterAdd(index, active, callback);
            // 触发添加事件
            self.fire(EVENT_ADDED, {
                index:index,
                trigger:triggerDom,
                panel:panelDom
            });
        },

        /**
         * 移除一项
         */
        remove:function (cfg) {

            var callback = cfg.callback || S.noop,
                self = this,
                steps = self.config.steps,
                beforeLen = self.length,
                index,
                panels = self.panels;
            if ("index" in cfg) {
                index = cfg.index;
            } else {
                index = cfg.panel;
            }
            // 删除panel后的 trigger 个数
            var afterLen = self._getLength(panels.length - 1),
                triggers = self.triggers,
                trigger = null,
                panel = null;

            if (!panels.length) {
                return;
            }

            // 传入Dom对象时转换成index
            index = S.isNumber(index) ?
                Math.max(0, Math.min(index, panels.length - 1)) :
                S.indexOf(index, panels);

            // 如果trigger跟panel不一一对应则，取最后一个
            trigger = steps == 1 ?
                triggers[index] :
                (afterLen !== beforeLen ? triggers[beforeLen - 1] : null);

            panel = panels[index];


            // 触发删除前事件,可以阻止删除
            if (self.fire(EVENT_BEFORE_REMOVE, {
                index:index,
                panel:panel,
                trigger:trigger
            }) === false) {
                return;
            }

            function deletePanel() {

                // 删除panel
                if (panel) {
                    DOM.remove(panel);
                    panels.splice(index, 1);
                }

                // 删除trigger
                if (trigger) {
                    DOM.remove(trigger);
                    for (var i = 0; i < triggers.length; i++) {
                        if (triggers[i] == trigger) {
                            self.triggers.splice(i, 1);
                            break;
                        }
                    }
                }

                // 重新计算 trigger 的数目
                self._resetLength();

                self.fire(EVENT_REMOVED, {
                    index:index,
                    trigger:trigger,
                    panel:panel
                });
            }

            // 完了
            if (afterLen == 0) {
                deletePanel();
                callback();
                return;
            }

            var activeIndex = self.activeIndex;

            if (steps > 1) {
                if (activeIndex == afterLen) {
                    // 当前屏幕的元素将要空了，先滚到前一个屏幕，然后删除当前屏幕的元素
                    self.switchTo(activeIndex - 1, undefined, undefined, function () {
                        deletePanel();
                        callback();
                    });
                } else {
                    // 不滚屏，其他元素顶上来即可
                    deletePanel();
                    self.activeIndex = -1;
                    // notify datalazyload
                    self.switchTo(activeIndex, undefined, undefined, function () {
                        callback();
                    });
                }
                return;
            }

            // steps ==1
            // 和当前的一样，先滚屏
            if (activeIndex == index) {
                var n = activeIndex > 0 ?
                    activeIndex - 1 :
                    activeIndex + 1;
                self.switchTo(n, undefined, undefined, function () {
                    deletePanel();
                    // 0 是当前项且被删除
                    // 移到 1 删除 0，并设置当前 activeIndex 为 0
                    if (activeIndex == 0) {
                        self.activeIndex = 0;
                    }
                    callback();
                });
            } else {
                // 要删除的在前面，activeIndex -1
                if (activeIndex > index) {
                    activeIndex--;
                    self.activeIndex = activeIndex;
                }
                deletePanel();
                callback();
            }
        },

        /**
         * 切换操作，对外 api
         * @param index 要切换的项
         * @param [direction] 方向，用于 autoplay/circular
         * @param [ev] 引起该操作的事件
         * @param [callback] 运行完回调，和绑定 switch 事件作用一样
         */
        switchTo:function (index, direction, ev, callback) {
            var self = this,
                cfg = self.config,
                fromIndex = self.activeIndex,
                triggers = self.triggers;

            // 再次避免重复触发
            if (!self._triggerIsValid(index)) {
                return self;
            }

            if (self.fire(EVENT_BEFORE_SWITCH, {
                fromIndex:fromIndex,
                toIndex:index
            }) === false) {
                return self;
            }

            self.fromIndex = fromIndex;

            // switch active trigger
            if (cfg.hasTriggers) {
                self._switchTrigger(triggers[fromIndex] || null, triggers[index]);
            }

            // switch active panels
            if (direction === undefined) {
                direction = index > fromIndex ? FORWARD : BACKWARD;
            }

            // 当前正在处理转移到 index
            self.activeIndex = index;

            // switch view
            self._switchView(direction, ev, function () {
                callback && callback.call(self);
            });

            return self; // chain
        },

        /**
         * 切换当前触点
         */
        _switchTrigger:function (fromTrigger, toTrigger) {
            var activeTriggerCls = this.config.activeTriggerCls;

            if (fromTrigger) {
                DOM.removeClass(fromTrigger, activeTriggerCls);
            }

            DOM.addClass(toTrigger, activeTriggerCls);
        },

        _getFromToPanels:function () {
            var self = this,
                fromIndex = self.fromIndex,
                fromPanels,
                toPanels,
                steps = self.config.steps,
                panels = self.panels,
                toIndex = self.activeIndex;

            if (fromIndex > -1) {
                fromPanels = panels.slice(fromIndex * steps, (fromIndex + 1) * steps);
            } else {
                fromPanels = null;
            }

            toPanels = panels.slice(toIndex * steps, (toIndex + 1) * steps);

            return {
                fromPanels:fromPanels,
                toPanels:toPanels
            };
        },

        /**
         * 切换视图
         */
        _switchView:function (direction, ev, callback) {
            var self = this,
                panelInfo = self._getFromToPanels(),
                fromPanels = panelInfo.fromPanels,
                toPanels = panelInfo.toPanels;

            // 最简单的切换效果：直接隐藏/显示
            if (fromPanels) {
                DOM.css(fromPanels, DISPLAY, NONE);
            }

            DOM.css(toPanels, DISPLAY, BLOCK);

            // fire onSwitch events
            // 同动画时保持一致，强制异步
            setTimeout(function () {
                self._fireOnSwitch(ev);
            }, 0);

            callback && callback.call(this);
        },

        /**
         * 触发 switch 相关事件
         */
        _fireOnSwitch:function (ev) {
            var self = this;
            self.fire(EVENT_SWITCH, S.merge(ev, {
                fromIndex:self.fromIndex,
                currentIndex:this.activeIndex
            }));
        },

        /**
         * 切换到上一视图
         */
        prev:function (ev) {
            var self = this;
            // 循环
            self.switchTo((self.activeIndex - 1 + self.length) % self.length,
                BACKWARD, ev);
        },

        /**
         * 切换到下一视图
         */
        next:function (ev) {
            var self = this;
            // 循环
            self.switchTo((self.activeIndex + 1) % self.length,
                FORWARD, ev);
        },

        destroy:function (keepNode) {
            var self = this,
                pluginHost = self.constructor;

            // destroy plugins by Hierarchy
            while (pluginHost) {
                S.each(pluginHost.Plugins, function (plugin) {
                    if (plugin.destroy) {
                        plugin.destroy(self);
                    }
                });
                pluginHost = pluginHost.superclass ?
                    pluginHost.superclass.constructor :
                    null;
            }

            // 释放DOM,已经绑定的事件
            if (keepNode) {
                Event.remove(self.container);
            } else {
                DOM.remove(self.container);
            }
            self.nav = null;
            self.content = null;
            self.container = null;
            //释放保存元素的集合
            self.triggers = [];
            self.panels = [];
            //释放事件
            self.detach();
        }
    });

    return Switchable;

}, { requires:['dom', "event"] });

/**
 * yiminghe@gmail.com : 2012.05.22
 *  - 增加 priority 插件初始化优先级
 *
 * yiminghe@gmail.com : 2012.05.03
 *  - 支持 touch 设备，完善 touch 边界情况
 *  - 增加 fromIndex 属性，表示上一个激活的 trigger index
 *  - refactor switchView, 去除多余参数
 *
 * yiminghe@gmail.com : 2012.04.12
 *  - 增加 switch/beforeSwitch 事件对象增加 fromIndex
 *  - 删除状态 completedIndex
 *
 * 董晓庆/yiminghe@gmail.com ：2012.03
 *   - 增加 添加、删除一项的功能 => 工程浩大
 *
 * 承玉：2011.06.02
 *   - review switchable
 *
 * 承玉：2011.05.10
 *   - 抽象 init plugins by Hierarchy
 *   - 抽象 init config by hierarchy
 *   - switchTo 处理，外部设置，初始展开面板
 *   - 增加状态 completedIndex
 *
 * 2010.07
 *  - 重构，去掉对 YUI2-Animation 的依赖
 *
 * 2010.04
 *  - 重构，脱离对 yahoo-dom-event 的依赖
 *
 * 2010.03
 *  - 重构，去掉 Widget, 部分代码直接采用 kissy 基础库
 *  - 插件机制从 weave 织入法改成 hook 钩子法
 *
 * TODO:
 *  - http://malsup.com/jquery/cycle/
 *  - http://www.mall.taobao.com/go/chn/mall_chl/flagship.php
 *
 * References:
 *  - jQuery Scrollable http://flowplayer.org/tools/scrollable.html
 */
/**
 * @fileOverview Switchable Circular Plugin
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('gallery/switchable/1.0/circular', function (S, DOM, Anim, Switchable) {

    var clearPosition = {
        position: '',
        left: '',
        top: ''
    };

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        circular: false
    });

    // 限制条件：总 item 数必须至少等于 一屏数
    // 当前帧 fromIndex 总位于总左边，所以 forward 情况下一定不是补帧
    function seamlessCircularScroll(callback, direction) {
        var self = this,
            fromIndex = self.fromIndex,
            cfg = self.config,
            len = self.length,
            isX = cfg.scrollType === 'scrollx',
            prop = isX ? 'left' : 'top',
            index = self.activeIndex,
            viewDiff = self.viewSize[isX ? 0 : 1],
            panels = self.panels,
            props = {},
            v = {},
            correction,
            _realStep = self._realStep,
            totalXX = viewDiff * len;

        props[prop] = -viewDiff * index;

        if (fromIndex == -1) {
            // 初始化
            DOM.css(self.content, props);
            callback && callback();
            return;
        }

        // 最终补帧状态对了
        // realStep 补帧
        // 等于时不要补帧，所以限制条件为：总个数至少等于一屏个数
        if (index + _realStep > len) {
            v = { position: 'relative'};
            v[prop] = totalXX;

            // 补帧数
            correction = index + _realStep - len;

            // 关键要同步！ realStep 取消或设定相对定位的同时要设置 left，保持在用户的显示位置不变
            // 最小补帧
            DOM.css(panels.slice(0, correction), v);
            // 取消其他补帧
            DOM.css(panels.slice(correction, _realStep), clearPosition);
        } else {
            DOM.css(panels.slice(0, _realStep), clearPosition);
        }


        // 调整当前位置
        var fromIndexPosition = DOM.css(panels[fromIndex], "position");

        var dl = (fromIndex + len - index) % len;
        var dr = (index - fromIndex + len) % len;


        // 当前位于补帧，左转比较容易，移到补帧处
        // ??
        // 什么情况下位于补帧并且需要右转?? 除非不满足限制条件
        // dl >= dr && fromIndexPosition == 'relative'

        if (dl < dr && fromIndexPosition == 'relative') {
            DOM.css(self.content, prop,
                -(viewDiff * (len + fromIndex)));
        } else
        // dl > dr
        // || fromIndexPosition != 'relative' 可忽略
        {
            // 当前即使位于补帧，但是之前不是，右转更方便
            // 不移动到补帧新位置
            // 保持原有位置

            //  edge case
            if (fromIndex == len - 1 && index == 0) {
                // 从 viewDiff 到 0，而不是 -(viewDiff * (fromIndex) 到 0，距离最短
                DOM.css(self.content, prop, viewDiff);
            } else {
                // 正常水平 :  -(viewDiff * (fromIndex) ->  -(viewDiff * (index)
                DOM.css(self.content, prop, -(viewDiff * (fromIndex)));
            }
        }

        if (self.anim) {
            self.anim.stop();
        }

        self.anim = new Anim(self.content,
            props,
            cfg.duration,
            cfg.easing,
            function () {
                // free
                self.anim = 0;
                callback && callback();
            }).run();


    }

    /**
     * 循环滚动效果函数
     */
    function circularScroll(callback, direction) {
        var self = this,
            fromIndex = self.fromIndex,
            cfg = self.config,
            len = self.length,
            isX = cfg.scrollType === 'scrollx',
            prop = isX ? 'left' : 'top',
            index = self.activeIndex,
            viewDiff = self.viewSize[isX ? 0 : 1],
            diff = -viewDiff * index,
            panels = self.panels,
            steps = self.config.steps,
            props = {},
            isCritical,
            isBackward = direction === 'backward';

        // 从第一个反向滚动到最后一个 or 从最后一个正向滚动到第一个
        isCritical = (isBackward && fromIndex === 0 && index === len - 1)
            ||
            (!isBackward && fromIndex === len - 1 && index === 0);

        // 开始动画
        if (self.anim) {
            self.anim.stop();
            // 快速的话会有点问题
            // 上一个 'relative' 没清掉：上一个还没有移到该移的位置
            if (panels[fromIndex * steps].style.position == "relative") {
                // 快速移到 reset 后的结束位置，用户不会察觉到的！
                resetPosition.call(self, panels, fromIndex, prop, viewDiff, 1);
            }
        }

        if (isCritical) {
            // 调整位置并获取 diff
            diff = adjustPosition.call(self, panels, index, prop, viewDiff);
        }

        props[prop] = diff + 'px';

        if (fromIndex > -1) {
            self.anim = new Anim(self.content,
                props,
                cfg.duration,
                cfg.easing,
                function () {
                    if (isCritical) {
                        // 复原位置
                        resetPosition.call(self, panels, index, prop, viewDiff, 1);
                    }
                    // free
                    self.anim = undefined;
                    callback && callback();
                }).run();
        } else {
            // 初始化
            DOM.css(self.content, props);
            callback && callback();
        }

    }

    /**
     * 调整位置
     */
    function adjustPosition(panels, start, prop, viewDiff) {
        var self = this,
            cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            from = start * steps,
            actionPanels,
            to = (start + 1) * steps;

        // 调整 panels 到下一个视图中
        actionPanels = panels.slice(from, to);
        DOM.css(actionPanels, 'position', 'relative');
        DOM.css(actionPanels, prop, (start ? -1 : 1) * viewDiff * len);

        // 偏移量
        return start ? viewDiff : -viewDiff * len;
    }

    /**
     * 复原位置
     */
    function resetPosition(panels, start, prop, viewDiff, setContent) {
        var self = this,
            cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            from = start * steps,
            actionPanels,
            to = (start + 1) * steps;

        // 滚动完成后，复位到正常状态
        actionPanels = panels.slice(from, to);
        DOM.css(actionPanels, 'position', '');
        DOM.css(actionPanels, prop, '');

        if (setContent) {
            // 瞬移到正常位置
            DOM.css(self.content, prop, start ? -viewDiff * (len - 1) : '');
        }
    }

    Switchable.adjustPosition = adjustPosition;

    Switchable.resetPosition = resetPosition;

    /**
     * 添加插件
     */
    Switchable.addPlugin({

        name: 'circular',

        priority: 5,

        /**
         * 根据 effect, 调整初始状态
         */
        init: function (host) {
            var cfg = host.config,
                effect = cfg.effect;

            // 仅有滚动效果需要下面的调整
            if (cfg.circular && (effect === 'scrollx' || effect === 'scrolly')) {
                // 覆盖滚动效果函数
                cfg.scrollType = effect; // 保存到 scrollType 中

                /*
                 特殊处理：容器宽度比单个 item 宽，但是要求 item 一个个循环滚动，关键在于动画中补全帧的处理
                 */
                if(host._realStep){
                    cfg.effect = seamlessCircularScroll;
                } else {
                    cfg.effect = circularScroll;
                }
            }
        }
    });

}, { requires: ["dom", "anim", "./base", "./effect"]});

/**
 * 2012-07-20 yiminghe@gmail.com
 *  - 增强 steps=1 时并且容器可视区域包括多个 item 的单步循环
 *  - 多补帧技术
 *
 *
 * 2012-04-12 yiminghe@gmail.com
 *  - 修复速度过快时从 0 到最后或从最后到 0 时的 bug ： 'relative' 位置没有 reset
 *
 * 2012-06-02 yiminghe@gmail.com
 *  - review switchable
 *
 * TODO:
 *   - 是否需要考虑从 0 到 2（非最后一个） 的 'backward' 滚动？需要更灵活
 */
/**
 * @fileOverview Switchable Effect Plugin
 */
KISSY.add('gallery/switchable/1.0/effect', function (S, DOM, Event, Anim, Switchable, undefined) {

    var DISPLAY = 'display',
        BLOCK = 'block',
        NONE = 'none',
        OPACITY = 'opacity',
        Z_INDEX = 'z-index',
        POSITION = 'position',
        RELATIVE = 'relative',
        ABSOLUTE = 'absolute',
        SCROLLX = 'scrollx',
        SCROLLY = 'scrolly',
        FADE = 'fade',
        LEFT = 'left',
        TOP = 'top',
        FLOAT = 'float',
        PX = 'px',
        Effects;
//        EVENT_ADDED = 'added',
//        EVENT_REMOVED = 'removed';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        effect: NONE, // 'scrollx', 'scrolly', 'fade' 或者直接传入 custom effect fn
        duration: .5, // 动画的时长
        easing: 'easeNone' // easing method
    });

    /**
     * 定义效果集
     */
    Switchable.Effects = {

        // 最朴素的显示/隐藏效果
        none: function (callback) {
            var self = this,
                panelInfo = self._getFromToPanels(),
                fromPanels = panelInfo.fromPanels,
                toPanels = panelInfo.toPanels;

            if (fromPanels) {
                DOM.css(fromPanels, DISPLAY, NONE);
            }
            DOM.css(toPanels, DISPLAY, BLOCK);
            callback && callback();
        },

        // 淡隐淡现效果
        fade: function (callback) {

            var self = this,
                panelInfo = self._getFromToPanels(),
                fromPanels = panelInfo.fromPanels,
                toPanels = panelInfo.toPanels;

            if (fromPanels && fromPanels.length !== 1) {
                S.error('fade effect only supports steps == 1.');
            }

            var cfg = self.config,
                fromEl = fromPanels ? fromPanels[0] : null,
                toEl = toPanels[0];

            if (self.anim) {
                // 不执行回调
                self.anim.stop();
                // 防止上个未完，放在最下层
                DOM.css(self.anim.fromEl, {
                    zIndex: 1,
                    opacity: 0
                });
                // 把上个的 toEl 放在最上面，防止 self.anim.toEl == fromEL
                // 压不住后面了
                DOM.css(self.anim.toEl, "zIndex", 9);
            }

            // 首先显示下一张
            DOM.css(toEl, OPACITY, 1);

            if (fromEl) {
                // 动画切换
                self.anim = new Anim(fromEl,
                    { opacity: 0 },
                    cfg.duration,
                    cfg.easing,
                    function () {
                        self.anim = undefined; // free
                        // 切换 z-index
                        DOM.css(toEl, Z_INDEX, 9);
                        DOM.css(fromEl, Z_INDEX, 1);
                        callback && callback();
                    }).run();
                self.anim.toEl = toEl;
                self.anim.fromEl = fromEl;
            } else {
                //初始情况下没有必要动画切换
                DOM.css(toEl, Z_INDEX, 9);
                callback && callback();
            }
        },

        // 水平/垂直滚动效果
        scroll: function (callback, direction, forceAnimation) {
            var self = this,
                fromIndex = self.fromIndex,
                cfg = self.config,
                isX = cfg.effect === SCROLLX,
                diff = self.viewSize[isX ? 0 : 1] * self.activeIndex,
                props = { };

            props[isX ? LEFT : TOP] = -diff + PX;

            if (self.anim) {
                self.anim.stop();
            }
            // 强制动画或者不是初始化
            if (forceAnimation ||
                fromIndex > -1) {
                self.anim = new Anim(self.content, props,
                    cfg.duration,
                    cfg.easing,
                    function () {
                        self.anim = undefined; // free
                        callback && callback();
                    }).run();
            } else {
                DOM.css(self.content, props);
                callback && callback();
            }
        }
    };
    Effects = Switchable.Effects;
    Effects[SCROLLX] = Effects[SCROLLY] = Effects.scroll;

    /**
     * 添加插件
     * attached members:
     *   - this.viewSize
     */
    Switchable.addPlugin({

        priority: 10,

        name: 'effect',

        /**
         * 根据 effect, 调整初始状态
         */
        init: function (host) {
            var cfg = host.config,
                effect = cfg.effect,
                panels = host.panels,
                content = host.content,
                steps = cfg.steps,
                panels0 = panels[0],
                container = host.container,
                activeIndex = host.activeIndex;

            // 注：所有 panel 的尺寸应该相同
            // 最好指定第一个 panel 的 width 和 height, 因为 Safari 下，图片未加载时，读取的 offsetHeight 等值会不对

            // 2. 初始化 panels 样式
            if (effect !== NONE) { // effect = scrollx, scrolly, fade

                // 这些特效需要将 panels 都显示出来
                DOM.css(panels, DISPLAY, BLOCK);

                switch (effect) {
                    // 如果是滚动效果
                    case SCROLLX:
                    case SCROLLY:

                        // 设置定位信息，为滚动效果做铺垫
                        DOM.css(content, POSITION, ABSOLUTE);

                        // 注：content 的父级不一定是 container
                        if (DOM.css(content.parentNode, POSITION) == "static") {
                            DOM.css(content.parentNode, POSITION, RELATIVE);
                        }

                        // 水平排列
                        if (effect === SCROLLX) {
                            DOM.css(panels, FLOAT, LEFT);
                            // 设置最大宽度，以保证有空间让 panels 水平排布
                            DOM.width(content, "999999px");
                        }

                        // 只有 scrollX, scrollY 需要设置 viewSize
                        // 其他情况下不需要
                        // 1. 获取高宽
                        host.viewSize = [
                            cfg.viewSize[0] || panels0 && DOM.outerWidth(panels0, true) * steps,
                            cfg.viewSize[1] || panels0 && DOM.outerHeight(panels0, true) * steps
                        ];

                        if (!host.viewSize[0]) {
                            S.error('switchable must specify viewSize if there is no panels');
                        }

                        if (steps == 1 && panels0) {
                            var realStep = 1;
                            var viewSize = host.viewSize;
                            var scroller = panels0.parentNode.parentNode;

                            var containerViewSize = [
                                Math.min(DOM.width(container), DOM.width(scroller)),
                                Math.min(DOM.height(container), DOM.height(scroller))
                            ];

                            if (effect == 'scrollx') {
                                realStep = Math.floor(containerViewSize[0] / viewSize[0]);
                            } else if (effect == 'scrolly') {
                                realStep = Math.floor(containerViewSize[1] / viewSize[1]);
                            }

                            if (realStep > cfg.steps) {
                                // !TODO ugly _realStep
                                host._realStep = realStep;
                            }
                        }

                        break;

                    // 如果是透明效果，则初始化透明
                    case FADE:
                        var min = activeIndex * steps,
                            max = min + steps - 1,
                            isActivePanel;

                        S.each(panels, function (panel, i) {
                            isActivePanel = i >= min && i <= max;
                            DOM.css(panel, {
                                opacity: isActivePanel ? 1 : 0,
                                position: ABSOLUTE,
                                zIndex: isActivePanel ? 9 : 1
                            });
                        });
                        break;
                }
            }

            // 3. 在 CSS 里，需要给 container 设定高宽和 overflow: hidden
        }
    });

    /**
     * 覆盖切换方法
     */
    S.augment(Switchable, {

        _switchView: function (direction, ev, callback) {

            var self = this,
                cfg = self.config,
                effect = cfg.effect,
                fn = S.isFunction(effect) ? effect : Effects[effect];

            fn.call(self, function () {
                self._fireOnSwitch(ev);
                callback && callback.call(self);
            }, direction);
        }

    });

    return Switchable;

}, { requires: ["dom", "event", "anim", "./base"]});
/**
 * 承玉：2011.06.02 review switchable
 */
/**
 * @fileOverview switchable
 */
KISSY.add("gallery/switchable/1.0/index", function (S, Switchable, Accordion, Carousel, Slide, Tabs) {
    var re = {
        Accordion: Accordion,
        Carousel: Carousel,
        Slide: Slide,
        Tabs: Tabs
    };
    S.mix(Switchable, re);

    return Switchable;
}, {
    requires: [
        "gallery/switchable/1.0/base",
        "gallery/switchable/1.0/accordion/base",
        "gallery/switchable/1.0/carousel/base",
        "gallery/switchable/1.0/slide/base",
        "gallery/switchable/1.0/tabs/base",
        "gallery/switchable/1.0/lazyload",
        "gallery/switchable/1.0/effect",
        "gallery/switchable/1.0/circular",
        "gallery/switchable/1.0/carousel/aria",
        "gallery/switchable/1.0/autoplay",
        "gallery/switchable/1.0/aria",
        "gallery/switchable/1.0/tabs/aria",
        "gallery/switchable/1.0/accordion/aria"
    ]
});
/**
 * @fileOverview Switchable Lazyload Plugin
 */
KISSY.add('gallery/switchable/1.0/lazyload', function (S, DOM, Switchable) {

    var EVENT_BEFORE_SWITCH = 'beforeSwitch',
        IMG_SRC = 'img',
        AREA_DATA = 'textarea',
        FLAGS = {};

    FLAGS[IMG_SRC] = 'lazyImgAttribute';
    FLAGS[AREA_DATA] = 'lazyTextareaClass';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        lazyImgAttribute: "data-ks-lazyload-custom",
        lazyTextareaClass: "ks-datalazyload-custom",
        lazyDataType: AREA_DATA // or IMG_SRC
    });

    /**
     * 织入初始化函数
     */
    Switchable.addPlugin({

        name: 'lazyload',

        init: function (host) {
            var DataLazyload = S.require("datalazyload"),
                cfg = host.config,
                type = cfg.lazyDataType,
                flag;

            if (type === 'img-src') {
                type = IMG_SRC;
            }
            else if (type === 'area-data') {
                type = AREA_DATA;
            }

            cfg.lazyDataType = type;
            flag = cfg[FLAGS[type]];
            // 没有延迟项
            if (!DataLazyload || !type || !flag) {
                return;
            }

            host.on(EVENT_BEFORE_SWITCH, loadLazyData);

            // 初始 lazyload activeIndex
            loadLazyData({
                toIndex: host.activeIndex
            });

            /**
             * 加载延迟数据
             */
            function loadLazyData(ev) {
                // consider steps == 1
                var steps = host._realStep || cfg.steps,
                    from = ev.toIndex * steps ,
                    to = from + steps;
                DataLazyload.loadCustomLazyData(host.panels.slice(from, to),
                    type, flag);
                if (isAllDone()) {
                    host.detach(EVENT_BEFORE_SWITCH, loadLazyData);
                }
            }

            /**
             * 是否都已加载完成
             */
            function isAllDone() {
                var elems,
                    i,
                    el,
                    len,
                    isImgSrc = type === IMG_SRC,
                    tagName = isImgSrc ? 'img' : (type === AREA_DATA ?
                        'textarea' : '');

                if (tagName) {
                    elems = DOM.query(tagName, host.container);
                    for (i = 0, len = elems.length; i < len; i++) {
                        el = elems[i];
                        if (isImgSrc ?
                            DOM.attr(el, flag) :
                            DOM.hasClass(el, flag)) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }
    });

    return Switchable;

}, { requires: ["dom", "./base"]});
/**
 * 2012-10-17 yiminghe@gmail.com
 *  - 初始 lazyload activeIndex
 *  - consider steps == 1 for carousel
 *
 * 承玉：2011.06.02 review switchable
 */
