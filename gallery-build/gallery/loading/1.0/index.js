KISSY.add("gallery/loading/1.0/index",function(S, Loading){
    return Loading;
}, {
    requires:["./loading"]
});/**
 * @fileoverview loading
 * @desc 显示/关闭加载状态
 * @author fool2fish<fool2fish@gmail.com>
 */


KISSY.add('gallery/loading/1.0/loading', function(S, undefined) {

    var D = S.DOM, E = S.Event, doc = document;

    /**
     * 构造器
     * @param {String} [txt = '加载中，请稍候……'] 加载时显示的提示文字
     */
    function Loading(txt) {
        var self = this;
        self._txt = txt || '加载中，请稍候……';
        self._init();
    }

    S.augment(Loading, S.EventTarget, {
        _init:function() {
            var self = this;
            self._el = D.create('<div class="loading" style="display:none;"><div class="mask"></div><div class="text"><i>' + self._txt + '</i><div></div>');
            doc.body.appendChild(self._el);
        },
        /**
         * 显示加载状态
         * @param {HTMLElement | String} [refEl = document.body] 显示加载状态时，蒙版要遮罩的参考元素
         */
        show:function(refEl) {
            var self = this, el = self._el;
            if (S.isString(refEl)) refEl = D.get(refEl);
            refEl = refEl || doc.body;
            el.style.left = D.scrollLeft(refEl) + 'px';
            el.style.top = D.scrollTop(refEl) + 'px';
            el.style.width = D.width(refEl) + 'px';
            el.style.height = D.height(refEl) + 'px';
            el.style.display = 'block';
            self.fire('show');
        },
        /**
         * 隐藏加载状态
         */
        hide:function() {
            var self = this, el = self._el;
            el.style.display = 'none';
            self.fire('hide');
        }
    });

    return Loading;
});
