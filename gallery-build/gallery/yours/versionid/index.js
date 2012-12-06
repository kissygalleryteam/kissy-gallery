/**
 * @fileoverview function
 * @desc function description
 * @author your-name<your-email>
 */

// 模块名字
KISSY.add('gallery/yours/versionid/index', function(S, undefined) {

    var D = S.DOM, E = S.Event, doc = document;

    //定义变量和常量

    /**
     * 功能
     * @param {String} [triggerCls = 'S_ViewCode'] 触发元素的class。注释具体格式参见jsdoc规范。
     * @return
     */
    function Yours(param) {

        var self = this;

        //参数处理

        //对象属性赋值

        //初始化

    }

    //默认配置

    //类继承
    //S.extend(Yours, S.Base);

    //原型扩展
    S.augment(Yours, S.EventTarget, {
        /**
         * public function
         * @param xxx
         * @return
         */
        sayhi:function(xxx) {
            var self = this;
            alert('hi');
        },
        /**
         * private function
         * @param xxx
         * @return
         */
        _method:function(xxx) {
            var self = this;
        }
    });

    //私有方法
    return Yours;
}, {
    requires: []
});
