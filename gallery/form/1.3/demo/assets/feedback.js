/**
 * @fileoverview 用户反馈入口
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/feedback',function(S, DOM,Event,Base) {
    var EMPTY = '';
    /**
     * @name Feedback
     * @class 用户反馈入口
     * @version 1.0
     * @constructor
     * @augments KISSY.Base
     * @param {String | HTMLElement} container 容器
     * @param {Object} config 配置对象
     * @property {HTMLElement} form 指向组件生成的表单元素
     * @description
     * 页面左侧的“我有问题要反馈”入口
     * @example
     */
    function Feedback(container,config){
        var self = this;
        self.container = S.get(container);
        self.elFeedback = EMPTY;
        //超类初始化
        Feedback.superclass.constructor.call(self, config);
    }
    //继承于KISSY.Base
    S.extend(Feedback, Base);
    S.mix(Feedback,/**@lends Feedback*/{
            /**
             * 支持的模板
             */
            tpl : {
                DEFAULT : '<div class="feedback J_Feedback">' +
                               '<span><a href="{url}" target="_blank">{title}</a><s></s></span>' +
                           '</div>'
            }
        });
    Feedback.ATTRS = {
        tpl : {
            value : Feedback.tpl.DEFAULT
        },
        url : {
            value : ''
        },
        title : {
            value : '我有问题要反馈'
        },
        scrollDelay : {
            value : '200'
        }
    };
    S.augment(Feedback,
        /**@lends Feedback.prototype */
        {
            /**
             * 运行
             */
            render : function(){
                var self = this,container = self.container;
                if(!container) return false;
                self.create();
            },
            /**
             * 创建反馈浮动层
             */
            create : function(){
                var self = this,container = self.container,tpl = self.get('tpl'),
                    url = self.get('url'),title = self.get('title'),
                    html,elFeedback;
                if(!S.isString(tpl) || !S.isString(url) || !S.isString(title)) return false;
                html = S.substitute(tpl,{url : url,title : title});
                elFeedback = DOM.create(html);
                DOM.append(elFeedback,container);
                self.elFeedback = elFeedback;
                self._setTopOffset();
                self._ie6Scroll();
                return elFeedback;
            },
            /**
             * 设置反馈浮出层的向上偏移
             */
            _setTopOffset : function(){
                var self = this,elFeedback = self.elFeedback,title = self.get('title'),
                    len = title.length, topOffset = len * 6;
                DOM.css(elFeedback,'marginTop','-'+topOffset+'px');
            },
            /**
             * IE6滚动修正，IE6不支持fix定位
             */
            _ie6Scroll : function(){
                if (S.UA.ie !== 6) return false;
                var self = this,elFeedback = self.elFeedback,curTop,top,height = DOM.height(elFeedback),
                    timer = S.later(function() {}, 0),delay = self.get('scrollDelay');
                Event.on(window, 'scroll resize', function(e) {
                    curTop = DOM.scrollTop();
                    top = (DOM.viewportHeight() - height) / 2;
                    timer.cancel();
                    timer = S.later(function() {
                        if (DOM.scrollTop() === curTop) {
                            DOM.css(elFeedback,'top', top + DOM.scrollTop());
                        }
                    }, delay);
                });
            }

        });
    return Feedback;
},{requires:['dom','event','base']});