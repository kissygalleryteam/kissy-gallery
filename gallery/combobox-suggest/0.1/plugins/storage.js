KISSY.add('gallery/combobox-suggest/0.1/plugins/storage', function (S,Event,undefined) {
    var EventTarget = Event.Target;
    function Storage(config) {
        Storage.superclass.constructor.call(this, config || {});
        this.initialize();
    }
    S.extend(Storage, S.Base);
    Storage.ATTRS = {
        "src":{
            value: "http://a.tbcdn.cn/apps/tbskip/public/flashStorage.swf?t=20110224"
        },
        bridge:{
            value:null
        },
        hasInit:{
            value:false
        }
    }
    S.augment(Storage, EventTarget, {
        initialize: function(config){
            config = config || {};
            var self = this;
            self._addFlash(config.appendTo);
            self.hasInit = true;
        },
        _addFlash : function(appendTo) {
            var self = this,
                doc = document,
                container = doc.createElement('div'),
                src = self.get('src'),
                htmlStr = '',
                bridgeVal;

            container.id = 'storagetool';
            container.style.height = 0;
            container.style.overflow = 'hidden';

            htmlStr += '<object id="J_StorageObj" name="J_StorageObj" ';
            htmlStr += 'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="1" height="1" ';
            htmlStr += 'codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab">';
            htmlStr += '<param name="movie" value="' + src + '" />';
            htmlStr += '<param name="allowScriptAccess" value="always" />';
            htmlStr += '<embed name="J_StorageEmbed" src="' + src + '" width="1" height="1" ';
            htmlStr += 'allowScriptAccess="always" type="application/x-shockwave-flash" ';
            htmlStr += 'pluginspage="http://www.adobe.com/go/getflashplayer">';
            htmlStr += '</embed></object>';

            appendTo = appendTo || doc.body;
            appendTo.appendChild(container);
            container.innerHTML = htmlStr;
            if (navigator.appVersion.indexOf('MSIE') !== -1) {
                //IE
                container.style.zoom = 1;
                container.style.filter = 'alpha(opacity=' + 10 + ')';
                bridgeVal = window['J_StorageObj'];
            } else {
                container.style.opacity = 0.1;
                bridgeVal = doc['J_StorageEmbed'];
            }
            //判断bridgeVal是否有read,如果没有,则表示flash被禁用,则调用localStorage
            self.set("bridge",bridgeVal);
        },
        save : function(key, value, tryCount) {
            var self = this,
                bridge = self.get("bridge");
            if (tryCount === undefined) {
                tryCount = 200;
            }
            if (tryCount === 0) {
                self.set("bridge",localStorage);
                localStorage.constructor.prototype.read = localStorage.getItem;
                localStorage.constructor.prototype.save = localStorage.setItem;
                bridge = localStorage;
            }
            try {
                bridge.save(key, value);
            } catch (e) {
                setTimeout(function() {
                    self.save(key, value, tryCount - 1);
                }, 0);
            }
        },
        read : function(key, callback,tryCount) {
            var self = this,
                bridge = self.get("bridge"),
                val;
            if (tryCount === undefined) {
                tryCount = 200;
            }
            if (tryCount === 0) {
                callback && callback.onFailure();
                self.set("bridge",localStorage);
                localStorage.constructor.prototype.read = localStorage.getItem;
                localStorage.constructor.prototype.save = localStorage.setItem;
                bridge = localStorage;
            }
            try {
                val =  bridge.read(key);
                callback&&callback.onSuccess(val);
                return val;
            } catch (e) {
                setTimeout(function() {
                    self.read(key,callback ,tryCount - 1);
                }, 0);
            }
        }
    });
    return Storage;
},{requires:['event']})