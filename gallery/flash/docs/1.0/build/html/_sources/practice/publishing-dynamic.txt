
动态发布方式
====================================

|  具有以下几种动态发布方式:
|  - :ref:`最小限度的动态发布 <flash-dynamic-section1>`
|  - :ref:`套用CSS <flash-dynamic-section2>`
|  - :ref:`使用flashvars配置flash对象 <flash-dynamic-section3>`
|  - :ref:`使用 JSON 配置flash对象 <flash-dynamic-section4>`
|  - :ref:`使用快速安装(express install) <flash-dynamic-section5>`

 .. _flash-dynamic-section1:

最小限度的动态发布
----------------------------------

**HTML步骤:**

1, 在SWF内容前，至少引入以下JS：

.. code-block:: html

    <script src="seed.js"></script>

2, 在期望插入SWF写上HTML钩子.如命名钩子为

.. code-block:: html

    <div id="myFlashContent"></div>

.. note::

    - 请不要在此入口HTML上写上其他HTML属性,此处内容将会被替换。

    - 尽可能减少针对此ID的CSS样式。

**Javascript步骤:**

1, 期望插入的SWF对象之后，插入操作SWF的相关JS代码：

.. code-block:: html

    <script src="PATH2YOURSCRIPT.js"></script>

2, 或在SCRIPT标签中写上相关操作SWF的JS代码

.. code-block:: html

    <script>
        //do sth.
    </script>

3, 在代码中可以这么写：

.. code-block:: javascript

    Flash.add('#myFlashContent',
        {
         src: 'PATH2YOURSWF.swf'
        }
    );  //注意  "#" 号.

.. _flash-dynamic-section2:

套用CSS
----------------------------------

**HTML步骤:**

同上面的 :ref:`最小限度的动态发布 <flash-dynamic-section1>`

**Javascript步骤:**

1, 仅需要修改"最小限度的动态发布"第3步:

.. code-block:: javascript

    Flash.add('#myFlashContent',
        {
         src: 'PATH2YOURSWF.swf',
         attrs: {
                    'class':"swfstyle",
                    width: 800,
                    height: 600
                }
        }
    );

2, 如果希望仅由CSS来控制高宽变化，则请将高宽置 100%:

.. code-block:: javascript

    Flash.add('#myFlashContent',
        {
         src: 'PATH2YOURSWF.swf',
         attrs: {
                    'class':"swfstyle",  // 指定样式名 ，多个请由英文半角逗号隔开。
                    width: "100%",
                    height: "100%"
                }
        }
    );

**CSS步骤:**

.. code-block:: html

    .swfstyle {
        width: 250px;
        height: 250px;
    }

.. _flash-dynamic-section3:

使用flashvars配置flash对象
---------------------------------------------

|    本部分描述将假设您已了解以下内容：
|
|        - :ref:`最小限度的动态发布 <flash-dynamic-section1>`
|        - :ref:`套用CSS <flash-dynamic-section2>`

.. code-block:: javascript

    var flashvars = {
        // 以下为传递给 flash 对象的参数
        name1: 'configuration value #1',
        name2: 'configuration value #2',
        name3: 'Hello World! I am changing'
    }

    Flash.add('#myFlashContent',
        {
         src: 'PATH2YOURSWF.swf',
         params:{
               flashvars : flashvars
         }
        }
    );

.. _flash-dynamic-section4:

使用 JSON 配置flash对象
-----------------------------------------------

|    本部分描述将假设您已了解以下内容：
|        - :ref:`最小限度的动态发布 <flash-dynamic-section1>`
|        - :ref:`套用CSS <flash-dynamic-section2>`

.. code-block:: javascript

    var flashvars = {
        // 以下为传递给 flash 对象的参数
        // config 对象将被自动JSON字符串化
        config: {
            clip:  {
                autoPlay: false,
                autoBuffering: true,
                source: [
                      'http://movie_a.flv',
                      'http://movie_b.flv',
                      'http://movie_c.flv'
                      ]
            }
        },
        array:[1,2,3,4,5,6,7]
    }

    Flash.add('#myFlashContent',
        {
         src: 'PATH2YOURSWF.swf',
         params:{
               flashvars : flashvars
         }
        }
    );

.. _flash-dynamic-section5:

使用快速安装(express install)
-----------------------------------------------

|    本部分描述将假设您已了解以下内容：
|        - :ref:`最小限度的动态发布 <flash-dynamic-section1>`
|        - :ref:`套用CSS <flash-dynamic-section2>`
|        - `Flash快速安装(express install) <http://www.adobe.com/devnet/flashplayer/articles/express_install.html>`_

.. code-block:: javascript

    F.add('#myFlashContent', {
        src: 'assets/test.swf',
        xi: 'express-install/expressInstall.swf',
        version: 20.2   // 强行观摩 :p
    });

.. note::

    需要flash player 8 版本以上。