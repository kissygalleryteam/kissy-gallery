KISSY.add("gallery/pagination/1.1/index",function(S, PG){
    return PG;
}, {
    requires:["./pagination"]
});/**
 * @fileoverview Pagination
 * @desc 分页组件
 * @author 乔花<shengyan1985@gmail.com>
 * @date 20110918
 * @version 1.0
 * @depends kissy, template
 */
KISSY.add('gallery/pagination/1.1/pagination', function(S, Template, undefined) {
    var EVENT_PAGE_BEFORE = 'beforePageChange',
        EVENT_PAGE_AFTER = 'afterPageChange',  // 其实是和 afterCurrentPageChange 等价的
        ENTER = 13,

        DEFAULT_TPL = '';

    // 添加for语句
    Template.addStatement('for', {
        start: 'for(KS_TEMPL_STAT_PARAM){',
        end: '}'
    });
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
         * 点击分页项时, 调用的函数
         * @type Function
         * 带三个参数:
         *  - idx: 新页号
         *  - pg obj: 当前分页对象
         *  - ready: fn 供外部调用者, 当切换好页时, 更新分页HTML等后续操作
         */
        callback: {
            value: function(idx, pg, ready) {
                ready(idx);
            }
        },
        /**
         * 当前页序号
         * @type Number
         */
        currentPage: {
            value: 1,
            setter: function(v) {
                return parseInt(v);
            }
        },
        /**
         * 点击页号时, url 变化, 暂时不实现
         */
        linkTo: {
            value: '#'
        },
        /**
         * 显示多少页.
         * - 当为0时, 表示只显示上一页/下一页
         * - ... prev1 prev2 current next1 next2 ...
         * @type Number
         */
        displayPageCount: {
            value: 2,
            setter: function(v) {
                return parseInt(v);
            }
        },
        /**
         * 总是显示前x页或后x页.
         * @type Number
         */
        alwaysDisplayCount: {
            value: 1,
            setter: function(v) {
                return parseInt(v);
            }
        },
        /**
         * 总共多少页, 当不设值该值时, 不能计算页码, 只能显示上一页和下一页
         * @type Number
         */
        totalPage: {
            value: 0,
            setter: function(v) {
                if (v) this.set('endPage', v + this.get('firstPage') - 1);
            }
        },
        /**
         * 首页序号, 首页序号从哪边开始计
         * @type Number
         */
        firstPage: {
            value: 1,
            setter: function(v) {
                return parseInt(v);
            }
        },
        /**
         * 末页序号
         * @private
         * @type Number
         */
        endPage: {
            value: 0
        },
        /**
         * 是否有下一页, 供那些不明确页数情况下使用, 需要后台接口给出
         * @type Boolean
         */
        hasNext: {
            value: true
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
        loadCurrentPage: {
            value: true
        },
        /**
         * 分页模板
         * @type String
         */
        template: {
            value: DEFAULT_TPL
        },
        /**
         * 钩子标志, 点击元素上如果有该标志, 需要跳转到特定页
         * @type String
         */
        pageRedirectHook: {
            value: 'data-page'
        },
        /**
         * 分页器加载数据状态标志
         * @type Boolean
         * @private
         */
        isLoading: {
            value: false
        },
        /**
         * 定制事件支持
         * @type Object  such as:
         * {
         *     'J_className1': {
         *         click: function(e) {
         *              // do sth
         *         }
         *     }
         *     'J_className2': {
         *         click: "page"
         *     }
         * }
         */
        events: {
            value: {}
        }
    };
    S.extend(Pagination, S.Base, {
        _init: function() {
            var self = this;

            // 载入第一页
            if (self.get('loadCurrentPage')) {
                self.page(self.get('currentPage'));
            } else {
                self.update();
            }
            self._bind();
        },
        /**
         * 根据当前状态, 构建HTML
         */
        update: function() {
            var self = this,
                currentPage = self.get('currentPage'),
                // 最多显示多少个页数
                displayPageCount = self.get('displayPageCount'),
                // 起始页/末页序号
                firstPage = self.get('firstPage'), endPage = self.get('endPage'),
                // 前后总是显示多少页
                alwaysDisplayCount = self.get('alwaysDisplayCount'),
                // 起始页码
                startIndex, endIndex,
                // 是否要缩略显示页码
                ellipseText = self.get('ellipseText');

            // 需要显示省略号时, 需要确定显示页码区间
            if (endPage && ellipseText) {
                startIndex = Math.min(Math.max(firstPage, parseInt(currentPage - displayPageCount)), endPage - displayPageCount * 2);
                endIndex = Math.min(endPage, startIndex + displayPageCount * 2);
            }
            // 否则就是全部显示页码, 且此时 alwaysDisplayCount 无效,
            // displayPageCount 只取 0 或非 0. falsy 不显示页码, truth 显示页码
            else if (endPage) {
                startIndex = firstPage;
                endIndex = endPage;
            }

            S.log([currentPage, ellipseText, firstPage, endPage, alwaysDisplayCount, !!displayPageCount, Math.max(startIndex, firstPage), Math.min(endIndex, endPage), self.get('hasNext')]);
            self.get('container').html(Template(self.get('template')).render({
                currentPage: currentPage,
                ellipseText: ellipseText,
                startPage: firstPage,
                endPage: endPage,
                alwaysDisplayCount: alwaysDisplayCount,
                showPageNum: !!displayPageCount,
                startIndex: Math.max(startIndex, firstPage),
                endIndex: Math.min(endIndex, endPage),
                hasNext: self.get('hasNext')
            }));

            self.fire(EVENT_PAGE_AFTER, {idx: currentPage});
        },
        /**
         * 绑定点击事件, 做页面切换
         */
        _bind: function() {
            var self = this,
                container = self.get('container'),
                pageTo = function(e) {
                    var target = new S.Node(e.target),
                        hook = parseInt(target.attr(self.get('pageRedirectHook')));
                    if (isNaN(hook)) return;

                    e.preventDefault();
                    if (self.get('isLoading')) return;

                    self.page(hook);
                };

            container.on('click', pageTo)/*.on('keyup', function(e) {
                if (e.keyCode === ENTER) {
                    pageTo(e);
                }
            })*/;


            // 用户定制事件
            var eventsCfg = self.get('events'),
                eventsList = [];
            // 依次找到所有事件类型
            S.each(eventsCfg, function(eventsObj) {
                S.each(eventsObj, function(fn, events) {
                    eventsList.push(events);
                });
            });
            S.each(eventsList, function(events) {
                // 仿事件代理
                container.on(events, function(e) {
                    var target = new S.Node(e.target),
                        runList = [];
                    while(target && target[0] !== container[0]) {
                        // 触发特定钩子上的特定事件
                        S.each(eventsCfg, function(eventsObj, cls) {
                            if (target.hasClass(cls)) {
                                S.isFunction(eventsObj[events]) && runList.push(eventsObj[events]);
                            }
                        });
                        // 往上遍历, 有时 target 会被删除掉
                        target = target.parent();
                    }

                    // 依次执行
                    S.each(runList, function(fn) {
                        fn.call(self, e);
                    });
                });
            });
        },
        /**
         * 跳转到第几页
         * @param idx
         */
        page: function(idx) {
            idx = parseInt(idx);
            if (isNaN(idx)) return;

            var self = this,
                endPage = self.get('endPage');

            if (self.fire(EVENT_PAGE_BEFORE, {idx: idx}) === false) return;

            // 防止重复切换
            self.set('isLoading', true);

            // 分页器切换到特定页时的状态
            self.set('currentPage', idx);

            // 完整性考虑, 当能取到 endPage 时, 也去更新下 hasNext 值
            // 当没法取到 endPage 时, 只能依赖后台或外部设定 hasNext 值后才能更新分页器, 代码即 ready 中的 代码
            if (endPage)  {
                self.set('hasNext', idx < endPage);
                self.update();
            }

            // 加载完某页后续工作
            function ready() {
                if (!endPage) {
                    self.update();
                }
                self.set('isLoading', false);
            }
            var cb = self.get('callback');
            S.isFunction(cb) && cb(idx, self, ready);
        },
        destroy: function() {
            var self = this;
            // 删除所有事件!!
            self.get('container').detach();
            self.get('container').remove();
        }
    });

    return Pagination;
}, {
    requires: ["gallery/template/1.0/index"]
});
/**
 * - 抽离分页HTML模板, 更加定制 --- 20111108 Done;
 * - 起始页/最终页 --- 20111109 Done;
 * - 跳转页框 --- 20111110 Done;
 * - aria/tabindex --- 参考了现有组件, 貌似没有都没有考虑, 暂时去掉 tabElem[0].focus()
 */
