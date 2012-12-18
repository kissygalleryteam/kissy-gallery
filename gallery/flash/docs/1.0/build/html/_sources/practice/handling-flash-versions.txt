处理Flash播放器版本
====================================

.. _flash-versions-section1:

满足期望的版本
-------------------------------

即使存在alternative content也不会显示。


.. code-block:: javascript

    if(KISSY.UA.fpvGEQ('9.1.0') {
        // 符合浏览SWF内容版本
    }

当然如果想了解客户端细节可以使用

.. code-block:: javascript

    var ver = KISSY.UA.fpv();
    if(ver){
        // 对ver做细节判断
        // 格式:[ Major, Minor, Revision ]
    }
    // 如果 未安装则 ver 为  undefined

.. _flash-versions-section2:

较旧的版本
----------------------------

对于使用 Flash 动态方式发布的swf,则会先尝试调用快速安装，如果未指定则不作任何操作。保留原入口显示

对于静态方式发布的SWF，如果有显示区域，则显示无内容的Flash播放器。即，播放器已实例化，而内容无法运行。


.. _flash-versions-section3:

未安装
------------------------------

对于使用 Flash 动态方式发布不作任何操作。保留原入口显示

如果有设置alternative content，则将显示该部分的内容。