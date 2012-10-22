/**
 * @fileoverview  解决IE6下模拟绝对定位层无法遮盖input的bug
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.3/select/iframeShade',function(S,Node,Base){
        var EMPTY = '',$ = Node.all;
        /**
         * @name IframeShade
         * @class 解决IE6下模拟绝对定位层无法遮盖input的bug
         * @constructor
         * @extends Base
         * @requires Node
         */
        function IframeShade(target,config){
            var self = this,
                cfg = S.merge({target : $(target)},config);
            //调用父类构造函数
            IframeShade.superclass.constructor.call(self, cfg);
            self._init();
        }
        S.extend(IframeShade,Base,/** @lends IframeShade.prototype*/{
                /**
                 * 运行
                 */
                _init : function(){
                    var self = this,$target = self.get('target');
                }
        },{ATTRS : /** @lends IframeShade*/{
            target:{value:EMPTY},
            tpl:{value:'<iframe src="" width="{width}" height="{height}" class="ks-nice-select-iframe"></iframe>'}
        }});
        return IframeShade;
},{requires : ['node','base']});