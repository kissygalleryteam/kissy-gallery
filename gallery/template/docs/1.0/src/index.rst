.. module:: template

KISSY Gallery Template
===============================================

|  模板, 具备如下特性：
|      - 模板语法,从 ``{{#tagName}}`` 开始,由 ``{{/tagName}}`` 结束(如果有结束标签的话).
|      - 模板变量, ``{{variable}}`` .
|      - 原生支持 if/elseif/else/each/! 四个标签.
|      - 支持嵌套.
|      - 容错和调试.
|      - 性能还不赖.
|      - 容易扩展.
   
Usage
-----------------------------------------------

    **获取模块值**

        .. code-block:: javascript

            KISSY.use("template",function(S,Template){

            });

    
    **正常调用：**
    
    其中 Template('template here.')返回编译后的模板方法, 可调用render渲染不同的数据
    
        .. code-block:: javascript
        
            Template('template here.').render(data);
        
    **语法扩展：**
    
    该方法,提供扩展语法的接口,目前支持标签语法开始,关闭及一个参数传递.

        .. code-block:: javascript

            Template.addStatement({'while': {
                start: 'while(KS_TEMPL_STAT_PARAM){',
                end: '}'
            }});

        即可支持 ``while`` 语句

        .. code-block:: javascript

            {{#while true}}
                BLOCK
            {{/while}}
    
    

Syntax
-----------------------------------------------

变量
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    变量支持JavaScript语法里的任何有返回值的语句,比如  ``name`` ,  ``user.name`` ,  ``user[0].name`` , 甚至可以使用方法,  ``KISSY.one('#template').html()``        

    语法：

    .. code-block:: javascript

        {{Variable}}

    范例：

    .. code-block:: javascript

        Template('Hello, {{name}}.')
            .render({name: 'Frank'});

        Hello, Frank.

        Template('Hello, {{user.name}}.')
            .render({user: {name: 'Frank'}});

        Hello, Frank.

if 语句
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    语法：

    .. code-block:: javascript
     
        {{#if conditions}}
            BLOCK
        {{/if}}

    范例：

    .. code-block:: javascript

        Template('Hello, {{#if show}}{{name}}{{/if}})')
            .render({show: true, name: 'Frank'});

        Hello, Frank

else和elseif
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    语法：

    .. code-block:: javascript

        {{#if conditions}}
            BLOCK
        {{#elseif conditions}}
            ELSEIF BLOCK
        {{#else}}
            ELSE BLOCK
        {{/if}}

    范例：

    .. code-block:: javascript

        Template('Hello, {{#if showName}}{{name}}.{{#else}}{{nick}}{{/if}})')
            .render({showName: false, name: 'Frank', nick: 'yyfrankyy'});

        Hello, yyfrankyy.

        Template('Hello, {{#if name}}{{name}}.{{#elseif nick}}{{nick}}{{/if}})')
            .render({name: 'Frank', nick: 'yyfrankyy'});

        Hello, Frank.

each
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    循环读取某个变量,直接调用 ``KISSY.each`` 方法进行遍历.

    语法：

    .. code-block:: javascript

        {{#each conditions as value index}}
            BLOCK
        {{/each}}

    注意 ``as value index`` 可选

    范例1(使用默认的循环参数)：

    .. code-block:: javascript

        Template('Hello, {{#each users}}<b color="{{_ks_value.color}}">{{_ks_value.user}}</b>{{/each}})')
            .render({users: [{name: 'Frank', color: 'red'}, {name: 'yyfrankyy', color: 'green']});

        Hello, <b color="red">Frank</b><b color="green">yyfrankyy</b>

    范例2(使用自定义参数,可选)：

    .. code-block:: javascript

        Template('Hello, {{#each users as user}}<b color="{{user.color}}">{{user.name}}</b>{{/each}})')
            .render({users: [{name: 'Frank', color: 'red'}, {name: 'yyfrankyy', color: 'green']});

        Hello, <b color="red">Frank</b><b color="green">yyfrankyy</b>

        Template('Hello, {{#each users as user index}}<b color="{{user.color}}">{{index}}:{{user.name}}</b>{{/each}})')
            .render({users: [{name: 'Frank', color: 'red'}, {name: 'yyfrankyy', color: 'green']});

        Hello, <b color="red">0:Frank</b><b color="green">1:yyfrankyy</b>

    范例3(嵌套使用)：

    .. code-block:: javascript

        Template('Hello, {{#each users as user}}<b color="{{user.color}}">{{#each user.names as name}}{{name}}{{/each}}</b>{{/each}})')
            .render({users: [{names: ['Frank', 'Wang'], color: 'red'}, {names: ['Frank', 'Xu'], color: 'green']});

        Hello, <b color="red">FrankWang</b><b color="green">FrankXu</b>

单行注释
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    语法：

    .. code-block:: javascript

        {{#! comments}}

    范例：

    .. code-block:: javascript

        Template('Hello, {{#! here you go.}}{{name}}.').render({name: 'Frank'});

        Hello, Frank.

标签嵌套
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    理论上支持任意标签嵌套,如果标签有关闭字符,记得关闭=,=,嵌套标签形成多代码块嵌套,作用域与JavaScript的作用域一致.

    语法：

    .. code-block:: javascript

        {{#each object}}
            {{#if condition}}
                BLOCK
            {{/if}}
        {{/each}}

    范例：

    .. code-block:: javascript

        Template('Hello, {{#each users}}{{#if _ks_value.show}}{{_ks_value.name}}{{/if}}{{/each}}.')
            .render({users: [{show: false, name: 'Frank'}, {show: true, name: 'yyfrankyy'}]});

        Hello, yyfrankyy.

容错和调试.
---------------------------------------------------

容错
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    目前支持两种错误信息:

    1. Syntax Error. 指模板在预编译阶段发生语法错误(模板编译后生成的脚本语法错误).
    2. Render Error. 指模板在渲染时发生错误(运行时错误,数据错误,或者模板变量错误等).

调试
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    默认情况下,模板将编译时和运行时的错误,直接返回到结果里.

    调试过程可调用 ``Template.log()`` 方法输出渲染方法,定位脚本模板错误,并可通过引用 ``jsbeauty`` 来格式化生成的模板方法.

模板性能对比
-------------------------------------------------------

https://spreadsheets.google.com/ccc?key=0ApZFGfLktT7FdDgtcGdzWV9wSzRpX2FRTElzZmVoV2c&hl=en#gid=3


demo 实例
---------------------------------------------------------

.. raw:: html

    <iframe src='../../src/raw/demo.html' height='400' width='100%'
     frameBorder="0"
     style='border:none;'></iframe>


.. note::

    模板变量不能为 JS 关键字，例如 delete if 等.