/**
 * @Description: 基于RandomRegion UI层的效果封装
 * @Author:     tiejun[at]taobao.com
 * @Date:       11-10-18
 * @Log:
 */
KISSY.add('gallery/random-show', function(S) {

    var D = S.DOM,
        RATIO_SHOW = 0.5;

    function RandomShow(container, cfg) {

        container = S.get(container);
        cfg = cfg || {};

        var children = D.children(container),
            rrCfg = {
                width: cfg.width || container.clientWidth,
                height: cfg.height || container.clientHeight,
                sizes: cfg.sizes || {baseWidth:children[0].offsetWidth,baseHeight:children[0].offsetHeight,minRatio:0.6}
            },
            rs = new S.Gallery.RandomRegion(rrCfg).getRegions(children.length),
            fixW = children[0].offsetWidth - children[0].clientWidth
                + parseInt(D.css(children[0],'padding-left'))
                + parseInt(D.css(children[0],'padding-right')),
            fixH =  children[0].offsetHeight - children[0].clientHeight
                + parseInt(D.css(children[0],'padding-top'))
                + parseInt(D.css(children[0],'padding-bottom')),
            self = this;


        self._anims = [];

        // set style and anims

        S.each(children, function(c, i) {
            var r = rs[i],
                w = r.right - r.left,
                h = r.bottom - r.top;

            D.css(c, {
                width: (w * RATIO_SHOW-fixW) + 'px',
                height: (h * RATIO_SHOW-fixH) + 'px',
                left: (r.left + rrCfg.width/2) * RATIO_SHOW + 'px',
                top: (r.top + rrCfg.height/2) * RATIO_SHOW + 'px'
            });

            self._anims.push(S.Anim(c,{
                width: (w-fixW) + 'px',
                height: (h-fixH) + 'px',
                left: r.left + 'px',
                top: r.top + 'px'
            }));
        });

        container.style.visibility = 'visible';
    }

    S.augment(RandomShow,{
        run:function(){
           var i = this._anims.length;
           while(i--){
               this._anims[i].run();
           }
        },
        stop:function(){
           var i = this._anims.length;
           while(i--){
               this._anims[i].stop();
           }
        }
    });

	//兼容 1.1.6
    S.namespace('Gallery');
    S.Gallery.RandomShow = RandomShow;
    return RandomShow;

}, {
    requires:['core','./random-region']
});