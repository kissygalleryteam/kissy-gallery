/**
 * 倒计时组件 - Timer Module
 * @author jide<jide@taobao.com>
 * 
 * 单例，公用的时间处理模块。负责尽量精确地计时，必要时弃帧保时。
 * Timer将统一调用时间更新函数。每更新一次时间对应一帧，对外提供add/remove帧函数的方法，
 * add 时需要 帧函数frame, 帧频率frequency，
 * remove 时只需要 帧函数frame
 *
 *
 * [+]new feature  [*]improvement  [!]change  [x]bug fix
 *
 * [*] 2012-04-26
 *     重构Timer模块，跟真实时间相关的逻辑只在这里处理
 * [x] 2011-04-26
 *     重写努力精确计时的算法
 * [*] 2011-01-13
 *     改为使用本地时间计时，避免额外(setInterval等导致的)误差的累计
 */
KISSY.add('gallery/countdown/1.1/timer', function (S) {
        // fns 中的元素都是二元组，依次为：
        //   frame {function}   帧函数
        //   frequency {number} 1代表帧频率是1000次/s，0代表帧频率是100次/s
    var fns = [],
        // 操作指令
        commands = [];

    /**
     * timer
     * 调用频率为100ms一次。努力精确计时，调用帧函数
     */
    function timer() {
        // 为避免循环时受到 对fns数组操作 的影响,
        // add/remove指令提前统一处理
        while (commands.length) {
            commands.shift()();
        }

        // 循环每次把frequency+2。对应 frequency 为1的，当frequency是21时，调用fn；frequency为0的，每次都调用fn;
        for (var i = 0, len = fns.length; i < len; i += 2) {
            // 每次加2，可保留末位
            fns[i + 1] += 2;
            //  1   第10次值为21
            //  0   是偶数就可以
            if (fns[i + 1] === 21 || (fns[i + 1] & 1) === 0) {
                fns[i]();
                // 保留末位，其它位置0
                fns[i + 1] &= 1;
            }
        }

        // 计算新时间，调整diff
        timer.nextTime += 100;

        var diff = timer.nextTime - (+new Date());
        diff = diff > 0 ? diff : 0;

        setTimeout(timer, diff);
    }
    // 首次调用
    timer.nextTime = +new Date();
    timer();

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
                if (i !== -1) {
                    fns.splice(S.indexOf(fn, fns), 2);
                }
            });
        }
    };
});

/**
 * NOTES: 
 * Firefox 5+, Chrome 11+, and Internet Explorer 10+ change timer resolution in inactive tabs to 1000 milliseconds. [http://www.nczonline.net/blog/2011/12/14/timer-resolution-in-browsers/, https://developer.mozilla.org/en/DOM/window.setTimeout#Inactive_tabs]
 */
