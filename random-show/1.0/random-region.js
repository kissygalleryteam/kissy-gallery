/**
 * @Description:  固定区域取若干随机位置大小区域
 * @Author:     tiejun[at]taobao.com
 * @Date:       11-10-18
 * @Log:
 */




KISSY.add('gallery/random-show/1.0/random-region', function(S) {


    function RandomRegion(cfg) {

        this.width = cfg.width;
        this.height = cfg.height;
        this.sizes = cfg.sizes;
        this.regions = [];

    }


    S.augment(RandomRegion, {
        _initSizes:function(count){
           var ret = [],i = count,minRatio,ratio;
           if(!S.isArray(this.sizes)){

               minRatio = this.sizes.minRatio;

               while(i--){
                   ratio =  minRatio + (1-minRatio)*i/(count-1);
                   ret.push({
                       width:this.sizes.baseWidth*ratio,
                       height:this.sizes.baseHeight*ratio
                   });
               }

               this.sizes = ret;
           }
        },
        isCross:function(r1) {
            var i = this.regions.length,
                r2,
                isCross = false;

            while (i--) {
                r2 = this.regions[i];
                // 两区域相交
                if (!(r1.left > r2.right + 2 || r1.right < r2.left - 2 ||
                    r1.bottom < r2.top - 2 || r1.top > r2.bottom + 2)) {
                    isCross = true;
                    break;
                }
            }
            return isCross;
        },
        randRegion:function(s) {


            var i = 1000, //超过1000次果断回头，10~20ms ，命中90%落在1000内,命中率70%
                wrapWidth = this.width - s.width - 1, // 优化随机区域计算
                wrapHeight = this.height - s.height - 1,
                x,y,r;

            while (i--) {

                x = Math.round(Math.random() * wrapWidth);
                y = Math.round(Math.random() * wrapHeight);

                r = {left: x,top:y,right:x + s.width,bottom:y + s.height};

                if (!this.isCross(r)) {
                    //console.log(time, 'try time:', 1000 - i);
                    return r;
                }
            }
        },
        getRegions:function(count) {

            var retry = 1,
                i,r;

            this._initSizes(count);

            //console.time('randRegion');
            for (i = 0; i < count; i++) {
                //console.log(i);
                //console.time('randRegion');
                if (r = this.randRegion(this.sizes[i], i + 1)) {
                    this.regions.push(r);
                } else {
                    //console.timeEnd('randRegion');
                    //console.time('randRegion');
                    //console.warn('not find');
                    if (retry < 6) {

                        S.log(['retry', retry]);
                        retry++;
                        this.regions = [];
                        i = -1;
                    } else {
                        S.log('hide','warn');
                        this.regions.push({left:-9999,top:-9999,right:-9999,bottom:-9999});
                    }
                }

            }
            //console.timeEnd('randRegion');
            return this.regions;
        }
    });

    return RandomRegion;
});