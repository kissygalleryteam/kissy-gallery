

KISSY.add("gallery/slide/1.0/index",function(S,BSlide){

	return BSlide;

},{
	requires:['./base']	
});


/**
 * @fileOverview KISSY Slide
 * @author  bachi@taobao.com
 * 		幻灯/Tab/Carousel...
 * 		Demo:	配host，访问：http://a.tbcdn.cn/apps/ks/zoo/slide/demo/tab.html
 *
 * @param 参数列表
 * 		autoSlide : {boolean} 	是否自动播放，默认为false
 * 		speed:		{float}		帧切换的速度，默认为500(ms)
 * 		timeout:	{Number}	帧切换的时间间隔，默认为1000(ms)
 * 		effect:		{String}	帧切换类型，默认为'none',取值： * 								none:无特效
 * 								fade:渐隐
 * 								hSlide:水平切换
 * 								vSlide:垂直切换
 * 		eventType:	{String}	触发tab切换的nav上的事件类型，默认为'click'，推荐使用：
 * 								click:点击
 * 								mouseover:鼠标经过(这个可能会多次触发切换事件)
 * 								mouseenter:鼠标进入
 * 		easing:		{String}	帧切换的缓动值，默认为'easeBoth'，取值请参照KISSY.Anim
 * 							http://docs.kissyui.com/docs/html/api/core/anim/index.html
 * 		hoverStop:	{boolean}	鼠标悬停在面板上是否停止自动播放，默认为true
 * 		selectedClass:{String}	tab选中时的className，默认为't-slide'，目前未实现
 * 		navClass:	{String}	tab容器的className，默认为'tab-nav'
 * 		triggerSelector:{String}tab容器中的触碰元素的选择器，默认为'li'
 * 		contentClass:{String}	tab内容容器的className,默认为tab-content
 * 		pannelClass:{String}	tab面板的className，默认为tab-pannel
 * 		id:			{String}	hook，直接写id，比如"J_id"(正确)，"#J_id"(错误)
 * 		carousel:	{Boolean}	是否以跑马灯形式播放，默认为false
 * 		touchmove:	{Boolean}	是否支持手指滑动切换，默认为false
 * 		adaptive_fixed_width:{boolean} 屏幕是否根据控件的宽度改变重新渲染尺寸，默认为false，主要在组件定宽高的场景中，保证resize时tab-pannel尺寸正确
 * 		adaptive_fixed_height:{boolean} 屏幕是否根据控件的高度改变重新渲染尺寸，默认为false,主要在组件定宽高的场景中，保证resize时tab-pannel尺寸正确
 * 		adaptive_fixed_size:{boolean} 屏幕是否根据控件的宽度和高度改变重新渲染尺寸，默认为false,主要在组件定宽高的场景中，保证resize时tab-pannel尺寸正确
 * 		defaultTab:	{Number}	默认定位在某个帧，默认为0，即第一帧
 * 		layerSlide:	{Boolean}	是否开启分层动画，默认为false
 * 		layerClass:	{String}	subLayer的className，未实现，默认用alt="sublayer"来标识
 * 		reverse:	{boolean} 	"播放下一个"和"播放上一个"对调，默认为false
 * 		adaptive_height:{function},同下
 * 		adaptive_width:{function}，如果是百分比设置容器的宽度的话，需要指定这个函数，返回一个宽度值，动态的得到可变化的宽度,默认为false，代码示例:
 *
 * 						var slide = new Slide('J_tab',{
 * 							adaptive_width:function(){
 * 								return document.body.offsetWidth;
 * 							}
 * 						});
 *
 *
 * 	@event 事件
 * 		ready:		初始化完成后的事件回调，带入上下文this，带入参数为
 * 					{
 *						index:index,		// 当前帧的索引
 *						navnode:navnode,	// 当前导航的节点
 *						pannelnode:pannelnode//当前面板的节点
 * 					}
 * 		switch:		切换发生时的事件，特指切换动作必然发生时的时刻，回调上下文和参数同上
 *		beforeSwitch:	“切换至”的事件，回调返回false可以阻止切换事件的发生
 *		beforeTailSwitch:从某一帧的角度看，这一帧切换到下一帧之前发生的事件,参数同上
 *		afterSwitch:	切换完成的动作，未实现
 *
 *
 *	@mathod 方法
 *		init		初始化，参数为一个对象，带入配置项
 *		previous	切换到上一个，无参数
 *		next		切换到下一个，无参数
 *		go		跳转到指定索引的帧，参数为index:0,1,2,3...
 *		switch_to	纯粹执行切换的动作，不推荐使用，建议使用go
 *		play		开始自动播放
 *		stop		停止自动播放
 *		hightlightNav 高亮某个特定的导航项，参数为索引值index:0,1,2,3...
 *		is_first	是否当前停止在第一帧
 *		is_last		是否当前停止在最后一真
 *		resetSlideSize 可以传入一个索引值为参数，重置第index个Slide的宽度和高度,幻灯尺寸发生动态变化时，需要调用这个方法来重设宽高，内部方法
 *		relocateCurrentTab 无参数，重新修正当前帧的位置，内部方法
 *		initLayer	初始化SubLayer，无参数，非触屏模式下有效 TODO
 *
 *
 *	@subClass 当layerSlide配置为true时，配置sublayer的参数，写法：
 *					
 *					<span alt="sublayer" 
 *						rel="alpha: true,slideindirection: left, durationin: 1000" 
 *						class="sublayer1">SubLayer1</span>
 *
 * 		subLayer配置项：
 * 			durationin		进入动画的缓动速度，默认为1000（毫秒）
 * 			easingin		进入动画的缓动效果，默认为easeIn，具体参照KISSY.Anim
 * 			durationout		移出动画的缓动速度，默认为1000（毫秒）
 * 			easingout		移出动画的缓动效果，默认为easeOut
 * 			delayin			进入动画的延时，默认为300（毫秒）
 * 			delayout		移出动画的延时，默认为300
 * 			slideindirection进入动画的起始方向，默认为'right'，top/right/left/bottom
 * 			slideoutdirection移出动画的起始方向，默认为'left'
 * 			alpha			是否带有透明度变幻，默认为true
 * 			offsetin		进入动画的相对距离，默认为50
 *			offsetout		移出动画的相对距离，默认为50
 */

