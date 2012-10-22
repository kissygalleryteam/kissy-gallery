/**
 * @fileoverview 从多张图片中选择一张作为封面图片或者主图。
 * @author 紫英（橘子）<daxingplay@gmail.com>，明河<jianping.xwh@taobao.com>

 */
KISSY.add('gallery/form/1.3/uploader/plugins/coverPic/coverPic', function(S, Node,Base){

    var $ = Node.all,
        LOG_PRE = '[LineQueue: setMainPic] ';

    /**
     * 从多张图片中选择一张作为封面图片或者主图
     * @param {NodeList | String} $input 目标元素
     * @param {Uploader} uploader uploader的实例
     * @constructor
     */
    function CoverPic($input,uploader){

    }
    S.extend(CoverPic, Base, /** @lends CoverPic.prototype*/{
        /**
         * 运行组件
         */
        render:function(){

        }
    },{
        ATTRS:/** @lends CoverPic.prototype*/{

        }
    });

    return CoverPic;

}, {
    requires: [ 'node','base' ]
});