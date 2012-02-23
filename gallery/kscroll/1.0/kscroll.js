/**
 * 滚动条组件
 */
KISSY.add("gallery/kscroll/1.0/kscroll",function(S, Node){
	var $ = Node.all,
        DOT = ".",
        //正数
        toPositive = function(n){
            return n<0?(~n+1):n;
        },
        toNegative = function(n){
            return ~n+1;
        };

    /**
     * Scroll构造器
     * @param container 容器
     * @param config 配置
     */
    function Scroll(container, config) {
        Scroll.superclass.constructor.apply(this, arguments);
        this._init(container,config);
    }

	//属性
    Scroll.ATTRS = {
        prefix:{
            value:"ks-",
            validator: function(v){
                return /^\S+$/.test(v);
            }
        },
        arrow:{
            value:true,
            validator: function(v){
                return (v===true || v===false);
            }
        },
        duration:{
            value:0.1,
            validator: function(v){
                return (S.isNumber(v) && !isNaN(v));
            }
        },
        easing:{
            value:"easeNone"
        },
        container: {},
        body: {},
        track:{},
        drag:{},
        arrowUp:{},
        arrowDown:{},
        extent:{
            value:10,
            setter: function(v){
                if(v<20)v=20;
                return v;
            }
        }
    }
	
	S.extend(Scroll, S.Base, {
        //初始化Scroll
        _init:function(container,config){
            var self = this,
                cfg = config || {};

            //判断容器是否正确
            container = $(container);
            if(!container[0]){
                S.log("请配置正确的容器");
                return;
            }
            
            //设置属性
            this.set("prefix",cfg.prefix);
            this.set("arrow",cfg.arrow);

            //是否自动wrap
            if(!container.parent().hasClass(cfg.prefix+"ScrollContainer")){
                container = self._wrap(container);
            }

            //初始化UI属性
            this.set("container",container);
            this.set("body",container.one(DOT+this.get("prefix")+"body"));
            this.set("track",container.one(DOT+this.get("prefix")+"track"));
            this.set("drag",this.get("track").one(DOT+this.get("prefix")+"drag"));
            this.set("arrowUp",container.one(DOT+this.get("prefix")+"arrowup"));
            this.set("arrowDown",container.one(DOT+this.get("prefix")+"arrowdown"));

            //绑定各种事件
            this._bindEvt();

            //初始化尺寸
            this.setSize();

        },

        //包裹panel
        _wrap: function(container){
            var self = this,
                prefix = this.get("prefix"),
                panel = container,
                wrap = $("<div></div>");

            //panel wrap
            wrap.insertAfter(panel).append(panel);

            //增加基本样式
            wrap.addClass(prefix+"container")
                .css({
                    position:"relative",
                    overflow:"hidden",
                    width:panel.outerWidth(),
                    height:panel.outerHeight()
                });

            //滚动条
            wrap.append(
                $("<div></div>")
                    .addClass(prefix+"track")
                    .css({
                        "position":"absolute",
                        "right":0
                    })
                    .append(
                        $("<div></div>")
                            .addClass(prefix+"drag")
                            .css({
                                "position":"absolute",
								"left":0
                            })
                            .append(
                                $('<div class="'+prefix+'dragtop"></div><div class="'+prefix+'dragbottom"></div><div class="'+prefix+'dragcenter"></div>')
                            )
                    )
            );

            //向上，向下箭头
            if(this.get("arrow")===true){
                wrap.append(
                    $("<a></a>")
                        .css({
                            "position":"absolute",
                            "right":0
                        })
                        .attr({
                            href:"javascript:",
                            tabindex:-1
                        })
                        .addClass(prefix+"arrowup")
                        .text("Scroll up")
                );
                wrap.append(
                    $("<a></a>")
                        .css({
                            "position":"absolute",
                            "right":0
                        })
                        .attr({
                            href:"javascript:",
                            tabindex:-1
                        })
                        .addClass(prefix+"arrowdown")
                        .text("Scroll down")
                );
            }
            
            //增加panel hook
            panel.css({
                    "position": "absolute",
                    "top": 0,
                    "left": 0,
					"width": wrap.innerWidth(),
                    "height": "auto",
                    "overflow": "visible"
                })
                .addClass(prefix+"body");


            return wrap;

        },

        //绑定事件
        _bindEvt: function(){
            var self = this,
				prefix = self.get("prefix");

            //滚轮事件
            this.get("container").on("mousewheel", function(ev){
                ev.halt();
                var sh = self.get("extent");
                self.scrollDistance(ev.deltaY===1?sh:-sh);
            });

            //上下箭头
			if(this.get("arrow")===true){
                var speed = 0,
                    speedx = 30,
                    timer = null,
                    timeSet = function(d){
                        speed += 1;
                        speedx = speedx/speed;
                        var sh = d=="down"?self.get("extent"):toNegative(self.get("extent")),
                            t =300 - speed*25;
                        self.scrollDistance(sh);
                        if(t<=30){t=30};
                        timer = setTimeout(function(){timeSet(d);},t);
                    };

				this.get("arrowUp").on("click", function(ev){
                    ev.halt();
                    var sh = self.get("extent");
					self.scrollDistance(sh);
				}).on("mousedown", function(ev){
                    ev.halt();
					$(this).addClass(prefix+"arrowup-active");
                    timeSet("down");
                }).on("mouseup", function(ev){
                    ev.halt();
					$(this).removeClass(prefix+"arrowup-active");
                    speed = 0;
                    speedx = 50;
                    clearTimeout(timer);
                }).on("mouseleave",function(ev){
                    //靠mouseup清除定时器不靠谱，因为有些情况下可以不执行mouseup
                    ev.halt();
					$(this).removeClass(prefix+"arrowup-active");
                    speed = 0;
                    speedx = 50;
                    clearTimeout(timer);
                }).on("mouseover",function(ev){
					ev.halt();
					$(this).addClass(prefix+"arrowup-hover");
				}).on("mouseout",function(ev){
					ev.halt();
					$(this).removeClass(prefix+"arrowup-hover");
				});

				this.get("arrowDown").on("click", function(ev){
                    ev.halt();
                    var sh = self.get("extent");
					self.scrollDistance(-sh);
				}).on("mousedown", function(ev){
                    ev.halt();
					$(this).addClass(prefix+"arrowdown-active");
                    timeSet("up");
                }).on("mouseup", function(ev){
                    ev.halt();
					$(this).removeClass(prefix+"arrowdown-active");
                    speed = 0;
                    speedx = 50;
                    clearTimeout(timer);
                }).on("mouseleave",function(ev){
                    ev.halt();
					$(this).removeClass(prefix+"arrowdown-active");
                    speed = 0;
                    speedx = 50;
                    clearTimeout(timer);
                }).on("mouseover",function(ev){
					ev.halt();
					$(this).addClass(prefix+"arrowdown-hover");
				}).on("mouseout",function(ev){
					ev.halt();
					$(this).removeClass(prefix+"arrowdown-hover");
				});
			}

            //单击轨道
            this.get("track").on("click", function(ev){
				ev.halt();
                self.scrollByPercent(ev.offsetY/self.get("track").outerHeight());
                self.updateBar();
            }).on("mouseover", function(ev){
				ev.halt();
				$(this).addClass(prefix+"track-hover");
			}).on("mouseout", function(ev){
				ev.halt();
				$(this).removeClass(prefix+"track-hover");
			});

            //拖动滚动条
            (function(){
                var pageY,
                    current = 0,
                    movefun = function(e2){
						e2.halt();
                        //self._moveBar(current,e2.pageY-pageY);
                        var track = self.get("track"),
                            trackLen = track.innerHeight(),
                            drag = self.get("drag"),
                            dragLen = drag.outerHeight(),
                            position = current+(e2.pageY-pageY);

                        //最上面
                        if(position<0){
                            position = 0;
                        }

                        //最下面
                        if(position>(trackLen-dragLen)){
                            position = trackLen-dragLen;
                        }

                        drag.css("top",position);
                        self.scrollByPercent(position/(trackLen-dragLen));
                    };
				
				//绑定各种drag事件
                self.get("drag")
					.on("mouseover",function(ev){
						$(this).addClass(prefix+"drag-hover");
					})
					.on("mouseout",function(ev){
						$(this).removeClass(prefix+"drag-hover");
					})
					.on("click",function(ev){
						ev.halt()
					})
					.unselectable()
					.on("mousedown", function(ev){
						ev.halt();
						var tg = $(ev.target);
						$(this).addClass(prefix+"drag-active");
						current = parseInt(self.get("drag").css("top"));
						pageY = ev.pageY;
						$(document)
							.on("mousemove",movefun)
							.on("mouseup", function(){
								tg.removeClass(prefix+"drag-active");
								$(document).detach("mousemove",movefun);
							});

					})
					.on("mouseup", function(ev){
						//这里不能ev.halt();
						$(ev.target).removeClass(prefix+"drag-active");
					});
            })();

        },
		
		//重置大小
		resize: function(w,h){
			
			this.get("container").css({
				width:w,
				height:h
			});

            this.get("body").css({
                width:this.get("container").innerWidth()-this.get("track").outerWidth()
            })
			
			this.setSize();
			
		},

		//设置大小
		setSize: function() {
            var height = this.get("container").height();

            //设置滚动幅度
            var bh = this.get("body").outerHeight(),
                ch = this.get("container").outerHeight(),
                ah = this.get("arrow")===true?(this.get("arrowUp").outerHeight() + this.get("arrowDown").outerHeight()):0;
			
			if(bh<ch){
				this.get("drag").hide();
			}else{
				this.get("drag").show();
			}
			
            if(bh<=0 || ch<=0){
                var sh = this.set("extent","20");
            }else{
                var sh = (ch - 2*ah) * ch / bh;
                this.set("extent",sh/6);
            }

            //如果有箭头
            if(this.get("arrow")){
                this.get("track").css({
                    height:height-this.get("arrowUp").outerHeight()-this.get("arrowDown").outerHeight(),
                    top:this.get("arrowUp").outerHeight()
                });
                this.get("arrowUp").css({
                    top:0
                });
                this.get("arrowDown").css({
                    bottom:0
                });
            }else{
                this.get("track").css({
                    height:height,
                    top:0
                });
            }

            if(sh>this.get("track").outerHeight()){
                sh = this.get("track").outerHeight();
            }

            if(sh<20){
                sh=20;
            }

            //drag
            this.get("drag").css({
                height: sh
            });

		},

		//滚动到指定位置
		_scrollBodyToPosition: function(position) {
            var container = this.get("container"),
                body = this.get("body"),
                h = body.outerHeight()-container.outerHeight();

            //无需滚动
            if(h<=0){
                return;
            }

            //最上面
            if(position>0){
                position = 0;
            }

            //最下面
            if(toPositive(position)>h){
                position = toNegative(h);
            }

            body.css("top",position);
		},

        scrollDistance: function(distance){
            var position = parseInt(this.get("body").css("top"))+distance;
            this._scrollBodyToPosition(position);
            this.updateBar();
        },

        scrollByPercent: function(percent){
            var self = this;
			percent = parseFloat(percent);
			if(isNaN(percent) || percent>1 || percent<0){
				return;
			}
			var d = (self.get("body").outerHeight()-self.get("container").innerHeight())*(-percent);
            this._scrollBodyToPosition(d);
			this.updateBar();
        },

        //滚动到指定元素
        toEl: function(el){
            el = $(el);
            if(!el.length>0)return;
            var position = el["0"].offsetTop;
            this._scrollBodyToPosition(-position);
            this.updateBar();
        },

        //同步滚动条位置
        updateBar: function(){
            var self = this,
                th = this.get("track").innerHeight(),
                dh = this.get("drag").outerHeight(),
                rh = th-dh,
                percent = toPositive(parseInt(self.get("body").css("top")))/(self.get("body").outerHeight()-self.get("container").innerHeight());

            this.get("drag").css({
                top: percent*rh
            });
        }

	});

    return Scroll;

},{
	requires:["node"]
});