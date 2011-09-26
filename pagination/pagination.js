/**
 * @fileoverview Pagenation
 * @desc 分页组件
 * @author 乔花<shengyan1985@gmail.com>
 * @date 20110918
 * @version 1.0
 */
KISSY.add('gallery/pagination', function(S, undefined) {
    /**
	 * 构造器
	 * @param {Object} cfg 配置参数
	 * @return
	 */
    function Pagination(cfg) {
        Pagination.superclass.constructor.apply(this, arguments);
        this._init();
    }
	
	//配置项
    Pagination.ATTRS = {
        /**
         * 分页的 DOM 容器
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
         * 样式前缀
         * @type String
         */
        cls: {
            value: 'pg-'
        },
        /**
         * 点击分页项时, 调用的函数
         * @type Function
         * 带三个参数:
         *  - idx: 新页号
         *  - pg obj: 当前分页对象
         *  - ready: fn 供外部调用者, 当切换好页时, 更新分页HTML等后续操作
         * note: 当 callback 返回 false 时, 停止事件冒泡
         */
        callback: {
            value: function(idx, pg, ready) {
                ready(idx);
                return false;
            }
        },
        /**
         * 当前页序号
         * @type Number 从0开始计
         */
        currentPage: {
            value: 0
        },
        /**
         * 点击页号时, url 变化, 暂时不实现
         */
        linkTo: {
            value: '#'
        },
        /**
         * 显示多少页.
         * - 取奇数
         * - 当为0时, 表示只显示上一页/下一页
         * @type Number
         */
        maxDisplayPageCount: {
            value: 5
        },
        /**
         * 总共多少页, 可不设
         * @type Number
         */
        totalPage: {
        },
        /**
         * 首页序号从哪边开始计
         * @type Number
         */
        firstPage: {
            value: 0
        },
        /**
         * 下一页文案
         * @type String
         */
        nextText: {
            value: '下一页'
        },
        /**
         * 是否有下一页, 供那些不明确页数情况下使用
         * @type Boolean
         */
        hasNext: {
            value: true
        },
        /**
         * 上一页文案
         * @type String
         */
        prevText: {
            value: '上一页'
        },
        /**
         * 是否省略多页
         * @type Boolean
         */
        ellipseText: {
            value: true
        },
        /**
         * 是否初始加载第一页
         * @type Boolean
         */
        loadFirstPage: {
            value: true
        }
    };
    S.extend(Pagination, S.Base, {
        _init: function() {
            var self = this;

            self.update();
            self._bind();

            // 载入第一页
            if (self.get('loadFirstPage')) {
                self.page(self.get('firstPage'));
            }
        },
        /**
         * 根据当前状态, 构建HTML
         */
        update: function() {
            var self = this,
                currentPage = self.get('currentPage'),
                cls = self.get('cls'),
                count = self.get('maxDisplayPageCount'),
                a = '', i, start, end, firstPage = self.get('firstPage'), endPage = self.get('totalPage');

            a += '<a href="#" class="' + cls + 'prev ' + (currentPage <= firstPage ? cls + 'disabled' : '') + '">' + self.get('prevText') + '</a>';
            if (count) {
                endPage -= 1;
                start = Math.max(firstPage, parseInt(currentPage - count / 2));
                end = Math.min(endPage, start + count);
                S.log([start, firstPage, end, endPage]);

                if (self.get('ellipseText') && start > firstPage) {
                    a += '<span class="' + cls + 'item">...</span>';
                }

                for (i = start; i <= end; i++) {
                    if (i !== currentPage) {
                        a += '<a href="#" class="' + cls + 'page ' + cls + 'item">' + (i + 1) + '</a>';
                    } else {
                        a += '<span class="' + cls + 'current ' + cls + 'item">' + (i + 1) + '</span>';
                    }
                }
                if (self.get('ellipseText') && end < endPage) {
                    a += '<span class="' + cls + 'item">...</span>';
                }

                // 判断是否具有下一页
                if (currentPage < endPage) self.set('hasNext', true);
            }

            a += '<a href="#" class="' + cls + 'next ' + (!self.get('hasNext') ? cls + 'disabled' : '') + '">' + self.get('nextText') + '</a>';

            self.get('container').html(a);
        },
        /**
         * 绑定点击事件, 做页面切换
         */
        _bind: function() {
            var self = this,
                cls = self.get('cls');

            self.get('container').on('click', function(e) {
                var target = new S.Node(e.target), idx = self.get('currentPage');
                if (target.hasClass(cls + 'disabled') || self.__loading) {
                    e.preventDefault();
                    return;
                } else if (target.hasClass(cls + 'page')) {
                    idx = parseInt(target.html()) - 1;
                } else if (target.hasClass(cls + 'prev')) {
                    idx -= 1;
                } else if (target.hasClass(cls + 'next')) {
                    idx += 1;
                } else {
                    return;
                }
                if (!self.page(idx)) e.preventDefault();
            });
        },
        page: function(idx) {
            var self = this,
                cb = self.get('callback');
            self.__loading = true;

            // 加载完某页后续工作
            function ready(idx) {
                self.set('currentPage', idx);
                self.update();
                self.__loading = false;
            }
            return cb(idx, self, ready);

        }
    });

	//私有方法

    //兼容 1.1.6
    S.namespace('Gallery');
    S.Gallery.Pagination = Pagination;

    return Pagination;
}, {
    requires: ["core"]
});


/**
 * - 抽离分页HTML模板, 更加定制;
 * - 起始页/最终页;
 * - 跳转页框;
 */