KISSY.add("gallery/chart/element-pie",function(S,Element){
    var P = S.namespace("Gallery.Chart"),
        Dom = S.DOM,
        Event = S.Event,
        darker = function(c){
            var hsl = c.hslData();
            return new P.Color.hsl(hsl[0],hsl[1],hsl[2]*0.6);
        };
    /**
     * class BarElement for Bar Chart
     */
    function BarElement(data,chart,drawcfg){
        this.data = data;
        this.chart = chart;
        this.drawcfg = drawcfg;

        this.initData(drawcfg);
        this.initEvent();

        this.current = [-1,-1];
        this.anim = new P.Anim(0.5,"easeInStrong");
        this.anim.init();
    }

    S.extend(BarElement, P.Element,{
        initData : function(cfg){
            var self = this,
                data = self.data.elements(),
                ml = this.maxlength,
                n = data.length,
                itemwidth = (cfg.right - cfg.left)/ml,
                gap = itemwidth/5/n,
                padding = itemwidth/3/n,
                barwidth = (itemwidth - (n-1) * gap - 2*padding)/n,
                barheight,barleft,bartop;
            self.items = [];
            S.each(data, function(dataitem,eidx){
                element = {};
                element._x = [];
                element._top = [];
                element._left = [];
                element._height = [];
                element._width = [];
                element._path = [];
                for(i = 0; i< ml; i++){
                    barheight = (cfg.bottom - cfg.top)* dataitem.data[i] / cfg.max;
                    barleft = cfg.left + i * itemwidth + padding + eidx * (barwidth + gap);
                    bartop = cfg.bottom - barheight;
                    element._left[i] = barleft;
                    element._top[i] = bartop;
                    element._width[i] = barwidth;
                    element._height[i] = barheight;
                    element._path[i] = new P.RectPath(barleft,bartop,barwidth,barheight);
                    element._x[i] = barleft+barwidth/2;
                }
                self.items.push(element);
            });
        },
        draw : function(ctx){
            var self = this,
                data = self.items,
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

        initEvent : function(){
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
            container = Dom.create("<div>");
            Dom.addClass(container ,"bartip");
            Dom.html(container,
                "<span style='color:"+colors[eidx].c+";'>"+
                this.data[eidx].label[didx]+"</span>");
            return container;
        }
    });

    P.BarElement = BarElement;
    return BarElement;
},{
    requires : ["./element"]
});
