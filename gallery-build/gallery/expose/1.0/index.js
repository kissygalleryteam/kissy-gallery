/**
 * @fileoverview 高亮指定的区域
 * @desc 高亮指定的区域，可以做出视频网站流行的高亮效果。
 * @author 常胤<satans17@gmail.com> lzlu.com
 * @blog http://lzlu.com
 */
 
KISSY.add('gallery/expose/1.0/expose', function(S, undefined) {

	var DOM = S.DOM, Event = S.Event,
	
		EVENT_EXPOSE = 'expose',
		EVENT_CLOSE = 'close';

		
    /**
	 * --------------
     * Expose
     * @constructor
	 * --------------
     */
	function Expose(target,config){
		var self = this,
			defconfig = {
				zindex: 9998,
				bgcolor: '#fff',
				anim: 1,
				opacity: 0.8,
				tip: '右键单击关闭遮罩效果'
			};
		
        /**
         * the target of widget
         * @type HTMLElement
         */
        self.target = S.get(target);

        /**
         * 配置参数
         * @type Object
         */
        self.config = S.merge(defconfig,config||{});
		
		self.flag = false;
		
		self.resize = null;
		
		self._init();

	}
		
		
	S.augment(Expose, S.EventTarget, {
	
        /**
         * init
         */
		_init: function(){
			var self = this,
				cfg = self.config,
				mask = DOM.create('<div title="'+cfg.tip+'" style="position:absolute; z-index:'+cfg.zindex+'; display:none; top:0px; left:0px; background-color:'+cfg.bgcolor+';"></div>');

			//append mask
			S.ready(function(){
				document.body.appendChild(mask);
				Event.on(mask,"click",function(ev){
					self.close();
				});
			});	
			
			self.mask = mask;
			
			self.resize = function(){
				DOM.css(mask,{
					width: DOM.docWidth(),
					height: DOM.docHeight()
				});
			}
			
		},
		
        /**
         * 开灯
         */
		//核心代码
		expose: function(){
			var self = this,
				cfg = self.config;
			
			if(self.flag)return;
		
			//页面大小改变后重置遮罩层的大小
			Event.on(window,"resize",self.resize);
			
			self.fire(EVENT_EXPOSE);
			
			//让对象置于遮罩层上方
			DOM.css(self.target,{
				"position": 'relative',
				"z-index": cfg.zindex+1
			});
			
			//重置遮罩层的大小
			DOM.css(self.mask,{
				display: 'block',
				width: DOM.docWidth(),
				height: DOM.docHeight(),
				opacity: 0
			});

			//动画的方式显示遮罩层
			S.Anim(self.mask, 'opacity: '+cfg.opacity , cfg.anim, 'easeOutStrong',function(){
				S.later(function(){
					self.flag = true;
				},100);
			}).run();
		},
		
        /**
         * 关灯
         */
		close: function(){
			var self = this,
				cfg = self.config;
				
			if(!self.flag)return;
			
			Event.remove(window,"resize",self.resize);
			self.fire(EVENT_CLOSE);
			S.Anim(self.mask, 'opacity: 0', cfg.anim, 'easeOutStrong',function(){
				DOM.hide(self.mask);
				DOM.css(self.target,{
					"position": 'static',
					"z-index": 'auto'
				});
				S.later(function(){
					self.flag = false;
				},100);
			}).run();
		}
	
	});

    return Expose;
});KISSY.add("gallery/expose/1.0/index",function(S, Expose){
    return Expose;
}, {
    requires:["./expose"]
});
