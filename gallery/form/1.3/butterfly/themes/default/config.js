KISSY.add(function (S) {
    /**
     * Butterfly表单组件配置
     */
    return {
        /**
         * 验证配置
         */
        auth:{
            autoBind:true,
            stopOnError:false,
            msg:{
                tpl:'<div class="msg {prefixCls}"><p class="{style}">{msg}</p></div>',
                args:{ prefixCls:'under' }
            }
        },
        /**
         * 字数统计
         */
        limiter:{
            //算字数时是否排除html标签（富编辑器一般需要把html标签所占的字数去掉）
            isRejectTag:false
        },
        /**
         * 选择框配置
         */
        select:{

        },
        /**
         * 图片上传
         */
        imageUploader:{

        },
        /**
         * 编辑器组件配置
         */
        editor:{
            cssUrl:'gallery/form/1.3/butterfly/themes/default/com/editor/',
            "font-bold":false,
            "font-italic":false,
            "font-size":{
                items:[
                    {
                        value:"14px",
                        attrs:{
                            style:'position: relative; border: 1px solid #DDDDDD; margin: 2px; padding: 2px;'
                        },
                        name:"" +
                            " <span style='font-size:14px'>标准</span>" +
                            "<span style='position:absolute;top:1px;right:3px;'>14px</span>"
                    },
                    {
                        value:"16px",
                        attrs:{
                            style:'position: relative; border: 1px solid #DDDDDD; margin: 2px; padding: 2px;'
                        },
                        name:"" +
                            " <span style='font-size:16px'>大</span>" +
                            "<span style='position:absolute;top:1px;right:3px;'>16px</span>"
                    },
                    {
                        value:"18px",
                        attrs:{
                            style:'position: relative; border: 1px solid #DDDDDD; margin: 2px; padding: 2px;'
                        },
                        name:"" +
                            " <span style='font-size:18px'>特大</span>" +
                            "<span style='position:absolute;top:1px;right:3px;'>18px</span>"
                    },
                    {
                        value:"20px",
                        attrs:{
                            style:'position: relative; border: 1px solid #DDDDDD; margin: 2px; padding: 2px;'
                        },
                        name:"" +
                            " <span style='font-size:20px'>极大</span>" +
                            "<span style='position:absolute;top:1px;right:3px;'>20px</span>"
                    }
                ],
                width:"115px"
            }, "font-family":{
                items:[
                    {name:"宋体", value:"SimSun"},
                    {name:"黑体", value:"SimHei"},
                    {name:"楷体", value:"KaiTi_GB2312"},
                    {name:"微软雅黑", value:"Microsoft YaHei"},
                    {name:"Times New Roman", value:"Times New Roman"},
                    {name:"Arial", value:"Arial"},
                    {name:"Verdana", value:"Verdana"}
                ]
            },
            "draft":{
                interval:5,
                limit:10,
                helpHtml:"<div " +
                    "style='width:200px;'>" +
                    "<div style='padding:5px;'>草稿箱能够自动保存您最新编辑的内容," +
                    "如果发现内容丢失" +
                    "请选择恢复编辑历史</div></div>"
            },
            "resize":{
                direction:["y"]
            },
            "font-strikeThrough":{
                style:{
                    element:'strike',
                    overrides:[
                        {element:'span', attributes:{ style:'text-decoration: line-through;' }},
                        { element:'s' },
                        { element:'del' }
                    ]
                }
            }
        }
    };
});
