KISSY.add("chart",function(S){
    var P     = S.namespace("chart"),
        Event = S.Event,
        Dom   = S.DOM;

    /**
     * 图表默认配置
     */
    var defaultCfg = {
        left:40,
        top:38
    };

    /**
     * class Chart
     * @constructor
     * @param {(string|object)} the canvas element
     */
    function Chart (canvas, data){
        if(!(this instanceof Chart)) return new Chart(canvas,data);

        var elCanvas = Dom.get(canvas);

        if(!elCanvas || !elCanvas.getContext){
            S.log("Canvas not found");
            return;
        }

        var self = this,
            ctx = elCanvas.getContext("2d"),
            width = elCanvas.width,
            height = elCanvas.height;

        this.elCanvas = elCanvas;
        this.ctx = ctx;
        this.width = width;
        this.height = height;


        this._stooltip = Chart.getTooltip();
        this._chartAnim = new P.Anim(0.3,"easeIn");

        //自动渲染
        if(data){
            this.render(data);
        }
    }
    /**
     * 获取ToolTip 对象， 所有图表共享一个Tooltip
     */
    Chart.getTooltip = function(){
        if(!Chart.tooltip){
            Chart.tooltip = new P.SimpleTooltip();
        }
        return Chart.tooltip;
    }

    S.augment(Chart,
        S.EventTarget, /**@lends Chart.prototype*/{
        /**
         * render form
         * @param {Object} the chart data
         */
        render : function(data){
            var self = this,
                type = data.type;

            self.init();
            if(!type || !data.elements || !data.axis){
                return;
            }
            data = S.clone(data);
            self.data = data;
            self._drawcfg = S.merge(defaultCfg, data.config, {width:self.width,
                height : self.height,
                right : self.width - 10,
                bottom : self.height - 20
            });
            self._frame = new P.Frame(self._drawcfg);
            if(type === "bar" || type === "line"){
                self._drawcfg.max = data.axis.y.max || P.Axis.getMax(P.Element.getMax(data.elements), self._drawcfg);
                self.axis = new P.Axis(data.axis,self,self._drawcfg,type);
                self.layers.push(self.axis);
            }
            self.element = P.Element.getElement(data.elements,self,self._drawcfg, data.type);
            self.layers.push(self._frame);
            self.layers.push(self.element);
            setTimeout(function(){
                self._redraw();
                self.initEvent();
            },100);
        },
        /**
         * show the loading text
         */
        loading : function(){
            this.showMessage("\u8F7D\u5165\u4E2D...");
        },

        /**
         * show text
         */
        showMessage : function(m){
            var ctx = this.ctx,
                tx = this.width/2,
                ty = this.height/2;
            ctx.clearRect(0,0,this.width,this.height);
            ctx.save();
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#808080";
            ctx.fillText(m,tx,ty);
            ctx.restore();
        },
        /**
         * init the chart for render
         * this will remove all the event
         * @private
         */
        init : function(){
            this._chartAnim.init();
            this.layers = [];
            this.offset = Dom.offset(this.elCanvas);
            this.loading();

            S.each([this.element,this.axis],function(item){
                if(item){
                    item.destory();
                    Event.remove(item);
                }
            });

            this.element = null;
            this.axis = null;
            if(this._event_inited){
                Event.remove(this.elCanvas,"mousemove",this._mousemoveHandle);
                Event.remove(this.elCanvas,"mouseleave",this._mouseLeaveHandle);
                Event.remove(this,"mouseleave",this._drawAreaLeave);
            }
            this._stooltip.hide();
        },
        initEvent : function(){
            this._event_inited = true;
            Event.on(this.elCanvas,"mousemove",this._mousemoveHandle,this);
            Event.on(this.elCanvas,"mouseleave",this._mouseLeaveHandle,this);
            Event.on(this,"mouseleave",this._drawAreaLeave,this);
            if(this.type === "bar"){
                Event.on(this.element,"barhover",this._barHover,this);
            }
            if(this.axis){
                Event.on(this.axis, "xaxishover",this._xAxisHover,this);
                Event.on(this.axis,"leave",this._xAxisLeave,this);
                Event.on(this.axis, "redraw", this._redraw,this);
            }
            Event.on(this.element,"redraw",this._redraw,this);
            Event.on(this.element,"showtooltip",function(e){
                this._stooltip.show(e.message.innerHTML);
            },this);
            Event.on(this.element,"hidetooltip",function(e){
                this._stooltip.hide();
            },this);
        },
        /**
         * draw all layers
         * @private
         */
        draw : function(){
            var self = this,
                ctx = self.ctx,
                k = self._chartAnim.get(),
                size = self._drawcfg;
            ctx.clearRect(0,0,size.width,size.height);
            ctx.globalAlpha = k;
            S.each(self.layers,function(e,i){
                e.draw(ctx, size);
            });
            if(k < 1) {
                this._redraw();
            }
        },
        /**
         * @private
         * redraw the layers
         */
        _redraw : function(){
            this._redrawmark = true;
            if(!this._running){
                this._run();
            }
        },
        /**
         * run the Timer
         * @private
         */
        _run : function(){
            var self = this;
            clearTimeout(self._timeoutid);
            self._running = true;
            self._redrawmark = false;
            self._timeoutid = setTimeout(function go(){
                self.draw();
                if(self._redrawmark){
                    self._run();
                }else{
                    self._running = false;
                }
            },1000/24);
        },
        /**
         * event handler
         * @private
         */
        _barHover : function(ev){
        },
        /**
         * event handler
         * @private
         */
        _xAxisLeave : function(ev){
            //this._redraw();
            this.fire("axisleave",ev);
        },
        /**
         * event handler
         * @private
         */
        _xAxisHover : function(ev){
            this.fire("axishover",ev);
            this._redraw();
        },
        /**
         * event handler
         * @private
         */
        _drawAreaLeave : function(ev){
            this._stooltip.hide();
        },
        /**
         * event handler
         * @private
         */
        _mousemoveHandle : function(e){
            var ox = e.offsetX || e.pageX - this.offset.left,
                oy = e.offsetY || e.pageY - this.offset.top;
            //if(this._frame && this._frame.path && this._frame.path.inpath(ox,oy)){
                this.fire("mousemove",{x:ox,y:oy});
            //}
        },
        /**
         * event handler
         * @private
         */
        _mouseLeaveHandle : function(ev){
            //var to = ev.toElement || ev.relatedTarget,
                //t = to!== this._tooltip.el,
                //c = to!==this.elCanvas,
                //t2 = !Dom.contains(this._tooltip.el, to);
            //if( c && t && t2){
            this.fire("mouseleave");
            //}
        }
    });

    /*export*/
    var Gallery = S.namespace("Gallery");
    Gallery.Chart = Chart;
    S.Chart = Chart;
});
