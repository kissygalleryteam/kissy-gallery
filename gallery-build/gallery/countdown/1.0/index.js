/**
 * ����ʱ���
 * @author jide<jide@taobao.com> ���
 * [+]new feature  [*]improvement  [!]change  [x]bug fix
 *
 * [*] 2011-01-13
 *     ��Ϊʹ�ñ���ʱ���ʱ���������(setInterval�ȵ��µ�)�����ۼ�
 * [x] 2011-04-18 16:35
 *     �޸���ʼ֮Ϊ0ʱ���ܳ��ֵ���ʱΪ�����bug by xixia.sm
 *     {{{ value = value < 0 ? 0 : value; }}}
 */
/*global KISSY */

KISSY.add('gallery/countdown/1.0/countdown', function (S) {
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
     * ���The watchman.
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

            // Ϊ����ѭ��ʱ�ܵ� ��fns����Ĳ��� ��Ӱ��,
            // add/remove ͳһ����
            while (commands.length) {
                commands.shift()();
            }

            for (i = 0, len = fns.length; i < len; i += 2) {
                // ÿ�μ�2���ɱ���ĩλ
                fns[i + 1] += 2;
                //  1   ��10��ֵΪ21
                //  0   ��ż��Ϳ���
                if (fns[i + 1] === 21 || (fns[i + 1] & 1) === 0) {
                    fns[i](time);
                    // ����ĩλ������λ��0
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
         * ��ʼ��
         * @private
         */
        _init: function () {//{{{
            var me = this,
                cfg = me.config,
                varReg = cfg._varReg,
                clockCfg = cfg._clock,
                container = me.container,
                hands = [];
            
            // ��ʼ��ʱ��.
            this._notify = [];
            /**
             * ָ��ṹ
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

            // ����markup
            varReg.lastIndex = 0;
            container.innerHTML = container.innerHTML.replace(varReg, function (str, type) {
                // ʱ��Ƶ��У��.
                if (type === 'u' || type === 's-ext') {
                    me.frequency = 100;
                }

                // ���hand��markup
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

            // ָ��type��������(node, radix, etc.)�ĳ�ʼ��.
            S.each(hands, function (hand) {
                var type = hand.type,
                    base = 100, i;

                hand.node = S.one(container).one('.hand-' + type);

                // radix, bits ��ʼ��.
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

            // ��ʾʱ��.
            D.css(container, 'display', 'block');
        },//}}}
        /**
         * ����ʱ��
         * @param {number} time
         */
        _reflow: function (time) {//{{{
            var left = this.total + this.startAt - time;

            // less than 100ms, the clock will show 00:00:00.0.
            // So we stop the clock.
            if (left < this.frequency) {
                watchman.remove(this._reflow);
            }

            // ����hands
            S.each(this.hands, function (hand) {
                hand.lastValue = hand.value;
                hand.value = Math.floor(left / hand.base) % hand.radix;
            });

            // ����ʱ��.
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
         * �ػ�ʱ��
         * @private
         */
        _repaint: function () {//{{{
            var me = this,
                effect = me.config.effect;

            Countdown.Effects[effect].paint.apply(me);

            me.fire(EVENT_AFTER_PAINT);
        },//}}}
        /**
         * ��ֵת��Ϊ��b��������ʽ
         * @private
         * @param {number} value
         * @param {number} bits
         */
        _toDigitals: function (value, bits) {//{{{
			value = value < 0 ? 0 : value;
			
            var digitals = [];

            // ��ʱ���֡���Ȼ��������.
            while (bits--) {
                digitals[bits] = value % 10;

                value = Math.floor(value / 10);
            }

            return digitals;
        },//}}}
        /**
         * �����Ҫ��html���룬�����
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
         * ����ʱ�¼�
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
});
/**
 * ����ʱ���
 * Effects ģ��
 * @author jide<jide@taobao.com>
 *
 */
/*global KISSY */

KISSY.add('gallery/countdown/1.0/effects', function (S, Countdown) {

    /**
     * Static attributes
     */
    Countdown.Effects = {
        // ��ͨ������Ч��
        normal: {
            paint: function () {
                var me = this,
                    content;

                // �ҵ�ֵ����ı��hand
                S.each(me.hands, function (hand) {
                    if (hand.lastValue !== hand.value) {
                        // ����µ�markup
                        content = '';

                        S.each(me._toDigitals(hand.value, hand.bits), function (digital) {
                            content += me._html(digital, '', 'digital');
                        });

                        // ������
                        hand.node.html(content);
                    }
                });
            }
        },
        // ����Ч��
        slide: {
            paint: function () {
                var me = this,
                    content, bits,
                    digitals, oldDigitals;

                // �ҵ�ֵ����ı��hand
                S.each(me.hands, function (hand) {
                    if (hand.lastValue !== hand.value) {
                        // ����µ�markup
                        content = '';
                        bits = hand.bits;
                        digitals = me._toDigitals(hand.value, bits);
                        if (hand.lastValue === undefined) {
                            oldDigitals = digitals;
                        } else {
                            oldDigitals = me._toDigitals(hand.lastValue, bits);
                        }

                        while (bits--) {
                            if (oldDigitals[bits] !== digitals[bits]) {
                                content = me._html([me._html(digitals[bits], '', 'digital'), me._html(oldDigitals[bits], '', 'digital')], 'slide-wrap') + content;
                            } else {
                                content = me._html(digitals[bits], '', 'digital') + content;
                            }
                        }

                        // ������
                        hand.node.html(content);
                    }
                });
                
                Countdown.Effects.slide.afterPaint.apply(me);
            },
            afterPaint: function () {
                // �ҵ�ֵ����ı��hand
                S.each(this.hands, function (hand) {
                    if (hand.lastValue !== hand.value && hand.lastValue !== undefined) {
                        var node = hand.node,
                            height = node.one('.digital').height();

                        node.css('height', height);
                        node.all('.slide-wrap').css('top', -height).animate('top: 0', 0.5, 'easeIn');
                    }
                });
            }
        },
        // ����Ч��
        // ����Ļ���Ҫʵ��DOM�ڵ�����Ч���Լ۱Ȳ���
/*
// ֻ������
<s class="flip-wrap">
    to be update...
</s>
// ��ָ��
<s class="hand">
    <s class="handlet new">
        <s class="digital digital-1"></s>
        <s class="digital digital-9"></s>
    </s>
    <s class="handlet old">
        <s class="digital digital-2"></s>
        <s class="digital digital-0"></s>
    </s>
    <s class="handlet mask">
        <s class="digital digital-2"></s>
        <s class="digital digital-0"></s>
    </s>
</s>
*/
        flip: {
            paint: function () {
                var me = this,
                    m_mask, m_new, m_old;

                // �ҵ�ֵ����ı��hand
                S.each(me.hands, function (hand) {
                    if (hand.lastValue !== hand.value) {
                        // ����µ�markup
                        m_mask = '';
                        m_new = '';
                        m_old = '';

                        S.each(me._toDigitals(hand.value, hand.bits), function (digital) {
                            m_new += me._html(digital, '', 'digital');
                        });
                        if (hand.lastValue === undefined) {
                            // ����
                            hand.node.html(m_new);
                        } else {
                            m_new = me._html(m_new, 'handlet');
                            S.each(me._toDigitals(hand.lastValue, hand.bits), function (digital) {
                                m_old += me._html(digital, '', 'digital');
                            });
                            m_mask = me._html(m_old, 'handlet mask');
                            m_old = me._html(m_old, 'handlet');

                            // ����
                            hand.node.html(m_new + m_old + m_mask);
                        }
                    }
                });
                
                Countdown.Effects.flip.afterPaint.apply(me);
            },
            afterPaint: function () {
                // �ҵ�ֵ����ı��hand
                S.each(this.hands, function (hand) {
                    if (hand.lastValue !== hand.value && hand.lastValue !== undefined) {
                        // Ȼ���������Ӷ���Ч��
                        var node = hand.node,
                            ns = node.all('.handlet'),
                            n_new = ns.item(0),
                            n_old = ns.item(1),
                            n_mask = ns.item(2),
                            width = node.width(),
                            height = node.height(),
                            h_top = Math.floor(height / 2),
                            h_bottom = height - h_top;

                        // prepare
                        n_old.css({
                            clip: 'rect(' + h_top + 'px, ' + width + 'px, ' + height + 'px, 0)'
                        });

                        // ����һ���ϰ벿��
                        n_mask.css({
                            overflow: 'hidden',
                            height: h_top + 'px'
                        });
                        n_mask.animate({
                            top: h_top + 'px',
                            height: 0
                        }, 0.15, 'easeNone', function () {
                            // ���������°벿��
                            n_mask.html(n_new.html());
                            n_mask.css({
                                top: 0,
                                height: h_top + 'px',
                                clip: 'rect(' + h_top + 'px, ' + width + 'px, ' + height + 'px, 0)'
                            });
                            n_mask.animate('height: ' + height + 'px', 0.3, 'bounceOut');
                        });
                    }
                });
            }
        }
    };

}, {
    requires: ["./countdown"]
});
KISSY.add("gallery/countdown/1.0/index",function(S, CD){
    return CD;
}, {
    requires:["./countdown", "./effects"]
});
