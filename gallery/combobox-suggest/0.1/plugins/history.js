KISSY.add('gallery/combobox-suggest/0.1/plugins/history', function (S,Event,LocalQuery, undefined) {
    var EventTarget = Event.Target;
    function History(config) {
        History.superclass.constructor.call(this, config || {});
        this.initialize();
        KISSY.sug = S.bind(this._retSug,this);
    }
    S.extend(History, S.Base);
    S.augment(History, EventTarget, {
        initialize:function(){
            var self = this,
                caller = self.get("caller"),
                thisMod = caller.get("mods").history,
                tab = thisMod.tab||"";
            caller.set('extend',{'history':true});
            self.historyLocalQuery=new LocalQuery({name:'history',tab:tab,user:caller.getNick()});
            self.hitedHistoryListMap={};
            var comboBox=caller.comboBox;
            comboBox.on('afterCollapsedChange',function(e){
                if(!e.newVal){
                    comboBox.detach('afterCollapsedChange',arguments.callee);
                    comboBox.get('menu').get('el').delegate('mousedown','.ks-menu-history-delete',self._historyDeleteMousedown,self);
                    comboBox.on("click",self.saveItemVal,self);
                }
            });
            caller.on("beforeSubmit",function(){
                var savedVal = comboBox.get("input").val();
                var localQueryInst = self.historyLocalQuery;
                if(localQueryInst){
                    localQueryInst._setKey({
                        name:"pinyin"
                    });
                    localQueryInst.save(savedVal,S.trim(savedVal));

                    localQueryInst._setKey({
                        name:"history"
                    })
                }
            })
            self._getPinyinQuery();
        },
        _getPinyinQuery: function(){
            var self = this,
                localQueryInst = self.historyLocalQuery;
            localQueryInst.checkFlash({
                onSuccess:function(){
                    localQueryInst._setKey({
                        name: 'pinyin'
                    })
                    var list = localQueryInst.query();
                    if(list.length > 0){
                        var text = decodeURIComponent(list[0].key);
                        if(/[\u4e00-\u9fa5]/.test(text)){
                            self._getPinyin(list[0].key);
                            localQueryInst.clearByDay(0);
                        }
                    }
                    localQueryInst._setKey({
                        name: 'history'
                    })
                },
                onFailure:function(){
                    S.log("loading flashStorage failure!");
                }
            })
        },
        render: function(){
            var self = this,
                caller = self.get("caller"),
                q = caller.query,
                allHitedHistoryList=self.historyLocalQuery.query(q),
                historyItemNum,
                hitedHistoryList;
            //只有有历史记录并且q不等于空值,才显示头尾
            if(q === "" && allHitedHistoryList.length > 0){
                var header = S.one(".ks-combobox-menu-header");
                caller.__header = {
                    tmpl: '<div class="history-box"><span>搜索历史</span></div>',
                    type: 'history'
                };
                caller.__footer = {
                    tmpl: '<div class="history-box"><a href="javascript:;" class="ks-menu-history-clean">清空搜索历史</a></div>',
                    type: 'history'
                };
                historyItemNum= 10;
            }else{
                caller.__header = null;
                caller.__footer = null;
                historyItemNum= 2;
            }
            hitedHistoryList = allHitedHistoryList.splice(0,historyItemNum);
            caller._addExtraEvent();
            self._renderHistoryItems(hitedHistoryList);
            self.hitedHistoryListMap[q]=hitedHistoryList;
        },
        saveItemVal: function(e){
            var self = this,
                caller = self.get("caller"),
                comboBox = caller.comboBox,
                node = e.target.get?e.target.get("el"):S.one(e.target),
                savedVal = node.one(".item-text").text(),
                localQueryInst = self.historyLocalQuery;
            if(localQueryInst){
                localQueryInst._setKey({
                    name:"pinyin"
                });
                localQueryInst.save(savedVal,S.trim(savedVal));

                localQueryInst._setKey({
                    name:"history"
                })

            }
        },
        _historyDeleteMousedown:function(e){
            var self = this,
                caller = self.get("caller"),
                target = S.one(e.target),
                index = target.parent().attr("index"),
                parent = target.parent(2),
                comboBox = caller.comboBox,
                menu = comboBox.get('menu'),
                children = menu.get("children");
            for(var i=0;i<children.length;i++){
                var item = children[i];
                if(item.get('el')[0]===parent[0]){
                    menu.removeChild(item,true);
                    break;
                }
            }
            self.historyLocalQuery&&self.historyLocalQuery.deleteItem(index);
            comboBox.sendRequest(caller.query);
        },
        _renderHistoryItems:function(list){
            var self=this,
                caller= self.get("caller"),
                historyItemValue,
                resultTmpl='<div class="ks-menu-extras-history" data-key="q={historyItemValue}&suggest=history_{index}" index="{historyItemValue}">' +
                    '<span class="ks-menu-history-key">{historyItemValue}</span><span class="ks-menu-history-delete">删除</span></div>',
                ret = caller.resultArr||(caller.resultArr=[]),
                resultHtml;
            list = S.unique(list);
            for(var i = 0, len = list.length - 1; i <= len; i ++){
                historyItemValue=decodeURI(list[i]['key']);
                resultHtml = resultTmpl.replace(/{historyItemValue}/g,historyItemValue).replace(/{index}/g,(i+1).toString());
                ret.push({
                    content: resultHtml,
                    textContent: historyItemValue,
                    unique:true
                });
            }
        },
        _getPinyin: function(text){
            var self = this,
                url = "http://suggest.taobao.com/sug?code=utf-8&area=py&callback=KISSY.sug&q="+text;
            if(window._DEV_&&location.href.indexOf("suggest=online") === -1){
                url = "http://tools.search.taobao.com:9999/proxy.php?url=http://s003187.cm6/sug%3F%26code=utf-8%26area=py%26callback=KISSY.sug%26q="+text;
            }
            self._savedInputValue = decodeURIComponent(text);
            S.getScript(url);
        },
        _retSug: function(data){
            if(data&&data.result){
                var pinyin = data.result[0],
                    self = this,
                    savedVal = self._savedInputValue;
                self.historyLocalQuery&&self.historyLocalQuery.save(savedVal,S.trim(pinyin));
            }
        },
        _cleanHistory:function(){
            var self = this,
                caller = self.get("caller"),
                comboBox = caller.comboBox,
                menu = comboBox.get("menu"),
                container = menu.get("el"),
                input = comboBox.get("input"),
                header= container.one('.ks-combobox-menu-header');
            self.historyLocalQuery.clearByDay(0);
            self.hitedHistoryListMap = {};
            var siblings =  header.siblings();
            siblings.css("display","none");
            header.html('<div class="history-box"><span>搜索历史已清空</span></div>');
            var anim = new S.Anim(container,{opacity:0},3,'easeIn',function(){
                siblings.css("display","block");
                container.css({"opacity":1,"visibility":"hidden"});
            });
            anim.run();
            input.on("blur keydown mousedown",function(e){
                if(anim.isRunning()){
                    anim.stop(true);
                }
                caller.__header = null;
                caller.__footer = null;
                //当点击清空后,立刻输入就需要马上需要做这个操作
                //还需要判断这个值是否为空,如果为空,则不显示
                if(e.type === "keydown"&&this.value){
                    container.css("visibility","visible");
                }
                input.detach('blur keydown mousedown',arguments.callee);
            })
        },
        /**
         *
         * @param config
         * eg:  {
                    "sugConfig":{
                        "resultFormat": '',
                        "sourceUrl":"http://suggest.taobao.com/sug?area=ssrch",
                        "tab":"item"
                    },
                    "extra":{
                        "tel": false,
                        "cat": false,
                        "new": false,
                        "history": true,
                        "jipiao": false,
                        "shop": false,
                        "tdg": false,
                        "showExtra": true
                    },
                    "action":"http://shopsearch.taobao.com/search?"
                }
         */
        update:function(config){
            var self = this,
                index = encodeURI(config.tab);
            self.historyLocalQuery._setKey({tab:index});
        }
    });
    return History;
},{requires:["event","gallery/combobox-suggest/0.1/plugins/local-query"]});
