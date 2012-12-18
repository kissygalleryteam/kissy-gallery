
静态发布方式
====================================

|  假如您已阅读了 `嵌入SWF的几种方式 <embed-swf-onto-webpage.html>`_ 和 `Flash播放器参数 <flashplayer-parameters.html>`_ ，这里将会变的非常简单。

一般的静态发布方式
---------------------------------------

**HTML步骤:**

1, 在SWF内容前，至少引入以下JS：

.. code-block:: html

    <script src="seed.js"></script>

2, 在期望的位置写上 SWF嵌入代码。（这里以 O-O方式插入）

.. code-block:: html

    <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
    width="200" height="150" id="myFlashContent2">
        <param name="movie" value="assets/test.swf"/>
        <!--[if !IE]>-->
        <object type="application/x-shockwave-flash"
        data="assets/test.swf" width="200" height="150">
        <!--<![endif]-->
        <a href="http://www.adobe.com/go/getflashplayer">
            <img src="get_flash_player.gif" alt="Get Adobe Flash player"/>
        </a>
        <!--[if !IE]>-->
        </object>
        <!--<![endif]-->
    </object>

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

.. code-block:: html

    F.add('#myFlashContent2');  //注意  "#" 号.