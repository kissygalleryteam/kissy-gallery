KISSY.add('gallery/spotlight/1.1/index',function(S){
	var DOM = S.DOM
		,Event = S.Event
		,EVENT_NEXT='nextFocus'
		,EVENT_PREVIOUS='prevFocus'
		,EVENT_HIDE='hide'
		,EVENT_RENDER = 'render'
		,EVENT_FOCUSTO = 'focusTo'
		;
	function Spotlight(cfg){
		var host = this.constructor;
		cfg = cfg || {};
		while(host){
			cfg = S.merge(host.Config,cfg);
			host = host.superclass ? host.superclass.constructor : null;
		}
		this.config = cfg;
		this.quene = cfg.quene || [];
		delete cfg.quene;
		this.masks = ['top','right','bottom','left'];
		this.isMasked = false;
		this._init();
	}
	Spotlight.Config = {
		zIndex:9999
		,bgColor:'#000'
		,opacity:.5
		,maskCls:'spotlight-mask'
		,anim:{
			duration:.2
		}
		,initIndex:0//默认的焦点下标值
		,lazyInit:true//实例化组建的时候是否直接渲染所需元素 否则等待手动激活的时候才渲染
		,clickOnHide:true//点击空白处隐藏mask
		,lastOnEnd:true//到达最后一个之后 如果在执行next的话 会清除mask
		,resizeBuffer:50//窗口resize事件的时候缓冲执行适应函数的时间
		,clickOnHideTip:''
		,toggleOnAnim:false//上一个下一个切换的时候是否为动画形式
		,focusBorder:null//显示焦点的时候在周围添加边框的配置
		,listeners:null
	};
	S.augment(Spotlight,S.EventTarget,{
		_init:function(){
			this._initEvent();
		}
		,_initEvent:function(){
			var l = this.config.listeners;
			if(l){
				S.each(l,function(fn,p){
					S.isFunction(fn) && this.on(p,fn,l.scope||this);
				},this)
			}
		}
		,_onRender:function(){
			var  me = this
				,doc = document
				,left = doc.createElement('div')
				,top = doc.createElement('div')
				,right = doc.createElement('div')
				,bottom = doc.createElement('div')
				,fragment = doc.createDocumentFragment()
				,cfg = me.config
				,maskCls = cfg.maskCls
				;
			fragment.appendChild(top);
			fragment.appendChild(left);
			fragment.appendChild(right);
			fragment.appendChild(bottom);
			left.title = top.title = right.title = bottom.title = cfg.clickOnHideTip;
			left.style.position = top.style.position = right.style.position = bottom.style.position = 'absolute';
			left.style.backgroundColor = top.style.backgroundColor = right.style.backgroundColor = bottom.style.backgroundColor = cfg.bgColor;
			left.style.opacity = top.style.opacity = right.style.opacity = bottom.style.opacity = cfg.opacity;
			left.style.filter = top.style.filter = right.style.filter = bottom.style.filter = 'alpha(opacity='+parseFloat(cfg.opacity)*100+')';
			left.style.zIndex = top.style.zIndex = right.style.zIndex = bottom.style.zIndex = cfg.zIndex;
			left.className = top.className = right.className = bottom.className = maskCls;
			left.className+=' '+maskCls+'-left';
			top.className+=' '+maskCls+'-top';
			right.className+=' '+maskCls+'-right';
			bottom.className+=' '+maskCls+'-bottom';
			right.style.top = right.style.right = bottom.style.right = bottom.style.bottom = left.style.left = left.style.bottom = top.style.left = top.style.top = 0;
			if(cfg.focusBorder){
				var border = this.border = document.createElement('div');
				border.className = maskCls +'-border';
				border.style.border = cfg.focusBorder.borderStyle;
				border.style.position = 'absolute';
				border.style.zIndex = cfg.zIndex+1;
				border.style.top = -9999;
				fragment.appendChild(border);
			}
			DOM.append(fragment,doc.body);
			this.fire(EVENT_RENDER);
			me.left = left;
			me.top = top;
			me.right = right;
			me.bottom = bottom;
			if(cfg.clickOnHide === true){
				Event.delegate(doc.body,'click','.'+cfg.maskCls,me.hide,me)
			}
			Event.on(window,'resize',this._onResize,this);
		}
		,_onResize:function(e){
			this.resizeTimer && this.resizeTimer.cancel();
			this.resizeTimer = S.later(function(){
				if(this.isMasked){
					var boxOpt = this._getMaskBoxSize(this.quene[this.currentIndex].node);
					S.each(this.masks,function(item,i){
						DOM.css(this[item],boxOpt[item])
					},this)
				}
			},this.config.resizeBuffer,false,this);
		}
		,_unmask:function(){
			this._alignToBox({
				top:{height:0}
				,bottom:{height:0}
				,right:{width:0}
				,left:{width:0}
			},this.config.anim.duration);
			this.isMasked = false;
			if(this.border){
				this.border.style.top = -9999;
			}
		}
		,_getMaskBoxSize:function(node){
			var  offset = DOM.offset(node)
				,height = DOM.height(node)
				,width = DOM.width(node)
				,topHeight = offset.top
				,leftWidth = offset.left
				,dWidth = DOM.docWidth()
				,dHeight = DOM.docHeight()
				,rightWidth = dWidth - (width + leftWidth)
				,bottomHeight = dHeight - (height + topHeight)
				;
			return {
				top:{
					height:topHeight
					,width:leftWidth+width
				}
				,left:{
					height:dHeight-topHeight
					,width:leftWidth
					,top:topHeight
				}
				,right:{
					width:rightWidth
					,height:topHeight+height
				}
				,bottom:{
					height:bottomHeight
					,width:dWidth-leftWidth
					,top:topHeight+height
				}
			}
		}
		,_alignToBox:function(opt,duration){
			if(!this.rendered){return}
			var fn;
			if(duration === 0 || duration === false){
				fn = function(item,i){
					DOM.css(this[item],opt[item]);
				}
			}
			else{
				fn = function(item,i){
					S.Anim(this[item],opt[item],duration).run();
				}
			}
			S.each(this.masks,fn,this);
			if(this.border){
				var node = this.quene[this.currentIndex].node
					,offset = DOM.offset(node)
					,size = {height:DOM.height(node),width:DOM.width(node)}
					;
				DOM.css(this.border,{height:size.height,width:size.width,top:offset.top,left:offset.left});
			}
			this.isMasked = true;
			this.border && this.config.focusBorder.focusOnBlink && this._applyBlinkBorder();
		}
		,_applyBlinkBorder:function(){
			this._cancelBlinkBorder();
			var  me = this
				,cfg = me.config
				,originalTop = this.border.style.top
				,none = '-9999px'
				,top
				;
			this.border.style.display = 'block';
			this.borderBlinkTimer = S.later(function(){
				top = this.border.style.top;
				this.border.style.top = top == originalTop ? none : originalTop;
				//console.log(this.border.style.top)
			},cfg.focusBorder.interval,true,this);
			if(cfg.focusBorder.blinkTime){
				this.borderBlinkStopTimer = S.later(function(){
					this._cancelBlinkBorder();
				},cfg.focusBorder.blinkTime,false,this);
			}
		}
		,_cancelBlinkBorder:function(){
			if(this.borderBlinkTimer){
			 	this.borderBlinkTimer.cancel();
			 	delete this.borderBlinkTimer;
			}
			if(this.borderBlinkStopTimer){
				this.borderBlinkStopTimer.cancel();
				delete this.borderBlinkStopTimer;
			}
			this.border && (this.border.style.display = 'none')
		}
		,canNext:function(){
			return !!this.quene[this.currentIndex + 1]
		}
		,canPrevious:function(){
			return !!this.quene[this.currentIndex - 1]
		}
		,hide:function(){
			this._unmask();
			this.fire(EVENT_HIDE);
			this._cancelBlinkBorder();
		}
		,end:function(){
			this.currentIndex = 0;
			this.hide();
		}
		,start:function(){
			var index = S.isNumber(this.config.initIndex) ? this.config.initIndex : this.currentIndex;
			if(this.quene[index]){
				this.currentIndex = index;
				this.focusTo(index,true);
				delete this.config.initIndex;
			}
		}
		,nextFocus:function(){
			var index = this.currentIndex + 1;
			if(this.quene[index]){
				this.currentIndex = index;
				this.fire(EVENT_NEXT,{nodeTarget:this.quene[index]});
				this.focusTo(this.currentIndex,this.config.toggleOnAnim);
			}
		}
		,prevFocus:function(){
			var index = this.currentIndex - 1;
			if(this.quene[index]){
				this.currentIndex = index;
				this.fire(EVENT_PREVIOUS,{nodeTarget:this.quene[index]});
				this.focusTo(this.currentIndex,this.config.toggleOnAnim);
			}
		}
		,focusTo:function(index,isAnim){
			if(this.rendered !== true) {
				this._onRender();
				this.rendered = true;
			}
			if(!this.quene[index]){
				return;
			}
			this.currentIndex = index;
			var me = this
				,node = me.quene[index].node
				,nodeHeight = DOM.height(node)
				,boxOpt = me._getMaskBoxSize(node)
				,offset = DOM.offset(node)
				,top = offset.top
				,vHeight = DOM.viewportHeight()
				,scrollTop = DOM.scrollTop()
				,notVisible = top > (vHeight + scrollTop)
				;
			(notVisible || (scrollTop>nodeHeight+top)) && S.one(window).animate({scrollTop:top -nodeHeight},.2)
			me._alignToBox(boxOpt,isAnim ? me.config.anim.duration : false);
			this.fire(EVENT_FOCUSTO,{nodeTarget:node,offset:offset,index:index});
		}
		,addFocus:function(cfg){
			this.quene.push(cfg)
		}
		,removeFocus:function(index){
			this.quene.splice(index,1)
		}
		,destroy:function(){
			this.hide();
			S.later(function(){
				DOM.remove([this.top,this.left,this.right,this.bottom,this.border]);
				this.top = this.left = this.right = this.bottom = this.border = null;
			},500,false,this);
		}
	});
	return Spotlight;
});