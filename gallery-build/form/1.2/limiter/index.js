/**
 * @fileoverview  字数统计并限制
 * @author 剑平（明河）<minghe36@126.com>
 **/

KISSY.add('gallery/form/1.2/limiter/index', function (S, Node, Base) {
    var EMPTY = '',$ = Node.all;
    /**
     * @name Limiter
     * @class 字数统计并限制
     * @constructor
     * @extends Base
     * @param {String} target 目标元素
     * @param {Object} config 配置
     */
    function Limiter(target,config) {
        var self = this;
        config = S.merge({target : $(target)},config);
        //调用父类构造函数
        Limiter.superclass.constructor.call(self, config);
    }
    S.mix(Limiter, /** @lends Limiter*/{
        /**
         * 模板
         */
        tpl : {
            DEFAULT : '<span class="ks-letter-count">你还可以输入<em class="J_LetterRemain">{remain}</em>个汉字</span>'
        },
        /**
         * 事件
         */
        event : { RENDER : 'render', COUNT : 'count' }
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Limiter, Base, /** @lends Limiter.prototype*/{
        /**
         * 运行
         */
        render:function () {
            var self = this,$target = self.get('target');
            if(!$target.length) return false;
            self.set('tpl',self.get('defaultTpl'));
            self.count();
            $target.on('keyup blur',function(ev){
                self.count();
            });
            self.fire(Limiter.event.RENDER);
        },
        /**
         * 统计字数
         */
        count : function(){
            var self = this,len = self.get('len'),
                max = self.get('max'),
                defaultTpl = self.get('defaultTpl'),
                exceedTpl = self.get('exceedTpl'),
                tpl = len > max && exceedTpl || defaultTpl;
            //设置模板
            self.set('tpl',tpl);
            self._create();
            self.fire(Limiter.event.COUNT);
        },
        /**
         * 创建字数统计元素
         */
        _create : function(){
            var self = this,$wrapper = self.get('wrapper'),
                $target = self.get('target'),
                tpl = self.get('tpl'),
                max = self.get('max'),
                len = self.get('len'),
                html;
            if(!$target.length) return false;
            html = S.substitute(tpl, {len : len,max : max,remain : Math.abs(max - len)});
            $wrapper.html(html);
        }
    }, {ATTRS:/** @lends Limiter.prototype*/{
        /**
         * 字数统计的容器元素
         * @type NodeList
         * @default ""
         */
        wrapper : {
            value : EMPTY,
            getter : function(v){
                return $(v);
            }
        },
        /**
         * 目标元素，比如文本框
         * @type NodeList
         * @default ""
         */
        target : {
            value : EMPTY
        },
        /**
         * 元素
         * @type NodeList
         * @default ""
         */
        el : {
            value : EMPTY
        },
        /**
         * 字数统计使用的模板（未超出字数和超出字数的情况是不一样的）
         * @type String
         * @default ""
         */
        tpl : { value:EMPTY },
        /**
         * 字数统计默认模板
         * @type String
         * @default "<span class="ks-letter-count">你还可以输入<em class="J_LetterRemain">{remain}</em>个汉字</span>"
         */
        defaultTpl:{value : '<span class="ks-letter-count">你还可以输入<em class="J_LetterRemain">{remain}</em>个汉字</span>'},
        /**
         * 超出字数后的模板
         * @type String
         *  @default "<span class="ks-letter-count">已经超出<em class="J_LetterRemain exceed-letter">{remain}</em>个汉字</span>"
         */
        exceedTpl:{value:'<span class="ks-letter-count">已经超出<em class="J_LetterRemain exceed-letter">{remain}</em>个汉字</span>' },
        /**
         * 最大允许输入的字数，超出的临界点
         * @type Number
         * @default 50
         */
        max : { value:50 },
        /**
         * 字数，只读属性
         * @type Number
         * @default 0
         */
        len : {
            value : 0,
            getter : function(v){
                var self = this, $target = self.get('target'),
                    val = $target.val(),
                    isRejectTag = self.get('isRejectTag');
                //过滤html标签
                if(isRejectTag) val = val.replace(/<[^>]*>/g, "");
                return val.length;
            }
        },
        /**
         * 算字数时是否排除html标签（富编辑器一般需要把html标签所占的字数去掉）
         * @type Boolean
         * @default false
         */
        isRejectTag:{value:false}
    }});
    return Limiter;
},{requires:['node', 'base']});
