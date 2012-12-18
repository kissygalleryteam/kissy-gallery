
flash-ua
=================================


Methods
-----------------------------------------------

.. function:: fpv

    | Array **fpv** ( [force] )
    | 返回当前客户端 Flash Player 的版本号数组, 格式为 [ Major, Minor, Revision ]
    
    :param Boolean force: 表示是否强制重新获取版本信息. 可选, 默认为false. 一般情况下, 出于性能考虑不带参数.     若不带参数, 则返回第一次运行时获取的版本号. 若在线安装后, 页面无刷新的情况下, 则可能需要强制获取最新版本号. `

    :returns: {Array} -数组依次为[主版本号,次版本号,修正版本号]

    .. note::

        fpv 是 Flash Player Version 的简写. 

.. function:: fpvGEQ

    | Boolean **fpvGEQ** ( ver[, force] )
    | 判断当前 Flash Player 版本号是否大于或等于指定版本. 
    | 一般用于判断是否可以播放当前flash内容. 
    
    :param String|Array|Number ver: 指定验证的版本号.  在这里我们推荐使用 小数点分隔"M.S.R"的写法. 如果你熟悉大名鼎鼎的SWFObject, 自然会喜欢这样的写法.  当然, 我们也允许其他的写法, 见示例.
    :param Boolean force: 表示是否强制重新获取版本信息, 并用于版本判断.  和 fpv();的方法参数效果一致. 

    :returns: {Boolean} - 如果大于或等于当前版本, 则返回true. 否则false
    
    推荐的判断版本参数, 以"."分隔. 
    
    .. code-block:: javascript

        if(KISSY.UA.fpvGEQ('9.1.0') {
            // do sth.
        }

    当然, 我们也允许其他癖好. 
    
    .. code-block:: javascript

        if(KISSY.UA.fpvGEQ("10.1 r53") {
        // do sth.
        }
        if(KISSY.UA.fpvGEQ(["10", "1", "53"]) {
        // do sth.
        }
        if(KISSY.UA.fpvGEQ(10.1) {
        // do sth.
        }

    .. note::

        GEQ 是 Greater than or EQual 的简写,即"大于等于". 