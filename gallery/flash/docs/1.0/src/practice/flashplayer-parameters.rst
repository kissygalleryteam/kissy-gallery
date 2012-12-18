
FlashPlayer 参数
====================================

|  这里仅阐述允许在Flash配置项中的一些播放器参数。


所有参数列表
----------------

    * :data:`movie`
    * :data:`wmode`
    * :data:`flashvars`
    * :data:`allowscriptaccess`
    * :data:`allownetworking`
    * :data:`allowfullscreen`
    * :data:`play`
    * :data:`loop`
    * :data:`menu`
    * :data:`quality`
    * :data:`scale`
    * :data:`salign`
    * :data:`bgcolor`
    * :data:`devicefont`
    * :data:`base`
    * :data:`swliveconnect`
    * :data:`seamlesstabbing`


最常用参数
--------------------------

.. data:: movie

    {URL} - 必选, SWF 对象路径。

    .. note::

        IE only,因此在Flash中将自动完成，不需要写入配置项。

.. data:: wmode

    {String} - 可选, 播放器插件窗口模式。可取:

    * window 独立窗口模式 缺省;
    * opaque 带背景色,非窗口模式;
    * transparent 透明背景,非窗口模式;

.. data:: flashvars

    {String} - 可选, 自定义参数。

    * 发送根级变量(root level variables)给Flash对象。
    * 最大64KB字符串容量
    * &分隔开的 name = variable 的组合 （variable 的值可能 需要 encodeURIComponent）
    * 特殊或 /、 & 和不可打印字符需要转换。(单一一个空格可以用 + 表示)

    .. note::

        为避免冲突，JSON数据需要将双引号“ 改为单引号' 。因此需要在 Flash对象内进行还原。

.. data:: allowscriptaccess

    {String} - 可选, SWF的脚本访问授权标记。可取:

    * sameDomain 只允许访问和SWF来源域相同的页面API及脚本 缺省
    * always 允许任何域的SWF访问当前承载页API及脚本
    * never 不允许访问当前承载页脚本

    .. note::

        - Flash player 9.0.115.0以上版本从always 变更至 sameDomain。
        - 承载页API:如页面跳转。

.. data:: allownetworking

    {String} - 可选, SWF的网络访问授权标记。可取:

    * all 允许SWF使用所有网络访问 缺省;
    * internal 仅允许SWF内建的网络访问，不能调用浏览器导航或浏览器交互 API
    * none 不允许访问当前承载页脚本

    .. note::

        - Flash player 9.0.115.0以上版本从always 变更至 sameDomain。

        - 当为 internal，则将视 allowscriptaccess为nerver。

.. data:: allowfullscreen

    {Boolean} - 可选, SWF的页面全屏模式授权标记。可取:

    * false 不允许全屏模式 缺省
    * true 允许全屏显示

    .. note::

        需要Flash Player 9.0.27.0以上版本。


显示控制参数
--------------------------------------

.. data:: play

    {Boolean} - 可选, SWF自动播放标记, 加载SWF后是否立刻开始播放。可取:

    * false 不允许自动播放 缺省
    * <true> 允许自动播放

    .. note::

        需要Flash Player 9.0.27.0以上版本。

.. data:: loop

    {Boolean} - 可选, SWF循环播放标记。播放到最后一帧时是否重新开始播放。可取:

    * false 不允许循环播放 缺省
    * true 允许循环播放

.. data:: menu

    {Boolean} - 可选, 显示完整右键菜单标记 。可取:

    * true 显示完整的菜单 缺省
    * false 仅仅显示'设置'选项和'about'选项

.. data:: quality

    {String} - 可选, 显示品质标记 。回放期间使用的消除锯齿级别，是显示质量和运行速率间的权衡值, 可取:

    * high 使外观优先于回放速度，它始终应用消除锯齿功能。 缺省
    * best 提供最佳的显示品质，而不考虑回放速度。
    * autohigh 在开始时是回放速度和外观两者并重，但在必要时会牺牲外观来保证回放速度。
    * medium 会应用一些消除锯齿功能，但并不会平滑位图。
    * autolow 优先考虑速度，但是也会尽可能改善外观。
    * low 使回放速度优先于外观，而且从不使用消除锯齿功能。

.. data:: scale

    {String} - 可选, 可视区域的缩放模式标记 。 可取:

    * showall 显示全部并保持原始宽高比 缺省
    * noborder 无边界并保持原始宽高比
    * exactfit 适应性填充，不保持原始宽高比
    * noscale 不缩放，保持原始宽高比

.. data:: salign

    {String} - 可选, 缩放对齐方式标记, 默认为空 。可取:

    * l 按左边对齐
    * t 按上边对齐
    * r 按右边对齐
    * b 按下边对齐
    * tl 按左上边对齐
    * tr 按右上边对齐
    * bl 按左下边对齐
    * br 按右下边对齐

.. data:: bgcolor

    {String} - 可选, 缩放对齐方式标记 。<#RRGGBB> 带#号的十六进制 RGB 值

    .. note::

        当wmode为非 transparent时有效。

.. data:: devicefont

    {Boolean} - 可选, 对于未选定“设备字体”选项的静态文本对象是否仍使用设备字体进行绘制 。可取:

    * false 缺省
    * true

    .. note::

        Flash包含了3种设备字体：
            _sans (类似 Helvetica 或 Arial)
            _serif (类似 Times Roman)
            _typewriter (类似 Courier)


其它参数
--------------------------------

.. data:: base

    {URL|PATH} - 可选, SWF内相对路径基址标记。默认为空

.. data:: swliveconnect

    {Boolean} - 可选, 选择启动Flash时是否先启动JAVA标记 。可取:

    * false 缺省
    * true

    .. note::

        - 启动 Java 会显着增加 SWF 文件的启动时间；因此，只有在必要时才应将此标签设置为 true。
        - 使用 fscommand() 动作可从独立的SWF中自动启用 Java。

.. data:: seamlesstabbing

    {Boolean} - 可选, 启动无缝Table选择标记 。可取:

    * false 缺省
    * true

    .. note::

        在使用Table键时，焦点是否可以移入移出Flash对象。当wmode为 window时可能失效。

