KISSY.add("gallery/combobox-suggest/0.1/index",function(S,Base,Event,ComboBox,undefined){
    var EventTarget = Event.Target,
    //提供一个局部变量，用来存储当前实例
        thisInst;
    function newSuggest(config) {
        newSuggest.superclass.constructor.call(this, config || {});
        //存储当前实例
        thisInst = this;
        //new后，立即执行init
        KISSY.sug = this._retSug;
        this.init();
    }
    S.extend(newSuggest, Base);
    newSuggest.ATTRS = {
        defaultExtra:{
            value: {
                "history": true,
                "tel": true,
                "cat": true,
                "global": true,
                "list": true,
                "new": true,
                "shop": true,
                "jipiao": true,
                "tdg": true,
                "showExtra": true
            }
        },
        sugConfig:{
            value:{
                //跳转需要附加的参数
                extraPassParams: "",
                //suggest接口需要的参数
                extraPostParams:"",
                sourceUrl: "",
                tab:"item",
                autoCollapsed: true,
                comboBoxCfg:{
                    focused: false,
                    hasTrigger:false,
                    matchElWidth: true,
                    //对应的节点
                    srcNode: ".allWidth",
                    //当用户输入的query与条目匹配时，是否高亮
                    highlightMatchItem: false,
                    //默认的显示格式
                    "resultFormat": '约{count}个宝贝',
                    //配置popmenu不随页面高度进行调整
                    menu :{
                        align:{overflow:{adjustY:0}}
                    },
                    cache: true
                }
            },
            setter:function(v){
                var _cfg = this.get("sugConfig");
                return S.mix(_cfg,v,undefined,undefined,true);
            }
        },
        dataSourceCfg:{
            value:{
                xhrCfg:{
                    url: "http://suggest.taobao.com/sug",
                    dataType:'jsonp',
                    scriptCharset:'utf-8',
                    data:{
                        code: "utf-8"
                    }
                },
                //设置为允许为空
                allowEmpty: true,
                paramName: 'q',
                cache:true
            }
        }
    }
    S.augment(newSuggest, EventTarget, {
        init: function(){
            var self = this;
            self._initCombo();
        },
        /**
         * 设置comboBox的缓存,比如tab之间的切换
         * @param dataSource 需要cached的dataSource
         * @private
         */
        _setComboCache: function(dataSource){
            var self = this,
                index = self.get("tab");
            self.configArr = self.configArr||[];
            self.configArr[index] = {
                data:dataSource
            };
        },
        /**
         * 绑定combo的事件
         * @private
         */
        _initComboEvent: function(){
            var self = this,
                comboBox = self.comboBox,
                input = comboBox.get("input");

            input.on("click",function(){
                if(self.fire("beforeFocus") !== false){
                    var isFocused = comboBox.get("el").hasClass("ks-combobox-focused"),
                        inputVal = S.trim(input.val()),
                        sugConfig = self.get("sugConfig");
                    if(isFocused){
                        if(sugConfig.autoCollapsed||inputVal === ""){
                            comboBox.sendRequest(inputVal);
                        }
                    }
                }

            });
            comboBox.on('afterCollapsedChange',function(e){
                if(!e.newVal){
                    comboBox.on("click",self.comboClick,self);
                }
            });
            comboBox.on("afterCollapsedChange", self._addExtraEvent);
            var form = input.parent("form");
            form.on("submit",function(){
                if (self.fire("beforeSubmit") === false){

                }
            })
        },
        comboClick: function(e){
            var self = this,
                el = e.target.get?e.target.get("el"):S.one(e.currentTarget),
                comboBox = self.comboBox;
            self.fire("beforeSubmit");
            var  retQuery = comboBox._savedInputValue||self.query,
                inputQuery = self.query,
                _child = el.children(),
                dataKey = _child.attr("data-key")||"q="+retQuery,
                _form = comboBox.get("el").parent("form"),
                _action = _form.attr("action"),
                dataAction = _child.attr("data-action")||self.get("action")||_action,
            //主动搜索的埋点
                initIdNode = document.getElementsByName("initiative_id")[0],
                initId = initIdNode?"&initiative_id="+initIdNode.value:"",
                otherQuery = "&wq=" + inputQuery +"&suggest_query=" + retQuery + "&source=suggest";
            //如果有?,则使用&连接,否则使用?
            if(dataAction.indexOf("?") > -1){
                dataAction +="&";
            }else{
                dataAction += "?";
            }
            location.href = dataAction + dataKey + otherQuery + initId;
        },
        /**
         * 载入用户的配置
         * @private
         */
        _loadUserCfg: function(){
            var self = this,
            //增加mods容错
                mods = self.get("mods")||[],
                modNames = [],names = [];
            for(var i in mods){
                if(mods[i].modname){
                    modNames.push(mods[i].modname);
                    names.push(i);
                }
            }
            self.mods = mods;
            self.__modules__ = [];
            //当mods不配置的时候,不use
            if(modNames.length > 0){
                S.use(modNames.join(","),function(){
                    var inst;
                    for(var i = 1,len = arguments.length -1;i<=len;i++){
                        inst = new arguments[i]({
                            caller: self
                        });
                        self.__modules__[names[i-1]] = inst;
                    }
                })
            }
        },
        _initCombo: function(){
            var self = this ,
            //获取suggest的配置
                sugCfg = self.get("sugConfig"),
            //获取datasource的配置
                dataSourceCfg = self.get("dataSourceCfg"),
                dataSource,
                comboBoxCfg = sugCfg.comboBoxCfg;
            dataSourceCfg.xhrCfg.url = sugCfg.sourceUrl||dataSourceCfg.xhrCfg.url;
            dataSourceCfg.parse = S.bind(self.parse,self);
            dataSource = new ComboBox.RemoteDataSource(dataSourceCfg);
            self._setComboCache(dataSource);
            comboBoxCfg.dataSource = dataSource;
            comboBoxCfg.format = S.bind(self.format,self);
            var comboBox = new ComboBox(comboBoxCfg);
            comboBox.render();
            self.comboBox = comboBox;
            self._initComboEvent();
            self._loadUserCfg();
            comboBox.get("input")[0].focus();
        },
        /**
         * 当实例需要更新配置，调用本方法
         * @param config
         */
        update: function(config){
            var self = this;
            //如果模块包含update,则调用模块的update方法
            for(var i in self.__modules__){
                var item = self.__modules__[i];
                item&& S.isFunction(item.update)&& item.update.call(item,config);
            }

        },
        /**
         * comboBox预留的对数据进行处理的接口
         * @param {String} query 触发suggest时的query
         * @param {Object} results 接口返回的数据
         * @returns {Array} 需要展示的数据
         */
        parse: function (query, results) {
            var self = this,
            // 返回结果对象数组
                _result = results.result;
            //如果query为空
            if(_result.length === 0){
                return [["",]];
            }

            //临时过滤机票query的bug
            // 当query为空时,为了避免suggest面板收起,生成了一个空的数据,需要在这里过滤
            for(var i in _result){
                if(!_result[i]){
                    _result.splice(i,1);
                }
            }
            delete(results.result);
            var dataSource = self.comboBox.get("dataSource");
            if(!S.isEmptyObject(results)) {
                (dataSource.extraData||(dataSource.extraData=[]))[query] = results;
            }
            return _result;
        },
        format: function (query, results) {
            var self = this;
            self.resultArr = [];
            self.render(query,results);
            return self.resultArr;
        },
        /**
         *
         * @param {String} query 触发suggest时的query
         * @param {Object} results 接口返回的数据
         *
         */
        render: function(query,results){
            var self = this,
                extra = self.get("extra"),
                defaultExtra = self.get("defaultExtra"),
                __modules__ = self.__modules__,
                mods = self.mods;
            //每次渲染的时候,获取一个query值
            self.query = query;
            extra = S.merge(defaultExtra,extra);
            extra = self._adjustExtra(query,extra);
            var tmpl,mod,addedPos,pos;
            for(var i in extra){
                mod = mods[i];
                //如果always为真,则一直都执行
                if(extra[i]){
                    if(__modules__[i]){
                        __modules__[i].render();
                    }else{
                        if(mod&&extra["showExtra"]&& (!(pos=mod.pos)||(addedPos !== pos))){
                            tmpl = mod.tmpl;
                            if(!tmpl) continue;
                            var len = self.resultArr.length,
                                diff = self.diffLen||0;
                            addedPos = self._defaultRender({
                                "tmpl": tmpl,
                                "name": i,
                                "pos": pos,
                                "always": mod.always&&(results.length> 0),
                                "callback": mod.callback,
                                "index": len - diff
                            });
                        }
                        if(i === "list"){
                            self._list(query,results);
                        }
                    }

                }
            }
        },
        /**
         * 模块默认的渲染方法
         * @param config 默认渲染调用的配置
         * @returns {String} 有可能为空,当不为空时,则表示为插入到对应的位置,比如header,footer
         * @private
         */
        _defaultRender: function(config){
            var self = this,
            //配置项的模板
                tmpl = config.tmpl,
            //配置项的名称
                name = config.name,
            //当前suggest的数据源
                dataSource = self.comboBox.get("dataSource"),
            //获取当前query
                query = self.query,
                extraData = dataSource.extraData,
                pos = config.pos,
                index = config.index,
                html;
            if(extraData&&extraData[query]||config.always){
                var date = self._getDate(),
                    data = {"$query": query,"$date": date};
                if(!config.always){
                    var retData = extraData[query][name],
                        noChildArr = true;
                    if(!retData) return;
                    if(S.isArray(retData)){
                        for(var i = 0,len = retData.length -1; i <= len; i++){
                            var _item = retData[i];
                            if(S.isArray(_item)){
                                noChildArr = false;
                                //当suggest返回的类目或者其他的数量超过2个时,只显示两个
                                if(_item.length >2) _item.length = 2;
                                for(var n = 0,leng = _item.length - 1; n <= leng; n ++){
                                    data["$"+n] = _item[n]||"";
                                }
                                data["$index"] = index + 1 + i;
                                html = S.substitute(tmpl,data);
                                self.addContent({
                                    "html":html,
                                    "query":query,
                                    "position": pos,
                                    "callback": config.callback
                                });
                                continue;
                            }else{
                                data["$"+i] = _item;
                                data["$index"] = index + 1 + i;
                            }
                        }
                        if(noChildArr){
                            html = S.substitute(tmpl,data);
                            self.addContent({
                                "html":html,
                                "position": pos,
                                "callback": config.callback
                            });
                        }
                        return pos;
                    }
                    data[name] = retData;
                }
                data["$index"] = index + 1;
                html = S.substitute(tmpl,data);
                self.addContent({
                    "html":html,
                    "position": pos,
                    "callback": config.callback
                });
                return pos;
            }
        },
        /**
         * 根据query判断是否要出额外的结构代码
         * @param query
         * @param extra
         * @returns {*}
         * @private
         */
        _adjustExtra: function(query,extra){
            if(query === ""){
                extra.showExtra = false;
            }else{
                extra.showExtra = true;
            }
            return extra;
        },
        /**
         * 获取当前登录用户的昵称
         * @returns {String} 返回用户的昵称
         */
        getNick: function(){
            var self = this;
            return self._getCookie('_nk_') || self._getCookie('tracknick');
        },
        /**
         * 从Cookie里获取对应key值的value
         * @param name cookie的名称
         * @returns {String} 返回对应的value
         * @private
         */
        _getCookie: function(name) {
            var win = window;
            if (win.userCookie && !S.isUndefined(win.userCookie[name])) {
                return win.userCookie[name];
            }

            if (win.SRP_COOKIES||(win.SRP_COOKIES = {})&&S.isUndefined(SRP_COOKIES[name])) {
                var m = document.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
                SRP_COOKIES[name] = (m && m[1]) ? decodeURIComponent(m[1]) : '';
            }
            return SRP_COOKIES[name];
        },
        /**
         *
         * @returns {string} 返回当天的日期
         * @private
         */
        _getDate: function(){
            var date = new Date();
            return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + (date.getDate()+1);
        },
        _list: function(query,results){
            var self = this,
                sugConfig = self.get("sugConfig"),
                resultFormat = sugConfig.comboBoxCfg.resultFormat,
                ret = self.resultArr||(self.resultArr=[]),tmpl = "<div class='item-wrapper' data-key='q={query}{text}&suggest=0_{index}'>" +
                    "<span class='item-text'>{query}<b>{text}</b></span>" +
                    "<span class='item-count'>"+ resultFormat +"</span>" +
                    "</div>";

            S.each(results, function (r,index) {
                if(!r||!r[0]) {
                    results.splice(index,1);
                    return;
                }
                var text = r[0],prefix = "",item,
                    _query = query;
                while(text.indexOf(_query) < 0){
                    _query = _query.substr(0,_query.length -1);
                };
                if(text.indexOf(_query) === 0){
                    prefix = _query;
                    text = text.replace(_query,"");
                }
                for(var i in ret){
                    item = ret[i];
                    if(item.textContent === r[0] && item.unique){
                        return;
                    }
                }
                ret.push({
                    // 点击菜单项后要放入 input 中的内容
                    textContent:r[0],
                    // 菜单项的
                    content:S.substitute(tmpl, {
                        query: prefix,
                        text:text,
                        index: index+1,
                        count:r[1]
                    })
                });
            });
            self.resultArr = ret;
        },
        /**
         * 给下拉列表添加内容
         * @param config {Object}
         *      config.html 需要被插入的html代码
         *      config.pos 插入的位置,eg: footer和header,或者null
         *      config.callback 回调函数
         */
        addContent: function(config){
            var self = this,
                html = config.html,
                pos = config.position,
                query = config.query;
            if(!pos){
                var ret = self.resultArr||[];
                ret.push({
                    "content" : html,
                    "textContent" : query
                });
                return;
            }else{
                self["__"+pos] = {
                    "tmpl": html
                };
                self._addExtraEvent();
            }
        },
        _addExtraEvent: function(e){
            var self = this,
                comboBox = thisInst.comboBox,
                headerCfg = thisInst.__header,
                footerCfg = thisInst.__footer;
            if(!e||(e&&!e.newVal)){
                var menu = comboBox.get("menu");
                if(!menu.get){
                    return;
                }
                var menuEl = menu.get("el");
                if(!menuEl||menuEl.all(".ks-menuitem").length < 1) {
                    return;
                }

                var header = menuEl.one(".ks-combobox-menu-header"),
                    footer = menuEl.one(".ks-combobox-menu-footer");
                if(footerCfg){
                    if (!footer) {
                        footer = new S.Node("<div class='ks-combobox-menu-footer'></div>").appendTo(menuEl);
                    }
                    footer.empty().append(footerCfg.tmpl);
                    var historyClean = footer.one(".ks-menu-history-clean");
                    if(historyClean){
                        historyClean.on("click",function(e){
                            e.halt();
                            var History = thisInst.__modules__["history"];
                            History._cleanHistory();
                        })
                    }
                    var tdgBtn = footer.one(".tdg-btn");
                    if(tdgBtn){
                        tdgBtn.on("click",function(){
                            var tdgInputs = footer.all(".tdg-input"),
                                tdgArr = [],val="",
                                tdgQueryInput = footer.one(".tdg-query");
                            tdgInputs.each(function(node){
                                val = node.val();
                                if(val){
                                    tdgArr.push(val);
                                }
                            })
                            tdgQueryInput.val(tdgArr.join(" + "));
                        })

                    }
                    var jpBtn = footer.one(".jp-btn");
                    if(jpBtn){
                        jpBtn.on("click",function(){
                            var inputs = footer.all("input"),
                                jpArr = [],jpEtArr=["tbsearch"],val = "";
                            inputs.each(function(node){
                                val = node.val();
                                if(val){
                                    if(node.hasClass("J_Jp-query")){
                                        jpArr.push(val);
                                    }
                                }
                                //当用户只输入两个input时，没有填写的需要一个空值
                                if(node.hasClass("J_Jp-et")){
                                    jpEtArr.push(val||"");
                                }

                            })
                            footer.one("#J_JiPiaoForm").val(jpArr.join(" "));
                            footer.one("#J_JipiaoEt").val(jpEtArr.join("|"));
                        })
                    }
                }else{
                    footer&&footer.remove();
                }
                if(headerCfg){
                    if (!header) {
                        header = new S.Node("<div class='ks-combobox-menu-header'></div>").prependTo(menuEl);
                    }
                    header.empty().append(headerCfg.tmpl);
                }else{
                    header&&header.remove();
                }
            }
            else{
                thisInst.__header = null;
                thisInst.__footer = null;
            }
        }
    });
    return newSuggest;
},{requires:["base","event","combobox","./index.css"]})
