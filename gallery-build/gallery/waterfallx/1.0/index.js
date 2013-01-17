KISSY.add("gallery/waterfallx/1.0/waterfallx",function(S, WaterFallX){
    return WaterFallX;
}, {
    requires:["./waterfallx"]
});
/**
 * @fileoverview waterfallx
 * @desc What's this?
 * 就是个waterfallx，与kissy最大的不同是，采用了inline-block布局，而未采用KISSY的绝对定位布局
 * 优点：
 *  1、容器无需定高；
 *  2、动态改变容器高度时，无需调用adjust，因为容器是静态定位的：）
 *  3、adjust的平均效率会更高
 *  4、支持在瀑布流头部插入数据，这可以通过调用preAddItems
 *  5、API兼容KISSY，并多了一个preAddItems用于前向插入数据
 * 适用场景：图片尺寸未知且需要自适应 线上案例： 1. 淘宝周边（http://zhoubian.taobao.com/） 2. 有图有真相（http://www.taobao.com/go/act/sale/zhenxiang.php）
 * 其他：弹性布局(如width:70%)，若出现折行现象，请设置瀑布流容器的white-space:nowrap;
 * 主要原因是该瀑布流未采用绝对定位， 通过margin来控制布局，会导致百分数的情况下，四舍五入多出1像素的margin，从而导致折行现象！
 * preAddItems的参数与addItems一致！
 *
 * @author 踏风<tafeng.dxx@taobao.com>
 */
KISSY.add('gallery/waterfallx/1.0/base', function (S) {
    var $ = S.Node.all,
        D = S.DOM,
        win = S.Env.host || window,
        COLCLASS = 'ks-waterfall-col',
        RESIZE_DURATION = 50,
        STYLE = '.' + COLCLASS + "{ display: inline-block; vertical-align:top;"
            + "*display: inline; *zoom: 1}";

    function timedChunk(items, process, context, callback) {
        var stopper = {},
            count = 0,
            timer;
        if (items.length > count) {
            timer = setTimeout(function () {
                var start = +new Date();
                do {
                    var item = items[count++];
                    process.call(context, item);
                } while (items.length > count && (+new Date() - start < 50));

                if (items.length > count) {
                    timer = setTimeout(arguments.callee, 25);
                } else {
                    callback && callback.call(context, items);
                }
            }, 25);
        } else {
            callback && S.later(callback, 0, false, context, items);
        }

        stopper.stop = function () {
            clearTimeout(timer);
        };

        return stopper;
    }

    function addItem(itemRaw, callback, status) {
        if (!itemRaw) {
            callback && callback();
            return;
        }


        var self = this;
        var effect = null,
            items =  null,
            add = 'append',
            item = $(itemRaw),
            colItems = self._colItems,
            curColCount = colItems.length,
            guard = Number.MAX_VALUE,
            col = 0;

        if(!status) {
            //尾部添加状态
            items = this._items;
            effect = self.config.effect;
            item.attr('data-waterfall-index', items.length) && (items.push(item));
        } else if(status == 'preadd') {
            //头部添加状态
            items = this._preItems;
            add = 'prepend';
            items.push(item);
            item.attr('data-waterfall-index', -items.length) ;
        } else {
            //调整状态
            effect = self.config.addjustEffect;
        }

        // 否则找到最短的列
        for (var i = 0; i < curColCount; i++) {
            var height = colItems[i].outerHeight(true);
            if (height < guard) {
                guard = height;
                col = i;
            }
        }

        /*
         不在容器里，就加上
         */

        if (effect && effect.effect) {
            colItems[col][add](item);
            item.hide();
            callback && callback();
            item[effect.effect](
                effect.duration,
                0,
                effect.easing
            );
        } else {
            colItems[col].append(item);
            callback && callback();
        }
        return item;
    }

    function doResize() {
        var containerRegion = this._containerRegion;
        // 宽度没变就没必要调整
        if (containerRegion && this.container.width() === containerRegion) {
            return;
        }
        //列数不变，仅需要调整间距
        if (this._calculate() === this._colItems.length) {
            this._adjustMargin();
            return;
        }
        this.adjust();
    }

    function WaterFallX(config) {
        if (!config.container) {
            return;
        }

        var defaultConfig = {
            align:'center',
            minColCount:1,
            effect:{
                effect:"fadeIn",
                duration:1
            }
        };

        this.config = S.merge(defaultConfig, config);
        this.container = $(config.container);//.css('whiteSpace', 'nowrap');
        this._colItems = [];
        this._preItems = [];
        this._items = [];
        this._init();
    }

    var privatePro = {
        _init:function () {
            D.addStyleSheet(STYLE, 'ks-waterfallx');
            this._createColumnItems();
            this.addItems(this.container.all(".ks-waterfall"));
            this.__onResize = S.buffer(doResize, RESIZE_DURATION, this);
            $(win).on("resize", this.__onResize);
        },
        /*
         *计算列数
         * */
        _calculate:function () {
            var conf = this.config,
                container = this.container,
                containerWidth = container.width(),
                colCount;

            // 当前列数
            conf.colWidth || (conf.colWidth = containerWidth);
            colCount = Math.max(parseInt((containerWidth) / conf.colWidth), conf.minColCount);
            // 当前容器宽度
            this._containerRegion = containerWidth;

            return colCount;
        },

        _createColumnItems:function () {
            var conf = this.config,
                colItems = this._colItems,
                colCount = this._calculate();

            //删除原有的列
            for (var i = colItems.length - 1; i > -1; --i) {
                colItems[i].remove();
            }

            colItems.length = colCount;

            //添加列
            for (i = 0; i < colCount; ++i) {
                colItems[i] = $('<div>').addClass(COLCLASS).appendTo(this.container);
                colItems[i].width(conf.colWidth);
            }

            //调整间距
            this._adjustMargin();
        },

        _adjustMargin:function () {
            var conf = this.config,
                align = conf.align,
                colItems = this._colItems,
                colCount = colItems.length;

            var margin = align === 'left' ? 0 : Math.max(this.container.width() - colCount * conf.colWidth, 0);
            margin /= colCount;
            if (align === 'center') {
                margin /= 2;
            }

            colItems[0].css('marginLeft', margin + 'px');
        },
        _deleteItem:function (item) {
            var index = +item.attr('data-waterfall-index');
            if (index < 0) {
                index = -(index + 1);
                this._preItems[index] = null;
            } else {
                this._items[index] = null;
            }
        }

    };

    var pulbicPro = {
        addItems:function (items, callback) {
            var self = this;
            /* 正在调整中，直接这次加，和调整的节点一起处理 */
            /* 正在加，直接这次加，一起处理 */
            self._adder = timedChunk(items,
                addItem,
                self,
                function () {
                    self._adder = 0;
                    callback && callback.call(self);
                    self.fire('addComplete', {
                        items:items
                    });
                });

            return self._adder;
        },
        preAddItems: function(items, callback) {
            var self = this;
            /* 正在调整中，直接这次加，和调整的节点一起处理 */
            /* 正在加，直接这次加，一起处理 */
            self._adder = timedChunk(items,
                function(itemRaw){
                    addItem.call(self, itemRaw, null, 'preadd');
                },
                self,
                function () {
                    self._adder = 0;
                    callback && callback.call(self);
                    self.fire('addComplete', {
                        items:items
                    });
                });

            return self._adder;
        },
        isAdding:function () {
            return !!this._adder;
        },

        removeItem:function (item, cfg) {
            cfg = cfg || {};
            item = $(item);
            var effect = cfg.effect,
                callback = cfg.callback,
                self = this;

            cfg.callback = function () {
                self._deleteItem(item);
                item.remove();
                callback && callback.call(self);
            };

            if (effect) {
                item.animate({effect:effect.effect }, effect.duration, effect.easing, cfg.callback);
            } else {
                cfg.callback();
            }
        },

        destroy:function () {
            $(win).detach("resize", this.__onResize);
        },

        isAdjusting:function () {
            return !!this._adjuster;
        },
        adjust:function (callback) {
            S.log("waterfall:adjust");
            var self = this,
                items = this._items = this._preItems.concat(this._items);

            /* 正在加，直接开始这次调整，剩余的加和正在调整的一起处理 */
            /* 正在调整中，取消上次调整，开始这次调整 */
            if (self.isAdjusting()) {
                self._adjuster.stop();
                self._adjuster = 0;
            }

            this._preItems = [];
            for (var i = 0, len = items.length; i < len; ) {
                //停止动画,去除空洞
                if(items[i]) {
                    $(items[i]).stop(true).attr('data-waterfall-index', i++);
                } else {
                    items.splice(i, 1);
                    --len;
                }
            }

            //重置列
            self._createColumnItems();

            var num = items.length;

            function check() {
                --num;
                if (num <= 0) {
                    self._adjuster = 0;
                    callback && callback.call(self);
                    self.fire('adjustComplete', {
                        items:items
                    });
                }
            }

            return self._adjuster = timedChunk(items, function (item) {
                addItem.call(self, item, check, true);
            });
        },
        adjustItem:function (item) {

        }
    };

    S.augment(WaterFallX, S.Event.Target, privatePro, pulbicPro);
    return WaterFallX;
});

/*
 Loader
 * */
KISSY.add("gallery/waterfallx/1.0/loader", function (S, Node, Waterfall) {

    var $ = Node.all,
        win = S.Env.host || window,
        SCROLL_TIMER = 50;


    function Loader() {
        Loader.superclass.constructor.apply(this, arguments);
        this.config.diff || (this.config.diff = 0);
    }

    function doScroll() {
        var self = this;
        S.log("waterfall:doScroll");
        if (self.__loading || !self.__started) {
            return;
        }
        // 如果正在调整中，等会再看
        // 调整中的高度不确定，现在不适合判断是否到了加载新数据的条件
        if (self.isAdjusting()) {
            // 恰好 __onScroll 是 buffered . :)
            self.__onScroll();
            return;
        }
        var diff = self.config.diff;
        // 动态载
        // 最小高度(或被用户看到了)低于预加载线
        if (diff + $(win).scrollTop() + $(win).height() >= self.container.outerHeight(true)) {
            S.log("waterfall:loading");
            loadData.call(self);
        }
    }

    function loadData() {
        var self = this;
        self.__loading = 1;

        var load = self.config.load;
        load && load(success, end);

        function success(items, callback) {
            self.__loading = 0;
            self.addItems(items, callback);
        }

        function end() {
            self.end();
        }
    }

    S.extend(Loader, Waterfall,
        /**
         * @lends Waterfall.Loader#
         */
        {
            _init:function () {
                var self = this;
                Loader.superclass._init.apply(self, arguments);
                self.__onScroll = S.buffer(doScroll, SCROLL_TIMER, self);
                // 初始化时立即检测一次，但是要等初始化 adjust 完成后.
                self.__onScroll();
                self.start();
            },

            /**
             * Start monitor scroll on window.
             * @since 1.3
             */
            start:function () {
                var self = this;
                if (!self.__started) {
                    $(win).on("scroll", self.__onScroll);
                    self.__started = 1;
                }
            },

            /**
             * Stop monitor scroll on window.
             */
            end:function () {
                $(win).detach("scroll", this.__onScroll);
                self.__started = 0;
            },

            /**
             * Use end instead.
             * @deprecated
             */
            pause:function () {
                this.end();
            },

            /**
             * Use start instead.
             * @deprecated
             */
            resume:function () {
                this.start();
            },

            /**
             * Destroy this instance.
             */
            destroy:function () {
                var self = this;
                Loader.superclass.destroy.apply(self, arguments);
                $(win).detach("scroll", self.__onScroll);
                self.__started = 0;
            }
        });

    return Loader;

}, {
    requires:['node', './base']
});

KISSY.add("gallery/waterfallx/1.0/waterfallx", function (S, WaterfallX, Loader) {
    WaterfallX.Loader = Loader;
    return WaterfallX;
}, {
    requires:['gallery/waterfallx/1.0/base', 'gallery/waterfallx/1.0/loader']
});
