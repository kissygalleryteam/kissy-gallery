KISSY.add("'gallery/form/1.3/uploader/plugins/imagePreview/imagePreview'",function(S){
	
	//策略
	var Mod;
	!function(){
		var types={};
		
		Mod={
			add : function(type,obj){
				if(!types[type]){
					types[type] = obj;
					types[type].type = type;
				} else {
					S.mix(types[type],obj);
					types[type].type = type;
				}
			},
			use : function(type){
				return S.mix(types['default'],types[type]);
			}
		}
	}();
	
	//普通
	Mod.add("default",{
		//获取图片，数据（html5）或文件名。过滤非图片数据（或非图片文件名后缀）
		getData:function(fileDom){
			return [fileDom.value];
		},
		// @fileData 文件名或文件对像
		// @img 显示图片DOM
		show:function(fileData,onshow){
			
			var self = this;
	
			var img = new Image();
			img.src = fileData;
			
			//不会进非ie6的，但习惯分别处理
			if (document.all) {
				img.onreadystatechange = function () {
					if (img.readyState == "loaded" || img.readyState == 'complete') {
						onshow(img,self.type);
						img.onreadystatechange = null;
					}
				}
				img.onreadystatechange();
			}
			else {
				img.onload = function () {
					onshow(img,self.type);
					img.onload = null;
				}
			}		
		}
	});
	
	//html5
	Mod.add("html5",{
		getData:function(fileDom){
			var img = [];
				for(var i = 0; i<fileDom.files.length;i++){
					if(fileDom.files[i].type.indexOf('image') >= 0){
						img.push(fileDom.files[i]);
					}
				}
			return img;
		},
		// @fileData 文件名或文件对像
		// @img 显示图片DOM
		show:function(fileData,onshow){
			var img = new Image(); 
			if (window.URL && window.URL.createObjectURL) {
				//FF4+
				img.src = window.URL.createObjectURL(fileData);
			} else if (window.webkitURL&&window.webkitURL.createObjectURL) {
				//Chrome8+
				img.src = window.webkitURL.createObjectURL(fileData);
			} else {
				//实例化file reader对象
				var reader = new FileReader();

				reader.onload = function(e) {
					img.src = e.target.result;
				}
				reader.readAsDataURL(fileData);
			}
			
			//没有使用预载。高宽不可行。。缩放用CSS
			onshow(img,this.type);
		}
	});
	
	//filter
	Mod.add("filter",{
		getData:function(fileDom){
			fileDom.select();
			try{
				return [document.selection.createRange().text];
			} finally { document.selection.empty(); }
			return [];
		},
		show:function(fileData,onshow){
			//TODO 先不考虑 小图标
			var TRANSPARENT = S.UA.ie==6 || S.UA.ie == 7 ? "http://img04.taobaocdn.com/tps/i4/T1Ao_pXfVpXXc6Yc2r-1-1.gif" : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
	
			if ( !this._preload ) {
				var preload = this._preload = document.createElement("div");
				//隐藏并设置滤镜
				S.DOM.css(preload, {
					width: "1px", height: "1px",
					visibility: "hidden", position: "absolute", left: "-9999px", top: "-9999px",
					filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image')"
				});
				//插入body
				var body = document.body; body.insertBefore( preload, body.childNodes[0] );
			}
			
			var 
				img = new Image(),
				preload = this._preload,
				data = fileData.replace(/[)'"%]/g, function(s){ return escape(escape(s)); });
			try{
				preload.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = data;
			}catch(e){ return; }
			//设置滤镜并显示
			img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src=\"" + data + "\")";
			
			img.style.width = preload.offsetWidth;
			img.style.height = preload.offsetHeight;
			
			img.src = TRANSPARENT;
			//传递真实高宽
			img.width = preload.offsetWidth;
			img.height = preload.offsetHeight;
			onshow(img,this.type,preload.offsetWidth,preload.offsetHeight);
		}
	});
	
	//filename 
	Mod.add("filename",{
		getData:function(fileDom){
			var filenames = [];
			if(fileDom.files){
				for(var i=0;i<fileDom.files.length;i++){
					filenames.push(fileDom.files[i].name);
				}
			} else {
				filenames.push(fileDom.value);
			}
			
			return filenames;
		},
		show:function(fileData,onshow){
			onshow(S.DOM.create(fileData),this.type);
		}
	});
	
	//路由
	function getMod(fileDom){
		var mod = "filename";
			
		if(window.URL&&window.URL.createObjectURL || window.webkitURL&&window.webkitURL.createObjectURL || window.FileReader) {
			mod = "html5";
		} else if(S.UA.ie === 7 || S.UA.ie === 8){
			mod = "filter";
		} else if(S.UA.ie === 6) {
			mod = "default";
		}
		
		return mod;
	}
	
	//入口
	function ImagePreview(fileDom,onshow){

		var 
			mod = Mod.use(getMod(fileDom)),
			
			imgs = mod.getData(fileDom) , img;

		for(var i=0;i<imgs.length;i++){
			mod.show(imgs[i],onshow);
		}

	}
	
	return ImagePreview;
});