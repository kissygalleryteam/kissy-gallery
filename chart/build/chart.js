KISSY.add("gallery/chart", function(S, CAnim) {
    var Event = S.Event,
        Dom = S.DOM;
    var P = S.namespace("Gallery.Chart");
    //kissy < 1.2
    CAnim = P.Anim;


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
    function Chart(canvas, data) {
        if (!(this instanceof Chart)) return new Chart(canvas, data);

        var elCanvas = Dom.get(canvas);

        if (!elCanvas || !elCanvas.getContext) {
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
        this._chartAnim = new CAnim(0.3, "easeIn");

        //自动渲染
        if (data) {
            this.render(data);
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
            var self = this,
                type = data.type;

            self.init();
            if (!type || !data.elements || !data.axis) {
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
            if (type === "bar" || type === "line") {
                self._drawcfg.max = data.axis.y.max || P.Axis.getMax(P.Element.getMax(data.elements), self._drawcfg);
                self.axis = new P.Axis(data.axis, self, self._drawcfg, type);
                self.layers.push(self.axis);
            }
            self.element = P.Element.getElement(data.elements, self, self._drawcfg, data.type);
            self.layers.push(self._frame);
            self.layers.push(self.element);
            setTimeout(function() {
                self._redraw();
                self.initEvent();
            }, 100);
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
        init : function() {
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
                this._stooltip.show(e.message.innerHTML);
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
         * @private
         * redraw the layers
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
            //if(this._frame && this._frame.path && this._frame.path.inpath(ox,oy)){
            this.fire("mousemove", {x:ox,y:oy});
            //}
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
    requires:['./chart/anim',
        './chart/axis',
        './chart/simpletooltip',
        './chart/frame',
        './chart/element'
    ]
});
/**
 * Formats the number according to the ‘format’ string;
 * adherses to the american number standard where a comma
 * is inserted after every 3 digits.
 *  note: there should be only 1 contiguous number in the format,
 * where a number consists of digits, period, and commas
 *        any other characters can be wrapped around this number, including ‘$’, ‘%’, or text
 *        examples (123456.789):
 *          ‘0 - (123456) show only digits, no precision
 *          ‘0.00 - (123456.78) show only digits, 2 precision
 *          ‘0.0000 - (123456.7890) show only digits, 4 precision
 *          ‘0,000 - (123,456) show comma and digits, no precision
 *          ‘0,000.00 - (123,456.78) show comma and digits, 2 precision
 *          ‘0,0.00 - (123,456.78) shortcut method, show comma and digits, 2 precision
 *
 * @method format
 * @param format {string} the way you would like to format this text
 * @return {string} the formatted number
 * @public
 */
KISSY.add("gallery/chart/format", function(S) {
    var format = function(that,format) {
        if (typeof format !== "string") {
            return;
        } // sanity check

        var hasComma = -1 < format.indexOf(","),
            psplit = format.split('.');

        // compute precision
        if (1 < psplit.length) {
            // fix number precision
            that = that.toFixed(psplit[1].length);
        }
        // error: too many periods
        else if (2 < psplit.length) {
            throw('NumberFormatException: invalid format, formats should have no more than 1 period:' + format);
        }
        // remove precision
        else {
            that = that.toFixed(0);
        }

        // get the string now that precision is correct
        var fnum = that.toString();

        // format has comma, then compute commas
        if (hasComma) {
            // remove precision for computation
            psplit = fnum.split('.');

            var cnum = psplit[0],
                parr = [],
                j = cnum.length,
                m = Math.floor(j / 3),
                n = cnum.length % 3 || 3; // n cannot be ZERO or causes infinite loop

            // break the number into chunks of 3 digits; first chunk may be less than 3
            for (var i = 0; i < j; i += n) {
                if (i != 0) {
                    n = 3;
                }
                parr[parr.length] = cnum.substr(i, n);
                m -= 1;
            }

            // put chunks back together, separated by comma
            fnum = parr.join(',');

            // add the precision back in
            if (psplit[1]) {
                fnum += '.' + psplit[1];
            }
        }

        // replace the number portion of the format with fnum
        return format.replace(/[\d,?\.?]+/, fnum);
    };

    var chart=S.namespace("Gallery.Chart");
    chart.format=format;

    return format;

});
/*
 * color.js
 * Version 0.2.1.2
 *
 * 2009-09-12
 * 
 * By Eli Grey, http://eligrey.com
 * Licensed under the X11/MIT License
 *   See LICENSE.md
 */

/*jslint undef: true, nomen: true, eqeqeq: true, regexp: true, strict: true, newcap: true, immed: true */

/*! @source http://purl.eligrey.com/github/color.js/blob/master/color.js*/
KISSY.add("gallery/chart/color", function(S) {
    var Color = (function () {
        var str = "string",
            Color = function Color(r, g, b, a) {
                var
                    color = this,
                    args = arguments.length,
                    parseHex = function (h) {
                        return parseInt(h, 16);
                    };

                if (args < 3) { // called as Color(color [, alpha])
                    if (typeof r === str) {
                        r = r.substr(r.indexOf("#") + 1);
                        var threeDigits = r.length === 3;
                        r = parseHex(r);
                        threeDigits &&
                        (r = (((r & 0xF00) * 0x1100) | ((r & 0xF0) * 0x110) | ((r & 0xF) * 0x11)));
                    }

                    args === 2 && // alpha specifed
                    (a = g);

                    g = (r & 0xFF00) / 0x100;
                    b = r & 0xFF;
                    r = r >>> 0x10;
                }

                if (!(color instanceof Color)) {
                    return new Color(r, g, b, a);
                }

                this.channels = [
                    typeof r === str && parseHex(r) || r,
                    typeof g === str && parseHex(g) || g,
                    typeof b === str && parseHex(b) || b,
                    (typeof a !== str && typeof a !== "number") && 1 ||
                        typeof a === str && parseFloat(a) || a
                ];
            },
            proto = Color.prototype,
            undef = "undefined",
            lowerCase = "toLowerCase",
            math = Math,
            colorDict;

        // RGB to HSL and HSL to RGB code from
        // http://www.mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript

        Color.RGBtoHSL = function (rgb) {
            // in JS 1.7 use: var [r, g, b] = rgb;
            var r = rgb[0],
                g = rgb[1],
                b = rgb[2];

            r /= 255;
            g /= 255;
            b /= 255;

            var max = math.max(r, g, b),
                min = math.min(r, g, b),
                h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            return [h, s, l];

        };

        Color.HSLtoRGB = function (hsl) {
            // in JS 1.7 use: var [h, s, l] = hsl;
            var h = hsl[0],
                s = hsl[1],
                l = hsl[2],

                r, g, b,

                hue2rgb = function (p, q, t) {
                    if (t < 0) {
                        t += 1;
                    }
                    if (t > 1) {
                        t -= 1;
                    }
                    if (t < 1 / 6) {
                        return p + (q - p) * 6 * t;
                    }
                    if (t < 1 / 2) {
                        return q;
                    }
                    if (t < 2 / 3) {
                        return p + (q - p) * (2 / 3 - t) * 6;
                    }
                    return p;
                };

            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                var
                    q = l < 0.5 ? l * (1 + s) : l + s - l * s,
                    p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return [r * 0xFF, g * 0xFF, b * 0xFF];
        };

        Color.rgb = function (r, g, b, a) {
            return new Color(r, g, b, typeof a !== undef ? a : 1);
        };

        Color.hsl = function (h, s, l, a) {
            var rgb = Color.HSLtoRGB([h, s, l]),
                ceil = math.ceil;
            return new Color(ceil(rgb[0]), ceil(rgb[1]), ceil(rgb[2]), typeof a !== undef ? a : 1);
        };

        Color.TO_STRING_METHOD = "hexTriplet"; // default toString method used

        Color.parse = function (color) {
            color = color.replace(/^\s+/g, "") // trim leading whitespace
                [lowerCase]();

            if (color[0] === "#") {
                return new Color(color);
            }

            var cssFn = color.substr(0, 3), i;

            color = color.replace(/[^\d,.]/g, "").split(",");
            i = color.length;

            while (i--) {
                color[i] = color[i] && parseFloat(color[i]) || 0;
            }

            switch (cssFn) {
                case "rgb": // handle rgb[a](red, green, blue [, alpha])
                    return Color.rgb.apply(Color, color); // no need to break;
                case "hsl": // handle hsl[a](hue, saturation, lightness [, alpha])
                    color[0] /= 360;
                    color[1] /= 100;
                    color[2] /= 100;
                    return Color.hsl.apply(Color, color);
            }

            return null;
        };

        (Color.clearColors = function () {
            colorDict = {
                transparent: [0, 0, 0, 0]
            };
        })();

        Color.define = function (color, rgb) {
            colorDict[color[lowerCase]()] = rgb;
        };

        Color.get = function (color) {
            color = color[lowerCase]();

            if (Object.prototype.hasOwnProperty.call(colorDict, color)) {
                return Color.apply(null, [].concat(colorDict[color]));
            }

            return null;
        };

        Color.del = function (color) {
            return delete colorDict[color[lowerCase]()];
        };

        Color.random = function (rangeStart, rangeEnd) {
            typeof rangeStart === str &&
                (rangeStart = Color.get(rangeStart)) &&
            (rangeStart = rangeStart.getValue());
            typeof rangeEnd === str &&
                (rangeEnd = Color.get(rangeEnd)) &&
            (rangeEnd = rangeEnd.getValue());

            var floor = math.floor,
                random = math.random;

            rangeEnd = (rangeEnd || 0xFFFFFF) + 1;
            if (!isNaN(rangeStart)) {
                return new Color(floor((random() * (rangeEnd - rangeStart)) + rangeStart));
            }
            // random color from #000000 to #FFFFFF
            return new Color(floor(random() * rangeEnd));
        };

        proto.toString = function () {
            return this[Color.TO_STRING_METHOD]();
        };

        proto.valueOf = proto.getValue = function () {
            var channels = this.channels;
            return (
                (channels[0] * 0x10000) |
                    (channels[1] * 0x100  ) |
                    channels[2]
                );
        };

        proto.setValue = function (value) {
            this.channels.splice(
                0, 3,

                value >>> 0x10,
                (value & 0xFF00) / 0x100,
                value & 0xFF
                );
        };

        proto.hexTriplet = ("01".substr(-1) === "1" ?
            // pad 6 zeros to the left
            function () {
                return "#" + ("00000" + this.getValue().toString(16)).substr(-6);
            }
            : // IE doesn't support substr with negative numbers
            function () {
                var str = this.getValue().toString(16);
                return "#" + (new Array(str.length < 6 ? 6 - str.length + 1 : 0)).join("0") + str;
            }
            );

        proto.css = function () {
            var color = this;
            return color.channels[3] === 1 ? color.hexTriplet() : color.rgba();
        };

        // TODO: make the following functions less redundant

        proto.rgbData = function () {
            return this.channels.slice(0, 3);
        };

        proto.hslData = function () {
            return Color.RGBtoHSL(this.rgbData());
        };

        proto.rgb = function () {
            return "rgb(" + this.rgbData().join(",") + ")";
        };

        proto.rgba = function () {
            return "rgba(" + this.channels.join(",") + ")";
        };

        proto.hsl = function () {
            var hsl = this.hslData();
            return "hsl(" + hsl[0] * 360 + "," + (hsl[1] * 100) + "%," + (hsl[2] * 100) + "%)";
        };

        proto.hsla = function () {
            var hsl = this.hslData();
            return "hsla(" + hsl[0] * 360 + "," + (hsl[1] * 100) + "%," + (hsl[2] * 100) + "%," + this.channels[3] + ")";
        };

        return Color;
    }());


    var chart = S.namespace("Gallery.Chart");
    chart.Color = Color;
    return Color;
});

KISSY.add("gallery/chart/colors", function(S){
    var P = S.namespace("Gallery.Chart"),
        colors = [
         { c : "#00AEEF" },
         { c : "#FF4037" },
         { c : "#39B54A" },
         { c : "#FEF56F" },
         { c : "#c821ac" },
         { c : "#D1EB53" }
    ];
    P.colors = colors;
});
KISSY.add("gallery/chart/path",function(S){
    var ie = S.UA.ie,
        P = S.namespace("Gallery.Chart");

    function Path(x,y,w,h){ }
    S.augment(Path,{
        /**
         * get the path draw
         */
        draw : function(ctx){
        },
        /**
         * get the path draw
         */
        inpath : function(ox,oy,ctx){
        }
    });

    function RectPath(x,y,w,h){
        this.rect = {x:x,y:y,w:w,h:h};
    }
    S.extend(RectPath, Path, {
        draw : function(ctx){
            var r = this.rect;
            ctx.beginPath();
            ctx.rect(r.x,r.y,r.w,r.h);
        },
        inpath : function(ox,oy,ctx){
            var r = this.rect,
                left = r.x,
                top = r.y,
                right = left + r.w,
                bottom = top + r.h,
                detect = ox > left && ox < right && oy > top && oy < bottom;
            return detect;
        }
    });

    function ArcPath(x,y,r,b,e,a){
        this._arc= {x:x,y:y,r:r,b:b,e:e,a:a};
    }
    S.extend(ArcPath, Path, {
        draw : function(ctx){
            var r = this._arc;
            ctx.beginPath();
            ctx.moveTo(r,x,r.y);
            ctx.arc(r.x,r.y,r.r,r.b,r.e,r.a);
            ctx.closePath();
        },
        /**
         * detect if point(ox,oy) in path
         */
        inpath : function(ox,oy,ctx){
            if(ctx){
                this.draw(ctx);
                return ctx.isPointInPath(ox,oy);
            }
            var r = this._arc,
                dx = ox - r.x,
                dy = ox - r.y,
                incircle = (Math.pow(dx, 2) + Math.pow(dy, 2))<= Math.pow(r.r, 2),
                detect;
            if(!incircle) {
                return false;
            }
            if(dx === 0){
                if(dy === 0){
                    return false;
                }else{
                    da = dy>0?Math.PI/2:Math.PI*1.5;
                }
            }else{
                //TODO
            }

            return detect;
        }
    });

    P.Path = Path;
    P.RectPath = RectPath;
    P.ArcPath = ArcPath;
    return {
        Path:Path,
        RectPath:RectPath,
        ArcPath:ArcPath
    };
});
KISSY.add("gallery/chart/frame",function(S){
    var P = S.namespace("Gallery.Chart");
    function Frame(cfg){
        this.path = new P.RectPath(cfg.left,cfg.top,cfg.right-cfg.left,cfg.bottom-cfg.top);
    }
    S.augment(Frame,{
        draw : function(ctx,cfg){
            ctx.save();
            ctx.strokeStyle = "#d7d7d7";
            ctx.lineWidth = 2.0;
            this.path.draw(ctx);
            ctx.stroke();
            ctx.restore();
        }
    });
    P.Frame = Frame;
    return Frame;
});
KISSY.add("gallery/chart/anim",function(S){
    var P = S.namespace("Gallery.Chart"),
        Easing = S.Easing;
    function Anim(duration,easing){
        this.duration = duration*1000;
        this.fnEasing = S.isString(easing)?Easing[easing]:easing;
    }
    S.augment(Anim,{
        init : function(){
            this.start = new Date().getTime();
            this.finish = this.start + this.duration;
        },
        get : function(){
            var now = new Date().getTime(),k;
            if(now > this.finish) {
                return 1;
            }
            k = (now - this.start)/this.duration;
            return this.fnEasing(k);
        }
    });
    P.Anim = Anim;
    return Anim;
});
KISSY.add("gallery/chart/simpletooltip",function(S){
    var P     = S.namespace("Gallery.Chart"),
        Dom   = S.DOM,
        Event = S.Event;

    /**
     * 工具提示，总是跟随鼠标
     */
    function SimpleTooltip(){
        var self = this;
        this.el_c = Dom.create("<div class='ks-chart-tooltip'>");
        this.n_c = S.one(this.el_c);
        this.n_c.hide();
        this._offset = {left:0,top:0}
        this._show = false;

        S.ready(function(){
            document.body.appendChild(self.el_c);
        });

        Event.on(document.body,"mousedown",this._mousemove, this);
        Event.on(document.body,"mousemove",this._mousemove, this);
    }

    S.augment(SimpleTooltip,{
        _mousemove : function(ev){
            var ttx = ev.pageX;
            var tty = ev.pageY;
            if(this._show){
                this._updateOffset(ttx, tty);
            }else{
                //save the position
                this._offset.left = ttx;
                this._offset.top = tty;
            }
        },
        _updateOffset : function(x,y){
            if(x > Dom.scrollLeft() + Dom.viewportWidth() - 100){
                x -= this.n_c.width() + 6;
            }
            if(y > Dom.scrollTop() + Dom.viewportHeight() - 100){
                y -= this.n_c.height() + 20;
            }
            this.n_c.offset({left:x, top:y+12});
        },
        /**
         * show the tooltip
         * @param {String} the message to show
         */
        show : function(msg){
            var self = this;
            this._show = true;
            this.n_c
                .html(msg)
                .show()
                .offset(this._offset)

        },
        /**
         * hide the tooltip
         */
        hide : function(){
            this._show = false;
            this.n_c.hide();
        },

        _init : function(){}
    });

    P.SimpleTooltip = SimpleTooltip;
    return SimpleTooltip;
});
KISSY.add("gallery/chart/axis", function(S) {
    var P = KISSY.namespace("Gallery.Chart"),
        Event = S.Event,
        ATYPE = {
            LINE : 0,
            BAR : 1
        };

    function Axis(data, chart, cfg, type) {
        var self = this,
            label,cfgitem;
        this.chart = chart;
        this.type = (type === "line") ? ATYPE.LINE : ATYPE.BAR;
        self.data = data;
        self.cfg = cfg;
        self.current_x = -1;
        self.initEvent();
        S.each(data, function(item, label) {
            item.name = ("name" in item) && S.isString(item) && item.name.length > 0 ? "(" + item.name + ")" : false;
        });
        self.initdata(data, cfg);
    }

    S.mix(Axis, {
        getMax : function(max, cfg) {
            var h = cfg.bottom - cfg.top,
                n = Math.ceil(h / 40),
                g = max / n,i;
            if (g <= 1) {
                g = 1;
            } else if (g > 1 && g <= 5) {
                g = Math.ceil(g);
            } else if (g > 5 && g <= 10) {
                g = 10;
            } else {
                i = 1;
                do{
                    i *= 10;
                    g = g / 10;
                } while (g > 10)
                g = Math.ceil(g) * i;
            }
            return g * n;
        }
    });
    S.augment(Axis, S.EventTarget, {
        initYLabel : function(data, cfg) {
            if (data.y.labels) {
                return null;
            }
            var max = cfg.max,
                n = Math.ceil((cfg.bottom - cfg.top) / 40),
                g = max / n,
                labels = [];
            for (i = 0; i <= n; i++) {
                labels.push(g * i);
            }
            data.y.labels = labels
        },
        initdata : function(data, cfg) {
            this.initYLabel(data, cfg);
            var xd = data.x,
                yd = data.y,
                xl = xd.labels.length,
                yl = yd.labels.length,
                right = cfg.right,
                left = cfg.left,
                bottom = cfg.bottom,
                top = cfg.top,
                ygap = (bottom - top) / (yl - 1),
                width = right - left,
                xgap, pathx,pathleft,pathright,
                lgap = Math.ceil(120 * xl / width);
            //init X Axis
            xd._lpath = {
                x : right * 2 - left,
                y : bottom + 20
            };
            xd._path = [];
            xd._area = [];
            xd._showlabel = [];
            for (i = 0; i < xl; i++) {
                if (this.type === ATYPE.LINE) {
                    xgap = width / (xl - 1);
                    pathx = left + i * xgap;
                    pathleft = (i === 0) ? pathx : pathx - xgap / 2;
                    pathright = (i === (xl - 1)) ? pathx : pathx + xgap / 2;
                } else {
                    xgap = width / xl;
                    pathx = left + (i + 0.5) * xgap;
                    pathleft = pathx - xgap / 2;
                    pathright = pathx + xgap / 2;
                }
                xd._showlabel.push(i === 0 || i % lgap === 0);
                xd._path.push({
                    left : pathleft,
                    right : pathright,
                    top : top,
                    bottom : bottom,
                    x : pathx
                });
                xd._area.push(new P.RectPath(pathleft, top, pathright - pathleft, bottom - top));
            }
            //init Y Axis
            yd._lpath = {
                x: (bottom - top) / 2 + top,
                y : -10
            };
            yd._path = [];
            for (i = 0; i < yl; i++) {
                yd._path.push({
                    y : bottom - ygap * i,
                    left : left,
                    right : right
                });
            }
        },
        initEvent : function() {
            if (this.type === ATYPE.LINE) {
                Event.on(this.chart, "mousemove", this.chartMouseMove, this);
                Event.on(this.chart, "mouseleave", this.chartMouseLeave, this);
            }
        },
        destory : function() {
            if (this.type === ATYPE.LINE) {
                Event.remove(this.chart, "mousemove", this.chartMouseMove);
                Event.remove(this.chart, "mouseleave", this.chartMouseLeave, this);
            }
        },
        chartMouseMove : function(ev) {
            var self = this;
            S.each(self.data.x._area, function(path, idx) {
                if (idx !== self.current_x && path.inpath(ev.x, ev.y)) {
                    self.current_x = idx;
                    self.fire("xaxishover", {index : idx, x : self.data.x._path[idx].x});
                    self.fire("redraw");
                }
            });
        },
        chartMouseLeave : function(ev) {
            this.current_x = -1;
            this.fire("redraw");
            this.fire("leave");
        },
        draw : function(ctx) {
            var self = this,
                cfgx = this.data.x,
                cfgy = this.data.y,
                lx = cfgx.labels.length,
                ly = cfgy.labels.length,
                label,gridleft,
                isline = self.type === ATYPE.LINE,
                isbar = self.type === ATYPE.BAR,
                i, iscurrent,px,py,textwidth,labelx,showlabel;
            ctx.save();
            //draw y axis
            for (i = 0; i < ly; i++) {
                py = cfgy._path[i];
                label = cfgy.labels[i];
                //draw even bg
                if (i % 2 === 1 && i > 0) {
                    ctx.save();
                    ctx.fillStyle = "#f7f7f7";
                    ctx.fillRect(
                        py.left,
                        py.y,
                        py.right - py.left,
                        cfgy._path[i - 1].y - py.y);
                    ctx.restore();
                }
                //draw grid
                if (i !== 0 && i !== ly - 1) {
                    ctx.strokeStyle = "#e4e4e4";
                    ctx.lineWidth = "1.0";
                    ctx.beginPath();
                    ctx.moveTo(py.left, py.y);
                    ctx.lineTo(py.right, py.y);
                    ctx.stroke();
                }
                //draw label
                if (label) {
                    ctx.font = "12px Tohoma";
                    ctx.textAlign = "right";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "#808080";
                    ctx.fillText(label, py.left - 5, py.y);
                }
            }
            //draw x axis
            for (i = 0; i < lx; i++) {
                iscurrent = (i === self.current_x);
                px = cfgx._path[i];
                label = cfgx.labels[i];
                showlabel = cfgx._showlabel[i];
                //draw x grid
                ctx.strokeStyle = isline && iscurrent ? "#404040" : "#e4e4e4";
                ctx.lineWidth = isline && iscurrent ? "1.6" : "1.0";
                if (isbar) {
                    if (i !== 0) {
                        ctx.beginPath();
                        ctx.moveTo(px.left, px.bottom);
                        ctx.lineTo(px.left, px.top);
                        ctx.stroke();
                    }
                }
                if (isline) {
                    if (i !== 0 && i !== lx - 1) {
                        ctx.beginPath();
                        ctx.moveTo(px.x, px.bottom);
                        ctx.lineTo(px.x, px.top);
                        ctx.stroke();
                    }
                }
                //draw x label
                if (label && showlabel) {
                    ctx.font = "13px Tahoma";
                    if (isline && i === 0) {
                        ctx.textAlign = "left";
                    } else if (isline && i === lx - 1) {
                        ctx.textAlign = "right";
                    } else {
                        ctx.textAlign = "center";
                    }
                    ctx.textBaseline = "top";
                    ctx.fillStyle = "#AAAAAA";
                    ctx.fillText(label, px.x, px.bottom + 5);
                }
            }
            if (self.current_x !== -1) {
                px = cfgx._path[self.current_x];
                label = cfgx.labels[self.current_x];
                ctx.font = "12px Tahoma";
                textwidth = ctx.measureText(label).width + 6;
                ctx.fillStyle = "#333";
                labelx = Math.max(px.x - textwidth / 2, self.cfg.left);
                labelx = Math.min(labelx, self.cfg.right - textwidth);
                ctx.fillRect(labelx, px.bottom, textwidth, 20);
                ctx.textAlign = "left";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(label, labelx + 2, px.bottom + 5);
            }
            ctx.restore();
            self.drawLabels(ctx);
        },
        drawLabels : function(ctx) {
            var self = this,
                data = self.data,
                yname = data.y.name,
                xname = data.x.name,
                px = data.x._lpath,
                py = data.y._lpath;
            //draw yaxis name
            ctx.save();
            ctx.font = "12px Arial";
            ctx.fillStyle = "#808080";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if (xname) {
                ctx.fillText(xname, px.x, px.y);
            }
            if (yname) {
                ctx.rotate(Math.PI / 2);
                ctx.translate(py.x, py.y);
                ctx.fillText(yname, 0, 0);
            }
            ctx.restore();
        }
    });
    P.Axis = Axis;
    return Axis;
});
KISSY.add("gallery/chart/element",function(S){
    var P = S.namespace("Gallery.Chart"),
        Dom = S.DOM,
        Event = S.Event,

        darker = function(c){
            var hsl = c.hslData();
            return new P.Color.hsl(hsl[0],hsl[1],hsl[2]*0.6);
        };

    function Element (data,chart,drawcfg){
        this.data = this.normalize(data);
        this.chart = chart;
        this.type = 0;
        this.drawcfg = drawcfg;
        this.initdata(drawcfg);
        this.init();
    }

    S.mix(Element,{
        getElement : function(a,b,c,type){
            var E;
            switch(type){
                case "line":
                    E = LineElement;
                    break;
                case "pie":
                    E = PieElement;
                    break;
                default:
                    E = BarElement;
            }
            return new E(a,b,c);
        },

        getMax : function(data){
            var max = data[0].data[0],
                elementidx, elementl = data.length,
                dataidx, datal;

            for(elementidx = 0; elementidx < elementl; elementidx ++){
                element = data[elementidx];
                if(element.notdraw) {continue;}
                for(dataidx = 0, datal = element.data.length; dataidx < datal; dataidx++){
                    max = Math.max(max, element.data[dataidx] || 0);
                }
            }
            return max;
        }
    });

    S.augment(Element,
        S.EventTarget,{
        /**
         * normalize the data
         * @argument {object} the data of chart elements
         */
        normalize : function(data){
            var label,newlabel,
                length = 0,
                fmt;

            S.each(data,function(element){
                if(!element.label){
                    element.label = "{d}";
                }
                element.format = (S.isString(element.format)) ? element.format : "0";
                length = Math.max(element.data.length, length);
                if(S.isString(element.label)){
                    label = element.label;
                    element.label = [];
                    if(S.isArray(element.data)){
                        S.each(element.data,function(d,idx){
                            fmt = '';
                            if(S.isNumber(d)){
                                fmt = P.format(d,element.format);
                            }else{
                                fmt = "null";
                                element.data[idx] = 0;
                            }
                            newlabel = S.substitute(label,{"d" : fmt,"name":element.name});
                            element.label.push(newlabel);
                        });
                    }
                }
            });
            this.maxlength = length;
            return data;
        },
        drawNames : function(ctx){
            var self = this,
                cfg = self.drawcfg,
                data = self.data,
                l = data.length,
                i = l - 1,
                d,c,
                br = cfg.right,
                by = cfg.top/2;

            for(; i>=0; i--){
                d = data[i];
                if(d.notdraw){
                    continue;
                }
                c = P.colors[i].c;
                //draw text
                ctx.save();
                ctx.textAlign = "end";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#808080";
                ctx.font = "12px Arial";
                ctx.fillText(d.name, br, by);
                br -= ctx.measureText(d.name).width + 10;
                ctx.restore();
                //draw color dot
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = c;
                ctx.arc(br,by,5,0,Math.PI*2,true);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                br -= 10;
            }
        },
        init : function(){},
        initdata : function(){},
        destory : function(){},
        draw : function(ctx,cfg){},
        drawBar : function(ctx,cfg){},
        getTooltip : function(index){}
    });

    /**
     * class Element for Line chart
     */
    function LineElement(data,chart,drawcfg){
        LineElement.superclass.constructor.call(this,data,chart,drawcfg);
        this._current = -1;
        this.anim = new P.Anim(0.4,"easeInStrong");
        this.anim.init();
    }

    S.extend(LineElement,Element,{
        initdata : function(cfg){
            var self = this,
                ml = self.maxlength,
                data = self.data,
                left = cfg.left,
                bottom = cfg.bottom,
                width = cfg.right - cfg.left,
                height = cfg.bottom - cfg.top,
                maxtop,xtop,
                gap = width/(ml-1),
                i,j;
            S.each(data,function(element,idx){
                if(element.notdraw){
                    return;
                }
                element._points = [];
                element._maxtop = bottom;
                for(i=0; i< ml; i++){
                    ptop = Math.max(bottom - element.data[i]*height/cfg.max, cfg.top - 5);
                    element._maxtop = Math.min(element._maxtop, ptop);
                    element._points.push({
                        x : left + gap*i,
                        y : ptop,
                        bottom : bottom
                    });
                }
            });
            //x top
            self._xtop = [];
            for(i = 0; i < ml; i++){
                xtop = bottom;
                S.each(data,function(element,idx){
                    if(element.notdraw){
                        return;
                    }
                    xtop = Math.min(element._points[i].y, xtop);
                });
                self._xtop.push(xtop);
            }
        },
        draw : function(ctx,cfg){
            var self = this,
                data = self.data,
                left = cfg.left,
                right = cfg.right,
                top = cfg.top,
                bottom = cfg.bottom,
                height = bottom - top,
                max = cfg.max,
                colors = P.colors,
                color,
                maxtop,
                ptop,
                points,i,l,t,
                k = self.anim.get(), gradiet;
            self.drawNames(ctx,cfg);
            if(this._ready_idx !== data.length-1 || k!==1){
                this.fire("redraw");
            }
            if(k === 1 && this._ready_idx < data.length -1){
                self._ready_idx ++;
                self.anim.init();
                k = self.anim.get();
            }
            S.each(data,function(linecfg,idx){
                if(linecfg.notdraw){
                    return;
                }
                if (idx !== self._ready_idx) {
                    t = (idx > self._ready_idx)?0:1;
                }else{
                    t = k;
                }
                color = colors[idx];
                points = linecfg._points;
                //draw bg
                if(linecfg.drawbg){
                    ctx.save();
                    ctx.globalAlpha = 0.4;
                    maxtop = bottom - (bottom - linecfg._maxtop)*t;
                    gradiet = ctx.createLinearGradient( left, maxtop, left, bottom);
                    gradiet.addColorStop(0,color.c);
                    gradiet.addColorStop(1,"rgb(255,255,255)");
                    ctx.fillStyle = gradiet;
                    ctx.beginPath();
                    ctx.moveTo(left,bottom);
                    for(i = 0; i < l; i++){
                        p = points[i];
                        ptop = bottom - (bottom - p.y)*t;
                        ctx.lineTo(p.x,ptop);
                    }
                    ctx.lineTo(right,bottom);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                }

                //draw line
                ctx.save();
                l = points.length;
                ctx.strokeStyle = color.c;
                ctx.lineWidth = 2;
                ctx.beginPath();
                for(i = 0; i < l; i++){
                    p = points[i];
                    ptop = bottom - (bottom - p.y)*t;
                    if(i===0){
                        ctx.moveTo(p.x,ptop);
                    } else {
                        ctx.lineTo(p.x,ptop);
                    }
                }
                ctx.stroke();
                ctx.restore();

                //draw point
                ctx.save();
                for(i = 0; i < l; i++){
                    p = points[i];
                    ptop = bottom - (bottom - p.y)*t;
                    //circle outter
                    ctx.fillStyle = color.c;
                    ctx.beginPath();
                    ctx.arc(p.x,ptop,5,0,Math.PI*2,true);
                    ctx.closePath();
                    ctx.fill();
                    //circle innner
                    if(i !== self._current){
                        ctx.fillStyle = "#fff";
                        ctx.beginPath();
                        ctx.arc(p.x,ptop,3,0,Math.PI*2,true);
                        ctx.closePath();
                        ctx.fill();
                    }
                }
                ctx.restore();
            });
        },
        init : function(){
            this._ready_idx = 0;
            Event.on(this.chart,"axishover",this._axis_hover,this);
            Event.on(this.chart,"axisleave",this._axis_leave,this);
        },
        destory : function(){
            Event.remove(this.chart,"axishover",this._axis_hover);
            Event.remove(this.chart,"axisleave",this._axis_hover);
        },
        _axis_hover : function(e){
            var idx = e.index;
            if(this._current !== idx){
                this._current = idx;
                this.fire("redraw");
                this.fire("showtooltip",{
                    left : e.x,
                    top : this._xtop[idx],
                    message : this.getTooltip(idx)
                });
            }
        },
        _axis_leave : function(e){
            this._current = -1;
            this.fire("redraw");
        },
        /**
         * get tip by id
         * @return {object:dom}
         **/
        getTooltip : function(index){
            var self = this,
                data = self.data,
                type = data[0].data.length === 1 ? 0:1,
                colors = P.colors,
                ul,
                elid = "tooltip"+index,
                li;
            //if(self._elcache[elid]) return this._elcache[elid];
            ul = Dom.create("<ul>");
            S.each(data,function(item,idx){
                li = Dom.create("<li>");
                Dom.html(li,
                    "<p style='font-weight:bold;color:"+colors[idx].c+"'>"+
                    item.label[index] +
                    "</p>");
                ul.appendChild(li);
            });
            //self._elcache[elid] = ul;
            return ul;
        }
    });

    /**
     * class BarElement for Bar Chart
     */
    function BarElement(data,chart,drawcfg){
        BarElement.superclass.constructor.call(this,data,chart,drawcfg);
        this.current = [-1,-1];
        this.anim = new P.Anim(0.5,"easeInStrong");
        this.anim.init();
    }
    S.extend(BarElement, Element,{
        initdata : function(cfg){
            var self = this,
                data = self.data,
                ml = this.maxlength,
                n = data.length,
                itemwidth = (cfg.right - cfg.left)/ml,
                gap = itemwidth/5/n,
                padding = itemwidth/3/n,
                barwidth = (itemwidth - (n-1) * gap - 2*padding)/n,
                barheight,barleft,bartop;
            S.each(data, function(element,eidx){
                element._x = [];
                element._top = [];
                element._left = [];
                element._height = [];
                element._width = [];
                element._path = [];
                for(i = 0; i< ml; i++){
                    barheight = (cfg.bottom - cfg.top)* element.data[i] / cfg.max;
                    barleft = cfg.left + i * itemwidth + padding + eidx * (barwidth + gap);
                    bartop = cfg.bottom - barheight;
                    element._left[i] = barleft;
                    element._top[i] = bartop;
                    element._width[i] = barwidth;
                    element._height[i] = barheight;
                    element._path[i] = new P.RectPath(barleft,bartop,barwidth,barheight);
                    element._x[i] = barleft+barwidth/2;
                }
            });
        },
        draw : function(ctx){
            var self = this,
                data = self.data,
                n = data.length,
                ml=self.maxlength,
                color,gradiet,colord,chsl,
                barheight,cheight,barleft,bartop,
                //for anim
                k = self.anim.get(), i;
            self.drawNames(ctx);
            S.each(data, function(bar,idx){
                color = new P.Color(P.colors[idx].c);
                colord = darker(color);
                for(i = 0; i< ml; i++){
                    barleft = bar._left[i];
                    barheight = bar._height[i];
                    cheight = barheight * k;
                    bartop = bar._top[i] + barheight - cheight;
                    barwidth = bar._width[i];
                    //draw backgraound
                    gradiet = ctx.createLinearGradient(barleft,bartop,barleft,bartop + cheight);
                    gradiet.addColorStop(0,color.css());
                    gradiet.addColorStop(1,colord.css());
                    ctx.fillStyle = gradiet;
                    ctx.fillRect(barleft,bartop,barwidth,cheight);
                    //draw label on the bar
                    if(ml === 1 && barheight > 25){
                        ctx.save();
                        ctx.fillStyle = "#fff";
                        ctx.font = "20px bold Arial";
                        ctx.textBaseline = "top";
                        ctx.textAlign = "center";
                        ctx.fillText(P.format(bar.data[i],bar.format), bar._x[i], bartop + 2);
                        ctx.restore();
                    }
                }

            });
            if(k !== 1) {
                self.fire("redraw");
            }
        },
        init : function(){
            Event.on(this.chart,"mousemove",this.chartMouseMove,this);
            Event.on(this.chart,"mouseleave",this.chartMouseLeave,this);
        },
        destory : function(){
            Event.remove(this.chart,"mousemove",this.chartMouseMove);
            Event.remove(this.chart,"mouseleave",this.chartMouseLeave);
        },
        chartMouseMove : function(ev){
            var current = [-1,-1],
                data = this.data;

            S.each(this.data,function(bar,idx){
                S.each(bar._path, function(path,index){
                    if(path.inpath(ev.x,ev.y)){
                        current = [idx,index];
                    }
                });
            });

            if( current[0] === this.current[0] &&
                current[1] === this.current[1])
            {
                return;
            }
            this.current = current;
            if(current[0] + current[1] >= 0){
                this.fire("barhover",{index:current});
                this.fire("showtooltip",{
                    top : data[current[0]]._top[current[1]],
                    left : data[current[0]]._x[current[1]],
                    message : this.getTooltip(current)
                });
            }else{
                this.fire("hidetooltip");
            }
        },
        chartMouseLeave : function(){
            this.current = [-1,-1];
        },
        /**
         * get tip by id
         * @return {object:dom}
         **/
        getTooltip : function(index){
            var self = this,
                eidx = index[0],
                didx = index[1],
                data = self.data,
                colors = P.colors,
                container,
                elid = "tooltip"+index,
                li;
            //if(self._elcache[elid]) return this._elcache[elid];
            container = Dom.create("<div>");
            Dom.addClass(container ,"bartip");
            Dom.html(container,
                "<span style='color:"+colors[eidx].c+";'>"+
                this.data[eidx].label[didx]+"</span>");
            //self._elcache[elid] = container;
            return container;
        }
    });

    function PieElement(data,chart,drawcfg){
        PieElement.superclass.constructor.call(this,data,chart,drawcfg);
        this.anim = new P.Anim(1,"bounceOut");
        this.anim.init();
    }
    S.extend(PieElement,Element,{
        initdata : function(cfg){
            var self = this,
                data = self.data,
                total = 0,
                color,colord,
                pecent,start;
            self._pecent = [];
            self._start = [];
            self._color = [];
            self._colord = [];

            S.each(data,function(item,idx){
                item.data = S.isNumber(item.data)?item.data:0;
                total += item.data;
            });

            start = 0;
            S.each(data,function(item,idx){
                pecent = item.data/total;
                color = new P.Color(P.colors[idx].c);
                colord = darker(color);
                self._start.push(start);
                self._pecent.push(item.data/total);
                self._color.push(color.css());
                self._colord.push(colord.css());
                start += pecent;
            });
            self._x = (cfg.right + cfg.left)/2;
            self._y = (cfg.top + cfg.bottom)/2;
            self._r = Math.min(cfg.bottom - cfg.top, cfg.right - cfg.left)/2;
        },
        draw : function(ctx){
            var self = this,
                px = self._x,
                py = self._y,
                pr = self._r,
                start, pecent,
                k = self.anim.get(),
                gra;
            if(k < 1){
                self.fire("redraw");
            }
            self.drawNames(ctx);
            S.each(self.data, function(p, idx){
                start = self._start[idx] * k;
                pecent = self._pecent[idx] * k;
                ctx.save();
                //ctx.strokeStyle = "#000";
                ctx.lineWidth = 2;
                gra = ctx.createRadialGradient(px,py,0,px,py,pr);
                gra.addColorStop(1,self._colord[idx]);
                gra.addColorStop(0.4,self._color[idx]);
                //gra.addColorStop(0,"#fff");
                ctx.fillStyle = gra;
                ctx.beginPath();
                ctx.moveTo(px,py);
                ctx.arc(px, py, pr, start*2*Math.PI, (start+pecent)*2*Math.PI,false);
                ctx.closePath();
                ctx.fill();
                //ctx.stroke();
                ctx.restore();
            });
        },
        init : function(){
            //Event.on(this.chart,"mousemove",this.chartMouseMove,this);
            //Event.on(this.chart,"mouseleave",this.chartMouseLeave,this);
        },
        destory : function(){
            //Event.remove(this.chart,"mousemove",this.chartMouseMove);
            //Event.remove(this.chart,"mouseleave",this.chartMouseLeave);
        },
        chartMouseMove : function(ev){
            var self = this,
                px = self._x,
                py = self._y,
                pr = self._r,
                start, pecent;
            S.each(self.data,function(item,idx){
                start = self._start[idx];
                pecent = self._pecent[idx];
                //ctx.beginPath();
                //ctx.moveTo(px,py);
                //ctx.art(px,py,pr,start*2*Math.PI,(start+pecent)*2*Math.PI);
            });
        },
        chartMouseLeave : function(ev){
        }
    });
    P.Element = Element;
    P.LineElement = LineElement;
    P.BarElement = BarElement;
    P.PieElement = PieElement;
    return {
        Element:Element,
        LineElement:LineElement,
        BarElement:BarElement,
        PieElement:PieElement
    };
});
