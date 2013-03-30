KISSY.add('gallery/slide/1.0/slide-util',function(S){

	"use strict";

	// Node 增补方法
	
	S.mix(S,{
		setHash : function(sUrl, data){
			var url;
			var i;
			if(typeof sUrl == 'object'){
				url = window.location.href;
				data = sUrl;
			}else{
				url = sUrl;
			}
			if(url.indexOf("#") < 0){
				url+='#';
			}
			var o = this.getHash(url);
			for(i in data){
				o[i] = data[i];
			}
			url = url.split("#")[0]+'#';
			for(i in o){
				url+=i+'='+o[i]+'&';
			}
			url = url.substr(0,url.length-1);
			return url;
		},
		getHash : function(sUrl){
			var url = sUrl || window.location.href;
			if(url.indexOf("#") < 0){
				return {};
			}else{
				var hash = url.split('#')[1];
				if(hash === '')return {};
				if(hash[hash.length-1] == '&')hash = hash.substr(0, hash.length-1);
				hash = hash.replace(/"/ig,'\'');
				// hash = hash.replace(/=/ig,'":"');
				hash = hash.replace(/=/ig,'":"');
				hash = hash.replace(/&/ig,'","');
				hash += '"';
				hash = "{\""+ hash + "}";
				var o = S.JSON.parse(hash);
				return o;
			}
		},
			
		_globalEval : function(data){
			if (data && /\S/.test(data)) {
				var head = document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0],
					script = document.createElement('script');

				// 神奇的支持所有的浏览器
				script.text = data;

				head.insertBefore(script, head.firstChild);
				setTimeout(function(){
					head.removeChild(script);
				},1);
			}
		},
		// 一段杂乱的html片段，执行其中的script脚本
		execScript:function(html){
			var self = this;
			var re_script = new RegExp(/<script([^>]*)>([^<]*(?:(?!<\/script>)<[^<]*)*)<\/script>/ig); // 防止过滤错误

			var hd = S.one('head').getDOMNode(),
				match, attrs, srcMatch, charsetMatch,
				t, s, text,
				RE_SCRIPT_SRC = /\ssrc=(['"])(.*?)\1/i,
				RE_SCRIPT_CHARSET = /\scharset=(['"])(.*?)\1/i;

			re_script.lastIndex = 0;
			while ((match = re_script.exec(html))) {
				attrs = match[1];
				srcMatch = attrs ? attrs.match(RE_SCRIPT_SRC) : false;
				// 通过src抓取到脚本
				if (srcMatch && srcMatch[2]) {
					s = document.createElement('script');
					s.src = srcMatch[2];
					// 设置编码类型
					if ((charsetMatch = attrs.match(RE_SCRIPT_CHARSET)) && charsetMatch[2]) {
						s.charset = charsetMatch[2];
					}
					s.async = true; // hack gecko
					hd.appendChild(s);
				}
				// 如果是内联脚本
				else if ((text = match[2]) && text.length > 0) {
					self._globalEval(text);
				}
			}
		},
		// 判断当前环境是否是daily环境
		isDaily:function(){
			var self = this;
			if(/daily\.taobao\.net/.test(window.location.hostname)){
				return true;
			}else{
				return false;
			}
		}
		
	});

},{
	requires:[
		'node',
		'sizzle',
		'json'
	]	
});
