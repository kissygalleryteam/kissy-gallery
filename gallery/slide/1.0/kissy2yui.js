/*jshint browser:true,devel:true */

KISSY.add('gallery/slide/1.0/kissy2yui',function(S){

	"use strict";

	// KISSY 2 YUI3
	S.augment(S.Node,{

		_delegate:function(){
			var self = this;
			if(S.isFunction(arguments[1])){
				self.delegate(arguments[0],arguments[2],arguments[1]);
			}else {
				self.delegate.apply(self,arguments);
			}
			return self;
		},

		// IndexOf 原生节点
		indexOf : function(node){
			var self = this;
			if(S.isUndefined(node)){
				return null;
			}
			if(node[0]){
				node = node[0];
			}
			var i = 0;
			self.each(function(el,index){
				if(el[0] === node){
					i = index;
				}
			});
			return i;

		},
		
		size:function(){
			return this.length;
		},

		set:function(k,v){
			if(k === 'innerHTML') {
				this.html(v);
			} else {
				this.attr(k,v);
			}
			return this;
		},

		get : function(k){
			var self = this;
			var o = {
				'innerHTML':function(){
					return self.html();
				},
				'region':function(){
					return {
						'height':self.height(),
						'width':self.width()
					};
				}

			};
			if(k in o){
				return o[k]();
			}
		},

		appendChild:function(){
			this.append.apply(this,arguments);
			return this;
		},
		
		setStyle : function(k,v){
			this.css.apply(this,arguments);
			return this;
		},
		
		setStyles: function(o){
			this.css.apply(this,arguments);
			return this;
		},

		cloneNode: function(){
			return this.clone.apply(this,arguments);
		}
	});

	S.Node.create = function(str){
		return S.Node(str);
	};

},{
	requires:['node','event']
});
