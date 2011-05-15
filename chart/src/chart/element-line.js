KISSY.add("gallery/chart/element-line",function(S){
    var P = S.namespace("Gallery.Chart"),
        Dom = S.DOM,
        Event = S.Event;
    /**
     * class Element for Line chart
     */
    function LineElement(data,chart,drawcfg){
        var self = this;
        self.chart = chart;
        self.data = data;
        self.elements = data.elements();
        self._current = -1;
        self.drawcfg = drawcfg;
        self.initdata(drawcfg);
        self.init();

        self.anim = new P.Anim(0.4,"easeInStrong");
        self.anim.init();
    }

    S.extend(LineElement, P.Element, {
        /**
         * 根据数据源，生成图形数据
         */
        initdata : function(cfg){
            var self = this,
                data = self.data,
                elements = self.elements,
                ml = data.maxElementLength(),
                left = cfg.left,
                bottom = cfg.bottom,
                width = cfg.right - cfg.left,
                height = cfg.bottom - cfg.top,
                gap = width/(ml-1),
                maxtop, i,j;
            var items = [];
            self.items = items;

            data.eachElement(function(elem,idx,idx2){
                if(!items[idx]){
                    items[idx] = {
                        _points : [],
                        _labels : [],
                        _color : data.getColor(idx),
                        _maxtop : bottom
                    };
                }
                var element = items[idx];
                ptop = Math.max(bottom - elem.data*height / cfg.max, cfg.top - 5);
                element._maxtop = Math.min(element._maxtop, ptop);
                element._labels[idx2] = elem.label;
                element._points[idx2] = {
                    x : left + gap*idx2,
                    y : ptop,
                    bottom : bottom
                };

            });

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
                color,
                ptop,
                points,i,l,t,
                k = self.anim.get(), gradiet;

            if(data.config.showLabels){
                self.drawNames(ctx,cfg);
            }

            // the animation
            //if(k === 1 && this._ready_idx < data.length -1){
                //self._ready_idx ++;
                //self.anim.init();
                //k = self.anim.get();
            //}

            //if(this._ready_idx !== data.length-1 || k!==1){
                //this.fire("redraw");
            //}
            
            k = 1;
            self._ready_idx = 100;


            S.each(self.items,function(linecfg,idx){
                if(linecfg.notdraw){
                    return;
                }
                if (idx !== self._ready_idx) {
                    t = (idx > self._ready_idx)?0:1;
                }else{
                    t = k;
                }
                color = linecfg._color;
                points = linecfg._points;
                //draw bg
                if(linecfg.drawbg){
                    ctx.save();
                    ctx.globalAlpha = 0.4;
                    maxtop = bottom - (bottom - linecfg._maxtop)*t;
                    gradiet = ctx.createLinearGradient( left, maxtop, left, bottom);
                    gradiet.addColorStop(0,color);
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
                ctx.strokeStyle = color;
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
                    ctx.fillStyle = color;
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
            var self = this, ul, li;
            ul= "<ul>";
            S.each(self.items, function(item,idx){
                li = "<li><p style='font-weight:bold;color:" + item._color + "'>" +
                        item._labels[index] +
                    "</p></li>";
                ul += li
            });
            ul += "</ul>";
            return ul;
        }
    });

    P.LineElement = LineElement;
    return LineElement;
},{
    requires : [
        "./element"
    ]
});
