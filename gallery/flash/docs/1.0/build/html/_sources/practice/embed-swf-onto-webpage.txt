
嵌入SWF的几种方式
====================================

|  一般来说，仅仅插入SWF不需要任何 JS代码。
|  当一个页面需要借助JS插入SWF,通常出于以下1个或多个情况:
|  - 消除某些浏览器存在的“点击激活(click-to-activate)”机制 。
|  - 当前页面和SWF间通讯。
|  - Flash player 版本向导及客户端版本控制。
|  - 动态增删改SWF及其涉及的元素属性及内容。
|
|  使用动态方式插入 SWF 时，代码会自行判断浏览器并以最恰当的方式进行插入。
|  代码差异性：指设定同样内容时，需要通过2种方式共同指定。
|
|  嵌入 SWF 有以下几种方式:
|  - :ref:`O-E静态方式 <flash-embed-section1>`
|  - :ref:`O-O静态方式 <flash-embed-section2>`
|  - :ref:`L-O静态方式 <flash-embed-section3>`
|  - :ref:`L-E静态方式 <flash-embed-section4>`


.. _flash-embed-section1:

O-E静态方式
--------------------------------------

**关于:**

    - 由 OBEJCT 和 EMBED 两个标签组合而成
    - Adobe Flash Pro 等官方工具产出的页面中 NOSCRIPT 标签间包含的内容
    - 通常附带名为 AC_RunActiveContent 的 javascript 文件

**优点:**

    - 最强兼容性
    - 遵从“优雅降级”(Gracefuldegradation)方式
    - 官方代码,具有官方技术人员负责维护核心部分代码。如 AC_RunActiveContent.js

**缺点:**

    - 最具差异性代码，不便于统一维护。
    - 无法自定义替换内容Alternative content。即不满足可用性(usable)。
    - 官方代码,具有官方技术人员负责维护核心部分代码。如 AC_RunActiveContent.js
    - 代码冗余
    
**其他:**

    - 默认官方代码主要依靠JS动态加载。可能会受限于页面控制权限。如第三方平台不允许用户使用。
    - 仅静态嵌入,需要用户从自动生成代码的 NOSCRIPT 标签中剥离。
    - AC_RunActiveContent是document.write()方式写入object或embed标签。

**适用:**

    - 自己的站点，或不需要考虑太多问题的地方。因为官方都已做好，傻瓜式。
    - 需要最强兼容但不需要自定义替换内容Alternative content的应用。

**示例代码:**

.. code-block:: html

    <script language="javascript">AC_FL_RunContent = 0;</script>
    <script src="AC_RunActiveContent.js" language="javascript"></script>
    <script language="javascript">
    if (AC_FL_RunContent == 0) {
        alert("此页需要 AC_RunActiveContent.js");
    } else {
        AC_FL_RunContent(
            'codebase', '/swflash.cab#version=9,0,0,0',
            'width', '950',
            'height', '203',
            'src', 'SWF.swf',
            'quality', 'high',
            'pluginspage', 'http://www.macromedia.com/go/getflashplayer',
            'align', 'middle',
            'play', 'true',
            'loop', 'true',
            'scale', 'showall',
            'wmode', 'window',
            'devicefont', 'false',
            'id', 'movie',
            'bgcolor', '#ffffff',
            'name', 'movie',
            'menu', 'true',
            'allowFullScreen', 'false',
            'allowScriptAccess','sameDomain',
            'movie', 'SWF.swf',
            'salign', ''
            ); //end AC code
    }
    </script>
    <noscript>

    <object
        classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
        codebase="/swflash.cab#version=6,0,0,0"
        width="950"
        height="203"
        id="movie"
    >

        <param name="movie" value="SWF.swf" />
        <param name="allowfullscreen" value="true" />
        <param name="allowscriptaccess" value="always" />
        <param name="allownetworking" value="all" />
        <param name="wmode" value="transparent" />

        <embed src="SWF.swf"
                width="950"
                height="203"
                allowfullscreen="true"
                allowscriptaccess="always"
                allownetworking="all"
                wmode="transparent"
                name="movie"
                type="application/x-shockwave-flash"
                pluginspage="http://www.macromedia.com/go/getflashplayer"
        />

    </object>
    </noscript>

.. _flash-embed-section2:

O-O静态方式
--------------------------------

**关于:**

    - 由 2 个OBEJCT 标签组合而成
    - SWObject 作者推荐的静态潜入方式
    - 通常附带名为 AC_RunActiveContent 的 javascript 文件

**优点:**

    - PC主流浏览器兼容。
    - 较少代码差异性，利于维护。
    - 可以自定义替换内容Alternative content。

**缺点:**

    - 在某些浏览器下会多一次自定义替换内容Alternative content的请求。
    - 在某些浏览器下多一次 SWF 请求，且不会从缓存取该内容。
    - IE条件注释标签作可能在非IE浏览器下存在潜在问题
    - 代码部分冗余

**其他:**

    - 有在线生成器。
    - SWFOject生成动态代码都是替换指定的 HTML 元素为一个 OBJECT 元素。

**适用:**

    - 所有PC上。
    - 当用户播放器可能没有安装或版本过低时，期望出现可替换内容的Alternative content。
    - 可能需要通过期望出现可替换内容的 Alternative content 面向SEO的。

**示例代码:**

.. code-block:: html

    <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="950"
    height="203" id="myFlashContent">

        <param name="movie" value="SWF.swf" />
        <param name="allowfullscreen" value="true" />
        <param name="allowscriptaccess" value="always" />
        <param name="allownetworking" value="all" />
        <param name="wmode" value="transparent" />
        <!--[if !IE]>-->
        <object type="application/x-shockwave-flash" data="SWF.swf"
        width="950" height="203">
            <param name="allowfullscreen" value="true" />

            <param name="allowscriptaccess" value="always" />
            <param name="allownetworking" value="all" />
            <param name="scale" value="exactfit" />
            <param name="wmode" value="transparent" />
        <!--<![endif]-->
        <a href="http://www.adobe.com/go/getflashplayer">
            <img src="get_flash_player.gif" alt="Get Adobe Flash player" />
        </a>
        <!--[if !IE]>-->
        </object>
        <!--<![endif]-->
    </object>


.. _flash-embed-section3:

L-O静态方式
--------------------------------------------------------------

**关于:**

    - L-O即 Lazy Object。
    - 仅有一个 OBJECT 标签。
    - 是O-O方式的偷懒写法。

**优点:**

    - PC上所有主流浏览器兼容。
    - 代码差异性很小。
    - 代码量较少。
    - 可以自定义替换内容Alternative content。

**缺点:**

    - 由于是O-O方式的偷懒法，故拥有O-O方式全部缺点。
    - 在部分浏览器下，SWF将不能被缓存。

**适用:**

    - 对页面请求数要求不高的页面。
    - 想偷懒又想能自定义替换内容Alternative content的页面。

**示例代码:**

.. code-block:: html

    <object  type="application/x-shockwave-flash"  data="SWF.swf"
    width="950" height="203" id="myFlashContent">
        <param name="movie" value="SWF.swf" />
        <param name="allowfullscreen" value="true" />
        <param name="allowscriptaccess" value="always" />
        <param name="allownetworking" value="all" />
        <param name="wmode" value="transparent" />
        <a href="http://www.adobe.com/go/getflashplayer">
            <img src="get_flash_player.gif" alt="Get Adobe Flash player" />
        </a>
    </object>

.. _flash-embed-section4:

L-E静态方式
-------------------------------

**关于:**

    - L-E即 Lazy Embed
    - 仅有一个 EMBED 标签。

**优点:**

    - 兼容当前所有主流浏览器。
    - 代码量最少。
    - 代码无差异性。
    - 无多余请求。

**缺点:**

    - 无法自定义替换内容Alternative content。
    - 非XHTML1.0规范(HTML5才正式纳入规范)。
    - 可能某些版本浏览器解析有问题。

**适用:**

    - 希望使用最少代码的页面
    - 不需要自定义替换内容Alternative content的页面

**示例代码:**

.. code-block:: html

    <embed src="SWF.swf"  width="950" height="203"
            allowfullscreen="true"
            allowscriptaccess="always"
            allownetworking="all"
            wmode="transparent"
            name="movie"
            pluginspage="http://www.macromedia.com/go/getflashplayer"
    />