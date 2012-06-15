/**
 * @fileoverview 表单美化组件
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.2/butterfly/index', function (S, Base, Node,Radio,Checkbox,Limiter,Uploader,spinbox) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[Butterfly]:';
    function Butterfly(target,config) {
        var self = this;
        config = S.mix({target:target},config);
        //超类初始化
        Butterfly.superclass.constructor.call(self, config);
    }
    S.extend(Butterfly, Base, /** @lends Butterfly.prototype*/{
        /**
         * 渲染组件
         */
        render : function(){
             var self = this,
                 $target = self.get('target'),
                 $inputs;
            if(!$target.length){
                S.log(LOG_PREFIX + '表单目标节点不存在！');
                return false;
            }
            $inputs = $target.all('input');
            self._LoaderCss();
            if(!$inputs.length){
                S.log(LOG_PREFIX + '不存在需要美化的表单元素！');
                return false;
            }
            $inputs.each(function($input){
                self._renderCom($input)
            })
        },
        /**
         * 根据表单元素的type实例化对应的表单组件
         * @param {NodeList} $input 表单元素
         */
        _renderCom:function($input){
            var self = this,type = $input.attr('type'),obj;
            switch (type){
                case 'radio':
                    obj = new Radio($input,{cssUrl:EMPTY});
                break;
                case 'checkbox':
                    obj = new Checkbox($input,{cssUrl:EMPTY});
                break;
                case 'file':

                break;
                case 'button':
                break;
            }
            obj && obj.render();
        },
        /**
         * 加载css文件
         */
        _LoaderCss:function (callback) {
            var self = this,
                cssUrl = self.get('cssUrl');
            //加载css文件
            if (cssUrl == EMPTY){
                callback.call(self);
                return false;
            }
            S.use(cssUrl, function () {
                callback.call(self);
            });
        }
    }, { ATTRS:/** @lends Butterfly.prototype*/{
        /**
         *  美化的目标表单
         * @type NodeList
         * @default  ""
         */
        target:{
            value:EMPTY,
            getter:function(v){
                return $(v);
            }
        },
        /**
         * css模块路径
         * @type String
         * @default ""
         */
        cssUrl:{value:'gallery/form/1.2/butterfly/themes/default/style.css'}
    }});
    return Butterfly;
}, {requires:['base', 'node','gallery/form/1.2/radio/index','gallery/form/1.2/checkbox/index','gallery/form/1.2/limiter/index','gallery/form/1.2/uploader/index','gallery/form/1.2/spinbox/index']});