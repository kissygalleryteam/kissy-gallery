## 综述

Calendar是一个为旅行业务量身定制的日历组件

* 版本：1.1
* 基于：kissy1.3（兼容kissy1.2，不兼容kissy1.1.6）
* 作者：昂天

#### Calendar的特性

* 支持静态日历展示
* 支持弹出式日历展示
* 支持多日历展示
* 支持节假日信息展示
* 支持显示节假日前1~3天，后1~3天日期信息
* 支持日期操作范围限定
* 触发节点支持selector批量设置，共享日历实例

## 组件Demo

* [静态日历，基本参数配置使用演示](../demo/demo1.html)
* [酒店/机票应用演示](../demo/demo2.html)

## 组件快速上手

kissy1.2下需要gallery的包配置：

```
KISSY.config({
    packages:[
        {
            name   : 'gallery',
            path   : 'http://a.tbcdn.cn/s/kissy/',
            charset: 'utf-8'
        }
    ]
});
```

kissy1.3就不需要该配置。

### 1.加载Calendar模块

```
KISSY.use('gallery/calendar/1.1/index', function(S, Calendar) {

});
```
**提醒**：use()的回调，第一个参数是KISSY，第二个参数才是组件实例。

### 2.初始化Calendar

```
KISSY.use('gallery/calendar/1.1/index', function(S, Calendar) {
    var calendar = new Calendar(cfg);
});
```

Calendar类接受一个参数，即组件属性配置。

## 组件属性说明

<table>
    <thead>
        <tr>
            <th style="width: 110px;">参数名</th>
            <th style="width: 80px;">类型</th>
            <th style="width: 70px;">默认值</th>
            <th>描述</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>date</td>
            <td>Date/String</td>
            <td>new Date()</td>
            <td>日历初始日期</td>
        </tr>
        <tr>
            <td>count</td>
            <td>Number</td>
            <td>2</td>
            <td>日历个数</td>
        </tr>
        <tr>
            <td>selectDate</td>
            <td>String</td>
            <td>null</td>
            <td>选择的日期</td>
        </tr>
        <tr>
            <td>minDate</td>
            <td>Date/String</td>
            <td>null</td>
            <td>允许操作的最小日期</td>
        </tr>
        <tr>
            <td>maxDate</td>
            <td>Date/String</td>
            <td>null</td>
            <td>允许操作的最大日期</td>
        </tr>
        <tr>
            <td>startDate</td>
            <td>String</td>
            <td>''</td>
            <td>开始日期</td>
        </tr>
        <tr>
            <td>endDate</td>
            <td>String</td>
            <td>''</td>
            <td>结束日期</td>
        </tr>
        <tr>
            <td>afterDays</td>
            <td>Number</td>
            <td>0</td>
            <td>等价于设置minDate和maxDate，minDate未设置时取当前日期</td>
        </tr>
        <tr>
            <td>message</td>
            <td>String</td>
            <td>''</td>
            <td>提示信息</td>
        </tr>
        <tr>
            <td>triggerNode</td>
            <td>String</td>
            <td>''</td>
            <td>触发节点，支持批量设置，用半角逗号分隔。弹出式日历必选配置。例('#ID, .className, ...')</td>
        </tr>
        <tr>
            <td>finalTriggerNode</td>
            <td>String</td>
            <td>''</td>
            <td>触发节点，支持批量设置，用半角逗号分隔。弹出式日历必选配置。例('#ID, .className, ...')</td>
        </tr>
        <tr>
            <td>container</td>
            <td>String</td>
            <td>''</td>
            <td>放置日历的容器。非弹出式日历必选配置</td>
        </tr>
        <tr>
            <td>isSelect</td>
            <td>Boolean</td>
            <td>false</td>
            <td>是否开启下拉列表选择日期，如果开启，日历个数限制为 1</td>
        </tr>
        <tr>
            <td>isDateInfo</td>
            <td>Boolean</td>
            <td>true</td>
            <td>是否显示日期信息</td>
        </tr>
        <tr>
            <td>isDateIcon</td>
            <td>Boolean</td>
            <td>true</td>
            <td>是否显示日期图标</td>
        </tr>
        <tr>
            <td>isHoliday</td>
            <td>Boolean</td>
            <td>true</td>
            <td>是否显示节假日信息</td>
        </tr>
    </tbody>
</table>


## 组件事件说明

<table>
    <thead>
        <tr>
            <th style="width: 140px;">事件名</th>
            <th style="width: 200px;">回调参数</th>
            <th>描述</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>render</td>
            <td>{}</td>
            <td>渲染日历后触发</td>
        </tr>
        <tr>
            <td>show</td>
            <td>{}.node：触发显示日历的节点</td>
            <td>日历显示后触发</td>
        </tr>
        <tr>
            <td>hide</td>
            <td>{}.node：触发隐藏日历的节点</td>
            <td>日历隐藏后触发</td>
        </tr>
        <tr>
            <td>prevmonth</td>
            <td>{}</td>
            <td>切换至上个月份后触发</td>
        </tr>
        <tr>
            <td>nextmonth</td>
            <td>{}</td>
            <td>切换至下个月份后触发</td>
        </tr>
        <tr>
            <td>dateclick</td>
            <td>{}.date：日期字符串<br />{}.dateInfo：日期信息</td>
            <td>日期点击后触发</td>
        </tr>
        <tr>
            <td>showmessage</td>
            <td>{}</td>
            <td>显示提示信息后触发</td>
        </tr>
        <tr>
            <td>hidemessage</td>
            <td>{}</td>
            <td>隐藏提示信息后触发</td>
        </tr>       
    </tbody>
</table>

## 组件方法说明

#### render()：设置属性后渲染日历

```
// 用于设置属性后渲染日历
calendar.render();
```

#### prevMonth()：渲染上月日历

```
// 渲染上月日历
calendar.prevMonth();
```

#### nextMonth()：渲染下月日历

```
// 渲染下月日历
calendar.nextMonth();
```

#### show()：显示日历

```
// 显示日历
calendar.show();
```

#### hide()：隐藏日历

```
// 隐藏日历
calendar.hide();
```

#### showMessage()：显示提示信息

```
// 显示提示信息
calendar.showMessage();
```

#### hideMessage()：隐藏提示信息

```
// 隐藏提示信息
calendar.hideMessage();
```

#### getSelectedDate()：获取选择的日期

```
// 获取选择的日期
calendar.getSelectedDate();
```

#### getCurrentNode()：获取当前触发元素节点

```
// 获取当前触发元素节点
calendar.getCurrentNode();
```

#### getDateInfo()：获取指定日期相关信息

```
// 获取指定日期相关信息
calendar.getDateInfo(‘2013-05-01’); // 劳动节
```


#### syncUI()：同步UI，主要用于动态创建触发元素后使用

```
//动态创建一个触发元素
S.one('body').append('<input type="text" class=".J_Item" />');
//让新创建的触发元素可以触发日历
calendar.syncUI();
```