KISSY.add("gallery/chart/element-pie",function(S){
    var P = S.namespace("Gallery.Chart"),
        Dom = S.DOM,
        Event = S.Event;

    function PieElement(data,chart,drawcfg){
        this.data = data;
        this.chart = chart;
        this.type = 0;
        this.drawcfg = drawcfg;
        this.initdata(drawcfg);
        this.init();
        this.anim = new P.Anim(1,"bounceOut");
        this.anim.init();
    }

    S.extend(PieElement,P.Element,{
        initdata : function(cfg){
            var self = this,
                data = self.data,
                total = 0,
                color,
                pecent,pecentStart;

            self._x = data.config.showLabels ? cfg.width * 0.618 /2 : cfg.width/2;
            self._y = cfg.height/2;
            self._r = Math.min(cfg.bottom - cfg.top, cfg.right - cfg.left)/2;
            self._lx = cfg.width*0.618;
            self.angleStart = -Math.PI/4;//Math.PI * 7/4;
            self.antiClock = true;
            self.items = [];
            self._currentIndex = -1;
            total = data.sum();

            pecentStart = 0;
            S.each(data.elements(),function(item,idx){
                pecent   = item.data/total;
                end = pecentStart + pecent;
                self.items.push({
                    start : pecentStart,
                    end : end,
                    color : data.getColor(idx, data.elements().length),
                    textColor : "#999",
                    labelRight : cfg.width - 50,
                    labelY : 50 + 20 * idx
                });
                pecentStart = end;
            });

        },

        /**
         * Draw the Labels for all Element
         * @private
         */
        drawLabels: function(ctx){
            var self = this,
                data = self.data,
                items = self.items,
                item,
                sum = data.sum(),
                labelText,
                labelX , labelY;
            ctx.save();
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'right';
            data.eachElement(function(elem,idx){
                item = items[idx];
                labelY = item.labelY;
                labelX = item.labelRight;
                ctx.fillStyle = items[idx].color;
                ctx.beginPath();
                ctx.moveTo(labelX,labelY)
                ctx.font = "15px sans-serif"
                ctx.fillRect(labelX - 10,labelY-5,10,10);
                ctx.closePath();
                ctx.fillStyle = items[idx].textColor;
                labelText = S.substitute("{name} ({data})",{data:P.format(elem.data,elem.format),name:elem.name}) + " - " + P.format(elem.data/sum * 100,"0.00") + "%";
                ctx.fillText(labelText, labelX - 15, labelY);
            });
            ctx.restore();
        },

        draw : function(ctx){
            var self = this,
                px = self._x,
                py = self._y,
                pr = self._r,
                start, end,
                k = self.anim.get(),
                //k = 1,
                gra;
            if(k < 1){
                self.fire("redraw");
            }
            if(self.data.config.showLabels){
                self.drawLabels(ctx);
            }
            S.each(self.items, function(p, idx){
                start = p.start * k * 2 * Math.PI;
                end = p.end* k * 2 * Math.PI;
                ctx.save();
                ctx.lineWidth = 0.5;
                ctx.fillStyle = p.color;
                ctx.strokeStyle = "#fff";
                ctx.beginPath();
                ctx.moveTo(px,py);
                p._currentStart = self.antiClock?self.angleStart-start:self.angleStart+start;
                p._currentEnd = self.antiClock?self.angleStart-end:self.angleStart+end;
                ctx.arc(px, py, pr, p._currentStart, p._currentEnd, self.antiClock);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            });
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
            var self = this,
                pr = self._r,
                dx = ev.x - self._x,
                dy = ev.y - self._y,
                anglestart,
                angleend, angle,t,
                item, items = self.items;

            // if mouse out of pie
            if(dx*dx + dy*dy > pr*pr){
                self.fire("hidetooltip");
                self._currentIndex = -1;
                return;
            };

            //get the current mouse angle from 
            //the center of the pie
            if(dx != 0 ){
                angle = Math.atan(dy/dx);
                if(dy < 0 && dx > 0){
                    angle += 2*Math.PI;
                }
                if(dx < 0){
                    angle += Math.PI;
                }
            }else{
                angle = dy >= 0 ? Math.PI/2 : 3 * Math.PI/2;
            }

            //find the pieace under mouse
            for(i = items.length - 1; i >= 0 ; i--){
                item = items[i];
                t = Math.PI * 2

                anglestart = item._currentStart;
                angleend = item._currentEnd;

                if(anglestart > angleend){
                    t = anglestart;
                    anglestart = angleend;
                    angleend = t;
                }

                t = angleend-anglestart;

                anglestart = anglestart % (Math.PI * 2)

                if(anglestart < 0 ){
                    if(anglestart + t < 0 || angle > Math.PI){
                        anglestart = anglestart + Math.PI * 2;
                    }
                }

                if(angle > anglestart && angle < anglestart + t && i !== self._currentIndex){
                    self._currentIndex = i;
                    self.fire("showtooltip",{
                        message : self.data.elements()[i].label
                    });
                }
            }

        },
        chartMouseLeave : function(ev){
            this._currentIndex = -1;
            this.fire("hidetooltip");
        }
    });

    P.PieElement = PieElement;
    return PieElement;

},{
    requires : [
        "./element"
    ]
});
