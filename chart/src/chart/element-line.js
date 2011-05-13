KISSY.add("gallery/chart/element-pie",function(S){
    var P = S.namespace("Gallery.Chart"),
        Dom = S.DOM,
        Event = S.Event;
    /**
     * class Element for Line chart
     */
    function LineElement(data,chart,drawcfg){
        LineElement.superclass.constructor.call(this,data,chart,drawcfg);
        this._current = -1;
        this.anim = new P.Anim(0.4,"easeInStrong");
        this.anim.init();
    }

    S.extend(LineElement,P.Element,{
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

    P.LineElement = LineElement;
    return LineElement;
},{
    requires : [
        "./element"
    ]
});
