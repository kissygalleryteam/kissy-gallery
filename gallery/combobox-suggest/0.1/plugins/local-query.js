/**
 *  用于提供本地存储某些数据并且根据key值查询
 */
KISSY.add('gallery/combobox-suggest/0.1/plugins/local-query', function (S,Event,FlashStorage, undefined) {
    var EventTarget = Event.Target;
    function LocalQuery(config) {
        LocalQuery.superclass.constructor.call(this, config || {});
        this.initialize();
    }
    S.extend(LocalQuery, S.Base);
    //私有变量
    /*
     index 用来做删除
     datalist的数据格式为：
     [
     {key:"女装",value:"",time:122123214},
     {key:"女装",value:"",time:122123214},
     {key:"女装",value:"",time:122123214}
     ]

     */
    var datalist=null;
    var prefix='localQuery';
    /*
     组件在存储datalist数据的名字，由name和prefix组成
     */
    var storageKey;

    //属性
    LocalQuery.ATTRS = {
        name:{
            value:'default',
            setter:function (v) {
                return v;
            }
        },
        user:{
            value:null,
            setter:function (v){
                return S.fromUnicode(v);
            }
        },
        maxLength:{
            value:500
        },
        storageType:{
            value:"flashStorage",
            setter:function (v) {
                return v;
            },
            getter:function (v) {
                return v;
            }
        }
    };
    //公用方法
    LocalQuery.METHOD = {



    }


    //业务逻辑，私有方法
    S.augment(LocalQuery, EventTarget, {
        initialize:function () {
            var self = this,
                name=self.get('name'),
                tab = self.get('tab'),
                user=self.get('user');
            storageKey=prefix+name+tab+user;
            self._getStorage();
        },
        checkFlash: function(callback){
            this.storage.read(callback);
        },
        _setKey: function(config){
            var self = this,
                name = config.name||self.get("name"),
                tab = config.tab||self.get("tab"),
                user = config.user||self.get("user");
            storageKey = prefix + name + tab + user;
            datalist = null;
        },
        _save:function(key, value){
            var list=this._getDatalist(),
                encodeKey = encodeURI(key),
                newItem={
                    key:encodeKey,
                    value:encodeURI(value),
                    time:S.now()
                };
            this._deleteItemByValue(list,encodeKey);//有重复的key便去重
            list.unshift(newItem);

        },
        _deleteItemByValue:function(list,value){
            var targetItem=null,
                oldKey;

            for(var i= 0;i<list.length;i++){
                oldKey=list[i]['key'];

                if(oldKey==value){
                    targetItem=list.splice(i,1);
                    i--;
                }
            }
        },
        /**
         * 根据查询字符串匹配出相应的记录,如果不传则放回所有
         * @param {String} q 查询字符串
         * @return {Array} 排序方式是，越新的记录越搞前
         * @private
         */
        _query:function(q){
            var list=this._getDatalist(),
                resultList=[],
                key,val;

            if(!q){
                return this._distinctByValue(list);
            }
            q=encodeURI(q);
            S.each(list,function(dataItem,index){
                key=dataItem['key'],
                    val = dataItem['value'];
                if(key.indexOf(q)===0||val.indexOf(q)===0){
                    resultList.push(dataItem);
                }
            });
            return this._distinctByValue(resultList);
        },
        /**
         * 根据value做去重
         * @param list
         * @private
         */
        _distinctByValue:function(list){
            var resultList=[],item;
            for(var i= 0,listLength=list.length;i<listLength;i++){
                item=list[i];
                !this._hasItemOfValue(resultList,item['value'])&&resultList.push(item);
            }
            return resultList;
        },
        _hasItemOfValue:function(list,value){
            var result=false;
            for(var i=list.length-1;i>=0;i--){
                if(list[i]['value']===value){
                    result=true;
                }
            }
            return result;
        },

        /**
         * 清理某个时间点之前的数据,由于业务特性，需要删除的往往应该比不需要删除的少，这里从尾部开始比较
         * @param {Number} time 基于毫秒速的字符串 例子：1362034594259
         *
         */
        _cleanBefore:function(time){
            var list=this._getDatalist(),
                item,delFlag=0;

            for(var i=list.length- 1;i>=0;i--){
                item=list[i];
                if(item["time"]>time){
                    delFlag=i+1;
                    break;
                }
            }

            list.length=delFlag;
        },
        _getDatalist:function(){
            //if(!datalist){
            datalist=this.storage.read()||[];
            //}

            return datalist;
        },

        _getStorage:function(){
            var storageType=this.get('storageType');
            switch (storageType){
                case 'flashStorage' : this.storage=this._initFlashStorage();break;
                default : this.storage=false;
            }
        },
        _initFlashStorage:function(){
            if (!S.Storage) S.Storage = new FlashStorage();
            return {
                save:function(value){
                    return S.Storage.save(storageKey, S.JSON.stringify(datalist));
                },
                read:function(callback){
                    var data=S.Storage.read(storageKey,callback);
                    if(data){
                        return S.JSON.parse(data);
                    }else{
                        return undefined;
                    }

                }
            }
        },
        /**
         * 析构函数
         */
        destructor:function(){
            datalist=null;
            prefix=null;
            storageKey=null;
        },
        /**
         * 保存某关键字key的一条结果value
         * @param key
         * @param value
         * @return {*}
         */
        save:function (key, value) {
            if(value==""){
                return;
            }

            var result=this._save(key, value);
            this.storage.save();
            /*hasHistory=true;*/
            return result;
        },
        /**
         * 根据查询字符串查找对应的条目
         * @param q
         * @return {*}
         */
        query:function (q) {
            return this._query(q);
        },
        /**
         * 删除条目
         * @param value
         *
         */
        deleteItem:function (value) {
            var list=this._getDatalist();
            this._deleteItemByValue(list,encodeURI(value));
            this.storage.save();
            /*
             if(list.length===0){
             hasHistory=false;
             }*/
        },
        /**
         * 清理几天前的数据
         * @param {Number} day
         */
        clearByDay:function(day){
            var time=S.now()-day*24*3600*1000;
            this._cleanBefore(time);
            this.storage.save();
        },

        /**
         * 是否还有历史记录
         */
        hasHistory:function(){
            if(this._getDatalist().length>0){
                return true;
            }else{
                return false;
            }
        }
    });
    return LocalQuery;
}, {
    requires:["event","gallery/combobox-suggest/0.1/plugins/storage"]
});
