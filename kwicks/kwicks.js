/**
 * @fileoverview Kwicks Widget
 * @desc kwicks 动画效果
 * @author 乔花<qiaohua@taobao.com>
 */
 
KISSY.add('gallery/kwicks', function(S, Switchable) {

    var DOM = S.DOM, Event = S.Event, doc = document,

        /**
         * 默认配置, 可覆盖 Switchable 的默认配置
         */
        defaultConfig = {
            markupType: 1
        };

    /**
     * Kwicks Class
     * @constructor
     */
    function Kwicks(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Kwicks)) {
            return new Kwicks(container, config);
        }

        // 插入 kwicks 的初始化逻辑
        self.on('init', function() {
            init_kwicks(self);
        });

        // 调用 superclass 的构造器
        Kwicks.superclass.constructor.call(self, container, S.merge(defaultConfig, config));
    }

    // 扩展 Switchable
    S.extend(Kwicks, Switchable);

    /**
     * Kwicks 的初始化逻辑
     * 计算每个部分的平均显示区域位置
     */
    function init_kwicks(self) {
        var width = DOM.width(self.container) / self.panels.length,
            oft = DOM.offset(self.container);
        S.each(self.panels, function(t, i) {
            DOM.offset(t, {left: width * i + oft.left, top:oft.top});
        });
    }

    S.augment(Kwicks, {

        /**
         * 切换视图时的行为, 覆盖 superclass 的 _switchView
         */
        _switchView: function(fromPanels, toPanels) {
            var self = this,
                panelWidth = DOM.width(toPanels[0]),
                width = (DOM.width(self.container) - panelWidth) / (self.panels.length - 1),
                start = 0;

            // 更新每个子区域的位置
            S.each(self.panels, function(t, i) {
                //也可直接使用offset设置元素位置, 但就没有动画效果了
                S.Anim(t, {left: start + 'px'}, 0.4, S.Easing.easeOut).run();
                if (t === toPanels[0]) {
                    start += panelWidth;
                } else {
                    start += width;
                }
            });
        }
    });

    //兼容 1.1.6
    S.namespace('Gallery');
    S.Gallery.Kwicks = Kwicks;

    return Kwicks;
}, {
    requires: ["switchable"]
});