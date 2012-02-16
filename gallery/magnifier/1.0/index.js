/**
 * 暴露接口给外部
 */
KISSY.add("gallery/magnifier/1.0/index",function(S){
   var D = S.DOM,
		E = S.Event;

	var RND = Math.round;

	var GLASS_W = 256;
	var GLASS_H = 256;
	var GLASS_R = 74;
	var GLASS_D = GLASS_R * 2;
	var GLASS_X = 40;
	var GLASS_Y = 11;
	var GLASS_CX = GLASS_X + GLASS_R;
	var GLASS_CY = GLASS_Y + GLASS_R;

	var ZOOM_STEP = 0.2;

	var iZoomMin = 1.5;
	var iZoomMax = 3.5;
	var iZoom = 2.5;

	var de = document.documentElement;
	var body = document.body;

	var css3;
	var oBox, styBox;
	var oBG, styBG;
	var oCircle;

	var oImg;
	var oLoader;
	var mapImgWidth = {};

	var iOffX = 0, iOffY = 0;
	var bShow;
	var oAni;




	function setZoomPic(url)
	{
		if(css3)
			oCircle.style.backgroundImage = "url(" + url + ")";
		else
			oBG.src = url;
	}


	function handleLoaderComplete()
	{
		mapImgWidth[this.big] = this.width;
		iZoomMax = this.width / oImg.width;

		//
		// 加载的不是当前的大图。
		// (上一张没加载完就移出区域，
		// 则放弃替换)
		//
		if(this.small != oImg.src)
			return;

		setZoomPic(this.src);
		updateZoom();
	}


	function handleMouseOver(e)
	{
		var img = e.target;
		var src_big = img.getAttribute("zoom");

		if(!src_big)
			return;

		oImg = img;

		var value = mapImgWidth[src_big];

		if(value > 0)
		{
			iZoomMax = value / img.width;
			setZoomPic(src_big);
		}
		else
		{
			setZoomPic(img.src);

			if(value == null)
			{
				//
				// 暂时先用小图片放大，
				// 等大图下载完成再换上
				//
				mapImgWidth[src_big] = 0;

				var loader = new Image;
				E.on(loader, "load", handleLoaderComplete);

				loader.big = src_big;
				loader.small = img.src;
				loader.src = src_big;
			}
		}

		E.on(document, "mousemove", handleMouseMove);
		E.on(document, "mousewheel", handleMouseWheel);
	}



	function handleMouseMove(e)
	{
		var x = e.pageX;
		var y = e.pageY;

		var rect = oImg.getBoundingClientRect();
		var dx = de.scrollLeft || body.scrollLeft;
		var dy = de.scrollTop || body.scrollTop;

		var left = rect.left + dx;
		var right = rect.right + dx;
		var top = rect.top + dy;
		var bottom = rect.bottom + dy;


//alert(r.left+":"+r.top+ "\n" + x+","+y+"\n"+left + "," + top + " : " + right + "," + bottom)

		//
		// 鼠标移出原图片
		//
		if(x < left || x > right ||
			y < top || y > bottom)
		{
			E.remove(document, "mousemove", handleMouseMove);
			E.remove(document, "mousewheel", handleMouseWheel);	

			oAni.run();
			bShow = false;
			return;
		}


		if(!bShow)
		{
			bShow = true;
			oAni.stop();
			D.css(oBox, {opacity: 1, display: "block"});
			updateZoom();
		}

		//
		// 更新放大镜位置
		//
		styBox.left = x - GLASS_CX + "px";
		styBox.top = y - GLASS_CY + "px";

		iOffX = x - left;
		iOffY = y - top;

		// ie6,7 图片不会动，强制设置下尺寸
		if(S.UA.ie < 8)
			updateZoom();

		updatePos();
	}


	function handleMouseWheel(e)
	{
		iZoom += (e.delta > 0? ZOOM_STEP : -ZOOM_STEP);

		updateZoom();
		updatePos();

		// 防止滚屏
		e.stopPropagation();
		e.preventDefault();
	}


	function updatePos()
	{
		var left = RND(-iZoom * iOffX + GLASS_R);
		var top = RND(-iZoom * iOffY + GLASS_R);

		if(css3)
		{
			oCircle.style.backgroundPosition = left + "px " + top + "px";
		}
		else
		{
			styBG.pixelLeft = left;
			styBG.pixelTop = top;
		}
	}


	function updateZoom()
	{
		if(iZoom < iZoomMin)
			iZoom = iZoomMin;
		else if(iZoom > iZoomMax)
			iZoom = iZoomMax;

		var width = RND(oImg.width * iZoom);
		var height = RND(oImg.height * iZoom);

		if(css3)
		{
			oCircle.style.backgroundSize = width + "px " + height + "px";
		}
		else
		{
			styBG.pixelWidth = width;
			styBG.pixelHeight = height;
		}
	}


	function create()
	{
		var css_box =
		{
			width: GLASS_W + "px",
			height: GLASS_H + "px",
			position: "absolute"
		};

		var css_back =
		{
			left: GLASS_X + "px",
			top: GLASS_Y + "px",
			width: GLASS_D + "px",
			height: GLASS_D + "px",
			backgroundColor: "#FFF",
			position: "absolute"
		};

		var front;


		oBox = D.create("<div style='z-index:999; cursor:none; display:none'></div>");

		D.css(oBox, css_box);
		styBox = oBox.style;
		css3 = "borderRadius" in styBox;

		//
		// css3 =>
		//   oBox: 顶层容器
		//     oBG: 圆形的DIV，可缩放的背景图片
		//     front: 放大镜图片
		//
		// ie =>
		//   oBox: 顶层容器
		//     oCircle: 蒙板容器
		//        oBG: 可缩放的IMG图片
		//        mask: 蒙板图片
		//     front: 放大镜图片
		//
		if(css3)
		{
			oCircle = D.create("<div></div>");
			front = D.create("<img src='pic.png' style='position:absolute;'></div>");
			
			D.css(oCircle, S.merge(css_back,
			{
				borderRadius: GLASS_R + "px",
				backgroundRepeat: "no-repeat"
			}));
		}
		else
		{
			// 缩放的img元素
			oBG = D.create("<img style='position:absolute;'>");
			styBG = oBG.style;

			// 此容器应用蒙板滤镜
			oCircle = D.create("<div></div>");

			oCircle.appendChild(oBG);
			oCircle.appendChild(
				D.create("<img src='mask.png' style='position:absolute;'>"));

			D.css(oCircle, S.merge(css_back,
			{
				borderRadius: GLASS_R + "px",
				filter: "chroma(color=#123456)",
				backgroundRepeat: "no-repeat",
				overflow: "hidden"
			}));

			// 支持ie6加载png-24
			front = D.create("<div style='background:url(pic.png); _background:none; _filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=pic.png);" + css_box + "'></div>");
			D.css(front, css_box);

			styBox.cursor = "url(blank.ico)";
		}

		oBox.appendChild(oCircle);
		oBox.appendChild(front);
		body.appendChild(oBox);

		E.on(document, "mouseover", handleMouseOver);


		oAni = S.Anim(oBox, "opacity: 0", 0.3, "easeOut", function()
		{
			D.css(oBox, {display: "none"});
		});
	}

    return {
		create: create
    }
});