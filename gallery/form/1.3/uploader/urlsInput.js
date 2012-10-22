/**
 * @fileoverview 存储文件路径信息的隐藏域
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.3/uploader/urlsInput',function(S, Node, Base) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-urlsInput]:';
    /**
     * @name UrlsInput
     * @class 存储文件路径信息的隐藏域
     * @constructor
     * @extends Base
     * @param {String} wrapper 容器钩子
     * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
     * @param {String} config.name *，隐藏域名称，当此name的隐藏域不存在时组件会创建一个
     * @param {String} config.split  多个路径间的分隔符
     * @param {String} config.tpl   隐藏域模板
     *
     */
    function UrlsInput(wrapper, config) {
        var self = this;
        //调用父类构造函数
        UrlsInput.superclass.constructor.call(self, config);
        self.set('wrapper', $(wrapper));
    }

    S.mix(UrlsInput, /**@lends UrlsInput*/ {
        /**
         * 隐藏域模板， '<input type="hidden" id="{name}" name="{name}" value="{value}" />'
         *
         */
        TPL : '<input type="hidden" id="{name}" name="{name}" value="{value}" />'
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(UrlsInput, Base, /** @lends UrlsInput.prototype*/{
        /**
         * 运行组件，实例化类后必须调用render()才真正运行组件逻辑
         * @return {UrlsInput}
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
            	S.log(LOG_PREFIX + 'urls input found');
                self.set('input',$(elInput));
            }else{
                self._create();
            }
            return self;
        },
        /**
         * 向路径隐藏域添加路径
         * @param {String} url 路径
         * @return {UrlsInput}
         */
        add : function(url){
            if(!S.isString(url)){
                S.log(LOG_PREFIX + 'add()的url参数不合法！');
                return false;
            }
            var self = this,urls = self.get('urls'),
                //判断路径是否已经存在
                isExist = self.isExist(url);
            //TODO:第一个路径会出现为空的情况，日后完善
            if(urls[0] == EMPTY) urls = [];
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
         * @return {Array} urls 删除后的路径
         */
        remove : function(url){
            if(!url) return false;
            var self = this,urls = self.get('urls'),
                isExist = self.isExist(url) ,
                reg = new RegExp(url);
            if(!isExist){
                S.log(LOG_PREFIX + 'remove()，不存在该文件路径！');
                return false;
            }
            urls = S.filter(urls,function(sUrl){
                return !reg.test(sUrl);
            });
            self.set('urls',urls);
            self._val();
            return urls;
        },
        /**
         * 解析当前input的值，取得文件路径
         * @return {Array}
         */
        parse: function(){
        	var self = this,
        		input = self.get('input');
    		if(input){
    			var urls = $(input).val(),
    				split = self.get('split'),
    				files;
    			files = urls.split(split);
                self.set('urls',files);
    			return files;
    		}else{
    			S.log(LOG_PREFIX + 'cannot find urls input.');
    			return [];
    		}
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
            var self = this,b = false,urls = self.get('urls'),
                reg = new RegExp(url);
            if(!urls.length) return false;
            S.each(urls,function(val){
                if(reg.test(val)){
                    return b = true;
                }
            });
            return b;
        },
        /**
         * 创建隐藏域
         */
        _create : function() {
            var self = this,
            	container = self.get('wrapper'),
                tpl = self.get('tpl'),
                name = self.get('name'), 
                urls = self.get('urls'),
                input;
            if(!container || container.length <= 0){
            	S.log(LOG_PREFIX + 'UrlsInput container not specified!', 'warn');
            	return false;
            }
            if (!S.isString(tpl) || !S.isString('name')){
                S.log(LOG_PREFIX + '_create()，tpl和name属性不合法！');
                return false;
            }
            input = $(S.substitute(tpl, {name : name,value : urls}));
            container.append(input);
            self.set('input', input);
            S.log(LOG_PREFIX + 'input created.');
            return input;
        }

    }, {ATTRS : /** @lends UrlsInput.prototype*/{
        /**
         * 隐藏域名称
         * @type String
         * @default ""
         */
        name : {value : EMPTY},
        /**
         * 文件路径
         * @type Array
         * @default []
         */
        urls : { value : [] },
        /**
         * input模板
         * @type String
         * @default  '<input type="hidden" id="{name}" name="{name}" value="{value}" />'
         */
        tpl : {value : UrlsInput.TPL},
        /**
         * 多个路径间的分隔符
         * @type String
         * @default ","
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
         * @type KISSY.Node
         * @default ""
         */
        input : {value : EMPTY},
        /**
         * 隐藏域容器
         *@type KISSY.Node
         * @default ""
         */
        wrapper : {value : EMPTY}
    }});

    return UrlsInput;
}, {requires:['node','base']});