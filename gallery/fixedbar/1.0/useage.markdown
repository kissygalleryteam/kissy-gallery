- by bachi@taobao.com
- <a href="demo.html">Demo</a>

> FixedBar 控件，当页面下拉到一定程度时，让页面中某个元素固定在视口范围内，不支持ie6

## JS代码

	<script>
		KISSY.use('gallery/fixedbar/1.0/',function(S,FixedBar){
			new FixedBar('#test',{
				top:20,
				floor:500
			});
		});
	</script>

## HTML结构(示例)

	<style>
		#test {
			background:yellow;
			width:100%;
		}
		#fixed-wrapper{
			height:20px;
		}
	</style>
	<div id="fixed-wrapper"><!--一般用来占位用-->
		<div id="test">
			fixedbar
		</div>
	</div>

<hr class="smooth large" />

## 参数说明

- *top* 距离视口顶部的高度
- *floor* 节点地盘不能越过这个高度

