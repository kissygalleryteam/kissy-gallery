
关于 alternative content
====================================

.. _flash-alternative-section1:

什么是 alternative content
--------------------------------------

替换内容(alternative content)。如果Flash插件没有安装或者不被支持(版本过低)那么这些替换内容就会被显示出来。

.. note::

    OBJECT tag only。参考 OBJECT fallback

示例：

.. code-block:: html

    <object  type="application/x-shockwave-flash"  data="PATH2SWF.swf" width="800" height="600" >
        <param name="movie" value=" PATH2SWF.swf " />
        <param name="flashvars" value="a=1&b=2"  />
        <a href="go/getflashplayer" >
            <img src="get_flash_player.gif" alt="Get Adobe Flash player" />
        </a>
    </object>

.. _flash-alternative-section2:

FAQ
------------------------------

**Q: 当Flash 对象(SWF)请求为404时是否被启用？**

A: 否，只有Flashplayer版本过低或未安装调用。

**Q: fallback在非IE下内容是否会被请求？**

A: 是，部分浏览器会请求此处内容，无论是否被满足条件。

