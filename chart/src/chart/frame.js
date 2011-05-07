KISSY.add("gallery/chart/frame",function(S){
    var P = S.namespace("Gallery.Chart");

    /**
     * The Border Layer
     */
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
