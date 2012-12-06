搜索提示的更多定制
======================================

Class
-----------------------------------------------

  * :class:`Suggest`

搜索提示的更多定制
--------------------------------------------------

    .. raw:: html

        <iframe width="100%" height="340" class="iframe-demo" src="../../../src/raw/demo/demo5.html"></iframe>


    没错, 上面这个就是淘宝首页的搜索框完整代码, 里面定制了很多, 例如, 不同tab公用一个suggest, 定制页脚, 替换返回数据等, 具体分析如下;

    **不同tab切换时, 关闭/开启suggest, 或者设置不同的数据源**

    .. code-block:: javascript

        // 切换逻辑
        // __fp_sug 是对 suggest 封装了一层, 其中的 sug 对象就是一个 Suggest 实例
        switchToTab = function(n) {
            if (!__fp_sug) return;

            // 设置不同的数据源
            if (n == 1) {
                __fp_sug.sug.dataSource = 'http://suggest.taobao.com/sug?area=b2c&code=utf-8&extras=1&callback=KISSY.Suggest.callback';
            } else {
                __fp_sug.sug.dataSource = 'http://suggest.taobao.com/sug?code=utf-8&extras=1&callback=KISSY.Suggest.callback';
            }
            // 由于多个数据源共享一个数据源的, 其中每次请求回来的数据都会被缓存下来, 当切换tab时, 需要清空下之前旧tab时的提示数据, 不然当不同tab, 输入相同关键词, 就不会触发请求, 导致提示层数据相同
            __fp_sug.sug._dataCache = {};

            // 当切换到特定tab时, 开启/关闭提示, .ON 为自定义的属性, 不是suggest内置的属性, 他的用处见下:
            var curRel = searchType.value;
            __fp_sug.ON = curRel === 'item' || curRel === 'mall';
        };

        // 绑定sug的 beforeStart 事件, 当 beforeStart 返回 false 时, 不去请求数据源, 进而不更新提示层数据
        // 结合之前的 ON 属性, 给特定tab不发送请求,及开启/关闭搜索提示
        __fp_sug.sug.on('beforeStart', function(e) {
            return self.ON;
        });

    **设置页脚** , 当输入特定的关键词时, 更改页脚内容

    .. code-block:: javascript

        // 绑定 updateFooter 事件, 该事件会在每次数据返回更新提示层数据后触发
        sug.on('updateFooter', self._updateFooter, self);

        // _updateFooter 代码片段
        function(evt) {
            var self = this,
                sug = self.sug;

            // ...
            sug.footer.appendChild(D.create('<div class="my-box">'));
        },

    **动态修改数据或插入特定数据**


    .. code-block:: javascript

            // 当请求数据返回的时候, 修改返回的数据
            sug.on('dataReturn', function() {
                this.returnedData['result'] = ['返回结果只有一条数据了'];

                this.rawData = this.returnedData;
            });

            // 当显示之前, 添加数据到指定位置
            sug.on('beforeShow', self._beforeShow, self);

            // self._beforeShow 片段
            var self = this,
                sug = self.sug,
                cateString = '',
                q = S.trim(self.q.val());

            S.each([['新数据1', 'id1'],['新数据2', 'id2']], function(cate, i) {
                cateString += '<li class="ks-suggest-extras-my" key="'+q+'" ><span class="ks-suggest-key">' + q + '</span>'+cate[0]+'</span></li>';
            });
            if (cateString) {
                D.prepend(D.create(cateString), sug.content.firstChild);
            }


