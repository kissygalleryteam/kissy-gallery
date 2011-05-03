KISSY.add("m~tooltip",function(S){
    var Dom = S.DOM,
        Event = S.Event,
        P = S.namespace("chart");
    /**
     * @constructor
     * @param {DOMObject} the container of tooltip
     */
    function Tooltip(container){
        var t = "<div class='bd'>"+
                    "<div class='cnt'>content</div>"+
                "</div>"+
                "</div><div class='ft'>"+
                    "<span class=\"bot\"></span>"+
                    "<span class=\"top\"></span>"+
                "</div>",
            el = Dom.create("<div />", {"class":"tooltip","style":"display:none"});
        el.innerHTML = t;
        this.bd = S.one(".cnt",el)
        this.el = S.one(el);
        this.timeoutid = 0;
        this.el.appendTo(container)
          .on("mouseleave",this._mouseleave, this)
          .on("mouseenter",this._mouseenter, this);
    }
    S.augment(Tooltip,{
        /**
         * hide tooltip
         * @public
         */
        hide : function(){
            var self = this,
                el = self.el;
            clearTimeout(self.timeoutid);
            self.timeoutid = setTimeout(function h(){
                if(self.anim) {
                    self.anim.stop();
                }
                self.anim = new S.Anim(el,{opacity : 0},0.3,"easeOut",function(){
                    el.hide();
                });
                self.anim.run();
            },100);
        },
        /**
         * show the tooltip
         * @public
         * @param {string|DomElement} the message to display
         * @param {object} left and top
         )*/
        show : function(cfg){
            var self = this,
                el = self.el,
                bd = self.bd,
                message = cfg.message,
                width = 120,
                height,left,top;
            clearTimeout(self.timeoutid);
            self.timeoutid = setTimeout(function s(){
                if(self.anim){
                    self.anim.stop();
                }
                //add message in
                if(S.isString(message)){
                    bd.html(messsage)
                }else{
                    Dom.html(bd,"");
                    bd.append(message);
                }
                //get size and position
                el.show();
                height = Dom.height(bd);
                left = cfg.left - el.width()/2;
                top = cfg.top - height - 20;
                el.css("opacity","0.2")
                  .css("left",left)
                  .css("top",top + 10);
                self.anim = S.Anim(el[0],{
                    "left":left + "px",
                    "top" : top + "px",
                    "opacity" : 1
                },0.3,"easeOut");
                self.anim.run();
            },100);
        },
        _mouseenter : function(e){
            clearTimeout(this.timeoutid);
            //this.show();
        },
        _mouseleave : function(e){
            this.hide();
        }
    });
    P.Tooltip = Tooltip;
});
