KISSY.add("gallery/starrating/1.0/index",function(S, SL){
    return SL;
}, {
    requires:["./starrating"]
});/**
 * @fileoverview Star Rating
 * @desc 评价星打分
 * @author 乔花<shengyan1985@gmail.com>
 */

KISSY.add('gallery/starrating/1.0/starrating', function(S, undefined) {
    var DOT = '.', EMPTY = '';

    function StarRating(config) {
        StarRating.superclass.constructor.apply(this, arguments);

        this._init();
    }
    StarRating.ATTRS = {
        /**
         * 打分容器
         * @type String|HTMLElement|KISSY.Node
         */
        container: {
            setter: function(v) {
                if (S.isString(v)) {
                    return S.one(v);
                }
                if (v.offset) return v;
                return new S.Node(v);
            }
        },
        /**
         * 默认的原因列表
         * @type Array<String>
         */
        reason: {
            value: []
        },
        /**
         * 满意程度描述列表
         * @type Array<String>
         */
        level: {
            value: []
        },
        /**
         * 提示浮层类
         * @type String
         */
        tipsCls: {
            value: 'rating-tips'
        },
        /**
         * 每个打分项类
         * @type String
         */
        itemCls: {
            value: 'shop-rating'
        },
        /**
         * 浮层样式类
         * @type String
         */
        popCls: {
            value: 'rating-pop-tip'
        },
        /**
         * 当前项类
         * @type String
         */
        currentCls: {
            value: 'current-rating'
        },
        /**
         * 结果类
         * @type String
         */
        resultCls: {
            value: 'result'
        },
        /**
         * 取值属性
         * @type String
         */
        valueName: {
            value: 'data-star-value'
        }
    };

    S.extend(StarRating, S.Base, {
        _init: function() {
            var self = this;

            var container = self.get('container');
            if (!container) return;

            var reason = self.get('reason'), level = self.get('level'),
                currentCls = self.get('currentCls');
            container.all(DOT+self.get('itemCls')).each(function(item, i) {
                if (!reason[i]) reason[i] = [];

                item.all('a').each(function(a, j) {
                    reason[i][j] = reason[i][j] || EMPTY;
                    level[j] = level[j] || EMPTY;

                    var sc = a.attr(self.get('valueName')),
                        rs = reason[i][j];

                    a.on('click', function(ev) {
                        ev.halt();

                        item.all(DOT+currentCls).removeClass(currentCls);
                        a.addClass(currentCls);

                        container.all(DOT+self.get('tipsCls')).hide();
                        item.one('input').val(sc);
                        item.one(DOT+self.get('resultCls')).html('<span><em>' + sc + '</em> 分</span> - <strong>' + rs + '</strong>');

                        self.fire('rating', {idx: i, score: sc});

                    }).on('mouseenter', function(e) {
                        var obj = new S.Node(e.currentTarget),
                            offset = obj.offset(),
                            coffset = container.offset();

                        container.all(DOT+self.get('popCls'))
                            .html('<span><em>' + sc + '</em> 分 ' + level[j] + '</span><strong>' + rs + '</strong>')
                            .css({
                                'left': offset.left + obj.width() - coffset.left - 100+ 'px',
                                'top': offset.top - coffset.top + obj.height() + 'px'
                            }).show();
                    }).on('mouseleave', function() {
                        container.all(DOT+self.get('popCls')).hide();
                    });

                    // ie6 change a class to his parent
                    try {
                        if (S.UA.ie === 6) {
                            a.parent().addClass(a.attr('class').split()[0]);
                        }
                    } catch(e) {}
                });
            });
        }
    });

    //兼容 1.1.6
    S.namespace('Gallery');
    S.Gallery.StarRating = StarRating;

    return StarRating;
});
