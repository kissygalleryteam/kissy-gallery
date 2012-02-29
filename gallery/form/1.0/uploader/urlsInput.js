/**
 * @fileoverview 存储文件路径信息的隐藏域
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.0/uploader/urlsInput',function(S, Node, Base) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-urlsInput]:';
    /**
     * @name UrlsInput
     * @class 存储文件路径信息的隐藏域
     * @constructor
     * @extends Base
     * @requires Node
     * @param {String} wrapper 容器
     */
    function UrlsInput(wrapper, config) {
        var self = this;
        //调用父类构造函数
        UrlsInput.superclass.constructor.call(self, config);
        self.set('wrapper', $(wrapper));
    }

    S.mix(UrlsInput, /**@lends UrlsInput*/ {
        TPL : '<input type="hidden" id="{name}" name="{name}" value="{value}" />'
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(UrlsInput, Base, /** @lends UrlsInput.prototype*/{
        /**
         * 运行
         */
        render : function() {
            var self = this,$wrapper = self.get('wrapper'),
                name = self.get('name'),
                elInput = document.getElementsByName(name)[0];
            if (!S.isObject($wrapper)) {
                S.log(LOG_PREFIX + 'container参数不合法！');
                return false;
            }
            //如果已经存在隐藏域，那么不自动创建
            if(elInput){
                self.set('input',$(elInput));
            }else{
                self._create();
            }
        },
        /**
         * 向路径隐藏域添加路径
         * @param {String} url 路径
         */
        add : function(url){
            if(!S.isString(url)){
                S.log(LOG_PREFIX + 'add()的url参数不合法！');
                return false;
            }
            var self = this,urls = self.get('urls'),
                //判断路径是否已经存在
                isExist = self.isExist(url);
            if(isExist){
                S.log(LOG_PREFIX + 'add()，文件路径已经存在！');
                return self;
            }
            urls.push(url);
            self.set('urls',urls);
            self._val();
            return self;
        },
        /**
         * 删除隐藏域内的指定路径
         * @param {String} url 路径
         */
        remove : function(url){
            var self = this,urls = self.get('urls'),
                isExist = self.isExist(url) ;
            if(!isExist){
                S.log(LOG_PREFIX + 'remove()，不存在该文件路径！');
                return false;
            }
            urls = S.filter(urls,function(sUrl){
                return sUrl != url;
            });
            self.set('urls',urls);
            self._val();
            return urls;
        },
        /**
         * 设置隐藏域的值
         * @return {String} 
         */
        _val : function(){
            var self = this,urls = self.get('urls'),
                $input = self.get('input'),
                //多个路径间的分隔符
                split = self.get('split'),
                sUrl = urls.join(split);
            $input.val(sUrl);
            return sUrl;
        },
        /**
         * 是否已经存在指定路径
         * @param {String} url 路径
         * @return {Boolean}
         */
        isExist : function(url){
            var self = this,b = false,urls = self.get('urls');
            if(!urls.length) return false;
            S.each(urls,function(val){
                if(val == url){
                    return b = true;
                }
            });
            return b;
        },
        /**
         * 创建隐藏域
         */
        _create : function() {
            var self = this,container = self.get('wrapper'),
                tpl = self.get('tpl'),
                name = self.get('name'), urls = self.get('urls'),
                input;
            if (!S.isString(tpl) || !S.isString('name')){
                S.log(LOG_PREFIX + '_create()，tpl和name属性不合法！');
                return false;
            }
            input = $(S.substitute(tpl, {name : name,value : urls}));
            container.append(input);
            self.set('input', input);
            return input;
        }

    }, {ATTRS : /** @lends UrlsInput*/{
        name : {value : EMPTY},
        /**
         * 文件路径
         */
        urls : { value : [] },
        /**
         * input模板
         */
        tpl : {value : UrlsInput.TPL},
        /**
         * 多个路径间的分隔符
         */
        split : {value : ',',
            setter : function(v){
                var self = this;
                self._val();
                return v;
            }
        },
        /**
         * 文件路径隐藏input
         */
        input : {value : EMPTY},
        /**
         * 隐藏域容器
         */
        wrapper : {value : EMPTY}
    }});

    return UrlsInput;
}, {requires:['node','base']});