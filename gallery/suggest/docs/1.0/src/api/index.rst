.. module:: suggest

KISSY Gallery Suggest
===============================================

|  提示补全, 支持如下功能：
|    - 完全跨域
|    - cache 功能
|    - 支持键盘控制：上下选择及回车后直接提交, ESC 键关闭
|    - 支持鼠标控制：鼠标选择和点击提交功能
|    - 支持匹配文字加亮
|    - 动画效果
|    - 在提示层中显示第一个搜索结果
|    - 整合本地表单的提示记录
|    - 关键词的模糊匹配提示功能
|    - 自定义提示Dom渲染
|    - 支持本地数据

Class
-----------------------------------------------

  * :class:`Suggest`

  
Configs
-----------------------------------------------

  * :data:`containerCls`
  * :data:`containerWidth`
  * :data:`resultFormat`
  * :data:`closeBtn`
  * :data:`closeBtnText`
  * :data:`shim`
  * :data:`autoFocus`
  * :data:`submitOnSelect`
  * :data:`offset`
  * :data:`charset`
  * :data:`callbackName`
  * :data:`callbackFn`
  * :data:`queryName`
  * :data:`dataType`
  * :data:`contentRender`
 
 
Attributes
-----------------------------------------------

  * :attr:`textInput`
  * :attr:`config`
  * :attr:`dataSource`
  * :attr:`returnedData`
  * :attr:`container`
  * :attr:`content`
  * :attr:`footer`
  * :attr:`query`
  * :attr:`queryParams`
  * :attr:`dataScript`
  * :attr:`selectedItem`

  
Methods
-----------------------------------------------

  * :meth:`start`
  * :meth:`stop`
  * :meth:`show`
  * :meth:`hide`
  * :meth:`isVisible`

  
Events
-----------------------------------------------

  * :meth:`beforeStart`
  * :meth:`itemSelect`
  * :meth:`beforeSubmit`
  * :meth:`beforeDataRequest`
  * :meth:`dataReturn`
  * :meth:`updateFooter`
  * :meth:`beforeShow`


Class Detail
-----------------------------------------------

.. class:: Suggest
    
    | **Suggest** (textInput, dataSource[, config])
    
    :param String|HTMLElement textInput: 输入框.
    :param String|Array<Object> dataSource: 获取提示的数据源, 可为远程URL, 或本地数据.
    :param Object config: 配置项, 详细见下方 **Configs Detail** .
    
    提示层的默认HTML结构如下：
    
    .. code-block:: html
    
        <div class='ks-suggest-container {containerCls}'>
            <ol class="ks-suggest-content">
                <li>
                    <span class='ks-suggest-key'>...</span>
                    <span class='ks-suggest-result'>...</span>
                </li>
            </ol>
            <div class='ks-suggest-footer'>
                <a class='ks-suggest-close-btn'>...</a>
            </div>
        </div>

    
Configs Detail
-----------------------------------------------


.. data:: containerCls

    {String} - 用户附加给悬浮提示层的 class.
    
.. data:: containerWidth

    {String} - 默认为和input等宽. 提示层的宽度, 必须带单位, 如'200px', '10%' 等.

.. data:: resultFormat

    {String} - 默认为 '%result%' ,  result 的格式.
    
.. data:: closeBtn

    {Boolean} - 默认为 false, 是否显示关闭按钮.
    
.. data:: closeBtnText

    {String} - 默认为 '关闭', 关闭按钮上的文字.
    
.. data:: shim

    {Boolean} - 是否需要 iframe shim 默认只在 ie6 下显示.
    
.. data:: autoFocus

    {Boolean} - 默认为 false , 初始化后, 自动激活.
    
.. data:: submitOnSelect

    {Boolean} - 默认为 true , 选择某项时, 是否自动提交表单.
    
.. data:: offset

    {Number} - 默认为 -1 , 提示悬浮层和输入框的垂直偏离. 默认向上偏差 1px, 使得悬浮层刚好覆盖输入框的下边框.
    
.. data:: charset

    {String} - 默认为 'utf-8' , 数据接口返回数据的编码.
    
.. data:: callbackName

    {String} - 默认为 'callback' , 回调函数的参数名.
    
.. data:: callbackFn

    {String} - 默认为 'KISSY.Suggest.callback' , 回调函数的函数名
    
.. data:: queryName

    {String} - 默认为 'q' , 查询的参数名
    
.. data:: dataType

    {Number} - 默认为 0 , 数据源标志, 默认为 0 , 可取 0, 1, 2
         * - 0: 数据来自远程, 且请求回来后存入 _dataCache
         * - 1: 数据来自远程, 且不存入 _dataCache, 每次请求的数据是否需要缓存, 防止在公用同一个 suggest , 但数据源不一样时, 出现相同内容
         * - 2: 数据来自静态, 不存在时, 不显示提示浮层
    
.. data:: contentRender



    {Function} - 默认为 null , 提示层内容渲染器. 该渲染器以返回的data为唯一参数, 且返回渲染的内容,可选项要求由"li"标签包裹, 并将用于表单提交的值存储在"li"元素的key属性上.
    

    
Attributes Detail
-----------------------------------------------

.. attribute:: textInput

    {HTMLElement} - 文本输入框.

.. attribute:: config

    {Object} - 配置参数.

.. attribute:: dataSource

    {String | Object} - 数据源.

.. attribute:: returnedData 

    {Object} - 通过 jsonp 返回的数据.

.. attribute:: container

    {HTMLElement} - 存放提示信息的容器.

.. attribute:: content

    {HTMLElement} - 存放提示信息的内容部分容器.

.. attribute:: footer

    {HTMLElement} - 存放提示信息的额外内容容器.

.. attribute:: query

    {String} - 输入框的值.

.. attribute:: queryParams

    {String} - 获取数据时的参数.

.. attribute:: dataScript

    {HTMLElement} - 获取数据的 script 元素.

.. attribute:: selectedItem

    {HTMLElement} - 提示层的当前选中项.

    
Methods Detail
-----------------------------------------------

.. method:: start
    
    | **start** ()
    | 启动计时器, 开始监听用户输入.

.. method:: stop
    
    | **stop** ()
    | 停止计时器.

.. method:: show
    
    | **show** ()
    | 显示提示层.

.. method:: hide
    
    | **hide** ()
    | 隐藏提示层.

.. method:: isVisible
    
    | **isVisible** ()
    | 提示层是否显示.

    :returns: 返回true表示处于显示状态, 否则处于隐藏状态.

    
Events Detail
-----------------------------------------------

.. method:: beforeStart

    | **beforeStart** ( )
    | 监控计时器开始前触发, 可以用来做条件触发. 注册的事件可反回Boolean值来确定事件是否生效.
    
.. method:: itemSelect

    | **itemSelect** ( )
    | 选中某项时触发, 可以用来添加监控埋点等参数. 注册的事件可反回Boolean值来确定事件是否生效.
    
.. method:: beforeSubmit

    | **beforeSubmit** ( ev )
    | 表单提交前触发, 可以用来取消提交或添加特定参数.
    
    :param Object ev.form: 所在的表单. 注册的事件可反回Boolean值来确定事件是否生效.
    
.. method:: beforeDataRequest

    | **beforeDataRequest** ( )
    | 请求数据前触发, 可以用来动态修改请求 url 和参数. 注册的事件可反回Boolean值来确定事件是否生效.
    
.. method:: dataReturn

    | **dataReturn** ( ev )
    | 获得返回数据时触发, 可以用来动态修正数据.
    
    :param Object ev.data: 返回的数据. 注册的事件可反回Boolean值来确定事件是否生效.
    
.. method:: updateFooter

    | **updateFooter** ( ev )
    | 更新底部内容时触发, 可以用来动态添加自定义内容.
    
    :param Object ev.footer: 即 :attr:`footer` .
    :param Object ev.query: 即 :attr:`query` .
    
.. method:: beforeShow

    | **beforeShow** ( )
    | 显示提示层前触发, 可以用来动态修改提示层数据. 注册的事件可反回Boolean值来确定事件是否生效.