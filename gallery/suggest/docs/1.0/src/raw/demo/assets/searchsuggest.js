/**
 * @fileoverview 搜索提示逻辑
 * @author 乔花<qiaohua@taobao.com>
 * @depends: ks-core, suggest
 *
 * CHANGELOG:
 *  2011-06-16: 将搜索框中的搜索提示从 searchform.js 中拆分开来
 *  2011-06-20: - 加入手机充值提示, 从充值本地存储中读取
 *              - 搜索提示中加入类目信息
 *              - 搜索关键词后缀加粗显示
 *  2011-06-29: - 加入埋点逻辑
 *              - 机票表单支持 tab
 *  2011-08-08: - 加入相关配置接口, 见 http://wiki.ued.taobao.net/doku.php?id=team:search:f2e:readme:taobao:searchsuggest
 *              - 功能逻辑没变
 *
     new S.SearchSuggest({
         'q': q,
         'form': form,
         // 'placeholder': 'data-default',
         resultFormat: ''
     });
 */

/**
 * Flash 本地存储
 */
var FlashStorage = (function() {
    var src = 'http://a.tbcdn.cn/apps/tbskip/public/flashStorage.swf?t=20110224',
        bridge = null;
    var read = function(key, tryCount) {
        var that = this;
        if (tryCount === undefined) {
            tryCount = 200;
        }
        if (tryCount === 0) {
            return false;
        }
        try {
            return bridge.read(key);
            } catch (e) {
            setTimeout(function() {
                that.read(key, tryCount - 1);
            }, 0);
        }
    };
    var readWithCB = function(key, callbackObj, tryCount) {
        var that = this,
            val;
        if (tryCount === undefined) {
            tryCount = 200;
        }
        if (tryCount === 0) {
            callbackObj.onFailure();
            return false;
        }
        try {
            val = bridge.read(key);
            callbackObj.onSuccess(val);
        } catch (e) {
            setTimeout(function() {
                that.readWithCB(key, callbackObj, tryCount - 1);
            }, 0);
        }
    };
    var save = function(key, value, tryCount) {
        var that = this;
        if (tryCount === undefined) {
            tryCount = 200;
        }
        if (tryCount === 0) {
            return false;
        }
        try {
            bridge.save(key, value);
        } catch (e) {
            setTimeout(function() {
                that.save(key, value, tryCount - 1);
            }, 0);
        }
    };
    var addFlash = function(appendTo) {
        var doc = document,
            container = doc.createElement('div'),
            htmlStr = '';

        container.id = 'storagetool';
        container.style.height = 0;
        container.style.overflow = 'hidden';

        htmlStr += '<object id="J_FlashStorageObj" name="J_FlashStorageObj" ';
        htmlStr += 'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="1" height="1" ';
        htmlStr += 'codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab">';
        htmlStr += '<param name="movie" value="' + src + '" />';
        htmlStr += '<param name="allowScriptAccess" value="always" />';
        htmlStr += '<embed name="J_FlashStorageEmbed" src="' + src + '" width="1" height="1" ';
        htmlStr += 'allowScriptAccess="always" type="application/x-shockwave-flash" ';
        htmlStr += 'pluginspage="http://www.adobe.com/go/getflashplayer">';
        htmlStr += '</embed></object>';

        appendTo = appendTo || doc.body;
        appendTo.appendChild(container);
        container.innerHTML = htmlStr;
        if (navigator.appVersion.indexOf('MSIE') !== -1) {
            //IE
            container.style.zoom = 1;
            container.style.filter = 'alpha(opacity=' + 10 + ')';
            bridge = window['J_FlashStorageObj'];
        } else {
            container.style.opacity = 0.1;
            bridge = doc['J_FlashStorageEmbed'];
        }
    };
    return {
        init: function(config) {
            config = config || {};
            addFlash(config.appendTo);
            this.hasInit = true;
        },
        read: read,
        readWithCB: readWithCB,
        save: save,
        hasInit: false
    };
})();


KISSY.add('searchsuggest', function(S, Suggest,undefined) {
    var D = S.DOM, E = S.Event,

        //记录当显示机票搜索提示时的query是什么，当用户再次输入此query时，由于内容是直接取自缓存的，无法重内容中判断。
        //可以通过这里的标记判断是显示同店购还是机票搜索提示
        jipiaoQuery = {},
        PLACEHOLDER;

    function SearchSuggest(config) {
        SearchSuggest.superclass.constructor.call(this, config || {});
        
        var self = this;
        // 输入框
        self.q = S.one(self.get('q'));
        // 对应的表单
        self.form = S.one(self.get('form'));
        if (!self.q || !self.form) return;

        // 开启提示标志
        self.ON = true;

        PLACEHOLDER = self.get('placeholder');
        
        self._init();
        self._bind();
    }

    S.extend(SearchSuggest, S.Base);

    SearchSuggest.ATTRS = {
        q: {            // 必设, input 元素
            value: undefined
        },
        form: {         // 必设, 所属表单, 提示层上点击/回车都会触发表单提交
            value: undefined
        },
        placeholder: {  // input 的默认值的属性名
            value: 'placeholder'
        },
        sourceUrl: {    // 设置 suggest 默认数据源 url
            value: 'http://suggest.taobao.com/sug?extras=1&code=utf-8'
        },
        telphone: {     // 是否加入本地充值记录提示功能
            value: true
        },
        category: {     // 是否加入子目录功能
            value: true
        },
        keyword: {      // 是否加入后缀关键词高亮
            value: true
        },
        topbar: {       // 是否加入排行榜功能
            value: true
        },
        jp: {           // 是否加入机票提示功能
            value: true
        },
        tdg: {          // 是否加入同店购功能
            value: true
        },
        sugConfig: {    // suggest 配置
            value: {
                resultFormat: '约%result%个宝贝'
            }
        }
    };
    S.augment(SearchSuggest, S.EventTarget, {
        _init: function() {
            var self = this;

            self.sug = new Suggest(self.q, self.get('sourceUrl'), self.get('sugConfig'));

            S.ready(function() {
                D.addStyleSheet(
                    '.ks-suggest-container {overflow: hidden;}' +
                    // 类目
                    '.ks-suggest-container .ks-suggest-cate {color: #7e7e7e; margin-left: 8px;}'+
                    // 充值记录
                    '.ks-suggest-container .ks-suggest-extras-tc {padding-left: 30px; background-image: url(http://img03.taobaocdn.com/tps/i3/T18K9gXlBzXXXXXXXX-16-36.png);background-position: 8px 3px;background-repeat:no-repeat }' +
                    '.ks-suggest-container .ks-suggest-extras-tc .ks-suggest-key {float: none;font-weight: bold;padding: 0 2px;}' +
                    '.ks-suggest-container .ks-selected {background-position: 8px -17px;}' +
                    // 机票搜索
                    '.ks-suggest-footer .jipiao-box {height:22px;}' +
                    '.ks-suggest-footer .jipiao-box input{width:32px;color:#333;border: 1px solid #A6A6A6;padding: 1px;height: 18px;}' +
                    '.ks-suggest-footer .jipiao-box .input-date{width:72px;}' +
                    '.ks-suggest-footer .jipiao-box em{font-size:12px;font-weight:normal;line-height:18px;}' +
                    '.ks-suggest-footer .jipiao-box h5{background:url(http://img02.taobaocdn.com/tps/i2/T1QQOXXnlqXXXXXXXX-73-15.png) no-repeat;width:73px;height:15px;margin-top:3px;}' +
                    '.ks-suggest-footer .jipiao-box h5 a{display:block;width:73px;height:15px;}' +
                    // 排行榜
                    '.ks-suggest-extras-top {padding: 2px 0 5px !important;}' +
                    '.ks-suggest-extras-top .ks-suggest-key {float: left; padding-left: 5px;}' +
                    '.ks-suggest-extras-top .ks-suggest-top-link { padding: 0 5px 0 20px; float: right;color: #008001;}' +
                    '.ks-suggest-top-link s { position:absolute; width:16px; height:16px;overflow:hidden; margin-left:-25px; margin-top:2px;}' +
                    '.ks-suggest-extras-top .ks-suggest-key { background: url(http://img02.taobaocdn.com/tps/i2/T1IyhRXaREXXXXXXXX.png) no-repeat 3px 0;color:#057BD2; font-weight:bold; padding-left:26px;}' +
                    // 搜索同店购
                    '.ks-suggest-footer { background: #f4f8fb; border-top: 1px solid #dfeffc; padding: 5px !important;zoom: 1;}' +
                    '.ks-suggest-footer .tdg-box {height:22px;}' +
                    '.ks-suggest-footer h5,.ks-suggest-footer em,.ks-suggest-footer input { float: left;}' +
                    '.ks-suggest-footer h5,.ks-suggest-footer .tdg-btn {background: transparent url(http://img04.taobaocdn.com/tps/i4/T1NpJOXiVpXXXXXXXX.png) no-repeat 999em 0; text-indent: -999em;}' +
                    '.ks-suggest-footer h5 {float: left; width: 49px; height: 20px; background-position: 0 0; margin-right: 11px;}' +
                    '.ks-suggest-footer em {font: bold 14px tahoma; color: #a7a7a7;padding: 2px 3px;}' +
                    '.ks-suggest-footer .tdg-btn {width: 60px;height: 20px; border: none; background-position: -49px 0; position: absolute;right: 5px; cursor: pointer;}' +
                    '.ks-suggest-footer .tdg-input {border: 1px solid #a6a6a6;padding: 1px; width: 80px; color: #bababa;height: 18px;}'
                );
            });
        },
        _bind: function() {
            var self = this,
                sug = self.sug;

            // 特定tab不发送请求
            sug.on('beforeStart', function(e) {
                return self.ON && (self._loading = true);
            });

            sug.on('dataReturn', function() {
                if (self.get('telphone')) {
                    // 加入本地手机号的查询数据
                    var newVal = S.trim(self.q.val()),
                        telData = [], idx = 0;
                    if (isDigital(newVal) && self._telHistory.length > 0) {
                        // 顺序以最近时间最前显示
                        for (var i = self._telHistory.length - 1; i > -1; i -= 2) {
                            if (self._telHistory[i - 1].indexOf(newVal) === 0) {
                                telData[idx++] = self._telHistory[i - 1];
                            }
                        }
                    }
                    self._telItemNum = telData.length;
                    S.each(this.returnedData['result'], function(obj) {
                        telData[idx++] = obj;
                    });
                    this.returnedData['result'] = telData;
                }

                this.rawData = this.returnedData;

                self._loading = false;
            });

            sug.on('beforeShow', self._beforeShow, self);
            sug.on('beforeSubmit', self._beforeSubmit, self);
            sug.on('updateFooter', self._updateFooter, self);
            self._bindInput();
        },
        /**
         * 显示提示层之前, 添加某些项目
         */
        _beforeShow: function() {
            var self = this;
            self.get('topbar') && self._topbar();
            self.get('telphone') && self._telphone();
            self.get('category') && self._category();
            self.get('keyword') && self._keyword();
        },
        /** 根据返回的 extrasData 数据(排行榜) 添加到提示层中
         * TB.Suggest.callback({"result": [],"extras": {"top":["手机排行榜","fcat=TR_SM&up=false&scat=TR_SJ"]}})
         *  http://top.taobao.com/?from=taobao_index
         */
        _topbar: function() {
            var self = this,
                sug = self.sug, list,
                extrasData = sug.rawData['extras'],
                topLink, topData;
            if (extrasData && (topData = extrasData.top)) {
                list = sug.content.firstChild;
                sug.extrasTopData = topData;

                topLink = document.createElement('LI');
                topLink.className = 'ks-suggest-extras-top';
                topLink.innerHTML = '<span class="ks-suggest-key">' + topData[0] + '</span>' +
                    '<span class="ks-suggest-top-link"><s></s>最权威的购物排行榜!</span>';
                list.appendChild(topLink);
            }
        },
        /**
         * 根据本机手机记录, 添加到提示层中
         */
        _telphone: function() {
            var self = this,
                sug = self.sug,
                telIdx = self._telItemNum;

            S.each(D.query('li', sug.content), function(obj, idx) {
                if (idx < telIdx) {
                    D.addClass(obj, "ks-suggest-extras-tc");
                    D.html(obj, '给'+D.html(obj)+'充值');
                }
            });
        },

        /**
         * 当用户在搜索框输入query, 命中后台特定词表时, 下拉框的第一条或前两条(不超过2条), 推荐该类型的词条
         * TB.Suggest.callback({"result": [],cat:[["cat_name","cat_id"],["cat_name","cat_id"]]})
         */
        _category: function() {
            var self = this,
                sug = self.sug,
                cateData = sug.rawData['cat'],
                cateString = '',
                q = S.trim(self.q.val());

            if (!cateData) return;
            
            S.each(cateData, function(cate, i) {
                var qsug = cate[2] || q;
                cateString += '<li date-index=' + i + ' class="ks-suggest-extras-cate" key="'+qsug+'" data-cateId="'+cate[1]+'"><span class="ks-suggest-key">' + qsug + '</span><span class="ks-suggest-cate">在<b>'+cate[0]+'</b>分类下搜索</span></li>';
            });
            if (cateString) {
                D.prepend(D.create(cateString), sug.content.firstChild);
            }
        },
        /**
         * 关键词后缀加粗显示
         */
        _keyword: function() {
            var self = this,
                sug = self.sug,
                ori = sug.query,
                idx = ori.length;

            S.each(D.query('li', sug.content), function(obj) {
                if ((D.hasClass(obj, 'ks-odd') || D.hasClass(obj, 'ks-even'))) {
                    var k = D.get('.ks-suggest-key', obj), s = D.html(k);
                    if (s.indexOf(ori) === 0) {
                        D.html(k, s.substring(0, idx) + '<b>' + s.substring(idx, s.length) + '</b>');
                    }
                }
            });
        },
        /* 表单提交前, 看是否是排行榜
         * 其他
         */
        _beforeSubmit: function() {
            var self = this,
                sug = self.sug,
                q = sug.textInput.value,
                wq = sug.query,
                writeSource = false,
                form = self.form,
                current = sug.selectedItem;

            if (self._loading) return;

            if (current && current.className) {
                var par = current.parentNode, cls = current.className,
                allItems = D.query('li', par), index = 1;

                S.each(allItems, function(item, i) {
                    if (item == current) {
                        index = i + 1;
                        return false;
                    }
                });

                //埋点标志
                //  普通词 = 0_B;
                //  分类目 = cat_B;
                //  手机充值= flt_B;
                //  机票 = celnum_B
                //
                //  (理论上这个英文缩写的对应有错，
                //  但鉴于php那边也是这样对应，咱们将错就错了吧)
                //
                //B为选项的index
                var suggest_tag = '0';

                function hasCls(cls) {
                    return current.className.indexOf(cls) > -1;
                }

                if (hasCls('ks-suggest-extras-top')) {
                    location.href = 'http://top.taobao.com/?from=sr_top_combobox&' + sug.extrasTopData[1];
                    return false;
                } else
                // 在特定类目中
                if (hasCls('ks-suggest-extras-cate')) {
                    writeHiddenInput('cat', D.attr(sug.selectedItem, 'data-cateId'), form);
                    suggest_tag = 'cat';
                } else
                //手机充值
                if (hasCls('ks-suggest-extras-tc')) {
                    suggest_tag = 'celnum';
                } else
                //机票
                if (hasCls('ks-suggest-extras-jp')) {
                    suggest_tag = 'flt';
                }

                writeHiddenInput('suggest', suggest_tag + '_' + index, form);
                writeSource = true;
            }

            if (writeSource) {
                // 指明是从搜索提示来的
                writeHiddenInput('source', 'suggest', form);
                if (q != wq) {
                    // 用户原始输入关键词
                    writeHiddenInput('wq', wq, form);
                }
            }
        },
        /**
         * 更新页底, 主要是机票/同店购逻辑
         * @param evt
         */
        _updateFooter: function(evt) {
            var self = this,
                sug = self.sug,
                // jipiaoData = {"jipiao":["出发城市","到达城市"]}
                jipiaoData = sug.rawData['jipiao'] || jipiaoQuery[evt.query];

            if (self.get('jp') && jipiaoData && jipiaoData.length > 1) {
                self._jipiao(evt, jipiaoData);
            } else if (self.get('tdg')) {
                self._tdg(evt);
            }
        },
        _jipiao: function(evt, jipiaoData) {
            var self = this,
                sug = self.sug,
                _q = evt.query;

            // 给提示层各项加入 ks-suggest-extras-jp
            S.each(D.query('li', sug.content), function(obj, idx) {
                if (idx > 2) return false;
                if (D.hasClass(obj, 'ks-odd') || D.hasClass(obj, 'ks-even')) {
                    D.addClass(obj, 'ks-suggest-extras-jp');
                }
            });
            jipiaoQuery[_q] = jipiaoData;

            // 显示机票搜索框 {{{
            var date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1),
                yyyy = date.getFullYear(),
                MM = date.getMonth() + 1,
                DD = date.getDate(),
                fullDate = yyyy + "-" + MM + "-" + DD,
                jipiaoBox = D.create('<div class="jipiao-box">'),
                jipiaoForm = D.create('<form target="_top" action="http://s.taobao.com/search" method="get"></form>');

            jipiaoForm.innerHTML = '<h5><a target="_blank" href="http://trip.taobao.com">淘宝旅行</a></h5>' +
                '<em>出发</em><input id="J_SugJiPiaoSCity" type="text" class="jp-input"  tabindex="0" value="' + jipiaoData[0] + '"><em>+</em>' +
                '<em>到达</em><input id="J_SugJiPiaoACity" type="text" class="jp-input"  tabindex="1" value="' + jipiaoData[1] + '"><em>+</em>' +
                '<em>日期</em><input id="J_SugJiPiaoSTime" type="text" class="jp-input input-date"  tabindex="2" value="' + fullDate + '">' +
                '<input type="hidden" id="J_ETQuery" name="jp_et" value="">' +
                '<input id="J_JiPiaoForm" type="hidden" name="q" value="' + evt.query + '">' +
                '<button type="submit" class="tdg-btn">搜索</button> ';

            jipiaoBox.appendChild(jipiaoForm);
            sug.footer.appendChild(jipiaoBox);

            E.on(jipiaoForm, 'submit', function(evt) {
                var sc = D.get("#J_SugJiPiaoSCity");
                var ac = D.get("#J_SugJiPiaoACity");
                var st = D.get("#J_SugJiPiaoSTime");
                var etq = D.get("#J_ETQuery");
                //if(sc && sc.value == ""){
                //alert("请填写出发城市！");
                //sc.focus();
                //return false;
                //} else if(ac && ac.value == ""){
                //alert("请填写到达城市！");
                //ac.focus();
                //return false;
                //} else if(st && st.value ==""){
                //alert("请填写出发日期（yyyy-MM-DD）!");
                //st.focus();
                //return false;
                //}
                etq.value = 'tbsearch|' + sc.value + '|' + ac.value + '|' + st.value;
                try {
                    D.get("#J_JiPiaoForm").value = sc.value + " " + ac.value + " " + _q;
                } catch(e) {
                }
                return true;
            });
            // 机票输入框键盘Tab操作处理
            self._bindFooterTab(S.all('.jp-input', jipiaoBox));
        },
        _tdg: function(evt) {
            var self = this,
                sug = self.sug,
                // 默认显示同店购
                tdgBox, tdgForm, inputs;

            // 无结果就不显示同店购
            if (!sug.content.innerHTML) return;

            // 同店购表单HTML
            tdgBox = D.create('<div class="tdg-box">');
            tdgForm = D.create('<form method="get" action="http://s.taobao.com/search" target="_top"></form>');
            tdgForm.innerHTML = '<input type="hidden" name="q" />' +
                '<input type="hidden" value="tdg1" name="from" />' +
                '<h5>同店购：</h5>' +
                '<input type="text" value="第一件宝贝" class="tdg-input" tabindex="0" />' +
                '<em>+</em>' +
                '<input type="text" value="另一宝贝" class="tdg-input" tabindex="1" />' +
                '<em>+</em>' +
                '<input type="text" value="另一宝贝" class="tdg-input" tabindex="2" />' +
                '<button class="tdg-btn" type="submit" tabindex="3">搜索</button>';
            tdgBox.appendChild(tdgForm);

            // 同店购输入框逻辑
            inputs = S.all('.tdg-input', tdgBox);
            inputs.each(function(input, i) {
                input.attr(PLACEHOLDER, input.val());
                if (0 === i) {
                    input.val(evt.query).css('color', '#000');
                }
            });

            // 同店购输入框事件注册，处理函数定义在外部减少消耗
            inputs.on('focus', self._tdgInputFocusHandler);
            inputs.on('blur', self._tdgInputBlurHandler);

            // 同店购表单提交处理
            E.on(tdgForm, 'submit', function() {
                var queries = [], value;
                inputs.each(function(input) {
                    if ((value = input.val()) !== input.attr(PLACEHOLDER)) {
                        queries.push(value);
                    }
                });
                this['q'].value = queries.join(' + ');
            });

            // 同店购输入框键盘Tab操作处理
            self._bindFooterTab(inputs);

            // HTML注入页面
            sug.footer.appendChild(tdgBox);
        },
        _bindFooterTab: function(inputs) {
            var sug = this.sug;

            E.on(sug.footer, 'keydown', function(evt) {
                var index;
                if (9 === evt.keyCode) {
                    index = parseInt(D.attr(evt.target, 'tabindex'), 10);
                    if (index < 2) {
                        // if using focus(), may crash in fucking IE, but work fine
                        try {
                            index++;
                            inputs[index].focus();
                        } catch (ex) {
                        }
                    } else if (2 === index) {
                        D.get('button.tdg-btn', sug.footer).focus();
                    } else {
                        inputs[0].select();
                    }
                    evt.halt();
                }
            });
        },
        /**
         * 同店购输入框focus事件处理
         * @param evt
         */
        _tdgInputFocusHandler: function(evt) {
            var target = evt.target;
            if (S.trim(target.value) === D.attr(target, PLACEHOLDER)) {
                target.value = '';
            } else {
                target.select();
            }
            D.css(target, {
                color: '#000',
                borderColor: '#6694E3'
            });
        },

        /**
         * 同店购输入框blur事件处理
         * @param evt
         */
        _tdgInputBlurHandler: function(evt) {
            var target = evt.target;
            if (S.trim(target.value) === '') {
                target.style.cssText = '';
                target.value = D.attr(target, PLACEHOLDER);
            }
            D.css(target, 'borderColor', '#A6A6A6');
        },

        /**
         * 监听输入框, 显示本地手机号码逻辑
         */
        _bindInput: function() {
            var self = this;

            if (self.get('telphone')) {
                self._telHistory = [];

                S.ready(function() {
                    // 本地存储, 多个 flashstorage 只要初始化一次
                    if (!FlashStorage.hasInit) {
                        FlashStorage.init();
                    }

                    FlashStorage.readWithCB('TBTelNumHistory', {
                        onSuccess: function(val) {
                            S.log('loading TBTelNumHistory: ' + val);
                            // 最后的是最新的
                            if (val) self._telHistory = val.split(',');
                        },
                        onFailure: function() {
                            S.log('loading TBTelNumHistory failure');
                        }
                    });
                });
            }
        }/*,

        *
         * 根据 url 中 suggest 添加到 stats_show 参数中

        _rest: function() {
            S.ready(function() {
                if (window.maidian) {
                    var suggest = /&suggest=(\w+)&?/g.exec(document.location.href),
                        old = /&stats_show=(.+)&/g.exec(window.maidian);
                    if (suggest && suggest[1] && old && old[1]) {
                        window.maidian = window.maidian.replace(/&stats_show=(.+)&/g, '&stats_show='+old[1]+'%3Bsuggest%3A'+suggest[1]+'&');
                    }
                }
            });
        }*/
    });

    // 判断是否是3位-11位数字串
    function isDigital(str) {
        var pat = /^[0-9]{3,11}$/g;
        return pat.test(str);
    }

    /**
     * 写入input hidden串
     * @param {string} key 隐藏域的 name.
     * @param {string} value 隐藏域的值.
     * @param {HTMLElement} form  所在的表单，如果不指定，采用 #J_searchForm.
     */
    function writeHiddenInput(key, value, form) {
        if (!form) return;

        var hiddenInput = form[0][key];
        if (hiddenInput) {
            D.val(hiddenInput, value);
            S.log('input ' + key + ' now has value:' + hiddenInput.value);
        } else {
            hiddenInput = D.create('<input type="hidden" name="' + key + '" value="' + value + '" />');
            form.append(hiddenInput);
            S.log('new input ' + key + ' now has value:' + hiddenInput.value);
        }
        return hiddenInput;
    }
    
    return SearchSuggest;
},{
    requires:['gallery/suggest/1.0/']
});