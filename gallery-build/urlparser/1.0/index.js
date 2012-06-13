KISSY.add("gallery/urlparser/1.0/index",function(S, Reflection){
    return Reflection;
}, {
    requires:["./urlparser"]
});
/**
* KISSY.URLParser
* @author 元泉<yuanquan.wxr@taobao.com>
* @version:1-0-1
*/
KISSY.add('urlparser',function(S, URLParser){
    function URLParser(url) {
        if (!(this instanceof URLParser)) {
            return new URLParser(url);
        }
        URLParser.superclass.constructor.call(this, url);
        this.a = document.createElement('a');
        this.a.href = url;
        this.url = url;
    }
    S.extend(URLParser, S.Base);
    S.augment(URLParser, {
        reset: function () {
            this.a.href = this.url;
        },
		appendParams : function(v){
			if (typeof v == 'string'){
				this.set('params',S.mix(this.get('params'), S.unparam(v)),'&','=',false);
			}else if(typeof v == 'object'){
				this.set('params',S.mix(this.get('params'), v),'&','=',false);
			}
		}
    }).ATTRS = {
        href: {
            getter: function () {
                return this.a.href;
            },
            setter: function (v) {
                if (!v) return;
                this.a.href = v;
            }
        },
        protocol: {
            getter: function () {
                return this.a.protocol;
            },
            setter: function (v) {
                if (!v) return;
                this.a.protocol = v;
            }
        },
        host: {
            getter: function () {
                var port = this.get('port');
                return this.get('hostname') + (port === "" ? "" : (":" + port));
            },
            setter: function (v) {
                if (!v) return;
                this.a.host = v;
            }
        },
        hostname: {
            getter: function () {
                return this.a.hostname;
            },
            setter: function (v) {
                if (!v) return;
                this.a.hostname = v;
            }
        },
        port: {
            getter: function () {
                return (this.a.port == 80 || this.a.port === 0) ? "" : this.a.port;
            },
            setter: function (v) {
                if (!v) return;
                this.a.port = v;
            }
        },
        search: {
            getter: function () {
                return this.a.search;
            },
            setter: function (v) {
                if (!v) return;
                v = v.replace('?', '');
                this.a.href = this.get('protocol') + "//" + this.get('host') + this.get('pathname') + "?" + v + this.get('hash');
            }
        },
        hash: {
            getter: function () {
				var href = this.a.href;
				var index = href.indexOf('#');
				return index != -1 ? href.slice(index) : "";
            },
            setter: function (v) {
                if (!v) return;
                this.a.hash = v;
            }
        },
        pathname: {
            getter: function () {
                var path = this.a.pathname;
                return '/' + path.replace(/^\//, '');
            },
            setter: function (v) {
                if (!v) return;
                this.a.pathname = v;
            }
        },
        params: {
            getter: function () {
				return S.unparam(this.get('search').replace('?', ''));
            },
            setter: function (v) {
                if (!v) return;
                this.set('search', S.param(v,'&','=',false));
            }
        },
        segments: {
            getter: function () {
                return this.a.pathname.replace(/^\//, '').split('/');
            },
            setter: function (v) {
                if (!v) return;
                this.a.pathname = v instanceof Array ? v.join('/') : v;
            }
        },
        relative: {
            getter: function () {
                return this.a.href.split(this.get('host'))[1];
            },
            setter: function (v) {
                if (!v) return;
                this.a.href = this.get('protocol') + "//" + this.get('host') + '/' + v.replace(/^\//, '');
            }
        }
    };
    return URLParser;
});

/**
* note
* 2012-4-9 增加relative属性,修复浏览器兼容bug
* 2012-4-10 支持params属性数组 如：{a:[1,2],b:3} <=> ?a=1&a=2&b=3
* 2012-4-25 修复safari对a的端口解析问题
*/
