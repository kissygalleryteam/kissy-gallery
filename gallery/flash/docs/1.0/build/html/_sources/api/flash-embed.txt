
flash-embed
=================================


Methods
-----------------------------------------------

.. function:: add

    | void **add** ( target[, config, callback] )
    | 通过指定SWF 容器 的 HTML 元素或 HTML 元素 ID. 对于是否添加成功, 需要依靠 callback 注册回调方法进行获取.
    
    :param String|HTMLElement target: 指定的HTML元素或HTML元素ID.

    .. note::

        如果不存在, 则自行创建 一个 div容器.  Flash.version 版本要 大于 1.2) 必选, 这里添加主要是将对象加入KISSY进行统一管理.

    :param Object config: 指定Flash的一些配置信息.  可选, 如标签属性、播放器参数以及其他诸如在线安装、SWF引用地址等等.  见下文的《config 允许配置关键字》
    :param Function callback: 回调函数.  可选.  返回添加的状态、id以及对应的SWF的HTML元素对象. 


    .. note::

        由于依赖于DOM,请确保 在中使用 KISSY.ready().
        
    config 配置示例：
    
    .. code-block:: javascript

        var conifg = {
            src: 'test.swf',       // swf 路径  [唯一必选]
            id:'myswfid'          //swf id  如果没有定义 会自行创建
            params: { flashvars:{a:123,b,"yes"} }, // Flash Player 的配置参数
            attrs: {         // swf 对应 DOM 元素的属性
                width: 215,    // 最小控制面板宽度,小于此数字将无法支持在线快速安装
                height: 138  // 最小控制面板高度,小于此数字将无法支持在线快速安装
            },
            xi: 'expressInstall.swf',  // 快速安装地址. 全称 express install 
            version: 10.1       // 要求的 Flash Player 最低版本
        };
        
    `了解更多Flash播放器参数 <practice/flashplayer-parameters.html>`_
        
    带 callback 的 返回示例：
        
    .. code-block:: javascript

        Flash.add('#myFlashContent2', { version: '9' }, function(data) {
            alert("My id:" + data.id);
            alert("My status:" + data.status);
            alert("My html element:" + data.swf);
            alert("is dynamic publish:" + data.dynamic);
        });
        
    关于flashvars的处理：
    flashvars 可以理解成为 向swf传参,是flash 页面播放器的一个参数,可以这样被组织：

    .. code-block:: html

        <object  type="application/x-shockwave-flash"  data="PATH2SWF.swf" width="800" height="600" >
            <param name="movie" value=" PATH2SWF.swf " />
            <param name="flashvars" value="a=1&b=2"  />
            <a href="go/getflashplayer" >
                <img src="get_flash_player.gif" alt="Get Adobe Flash player" />
            </a>
        </object>
        
    事实上就是类似这样的解释：
    
    .. code-block:: javascript
    
        PATH2SWF.swf?a=1&b=2
        
    这样传参的好处则可以避免了URL的长度限制,其本身可以承受最大64KB容量的数据意味着可以传递大规模的数据,为了解决 "较少的参数传递更多更复杂数据".
    Flash支持复杂的flashvars传递. 同时,复杂数据意味着"杂质",因此 Flash 将自行将参数值进行encodeURIComponent处理.
    因此,凡flashvars深度大于1的,都将会把数据转换为JSON数据给SWF.
    示例：
    
    .. code-block:: javascript
    
        F.add('#test-flash3', {
            src: 'assets/test.swf',
            version: 9,
            attrs: {
                width: 200,
                height: 150
            },
            params: {
                flashvars: {
                    s: "string",
                    b: false,
                    n: 1,
                    nul: null,
                    und: undefined,
                    url: "http://taobao.com/?x=1&z=2",
                    o: {
                        s: "string",
                        b: false,
                        n: 1,
                        url: "http://taobao.com/?x=1&z=2"
                    }
                }
            }
        }, function(data) {
            if (data.status !== 1) test.fail();
        });
        // 见此页最后的完整测试页面示例

.. function:: remove

    | void **remove** ( id )
    | 通过指定的ID,移除已注册到 Flash 的 SWF 和 DOM 中对应的 HTML 元素.
    
    :param String id: 在 Flash 中注册的ID.  必选`
    
    .. note::

        对于已存在DOM中,但未向 Flash注册的,则不会被移除.
        
.. function:: get

    | HTMLElement **get** ( id )
    | 获得已注册到 Flash 的 SWF.
    
    :param String id: 在 Flash 中注册的ID.  必选

    :returns: {Boolean} - 返回 SWF 的 HTML 元素,可能是(<object>或<embed>).  未注册时,返回 undefined
    
    .. note::

        注意,请不要混淆 DOM.get() 和 Flash.get(). 
        对于未向 Flash注册的SWF,请使用 DOM.get()方法.
        只有成功执行过 Flash.add() 的 SWF 才可以被获取.

.. function:: contains

    | Boolean **contains** ( target )
    | 检测是否存在已注册的 swf. 
    
    :param String target: 在 Flash 中注册的ID.  必选`

    :returns: {Boolean} - 只有有成功执行过 S.Flash.add() 的 SWF 返回 true,其他返回 false.