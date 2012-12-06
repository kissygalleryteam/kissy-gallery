KISSY.add("gallery/mobiletab/1.0/index",function(S, Mobiletab){
    return Mobiletab;
}, {
    requires:["./mobiletab"]
});KISSY.add('gallery/mobiletab/1.0/mobiletab', function(S, DOM, Event, Switchable, undefined){
   
    var D = DOM;
    var E = Event;
    var CLS_PREFIX = 'ks-switchable-', DOT = '.', PREV_BTN = 'prevBtn', NEXT_BTN = 'nextBtn';
    var DOM_EVENT = {
        originalEvent: {
            target: 1
        }
    };
    
    /**
     * 触摸版Switchable
     * @class
     * @name MobileTab
     * @constructor
     * @param {Selector||HTML Element} container 容器
     * @param {Object} config 配置参数
     * @example
     * <pre>
     * 	scrolltab:tab是否可触摸滚动，默认false
     * （其它参数同Switchable）
     * </pre>
     * 
     */
    function MobileTab(container, config){
    
        var self = this;
       
		
        // factory or constructor
        if (!(self instanceof MobileTab)) {
            return new MobileTab(container, config);
        }
		//用于重新初始化
        self.html = D.get(container).innerHTML;
		self.reload = function(){
			//记录当前切换到的位置
			var index=D.attr(self.container,"data-index")?D.attr(self.container,"data-index")-0:0;
			D.html(container,self.html);
			var newtab = new MobileTab(container, config);
			//恢复位置
			newtab.switchTo(index);
			return newtab;
		}
		self.log = D.create("<div>");
		D.insertBefore(self.log,container)
		if(config.beforeStart){
			config.beforeStart();
		}
        // call super
        MobileTab.superclass.constructor.apply(self, arguments);
    }
    
    MobileTab.Config = {
        circular: false,
        effect: "scrollx",
        duration: 0.2,
        easing: "easeOut",
        scrolltab: false
    };
    
    MobileTab.Plugins = [];
    
    S.extend(MobileTab, Switchable, {
        /**
         * MobileTab 的初始化逻辑
         */
        _init: function(){
            var self = this;
            MobileTab.superclass._init.call(self);
            var cfg = self.config, disableCls = cfg.disableBtnCls, switching = false, content = self.content, start = false;
            var startX, startY, startpos, offset, timer = 0, unitwidth, sidewidth, conwidth, cfg, outeroffset, inneroffset, offsety;
            content.addEventListener("touchstart", function(e){
                var t = e.touches[0];
                startpos = parseInt(D.css(content, "left"));
                startX = t.pageX;
                startY = t.pageY;
                timer = S.now();
                
            });
            content.addEventListener("touchmove", function(e){
                if (switching) 
                    return;
                var t = e.touches[0];
                offset = t.pageX - startX;
                offsety = t.pageY - startY;
                if (Math.abs(offset) > 5 && Math.abs(offset) > Math.abs(offsety)) {
                    e.preventDefault();
                    start = true;
                    D.css(content, {
                        left: startpos + offset + "px"
                    });
                }else{
					start = false;
				}
                if(Math.abs(offset) < Math.abs(offsety)){
					start = false;
				}
            });
            
            content.addEventListener("touchend", function(e){
                if (start) {
                    var unitwidth = self.viewSize[0], sidewidth = unitwidth / 2, conwidth = D.width(content), cfg = self.config, outwidth = D.width(self.container), outeroffset = D.offset(self.container).left, inneroffset = D.offset(self.content).left;
                    if (switching) 
                        return;
                    var t = e.touches[0], i = self.activeIndex;
                    function backstart(edge){
                        if (!edge) {
                            var left = -self.viewSize[0] * i + "px";
                        }
                        if (edge == "start") {
                            var left = 0;
                        }
                        if (edge == "end") {
                            var left = D.width(self.container) - D.width(self.content) + "px";
                        }
                        self.anim = new S.Anim(self.content, {
                            left: left
                        }, cfg.duration, cfg.easing, function(){
                            self.anim = undefined;
                        }, cfg.nativeAnim).run();
                    }
					/*如果移动距离超过半个panel宽度，或者速度大于一定值*/
                    if (Math.abs(offset) > sidewidth || Math.abs(offset / (timer - S.now())) > 0.2) {
                        if (offset < 0) {

                            if (inneroffset + conwidth - outeroffset > outwidth) 
                                self.switchTo(i + Math.ceil(Math.abs(offset) / unitwidth));
                            else {
                                    self.activeIndex = self.length - 1
                                    backstart("end");
                            }
                        }
                        else {
                            if (-inneroffset >= unitwidth) 
                                self.switchTo(i - Math.ceil(Math.abs(offset) / unitwidth));
                            else 
                                if (self.activeIndex != 0) 
                                    self.switchTo(0)
                                else {
                                    backstart("start");
                                }
                        }
                        return;
                    }
                    else {
                        backstart();
                        return;
                    }
                    start = false;
                }
            });
            self.on('beforeSwitch', function(ev){
				if(ev.toIndex>self.length-1){
					return false;
				}
                switching = true;
            });
            self.on('switch', function(){
                switching = false;
				offset=0;
				//这里用自定义属性存当前位置，android下不知为何不能用变量存储。
				D.attr(self.container,"data-index",self.activeIndex);
            });
            if (self.config.scrolltab) {
                self.scrolltab();
            }
        },
        scrolltab: function(){
            var self = this, tabwidth = D.width(self.triggers[0]), conwidth = D.width(self.container), n = Math.floor(conwidth / tabwidth);
            
            S.each(self.triggers, function(t){
                D.width(t, D.width(t));
            });
            var scrolltab = MobileTab(self.container, {
                panels: self.triggers,
                hasTriggers: false,
                viewSize: [tabwidth]
            });
            self.on('beforeSwitch', function(ev){
                var i = ev.toIndex;
                if (i > self.activeIndex) {
                    if (i >= Math.ceil(n / 2) && i <= Math.floor(scrolltab.length - n / 2)) {
                        scrolltab.switchTo(i - Math.ceil(n / 2) + 1);
                    }
                }
                else {
                    if (i >= Math.ceil(n / 2) - 1 && i <= Math.floor(scrolltab.length - n / 2 - 1)) {
                        i = ev.toIndex;
                        scrolltab.switchTo(i - Math.ceil(n / 2) + 1);
                    }
                }
                if (i < Math.ceil(n / 2)) {
                    scrolltab.switchTo(0);
                }
                if (i > Math.floor(scrolltab.length - n / 2 - 1)) {
                    scrolltab.switchTo(Math.floor(scrolltab.length - n));
                }
            });
        }
    });
    return MobileTab;
    
}, {
    requires: ["dom","event","switchable"]
});
