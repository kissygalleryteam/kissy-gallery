/*
 digital clock emulation
 @author yiminghe@gmail.com(chengyu)
 */
KISSY.add("digital-clock", function (S) {
    //clock number markup
    var CLOCK_NUMBER = ('<div class="Kelement  Kvertical Ke1">'
        + '<s class="Kfirst"></s>'
        + '<div class="Kbar"></div>'
        + '<b class="Klast"></b>'
        + '</div>'
        + '<div class="Kelement Kvertical Ke2">'
        + '<s class="Kfirst"></s>'
        + '<div class="Kbar"></div>'
        + '<b class="Klast"></b>'
        + '</div>'
        + '<div class="Kelement Khorizonal Ke3">'
        + '<s class="Kfirst"></s>'
        + '<div class="Kbar"></div>'
        + '<b class="Klast"></b>'
        + '</div>'
        + '<div class="Kelement  Kvertical Ke4">'
        + '<s class="Kfirst"></s>'
        + '<div class="Kbar"></div>'
        + '<b class="Klast"></b>'
        + '</div>'
        + '<div class="Kelement Kvertical Ke5">'
        + '<s class="Kfirst"></s>'
        + '<div class="Kbar"></div>'
        + '<b class="Klast"></b>'
        + '</div>'
        + '<div class="Kelement Khorizonal Ke6">'
        + '<s class="Kfirst"></s>' + '<div class="Kbar"></div>' +
        '<b class="Klast"></b>' + '</div>' + '<div class="Kelement Khorizonal Kex">' +
        '<s class="Kfirst"></s>' + '<div class="Kbar"></div>' + '<b class="Klast"></b>' +
        '</div>').replace(/K/g, "ks-digitalclock-"),
        N2 = function (str) {
            return parseInt(str, 2);
        }
        //colon markup
        ,
        COLON = ('<div class="Kcontainer">' + '<div class="Kcolon1">' + '<s class="Kcolon-top">' + '</s>' + '<b class="Kcolon-bottom">' + '</b>' + '</div>' + '<div class="Kcolon2">' + '<s class="Kcolon-top">' + '</s>' + '<b class="Kcolon-bottom">' + '</b>' + '</div>' + '</div>').replace(/K/g, "ks-digitalclock-")
        //clock container markup
        ,
        Node = S.Node,
        //clock region
        C_WIDTH = 120,
        C_HEIGHT = 200,
        BORDER_L = 10,
        BORDER_S = 5,
        COLON_WIDTH = 30,
        KS_WIDTH = 710,
        S_ZOOM = 0.4,
        BG_COLOR = "#565656",
        //property shortcut for compression
        ks_digitalclock_first = ".ks-digitalclock-first",
        ks_digitalclock_last = ".ks-digitalclock-last",
        ks_digitalclock_element = ".ks-digitalclock-element",
        border_width = "border-width",
        WIDTH = "width",
        HEIGHT = "height",
        ks_digitalclock_colon_top = ".ks-digitalclock-colon-top",
        ks_digitalclock_colon_bottom = ".ks-digitalclock-colon-bottom",
        VALUE = "value",
        //电子钟组成部分和相应div的对照
        DIGITAL_CONFIG = {
            0: N2("01111110"),
            1: N2("0110000"),
            2: N2("11101100"),
            3: N2("11111000"),
            4: N2("10110010"),
            5: N2("11011010"),
            6: N2("11011110"),
            7: N2("01110010"),
            8: N2("11111111"),
            9: N2("11111011")
        };
    var ClockNumber = S.Base.create([S.Ext.Box], {
        init:function() {
            var self = this;
            self.on("renderUI", self._renderUIClockNumber, self);
        },
        _renderUIClockNumber:function() {
            var self = this,el = self.get("el");
            el.html(CLOCK_NUMBER);
            self._bars = el.children();
            var bars = self._bars;
            for (var i = 0; i < bars.length; i++) {
                bars[i] = new Node(bars[i]);
            }
        },
        //internal use ,zoom number
        _uiSetZoom: function (z) {

            var self = this,_domNode = self.get("el"),_bars = self._bars;
            _domNode.css(WIDTH, C_WIDTH * z + "px");
            _domNode.css(HEIGHT, C_HEIGHT * z + "px");
            //if zoom too small ,then triangle disappear !
            if (z >= self.get("zoomLimit")) {
                _domNode.all(ks_digitalclock_element).each(function (node) {
                    node.css("background-color", "transparent");
                });
                _domNode.all(ks_digitalclock_last).each(function (node) {
                    node.css(border_width, BORDER_L * z + "px");
                });
                _domNode.all(ks_digitalclock_first).each(function (node) {
                    node.css(border_width, BORDER_L * z + "px");
                });
                _bars[0].one(ks_digitalclock_first).css(border_width, BORDER_L * z + "px");
                _bars[4].one(ks_digitalclock_first).css(border_width, BORDER_L * z + "px");
                _bars[0].one(ks_digitalclock_last).css(border_width,
                    BORDER_S * z + "px" + " " + BORDER_L * z + "px");
                _bars[1].one(ks_digitalclock_first).css(border_width,
                    BORDER_S * z + "px" + " " + BORDER_L * z + "px");
                _bars[1].one(ks_digitalclock_last).css(border_width, BORDER_L * z + "px");
                _bars[3].one(ks_digitalclock_last).css(border_width, BORDER_L * z + "px");
                _bars[3].one(ks_digitalclock_first).css(border_width,
                    BORDER_S * z + "px" + " " + BORDER_L * z + "px");
                _bars[4].one(ks_digitalclock_last).css(border_width,
                    BORDER_S * z + "px" + " " + BORDER_L * z + "px");
            } else {
                _domNode.all(ks_digitalclock_element).each(function (node) {
                    node.css("background-color", BG_COLOR);
                });
            }
        },
        //internal use ,synchronize data with ui
        _uiSetValue: function (vr, e) {

            var self = this
                , v = DIGITAL_CONFIG[vr]
                , preV = DIGITAL_CONFIG[e && e.prevVal || vr]
                , diff = v ^ preV,
                _bars = self._bars;

            for (var i = 0; i < _bars.length; i++) {
                v = v >> 1;
                diff = diff >> 1;
                var node = _bars[i],
                    b = v & 1,
                    diffB = diff & 1;
                if (b && diffB) {
                    node.css("display", "");
                } else if (diffB) {
                    node.css("display", "none");
                }
            }
        }
    }, {
        ATTRS:{
            elCls:{
                value:"ks-digitalclock-container"
            },
            /*
             clock number value
             @default 0
             */
            value: {
                value: 8
            },
            zoomLimit:{
                value:0.2
            },
            /*
             clock zoom value
             @default 1
             */
            zoom: 1
        }
    });


    DigitalClock = S.Base.create([S.Ext.Box], {
        init:function() {
            var self = this;
            self.on("renderUI", self._renderUIDigitalClock, self);
        },
        _renderUIDigitalClock:function() {
            var self = this,el = self.get("el"),c;
            self._ns = [];
            var ns = self._ns,zoomLimit = self.get("zoomLimit");
            for (i = 0; i < 2; i++) {
                var s = new ClockNumber({
                    zoomLimit:zoomLimit,
                    render:el,
                    autoRender:true
                });
                s.get("el").addClass("ks-digitalclock-seconds");
                ns.unshift(s);
            }
            for (i = 0; i < 2; i++) {
                ns.unshift(new ClockNumber({
                    zoomLimit:zoomLimit,
                    render:el,
                    autoRender:true
                }));
            }
            self._colon = new Node(COLON).prependTo(el);
            self._colonVisible = true;
            for (var i = 0; i < 2; i++) {
                ns.unshift(new ClockNumber({
                    zoomLimit:zoomLimit,
                    render:el,
                    autoRender:true
                }));
            }
        },
        _uiSetZoom: function (z) {
            var self = this,
                i,
                _colon = self._colon,
                _ns = self._ns;
            for (i = 0; i < 4; i++)
                _ns[i].set("zoom", z);
            for (i = 4; i < 6; i++)
                _ns[i].set("zoom", z * S_ZOOM);
            _colon.css(WIDTH, COLON_WIDTH * z + "px");
            _colon.css(HEIGHT, C_HEIGHT * z + "px");
            _colon.all(ks_digitalclock_colon_top).each(function (node) {
                node.css(border_width, BORDER_L * z + "px");
            });
            _colon.all(ks_digitalclock_colon_bottom).each(function (node) {
                node.css(border_width, BORDER_L * z + "px");
            });
            self.get("render").css(WIDTH, KS_WIDTH * z + "px");
        },
        //internal use ,repaint its numbers and colon
        _uiSetDate: function (d) {
            var self = this
                ,h = d.getHours(),
                _ns = self._ns,
                _colonVisible = self._colonVisible,
                m = d.getMinutes(),
                s = d.getSeconds();
            _ns[0].set(VALUE, Math.floor(h / 10));
            _ns[1].set(VALUE, Math.floor(h % 10));
            _ns[2].set(VALUE, Math.floor(m / 10));
            _ns[3].set(VALUE, Math.floor(m % 10));
            _ns[4].set(VALUE, Math.floor(s / 10));
            _ns[5].set(VALUE, Math.floor(s % 10));
            _colonVisible = !_colonVisible;
            self._colon.css("visibility", _colonVisible ? "visible" : "hidden");
            self._colonVisible = _colonVisible;
        }
    }, {
        ATTRS:{
            elCls:{
                value:"ks-digitalclock-border clearfix"
            },
            /*
             clock time
             @default now
             */
            date: {
                value: new Date()
            },
            zoom: {
                value: 1
            },
            /*
             trangle will disappear when lower enough
             @default 0.2
             */
            zoomLimit:{
                value:0.2
            }
        }
    });
    S.DigitalClock = DigitalClock;
});