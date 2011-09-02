/**
 * 倒计时组件
 * @author jide<jide@taobao.com> 基德
 * [+]new feature  [*]improvement  [!]change  [x]bug fix
 *
 * [*] 2011-01-13
 *     改为使用本地时间计时，避免额外(setInterval等导致的)误差的累计
 * [x] 2011-04-18 16:35
 *     修复初始之为0时可能出现倒计时为负数的bug by xixia.sm
 *     {{{ value = value < 0 ? 0 : value; }}}
 */
/*global KISSY */

KISSY.add('Countdown', function (S) {
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
        //tagWrap: 's', // support regular expression?
        effect: 'normal',
        _varReg: /\$\{([\-\w]+)\}/g,
        _clock: ['d', 100, 2, 'h', 24, 2, 'm', 60, 2, 's', 60, 2, 'u', 10, 1]
    };

    /**
     * 更夫：The watchman.
     *
     * when {fn} is added, watchman will call
     * the {fn} on the {frequency} required,
     * and tell the method the new Date();
     */
    var watchman = (function () {//{{{
        var fns = [],
            commands = [];

        /**
         * sound the night watches :)
         *
         * call the {fn} on the {frequency} required,
         * and tell {fn} the new Date();
         */
        function sound() {
            var time = +new Date(),
                duration = 100 - time + sound.lastTime,
                i, len;

            // 为避免循环时受到 对fns数组的操作 的影响,
            // add/remove 统一操作
            while (commands.length) {
                commands.shift()();
            }

            for (i = 0, len = fns.length; i < len; i += 2) {
                // 每次加2，可保留末位
                fns[i + 1] += 2;
                //  1   第10次值为21
                //  0   是偶数就可以
                if (fns[i + 1] === 21 || (fns[i + 1] & 1) === 0) {
                    fns[i](time);
                    // 保留末位，其它位置0
                    fns[i + 1] &= 1;
                }
            }

            sound.lastTime = time;

            duration = duration > 0 ? duration : 0;
            setTimeout(sound, duration);
        }
        sound.lastTime = +new Date();
        setTimeout(sound, 100);

        return {
            add: function (fn, frequency) {
                commands.push(function () {
                    fns.push(fn);
                    fns.push(frequency === 1000 ? 1 : 0);
                });
            },
            remove: function (fn) {
                commands.push(function () {
                    var i = S.indexOf(fn, fns);
                    if ( i !== -1 ) {
                        fns.splice(S.indexOf(fn, fns), 2);
                    }
                });
            }
        };
    }());//}}}

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
            me.total = parseInt(D.attr(container, 'data-time'), 10);
            me.startAt = +new Date();

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

            me._reflow(me.startAt);

            // bind reflow to me.
            var _reflow = me._reflow;
            me._reflow = function (time) {
                return _reflow.call(me, time);
            };
            watchman.add(me._reflow, me.frequency);

            // 显示时钟.
            D.css(container, 'display', 'block');
        },//}}}
        /**
         * 更新时钟
         * @param {number} time
         */
        _reflow: function (time) {//{{{
            var left = this.total + this.startAt - time;

            // less than 100ms, the clock will show 00:00:00.0.
            // So we stop the clock.
            if (left < this.frequency) {
                watchman.remove(this._reflow);
            }

            // 更新hands
            S.each(this.hands, function (hand) {
                hand.lastValue = hand.value;
                hand.value = Math.floor(left / hand.base) % hand.radix;
            });

            // 更新时钟.
            this._repaint();

            // notify
            if (this._notify[left]) {
                S.each(this._notify[left], function (callback) {
                    callback();
                });
            }

            return this;
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

    S.Countdown = Countdown;
});
