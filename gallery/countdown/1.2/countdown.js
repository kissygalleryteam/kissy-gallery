/**
 * 倒计时组件
 * @author jide<jide@taobao.com>
 * [+]new feature  [*]improvement  [!]change  [x]bug fix
 *
 * [*] 2012-04-26
 *     移除watchman，以及与真实时间有关的逻辑。修正notify无效的bug
 * [x] 2011-04-18 16:35
 *     修复初始之为0时可能出现倒计时为负数的bug by xixia.sm
 *     {{{ value = value < 0 ? 0 : value; }}}
 */

KISSY.add('gallery/countdown/1.2/countdown', function (S, Timer) {
    var D = S.DOM,
        EVENT_AFTER_PAINT = 'afterPaint';

    /**
     * A Countdown instance constructor.
     * configuration:
     *      effect
     * @constructor
     * @param {HTMLElement|string} container
     * @param {Object=} config
     */
    function Countdown(container, config) {//{{{

        // factory or constructor
        if (!(this instanceof Countdown)) {
            return new Countdown(container, config);
        }

        // check if container exist
        container = S.get(container);
        if (!container) {
            return;
        }

        // set container & config
        /**
         * @type {HTMLElement}
         */
        this.container = container;
        /**
         * @type {Object}
         */
        this.config = S.merge(Countdown.Config, config);

        // init Countdown
        this._init();
    }//}}}

    /**
     * Static attributes
     */
    Countdown.Config = {
        effect: 'normal',
        _varReg: /\$\{([\-\w]+)\}/g,
        _clock: ['d', 100, 2, 'h', 24, 2, 'm', 60, 2, 's', 60, 2, 'u', 10, 1]
    };

    S.augment(Countdown, S.EventTarget, {
        /**
         * 初始化
         * @private
         */
        _init: function () {//{{{
            var me = this,
                cfg = me.config,
                varReg = cfg._varReg,
                clockCfg = cfg._clock,
                container = me.container,
                hands = [];
            
            // 初始化时钟.
            this._notify = [];
            /**
             * 指针结构
             * hand: {
             *   type: string,
             *   value: number,
             *   lastValue: number,
             *   base: number,
             *   radix: number,
             *   bits: number,
             *   node: S.Node
             * }
             */
            me.hands = hands;
            me.frequency = 1000;

            // 分析markup
            varReg.lastIndex = 0;
            container.innerHTML = container.innerHTML.replace(varReg, function (str, type) {
                // 时钟频率校正.
                if (type === 'u' || type === 's-ext') {
                    me.frequency = 100;
                }

                // 生成hand的markup
                var content = '';
                if (type === 's-ext') {
                    hands.push({type: 's'});
                    hands.push({type: 'u'});
                    content = me._html('', 's', 'handlet') +
                        me._html('.', '', 'digital') +
                        me._html('', 'u', 'handlet');
                } else {
                    hands.push({type: type});
                }

                return me._html(content, type, 'hand');
            });

            // 指针type以外属性(node, radix, etc.)的初始化.
            S.each(hands, function (hand) {
                var type = hand.type,
                    base = 100, i;

                hand.node = S.one(container).one('.hand-' + type);

                // radix, bits 初始化.
                for (i = clockCfg.length - 3; i > -1; i -= 3) {
                    if (type === clockCfg[i]) {
                        break;
                    }

                    base *= clockCfg[i + 1];
                }
                hand.base = base;
                hand.radix = clockCfg[i + 1];
                hand.bits = clockCfg[i + 2];
            });

            me._getLeft();
            me._reflow();

            // bind reflow to me.
            var _reflow = me._reflow;
            me._reflow = function () {
                return _reflow.apply(me, arguments);
            };
            Timer.add(me._reflow, me.frequency);

            // 显示时钟.
            D.css(container, 'display', 'block');
        },//}}}
        /**
         * 获取倒计时剩余帧数
         */
        _getLeft: function () {//{{{
            // 新属性1
            var left = D.attr(this.container, 'data-total');
            // 新属性2
            if (undefined === left) {
                left = D.attr(this.container, 'data-end') - S.now();
            }
            // 旧属性，Deprecated
            if (undefined === left) {
                left = D.attr(this.container, 'data-time');
            }
            
            left = parseInt(left, 10);
            this.left = left - left % this.frequency;
        },//}}}
        /**
         * 更新时钟
         */
        _reflow: function (count) {//{{{
            count = count || 0;

            var me = this;
            me.left = me.left - me.frequency * count;

            // 更新hands
            S.each(me.hands, function (hand) {
                hand.lastValue = hand.value;
                hand.value = Math.floor(me.left / hand.base) % hand.radix;
            });

            // 更新时钟.
            me._repaint();

            // notify
            if (me._notify[me.left]) {
                S.each(me._notify[me.left], function (callback) {
                    callback.call(me);
                });
            }

            // notify 可能更新me.left
            if (me.left < 1) {
                Timer.remove(me._reflow);
            }

            return me;
        },//}}}
        /**
         * 重绘时钟
         * @private
         */
        _repaint: function () {//{{{
            var me = this,
                effect = me.config.effect;

            Countdown.Effects[effect].paint.apply(me);

            me.fire(EVENT_AFTER_PAINT);
        },//}}}
        /**
         * 把值转换为独立的数字形式
         * @private
         * @param {number} value
         * @param {number} bits
         */
        _toDigitals: function (value, bits) {//{{{
			value = value < 0 ? 0 : value;
			
            var digitals = [];

            // 把时、分、秒等换算成数字.
            while (bits--) {
                digitals[bits] = value % 10;

                value = Math.floor(value / 10);
            }

            return digitals;
        },//}}}
        /**
         * 生成需要的html代码，辅助工具
         * @private
         * @param {string|Array.<string>} content
         * @param {string} className
         * @param {string} type
         */
        _html: function (content, className, type) {//{{{
            if (S.isArray(content)) {
                content = content.join('');
            }

            switch (type) {
            case 'hand':
                className = type + ' hand-' + className;
                break;
            case 'handlet':
                className = type + ' hand-' + className;
                break;
            case 'digital':
                if (content === '.') {
                    className = type + ' ' + type + '-point ' + className;
                } else {
                    className = type + ' ' + type + '-' + content + ' ' + className;
                }
                break;
            }

            return '<s class="' + className + '">' + content + '</s>';
        },//}}}
        /**
         * 倒计时事件
         * @param {number} time
         * @param {Function} callback
         */
        notify: function (time, callback) {//{{{
            var notifies = this._notify[time] || [];
            notifies.push(callback);
            this._notify[time] = notifies;

            return this;
        }//}}}
    });

    return Countdown;
}, {requires: ['./timer']});
