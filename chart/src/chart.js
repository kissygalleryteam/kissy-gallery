KISSY.add("gallery/chart", function(S) {
    var Event = S.Event,
        Dom = S.DOM;

    //kissy < 1.2
    var P = S.namespace("Gallery.Chart");


    /**
     * 图表默认配置
     */
    var defaultCfg = {
        'left' : 40,
        'top'  : 40
    };

    /**
     * class Chart
     * @constructor
     * @param {String|Object} the canvas element
     * @param {String|Object} the canvas data
     */
    function Chart(canvas, data) {
        if (!(this instanceof Chart)) return new Chart(canvas, data);

        var elCanvas = this.elCanvas = Dom.get(canvas)

        if(!elCanvas) return;

        var self = this,
            width = elCanvas.width,
            height = elCanvas.height;

        self.elCanvas = elCanvas;
        self.width = width;
        self.height = height;
        self.ctx = -1;

        self._stooltip = Chart.getTooltip();
        self._chartAnim = new P.Anim(0.3, "easeIn");
        if(data){
            self.data = data;
            self._initContext();
        }

    }

    /**
     * 获取ToolTip 对象， 所有图表共享一个Tooltip
     */
    Chart.getTooltip = function() {
        if (!Chart.tooltip) {
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
        render : function(data) {
            var self = this;

            // ensure we have got context here
            if(self.ctx == -1){
                self.data = data;
                self._initContext();
                return;
            }
            //wait... context to init
            if(self.ctx === 0){
                self.data = data;
                return;
            }
            self._data = new P.Data(data);
            if(!self._data) return;
            data = self._data;

            self.initChart();
            //绘图相关属性
            self._drawcfg = S.merge(defaultCfg, data.config, {
                width:self.width,
                height : self.height,
                right : self.width - 10,
                bottom : self.height - 30
            });


            if (data.type === "bar" || data.type === "line") {

                //generate the max of Y axis
                self._drawcfg.max = P.Axis.getMax(data.max(), self._drawcfg);

                self.axis = new P.Axis(data, self, self._drawcfg);
                self._frame = new P.Frame(self._drawcfg);
                self.layers.push(self.axis);
                self.layers.push(self._frame);

            }

            self.element = P.Element.getElement(self._data, self, self._drawcfg);
            self.layers.push(self.element);

            setTimeout(function() {
                self._redraw();
                self.initEvent();
            }, 100);
        },
        /**
         * init Canvas Context
         * @private
         */
        _initContext : function(){
            var self = this;
            if(typeof self.ctx == 'object') return;

            if(self.elCanvas.getContext){
                this.ctx = self.elCanvas.getContext('2d');
                self._contextReady()
            }else{
                //this is for gaving flashCanvas has the time to init canvas
                self.ctx = 0;
                (typeof self._count == "number")?self._count--:self._count = 8;
                if(self._count >= 0){
                    setTimeout(function ctx(){
                        self._initContext();
                    },150)
                }else{
                    var text = Dom.create("<p class='ks-chart-error' > 糟了，你的浏览器还不支持我们的图表</p>")
                    Dom.insertAfter(text,self.elCanvas)
                }
            }
        },

        /**
         * execute when the ctx is ready
         * @private
         */
        _contextReady : function(){
            var self = this;
            if(self.data){
                self.render(self.data);
           }
        },

        /**
         * show the loading text
         */
        loading : function() {
            this.showMessage("\u8F7D\u5165\u4E2D...");
        },

        /**
         * show text
         */
        showMessage : function(m) {
            var ctx = this.ctx,
                tx = this.width / 2,
                ty = this.height / 2;
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.save();
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = "#808080";
            ctx.fillText(m, tx, ty);
            ctx.restore();
        },

        /**
         * init the chart for render
         * this will remove all the event
         * @private
         */
        initChart : function() {
            this._chartAnim.init();
            this.layers = [];
            this.offset = Dom.offset(this.elCanvas);
            this.loading();

            S.each([this.element,this.axis], function(item) {
                if (item) {
                    item.destory();
                    Event.remove(item);
                }
            });

            this.element = null;
            this.axis = null;
            if (this._event_inited) {
                Event.remove(this.elCanvas, "mousemove", this._mousemoveHandle);
                Event.remove(this.elCanvas, "mouseleave", this._mouseLeaveHandle);
                Event.remove(this, "mouseleave", this._drawAreaLeave);
            }
            this._stooltip.hide();
        },

        initEvent : function() {
            this._event_inited = true;

            Event.on(this.elCanvas, "mousemove", this._mousemoveHandle, this);
            Event.on(this.elCanvas, "mouseleave", this._mouseLeaveHandle, this);
            Event.on(this, "mouseleave", this._drawAreaLeave, this);
            if (this.type === "bar") {
                Event.on(this.element, "barhover", this._barHover, this);
            }
            if (this.axis) {
                Event.on(this.axis, "xaxishover", this._xAxisHover, this);
                Event.on(this.axis, "leave", this._xAxisLeave, this);
                Event.on(this.axis, "redraw", this._redraw, this);
            }
            Event.on(this.element, "redraw", this._redraw, this);
            Event.on(this.element, "showtooltip", function(e) {
                var msg = S.isString(e.message)?e.message:e.message.innerHTML;
                this._stooltip.show(msg);
            }, this);
            Event.on(this.element, "hidetooltip", function(e) {
                this._stooltip.hide();
            }, this);
        },

        /**
         * draw all layers
         * @private
         */
        draw : function() {
            var self = this,
                ctx = self.ctx,
                k = self._chartAnim.get(),
                size = self._drawcfg;
            ctx.clearRect(0, 0, size.width, size.height);
            ctx.globalAlpha = k;

            S.each(self.layers, function(e, i) {
                e.draw(ctx, size);
            });

            if (k < 1) {
                this._redraw();
            }
        },
        /**
         * Get The Draw Context of Canvas
         */
        ctx : function(){
            if(this.ctx) {
                return this.ctx;
            }
            if(this.elCanvas.getContext){
                this.ctx = this.elCanvas.getContext('2d');
                return this.ctx;
            }else{
                return null;
            }
        },
        /**
         * redraw the layers
         * @private
         */
        _redraw : function() {
            this._redrawmark = true;
            if (!this._running) {
                this._run();
            }
        },
        /**
         * run the Timer
         * @private
         */
        _run : function() {
            var self = this;
            clearTimeout(self._timeoutid);
            self._running = true;
            self._redrawmark = false;
            self._timeoutid = setTimeout(function go() {
                self.draw();
                if (self._redrawmark) {
                    self._run();
                } else {
                    self._running = false;
                }
            }, 1000 / 24);
        },
        /**
         * event handler
         * @private
         */
        _barHover : function(ev) {
        },
        /**
         * event handler
         * @private
         */
        _xAxisLeave : function(ev) {
            //this._redraw();
            this.fire("axisleave", ev);
        },
        /**
         * event handler
         * @private
         */
        _xAxisHover : function(ev) {
            this.fire("axishover", ev);
            this._redraw();
        },
        /**
         * event handler
         * @private
         */
        _drawAreaLeave : function(ev) {
            this._stooltip.hide();
        },
        /**
         * event handler
         * @private
         */
        _mousemoveHandle : function(e) {
            var ox = e.offsetX || e.pageX - this.offset.left,
                oy = e.offsetY || e.pageY - this.offset.top;
            if(this._frame && this._frame.path && this._frame.path.inpath(ox,oy) || !this._frame){
                this.fire("mousemove", {x:ox,y:oy});
            }else{
                this.fire("mouseleave");
            }
        },
        /**
         * event handler
         * @private
         */
        _mouseLeaveHandle : function(ev) {
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
    P.Chart = Chart;
    return Chart;
}, {
    requires:[
        './chart/anim',
        './chart/axis',
        './chart/simpletooltip',
        './chart/frame',
        './chart/element',
        './chart/data'
    ]
});
