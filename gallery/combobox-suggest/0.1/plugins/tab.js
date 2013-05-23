KISSY.add("gallery/combobox-suggest/0.1/plugins/tab",function(S,Event,ComboBox){
    var EventTarget = Event.Target;
    function SuggestTab(config) {
        SuggestTab.superclass.constructor.call(this, config || {});
        this.initialize();
    }
    SuggestTab.ATTRS = {

    };
    S.extend(SuggestTab, S.Base);
    S.augment(SuggestTab, EventTarget, {
        initialize:function(){
            var self = this,
                sug = self.get("caller"),
                mods = sug.mods,
                tabCfg = mods.tab,
                selectors = tabCfg.nodelist||"#J_SearchTab li";
            Event.on(selectors,"click",function(e){
                var target = S.one(e.currentTarget),
                    type = target.attr("data-searchtype"),
                    tabCfg;
                target.siblings().removeClass("active");
                target.addClass("active");
                if(type){
                    tabCfg = self.getDefCfg(type);
                    sug.update(tabCfg);
                }else{
                    var query = sug.query||sug.comboBox.get("input").val(),
                        aNode = target.one("a");
                    if(aNode){
                        var href = aNode.attr("href");
                        //因为默认情况下,shopsearch的链接是没有search的,所以当有q时,需要拼接
                        href = href.replace("/?","/search?");
                        href = href + "&q="+query;
                        aNode.attr("href",href);
                    }
                }
                e.preventDefault();
            });
        },
        update: function(config){
            var self = this,
                sug = self.get("caller"),
                index = config.tab,
                comboBox = sug.comboBox,
                cachedData = sug.configArr[index],
                dataSource,
                dataSourceCfg,xhrCfg,
                sugConfig = config.sugConfig;
            sug.configArr = sug.configArr||[];
            dataSourceCfg = sug.get("dataSourceCfg");
            xhrCfg = dataSourceCfg.xhrCfg;
            xhrCfg.url = sugConfig.sourceUrl||xhrCfg.url;
            S.mix(sug.__attrVals,config,{deep: true});
            if(!cachedData){
                cachedData = sug.configArr[index] = {
                    data: new ComboBox.RemoteDataSource(dataSourceCfg)
                }
            }else{
                dataSource =  cachedData.data;
            }
            comboBox.set("dataSource",cachedData.data);
            comboBox.get("input")[0].focus();
            comboBox.sendRequest(sug.query);
        },
        /**
         * 获取预定义的配置
         * @param type
         * @returns {Object} tabCfg
         */
        getDefCfg:function(type){
            var tabCfg;
            switch(type) {
                case "shop": {
                    tabCfg = {
                        "sugConfig":{
                            comboBoxCfg:{
                                "resultFormat": ''
                            },
                            "sourceUrl":"http://suggest.taobao.com/sug?area=ssrch"
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
                } break;
                case "item": {
                    tabCfg = {
                        sugConfig: {
                            comboBoxCfg:{
                                "resultFormat": '约{count}个宝贝'
                            },
                            "sourceUrl": "http://suggest.taobao.com/sug"
                        },
                        extra:{},
                        action:"http://s.taobao.com/search?"
                    }
                } break;
                case "tmall": {
                    tabCfg = {
                        sugConfig: {
                            comboBoxCfg:{
                                "resultFormat": '约{count}个宝贝'
                            },
                            "sourceUrl": "http://suggest.taobao.com/sug?area=b2c"
                        },
                        extra: {
                            "tel": false,
                            "cat": true,
                            "new": false,
                            "history": true,
                            "jipiao": false,
                            "shop": false,
                            "tdg": true,
                            "showExtra": true
                        },
                        action:"http://s.taobao.com/search?tab=mall&"
                    }
                } break;
                default:{
                    if(S.isObject(type)){
                        tabCfg = type;
                        //当sugConfig不存在时，赋值
                        if(!tabCfg.sugConfig) tabCfg.sugConfig = {};
                    }else{
                        S.log("配置有误");
                        return;
                    }
                }
            }
            //todo 当sugConfig没有配置时，会报错
            if(!tabCfg.tab) tabCfg.tab = tabCfg.sugConfig.sourceUrl;
            return tabCfg;
        }
    });
    return SuggestTab;
},{
    requires:["event","combobox"]
})