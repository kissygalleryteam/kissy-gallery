KISSY.add('gallery/combobox-suggest/0.1/plugins/telephone', function (S,Event,Storage,undefined) {
    var EventTarget = Event.Target;
    function Telephone(config) {
        Telephone.superclass.constructor.call(this, config || {});
        this.initialize();
    }
    S.extend(Telephone, S.Base);
    S.augment(Telephone, EventTarget, {
        /**
         * 读取电话号码的值
         * @private
         */
        initialize: function(){
            var self = this;
            if (!S.Storage && !S.Storage.hasInit) {
                S.Storage = new Storage();
            }
            self._telHistory = [];
            S.Storage.read('TBTelNumHistory', {
                onSuccess: function(val) {
                    S.log('loading TBTelNumHistory: ' + val);
                    // 最后的是最新的
                    if (val) self._telHistory = val.split(',');
                },
                onFailure: function() {
                    S.log('loading TBTelNumHistory failure');
                }
            });
        },
        /**
         * suggest调用的render事件
         */
        render: function(){
            var self = this,
                caller = self.get("caller"),
                ret = caller.resultArr||[];
            //如果用户没有登录,则不显示
            var nk = caller.getNick();
            if(!nk){
                return;
            }
            var query = caller.query;
            var tmpl = '<div data-key="{q=query}&nk={nk}&suggest=celnum_1&source=suggest" key="{allNum}" class="ks-menu-extras-cz">给<span class="ks-menu-key">{query}<b>{rest}</b></span>充值</div>';
            //todo
            var newVal = caller.query,idx = 0,arr = {};
            if (/^[0-9]{3,11}$/g.test(newVal)) {
                // 顺序以最近时间最前显示
                for (var i = self._telHistory.length - 1; i > -1; i -= 2) {
                    if (self._telHistory[i - 1].indexOf(newVal) === 0) {
                        arr.rest = self._telHistory[i - 1];
                        arr.nk = nk;
                        caller.addContent({
                            html:S.substitute(tmpl,arr)
                        });
                    }
                }
                caller.resultArr = ret;
            }
        }
    })
    return Telephone;
},{requires:['event','gallery/combobox-suggest/0.1/plugins/storage']})