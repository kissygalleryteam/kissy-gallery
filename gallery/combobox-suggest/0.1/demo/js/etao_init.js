KISSY.use("gallery/combobox-suggest/0.1/index", function (S,Sug,undefined) {
    S.ready(function(){
        var sug = new Sug({
            "mods":{
                "history":{
                    "modname": "gallery/combobox-suggest/0.1/plugins/history",
                    "tab":"item"
                }
            },
            "extra":{
                "history": window.TB&&window.TB.Global.isLogin(),
                "tipNotice":false,
                "tab":false,
                "tel": false,
                "cat": false,
                "global": false,
                "new": false,
                "shop": false,
                "jipiao": false,
                "tdg": false,
                "showExtra": false
            },
            "sugConfig":{
                extraParams: "",
                sourceUrl:"http://suggest.taobao.com/sug?area=etao",
                comboBoxCfg:{
                    srcNode: ".input-auto"
                }
            }
        });
        sug.on("beforeFocus",function(){
            alert("beforeFocus事件");
        })
        sug.on("beforeSubmit",function(e){
            var queryNode = S.one("#q");
            if(!queryNode) return;
            var query = queryNode.val();
            if(S.trim(query) === ""){
                return true;
            }
        })
    })
})
