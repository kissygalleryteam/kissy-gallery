/**
 * scrollbar for kissy
 * @author changyin@taobao.com,yiminghe@gmail.com
 */
KISSY.add("gallery/kscroll/1.1/index", function (S, Node) {
    var $ = Node.all,

        //正数
        toPositive = function (n) {
            return n < 0 ? -n : n;
        },

        toInt = function(n){
            return isNaN(parseInt(n))?0:parseInt(n);
        },

        SCROLL_HTML = '<div class="{prefix}scrollbar"><div class="{prefix}track" ' +
            '>' +
            '<div class="{prefix}drag" ' +
            '>' +
            '<div class="{prefix}dragtop">' +
            '</div><div class="{prefix}dragbottom"></div>' +
            '<div class="{prefix}dragcenter"></div>' +
            '</div>' +
            '</div></div>',

        ARROW = '<div '+
                'class="{prefix}arrow{type}">' +
                    '<a href="javascript:void(\'scroll {type}\')" ' +                      
                    '>scroll {type}</a>'+
                '</div>';

    function capitalFirst(s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    /**
     * Scroll构造器
     * @param container 容器
     * @param config 配置
     */
    function Scroll(container, config) {
        var self = this;
        Scroll.superclass.constructor.call(self, config);
        self._init(container);
    }

    //属性
    Scroll.ATTRS = {
        prefix:{
            value:"ks-"
        },
        duration:{
            value:0.1
        },
        easing:{
            value:"easeNone"
        },
        container:{},
        body:{},
        track:{},
        drag:{},
        arrowUp:{},
        allowArrow:{value:true},
        arrowDown:{},
        step:{},
        scrollBar:{}
    };

    S.extend(Scroll, S.Base, {
        //初始化Scroll
        _init:function (container) {
            var self = this,
                prefix = "." + self.get("prefix");
            //判断容器是否正确
            container = self._wrap($(container));
            //初始化UI属性
            self.set("container", container);
            self.set("body", container.one(prefix + "body"));
            self.set("track", container.one(prefix + "track"));
            self.set("drag", this.get("track").one(prefix + "drag"));
            if (self.get("allowArrow")) {
                self.set("arrowUp", container.one(prefix + "arrowup"));
                self.arrowUpHeight = self.get("arrowUp").outerHeight();
                self.set("arrowDown", container.one(prefix + "arrowdown"));
                self.arrowDownHeight = self.get("arrowDown").outerHeight();
            } else {
                self.arrowUpHeight = self.arrowDownHeight = 0;
            }
            //绑定各种事件
            self._bindEvt();
            //初始化尺寸
            self._setSize();
        },

        destroy:function () {
            var self = this,
                container = self.get("container"),
                track = self.get("track"),
                arrowUp = self.get("arrowUp"),
                arrowDown = self.get("arrowDown"),
                c = container.children().item(0);
            if (arrowUp) {
                arrowUp.remove();
            }
            if (arrowDown) {
                arrowDown.remove();
            }
            c.insertBefore(container);
            container.remove();
            c.css(self.__backup);
            c.removeClass(self.get("prefix") + "body");
        },

        _wrap:function (container) {
            var self = this,
                prefix = self.get("prefix"),
                wrap = $("<div></div>");

            //ie6下自动扩展问题
            if(S.UA.ie==6){
                container.css({"overflow":"auto"});
            }

            //panel wrap
            wrap.insertAfter(container).append(container);

            //增加基本样式
            wrap.addClass(prefix + "container")
                .css({
                    position:"relative",
                    overflow:"hidden",
                    width:container.outerWidth(),
                    height:container.outerHeight()
                });

            //滚动条
            wrap.append(S.substitute(SCROLL_HTML, {
                prefix:prefix
            }));
            
            var scrollbar=wrap.one("."+prefix + "scrollbar");

            self.set("scrollBar",scrollbar);   

            //向上，向下箭头
            if (self.get("allowArrow")) {
                scrollbar.append(S.substitute(ARROW, {
                    type:'up',
                    prefix:prefix
                }));
                scrollbar.append(S.substitute(ARROW, {
                    type:'down',
                    prefix:prefix
                }));
            }

            var style = container[0].style;

            self.__backup = {
                "position":style.position,
                "top":style.top,
                "left":style.left,
                "width":style.width,
                "height":style.height,
                "overflow":style.overflow
            };

            //增加panel hook
            container.css({
                "position":"absolute",
                "top":0,
                "left":0,
                "width":"100%",
                "height":"auto",
                "overflow":"visible"
            })
                .addClass(prefix + "body");


            return wrap;
        },

        _bindArrow:function (type) {
            var self = this,
                type2 = capitalFirst(type),
                speed = 0,
                timer = null,
                prefix = self.get("prefix"),
                n = self.get("arrow" + type2),
                timeSet = function () {
                    speed += 1;
                    var step = self.get("step");
                    var sh = type == "up" ? step : -step,
                        t = 300 - speed * 25;
                    self.scrollByDistance(sh);
                    if (t <= 30) {
                        t = 30
                    }
                    timer = setTimeout(function () {
                        timeSet();
                    }, t);
                };

            n.on("click",
                function () {
                    var sh = self.get("step");
                    self.scrollByDistance(type == "up" ? sh : -sh);
                }).on("mousedown",
                function () {
                    n.addClass(prefix + "arrow" + type + "-active");
                    timeSet();
                }).on("mouseup",
                function () {
                    n.removeClass(prefix + "arrow" + type + "-active");
                    speed = 0;
                    clearTimeout(timer);
                }).on("mouseleave",
                function () {
                    // 靠mouseup清除定时器不靠谱，因为有些情况下可以不执行mouseup
                    n.removeClass(prefix + "arrow" + type + "-active");
                    speed = 0;
                    n.removeClass(prefix + "arrow" + type + "-hover");
                    clearTimeout(timer);
                }).on("mouseover",
                function () {
                    n.addClass(prefix + "arrow" + type + "-hover");
                });
        },

        _bindDrag:function () {
            var doc = $(document),
                self = this,
                pageY,
                prefix = self.get("prefix"),
                current = 0,
                drag = self.get("drag"),
                track = self.get("track"),
                moveFn = function (ev) {
                    var trackLen = track.outerHeight(),
                        dragLen = drag.outerHeight(),
                        t = trackLen - dragLen,
                        position = current + (ev.pageY - pageY);

                    //最上面
                    if (position < 0) {
                        position = 0;
                    }

                    //最下面
                    if (position > t) {
                        position = t;
                    }


                    drag.css("top", position);

                    self.scrollByPercent(position / t,1);
                };

            //绑定各种drag事件
            drag
                .on("mouseenter", function (ev) {
                drag.addClass(prefix + "drag-hover");
            })
                .on("mouseleave", function (ev) {
                    drag.removeClass(prefix + "drag-hover");
                })
                .on("click", function (ev) {
                    // prevent track handle it
                    ev.stopPropagation();
                })
                .on("mousedown", function (ev) {
                    drag.addClass(prefix + "drag-active");
                    current = parseInt(drag.css("top")) || 0;
                    pageY = ev.pageY;
                    doc
                        .on("mousemove", moveFn)
                        .on("mouseup", function () {
                            drag.removeClass(prefix + "drag-active");
                            doc.detach("mousemove", moveFn);
                            doc.detach("mouseup", arguments.callee);
                            pageY = 0;
                        });

                });
        },
		
		//完美支持键盘滚动
		_bindHotkey: function(){
            var self = this,
				body = self.get("body"),
                container = self.get("container"),
                canMousewheel = function(direction){
                    var position = toInt(body.css("top"));
                    if(direction>0 && position>=0){
                        return false;
                    }
                    if(direction<0 && position+body.outerHeight()<=container.outerHeight()){
                        return false;
                    }
                    return true;
                };
                
			//当前容器一定要获取焦点才能使用键盘事件
			//考虑到outline实在影响美观，直接删掉
			container.css("outline","none").attr("tabindex",S.guid()).on("keydown", function (ev) {
				var keycode = ev.keyCode,
					sh = self.get("step");
				if(!~"38,39,36,40,37,35".indexOf(keycode)){
					return;
				}else{
					var d = ~"38,39,36".indexOf(keycode)?sh:-sh;
					if(canMousewheel(d)){
						ev.halt();
					}	
				}
				
				switch(keycode){
					case 38:
					case 39:
						self.scrollByDistance(sh);
						break;
					case 40:
					case 37:
						self.scrollByDistance(-sh);
						break;
					case 36:
						self.scrollByPercent(0);
						break;
					case 35:
						self.scrollByPercent(1);
						break;
				}
            });
			
		},

        _bindTrack:function () {
            var self = this,
                prefix = self.get("prefix");
            var track = self.get("track");
            track.
                unselectable()
                .on("click",
                function (ev) {
                    self.scrollByPercent((ev.pageY - track.offset().top ) / (track.outerHeight()));
                })
                .on("mousedown", function (ev) {
                    // prevent chrome selection
                    ev.preventDefault();
                })
                .on("mouseenter",
                function () {
                    track.addClass(prefix + "track-hover");
                })
                .on("mouseleave", function (ev) {
                    track.removeClass(prefix + "track-hover");
                });
        },

        _bindContainer:function () {
            var self = this,
                //在最上或者最下再滚动，不要阻止浏览器默认事件
                body = self.get("body"),
                container = self.get("container"),
                canMousewheel = function(direction){
                    var position = toInt(body.css("top"));
                    if(direction>0 && position>=0){
                        return false;
                    }
                    if(direction<0 && position+body.outerHeight()<=container.outerHeight()){
                        return false;
                    }
                    return true;
                };
            //滚轮事件
            self.get("container").on("mousewheel", function (ev) {
                if(canMousewheel(ev.deltaY)){
                    ev.halt();
                }
                var sh = self.get("step");
                self.scrollByDistance(ev.deltaY > 0 ? sh : -sh);
            });
        },

        //绑定事件
        _bindEvt:function () {
            var self = this;

            self._bindContainer();

            //上下箭头
            if (self.get("allowArrow")) {
                self._bindArrow("up");
                self._bindArrow("down");
            }

            //单击轨道
            self._bindTrack();

            //拖动滚动条
            self._bindDrag();
			
			//键盘支持
			self._bindHotkey();
        },

        //重置大小
        resize:function (w, h) {
            var self = this;
            self.get("container").css({
                width:w,
                height:h
            });
            self._setSize();
        },

        //设置大小
        _setSize:function () {
            //设置滚动幅度
            var self = this,
                bh = self.get("body").outerHeight(),
                sh,
                ch = self.get("container").innerHeight(),
                arrowUp = self.get("arrowUp"),
                arrowDown = self.get("arrowDown"),
                track = self.get("track"),
                drag = self.get("drag"),
                ah = self.arrowUpHeight + self.arrowDownHeight;

            if (bh <= ch || ch < ah) {
				//水儿发现的bug,某些情况下滚动条隐藏，top>0
				self.get("body").css({"top":0});				
                self.get("scrollBar").hide();
                return;
            } else {
                self.get("scrollBar").show();
            }

            sh = (ch - ah) * ch / bh;

            if (sh < 20) {
                sh = 20;
            }

            if (!self.get("step")) {
                self.set("step", Math.max(sh / 6, 10));
            }

            track.css({
                height:ch - ah,
                top:self.arrowUpHeight
            });

            //drag
            drag.css({
                height:sh
            });

        },

        //滚动到指定位置
        _scrollBodyToPosition:function (position) {
            var self = this,
                container = self.get("container"),
                body = self.get("body"),
                t = body.outerHeight() - container.innerHeight();
            if (t < 0) {
                return;
            }
            if (position > 0) {
                position = 0;
            }
            if (toPositive(position) > t) {
                position = -t;
            }
            body.css("top", position);
        },

        scrollByDistance:function (distance, notUpdateBar) {
            var self = this,
                position = parseInt(self.get("body").css("top")) + distance;
            self._scrollBodyToPosition(position);
            if (!notUpdateBar) {
                self._updateBar();
            }
        },

        scrollByPercent:function (percent, notUpdateBar) {
            var self = this;
            percent = parseFloat(percent, 10);
            if (isNaN(percent) || percent > 1 || percent < 0) {
                return;
            }
            var d = (self.get("body").outerHeight() - self.get("container").innerHeight()) * (-percent);
            self._scrollBodyToPosition(d);
            if (!notUpdateBar) {
                self._updateBar();
            }
        },

        //滚动到指定元素
        scrollToElement:function (el) {
            el = $(el);
            if (!el.length) {
                return;
            }
            var self = this,
                position = el.offset().top - self.get("body").offset().top;
            self._scrollBodyToPosition(-position);
            self._updateBar();
        },

        //同步滚动条位置
        _updateBar:function () {
            var self = this,
                drag = self.get("drag"),
                th = self.get("track").innerHeight() - drag.outerHeight(),
                body = self.get("body"),
                container = self.get("container"),
                percent = toPositive(parseInt(body.css("top"))) / (body.outerHeight() - container.innerHeight());
            drag.css("top", percent * th);
        }

    });

    return Scroll;

}, {
    requires:["node"]
});
/**
 * 2012-02-24
 *  - review and refactor by yiminghe@gmail.com
 *  - 1.0 to cdn
 *  - TODO for changyin : 横向模拟滚动条
 * 
 * 2012-02-25
 *  - bugfix ie6自动扩展问题，加上overflow:auto
 *  - 清羽的建议，组件不能滚动时，不要阻止浏览器默认事件
 * 2012-04-19
 *  - 修复水儿发现的bug
 *  - 键盘支持 key[38,39,36,40,37,35], 注意：key事件绑定在container上，没有获得焦点的情况下无法使用键盘操作
 *
 * 2012-05-05
    - 增加 wrap 元素，简化代码
    - 增加新皮肤 
 **/