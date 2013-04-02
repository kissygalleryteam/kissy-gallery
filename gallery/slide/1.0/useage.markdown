- <a href="d1.html">Demo1</a>
- <a href="d2.html">Demo2</a>
- <a href="d3.html">Demo3</a>
- <a href="d4.html">Demo4</a>
- <a href="d5.html">Demo5</a>
- <a href="d6.html">Demo6</a>
- <a href="d7.html">Demo7</a>
- <a href="d8.html">Demo8</a>
- <a href="touch.html">Touch</a>

> 这是一个选项卡切换控件，基于KISSY 1.3.0，并针对移动终端（ios/Android）有简单的性能优化，动画流畅，支持基础的触屏事件。

## 开始使用

	<script>
		// 回调传入了S（KISSY对象）和Slide构造器
		KISSY.use('gallery/slide/1.0/',function(S,Slide){
			// 这里可以调用Slide
		});
	</script>

Slide依赖典型的HTML结构

	<div id="J_tab" class="slide-style">
		<ul class="tab-nav clearfix"><!--选项卡导航，内容可以是空-->
			<!--若内容为空，则Slide会创建<li></li>-->
			<li class="selected"><a href="#">1</a></li>
			<li><a href="">2</a></li>
			<li><a href="">3</a></li>
			<li><a href="">4</a></li>
		</ul>
		<div class="tab-content"><!--选项卡内容的父容器-->
			<div class="tab-pannel"><!--选项卡的每项的容器-->
				<!--第1个选项卡中的内容-->
			</div>
			<!--一般情况下，需要指定默认情况非首帧是否显示-->
			<div class="tab-pannel hidden">
				<!--第2个选项卡中的内容-->
			</div>
			<div class="tab-pannel hidden">
				<!--第3个选项卡中的内容-->
			</div>
			<div class="tab-pannel hidden">
				<!--第4个选项卡中的内容-->
				<textarea class="data-lazyload">
					延时加载的内容
				</textarea>
			</div>
		</div>
	</div>

- `#J_tab`，Slide的ID，名称自取，必须指定，用作hook
- `ul.tab-nav`,控制导航,必须指定,容器内容可以为空，默认指定自然数为下标，名称可定制
- `ul.tab-nav li.selected`,控制tab页签,若有li，则必须指定，名称可定制
- `div.tab-content`，内容容器，必须指定，名称可定制
- `div.tab-content div.tab-pannel`，内容面板，必须指定，名称可定制

这样来调用：

	KISSY.use('gallery/slide/1.0/',function(S,Slide){
		var s = new Slide('JSlide');
	});

## Slide的样式

如果是图片轮播，`div.tab-content`需要指定宽高，超出部分隐藏掉，`div.tab-pannel`的宽高都为100%即可，这里需要指定`div.tab-content`的`position:relative`。

普通tab点击切换（无特效），内容部分高度不定，若带滚动切换效果，`div.tab-content`尺寸可以随意，Slide会根据pannel的尺寸来初始化当前父容器的尺寸

基本结构包含导航和内容两部分，“向前”、“向后”的按钮切换由开发者添加,只需保证基本原型html的完整即可

控制样式的className可以配置，需要在js中启动的时候做相应配置，在不配置的情况下，Slide以典型html结构做为默认配置进行渲染 

## 初始化

通过构造函数的形式来渲染一个幻灯（Tab），第二个对象是配置参数，比如下面这两段代码，这段代码用来初始化一个简单的Tab 

	new Slide('J_tab',{ // 直接指定id，而不是选择器
		eventype:'click' //通过点击页签来切换Tab
	});

通过配置参数来定制渲染的示例代码：

	new Slide('J_tab',{
		eventype:'click',//tab上的触发事件
		effect:'vSlide',//切换效果为纵向滚动
		autoSlide:true,//自动播放
		timeout:2000,//切换时间间隔
		speed:500,//切换速度，越小越快，单位为毫秒
		hoverStop:true//鼠标经过内容是否停止播放
	});

## 跑马灯原理

该Slide支持跑马灯效果，跑马灯是可以连续相同方向滚动的幻灯，帧首尾相连接。有两种实现方式，一种是滚动时将首（尾）的节点拷贝至尾（首），另一种是初始化时处理首尾的节点，滚动时只改变位置，出于性能的考虑，这里选用第二种方式。


由于窗口滑块所容纳的帧数可变，因此，需要同时复制多个帧至首位，数量根据Slide组件的colspan参数指定，比如，colspan参数默认为1，即滑块只容纳一个帧，首尾各复制一份。如果colspan为2，则滑块的跨度为2，复制两分，如图：

![](http://img02.taobaocdn.com/tps/i2/T1xl62Xb0fXXXcUVob-597-199.png)

切换幻灯的动作实际上是滑块移动的操作，滑块定位在初始位置由参数defaultTab指定，默认为0，如果colspan指定了跨度为2，则滑块初始位置为：

![](http://img01.taobaocdn.com/tps/i1/T1Cj61XcJkXXXuXRQf-599-148.png)

如果Slide不是跑马灯效果，则和基本的Tab切换原理一样，无须复制节点

<hr class="smooth large" />

## API 

Slide构造器第二个参数用以传入配置项，这些配置项为基础参数，Slide支持LayerSlide（多层动画），如果指定LayerSlide为true，需要了解SubLayer（帧里的子层）的配置参数

<hr class="smooth" />

### 基本参数

*autoSlide* (Boolean)

是否自动播放，默认为false

*speed* (Float)

帧切换的速度，默认为500(ms)

*timeout* (Number)

帧切换的时间间隔，默认为1000(ms)

*effect* (String)

帧切换类型，默认为'none',取值：

- none:无特效
- fade:渐隐
- hSlide:水平切换
- vSlide:垂直切换

*eventType* (String)

触发tab切换的nav上的事件类型，默认为'click'，推荐使用：

- click:点击
- mouseover:鼠标经过(这个可能会多次触发切换事件,不推荐)
- mouseenter:鼠标进入

*easing* (String)

帧切换的缓动值，默认为'easeBoth'，取值请参照[KISSY.Anim](http://docs.kissyui.com/docs/html/api/core/anim/index.html)

*hoverStop* (Boolean)

鼠标悬停在面板上是否停止自动播放，默认为true

*selectedClass* (String)

导航选中时的className，默认为'selected'

*conClass* (String)

整个Tab容器的className，可不传

*navClass* (String)

导航容器的className，默认为tab-nav

*triggerSelector* (String)

导航中的选项所在的选择器，即触碰元素的选择器，默认为li，如果为`<li><a></a></li>`，可以写为`li a`

*contentClass* (String)

Pannel父容器的ClassName，即Tab内容容器的className,默认为tab-content

*pannelClass* (String)

tab面板的className，默认为tab-pannel

*id* (String)

整个Tab组件所在的容器id，通常是通过Slide构造器的第一个参数指定，这里可不传，应当直接写id，比如"id"（正确），"#id" （不正确）

*carousel* (Boolean)

是否以跑马灯形式播放，默认为false

*touchmove* (Boolean)	

是否支持手指滑动切换，默认为false，Slide控件会自动检测移动设备，如果是，则默认增加触碰事件支持，因此滑动切换功能就没必要了，因此默认为false

*adaptive`_`fixed`_`width* (Boolean)

屏幕是否根据控件的宽度改变重新渲染尺寸，默认为false，主要在组件定宽高的场景中，保证resize时tab-pannel尺寸正确

*adaptive`_`fixed`_`height* (boolean) 

屏幕是否根据控件的高度改变重新渲染尺寸，默认为false,主要在组件定宽高的场景中，保证resize时tab-pannel尺寸正确

*adaptive`_`fixed`_`size* (boolean) 

屏幕是否根据控件的宽度和高度改变重新渲染尺寸，默认为false,主要在组件定宽高的场景中，保证resize时tab-pannel尺寸正确

*defaultTab* (Number)	

默认定位在某个帧，默认为0，即第一帧

*layerSlide* (Boolean)	

是否开启分层动画，默认为false（在IE6/7/8里始终关闭layerSlide）

*layerClass* (String)	

subLayer的className，默认值为tab-animlayer，未实现，默认用alt="sublayer"来标识

*reverse* (boolean) 	

"播放下一个"和"播放上一个"对调，默认为false

*adaptive`_`height* (function)

同下

*adaptive`_`width* (function)

如果是百分比设置容器的宽度的话，需要指定这个函数，返回一个宽度值，动态的得到可变化的宽度,默认为false，代码示例:

	var slide = new Slide('J_tab',{
		adaptive_width:function(){
			return document.body.offsetWidth;
		}
	});

*colspan* (Number)

滑块窗口的跨度，比如滑块中包含2帧，则指定为2

*webkitOptimize* (Boolean)

是否在webkit浏览器中开启硬件加速，默认为true，因为webkit在各平台中可能有bug，常需要临时性关闭移动设备中的硬件加速，则可以通过设置此属性为false来实现。

<hr class="smooth" />

### 事件

*ready*

初始化完成后的事件回调，带入上下文this，带入参数为

	{
		index:index,		// 当前帧的索引
		navnode:navnode,	// 当前导航的节点
		pannelnode:pannelnode//当前面板的节点
	}

*switch*

切换发生时的事件，特指切换动作必然发生时的时刻，回调上下文和参数同上

*beforeSwitch*

“切换至”的事件，回调返回false可以阻止切换事件的发生

*beforeTailSwitch*

从某一帧的角度看，这一帧切换到下一帧之前发生的事件,参数同上

*afterSwitch*

切换完成的动作

> 如果当Slide为跑马灯，且colspan大于1，则回调函数中的index值的取值可能会有偏差，原则上不推荐这种模式下获取当前帧的index

<hr class="smooth" />

### 方法

*init*	

初始化，参数为一个对象，带入配置项

*previous(callback)*

切换到上一个，可以传入callback，执行切换完毕后的回调

*next(callback)*

切换到下一个，可以传入callback，执行切换完毕后的回调

*go(index,callback)*

跳转到指定索引的帧，参数为index:0,1,2,3...，callback为切换完毕后的回调

*add(node,index)*

添加一个帧，node为待添加的节点，可以是node，也可以是字符串。index为加入的节点的位置，默认为最后一个

*remove(index)*

删除一个帧，传入要删除的帧的index

*removeLast*

删除最后一个帧，无参数，当只有一帧时无法删除这一帧

*play*

开始自动播放

*stop*

停止自动播放

*hightlightNav*

高亮某个特定的导航项，参数为索引值index:0,1,2,3...

*is`_`first*

是否当前停止在第一帧

*is`_`last*

是否当前停止在最后一真

*resetSlideSize*

可以传入一个索引值为参数，重置第index个Slide的宽度和高度,幻灯尺寸发生动态变化时，需要调用这个方法来重设宽高，内部方法

*relocateCurrentTab*

无参数，重新修正当前帧的位置，内部方法

*initLayer*

初始化SubLayer，无参数，（目前触屏模式下默认关闭）

<hr class="smooth" />

# Examples 

## 基本的tab切换

JS代码：

	KISSY.use('gallery/slide/1.0/',function(S,Slide){
		new Slide('Jtab',{
			eventType:'mouseenter' // 鼠标触碰切换
		});
	});

延迟加载的内容放置于textarea中，className为data-lazyload，其中可以执行JavaScirpt代码：

	<textarea class="data-lazyload">
		第三帧的内容，只被渲染一次
		<script>
			alert('延迟执行的脚本，只执行一次');
		</script>
	</textarea>

## 基本的帧切换

JS代码：

	KISSY.use('gallery/slide/1.0/',function(S,Slide){

		var s = new Slide('JSlide',{
			eventType:'click',//点击触碰点切换
			navClass:'scrollable-trigger',//导航样式
			contentClass:'scrollable-panel',//面板父容器样式
			pannelClass:'scrollable-content',//面板样式
			selectedClass:'current',//触碰点选中时的ClassName
			triggerSelector:'a',//触碰节点为a
			effect:'fade',//渐变切换
			autoPlay:true //开启自动播放
		});

		// 跳到下一帧
		S.one('#next').on('click',function(){
			s.next();
		});

		// 跳到上一帧
		S.one('#prev').on('click',function(){
			s.previous();
		});
	});

## 常规的单幅图片切换

配置effect为hSlide为水平切换，vSlide水垂直切换

JS代码：

	KISSY.use('gallery/slide/1.0/',function(S,Slide){
		var C = new Slide('slides',{
			autoSlide:true,
			effect:'vSlide', //垂直切换
			timeout:3000,
			speed:700,
			selectedClass:'current'
		});
	});

## 多福图片的逐帧切换

需要定义colspan，即窗口显示的帧的个数

JS代码：

	KISSY.use('gallery/slide/1.0/',function(S,Slide){
		new Slide('JSlide',{
			effect:'hSlide', //水平切换
			carousel:true, //可以配置为跑马灯,也可以为false
			colspan:3 // 定义跨度为3
		});
	});

如果切换到下一帧的动作是向右滑动，则配置reverse为true，即颠倒切换上一帧和下一帧的动作

## 单帧切换时的跑马灯效果

代码同上，去掉colspan配置即可

> 垂直切换时的多副图片逐帧切换的跑马灯效果未实现

## LayerSlide 动画

LayerSlide是一种分层动画，SubLayer通过Pannel中这样指定

	<span alt="sublayer" 
		rel="alpha: true,slideindirection: left, durationin: 1000"
		class="自定义">SubLayer</span>

即只需指定alt="sublayer"，其中rel为当前层动画的配置参数，采用key:value的形式定义，多属性之间用逗号分隔，注意结束位置不要写逗号

HTML代码：

	<div id="J_slide">
		<!--Slide Content 容器-->
		<div class="slides_container tab-content">
			<div class="tab-pannel pn1">
				<!--背景动画-->
				<img class="tbg" src="img/l12.jpg">
				<!--SubLayer动画-->
				<img src="img/l13.png" alt="sublayer" 
						rel="alpha: false,
								slideindirection: top, 
								offsetin:160,
								durationin: 1000,
								easingin:easeBoth">
				<!--SubLayer动画-->
				<img src="img/l17.png" alt="sublayer" 
						rel="alpha: false,
								slideindirection: top, 
								offsetin:180,
								durationin: 2100,
								easingin:easeBoth">
			</div>
			<div class="tab-pannel pn2"></div>
			...
		</div>
		<!--Slide Nav 容器-->
		<div class="tab-nav"></div>
	</div>

JS 代码：

	<script>
	KISSY.use('gallery/slide/1.0/',function(S,Slide){
		new Slide('slides',{
			autoSlide:false,
			effect:'hSlide',
			timeout:6000,
			speed:700,
			selectedClass:'current',
			carousel:true,
			layerSlide:true//开启LayerSlide
		});
	});
	</script>

### subLayer配置项：

- durationin		进入动画的缓动速度，默认为1000（毫秒）
- easingin		进入动画的缓动效果，默认为easeIn，具体参照KISSY.Anim
- durationout		移出动画的缓动速度，默认为1000（毫秒）
- easingout		移出动画的缓动效果，默认为easeOut
- delayin			进入动画的延时，默认为300（毫秒）
- delayout		移出动画的延时，默认为300
- slideindirection进入动画的起始方向，默认为'right'，top/right/left/bottom
- slideoutdirection移出动画的起始方向，默认为'left'
- alpha			是否带有透明度变幻，默认为true
- offsetin		进入动画的相对距离，默认为50
- offsetout		移出动画的相对距离，默认为50

### Demos

- <a href="d1.html">Demo1</a>
- <a href="d2.html">Demo2</a>
- <a href="d3.html">Demo3</a>
- <a href="d4.html">Demo4</a>
- <a href="d5.html">Demo5</a>
- <a href="d6.html">Demo6</a>
- <a href="d7.html">Demo7</a>
- <a href="d8.html">Demo8</a>
- <a href="touch.html">Touch</a>
