/**
 * @fileoverview ajax方案上传
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.0/uploader/type/ajax',function(S, Node, UploadType) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-AjaxType]:';

    /**
     * @name AjaxType
     * @class ajax方案上传
     * @constructor
     * @extends UploadType
     * @requires Node
     */
    function AjaxType(config) {
        var self = this;
        //调用父类构造函数
        AjaxType.superclass.constructor.call(self, config);
        try{
            self.set('formData', new FormData());
        }catch(e){}
        //处理传递给服务器端的参数
        self._processData();
    }

    S.mix(AjaxType, /** @lends AjaxType.prototype*/{
        /**
         * 事件列表
         */
        event : S.merge(UploadType.event,{
            PROGRESS : 'progress'
        })
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(AjaxType, UploadType, /** @lends AjaxType.prototype*/{
        /**
         * 上传文件
         * @param {HTMLElement} fileInput 文件input
         * @return {AjaxType}
         */
        upload : function(fileInput) {
            //不存在文件信息集合直接退出
            if (!fileInput) {
                S.log(LOG_PREFIX + 'upload()，fileInput参数有误！');
                return false;
            }
            var self = this, files = fileInput.files, file;
            //不存在文件信息集合直接退出
            if (!files.length) {
                S.log(LOG_PREFIX + 'upload()，不存在要上传的文件！');
                return false;
            }
            file = files[0];
            self._addFileData(fileInput, file);
            self.send();
            return self;
        },
        /**
         * 停止上传
         * @return {AjaxType}
         */
        stop : function() {
            var self = this,xhr = self.get('xhr');
            if (!S.isObject(xhr)) {
                S.log(LOG_PREFIX + 'stop()，io值错误！');
                return false;
            }
            //中止ajax请求，会触发error事件
            xhr.abort();
            self.fire(AjaxType.event.STOP);
            return self;
        },
        /**
         * 发送ajax请求
         * @return {AjaxType}
         */
        send : function() {
            var self = this,
                //服务器端处理文件上传的路径
                action = self.get('action'),
                data = self.get('formData');
            var xhr = new XMLHttpRequest();
            //TODO:如果使用onProgress存在第二次上传不触发progress事件的问题
            xhr.upload.addEventListener('progress',function(ev){
                self.fire(AjaxType.event.PROGRESS, { 'loaded': ev.loaded, 'total': ev.total });
            });
            xhr.onload = function(ev){
                var result = {};
                try{
                    result = S.JSON.parse(xhr.responseText);
                }catch(e){
                    S.log(LOG_PREFIX + 'ajax返回结果集responseText格式不合法！');
                }
                self.fire(AjaxType.event.SUCCESS, {result : result});
            };
            xhr.open("POST", action, true);
            xhr.send(data);
            // send之后清空FormData
            try{
            	self.set('formData', new FormData());
            }catch(e){
            	S.log(LOG_PREFIX + 'something error when reset FormData.');
            	S.log(e, 'dir');
            }
            self.set('xhr',xhr);
            return self;
        },
        /**
         * 处理传递给服务器端的参数
         */
        _processData : function() {
            var self = this,data = self.get('data'),
                formData = self.get('formData');
            //将参数添加到FormData的实例内
            S.each(data, function(val, key) {
                formData.append(key, val);
            });
            self.set('formData', formData);
        },
        /**
         * 将文件信息添加到FormData内
         * @param {HTMLElement} fileInput 文件上传域
         * @param {Object} file 文件信息
         */
        _addFileData : function(fileInput, file) {
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_addFileData()，file参数有误！');
                return false;
            }
            var self = this,
                formData = self.get('formData'),
                fileDataName = self.get('fileDataName');
            if (fileDataName == EMPTY) {
                fileDataName = $(fileInput).attr('name');
                self.set('fileDataName', fileDataName);
            }
            formData.append(fileDataName, file);
            self.set('formData', formData);
        }
    }, {ATTRS : /** @lends AjaxType*/{
        /**
         * 表单数据对象
         */
        formData : {value : EMPTY},
        /**
         * ajax配置
         */
        ajaxConfig : {value : {
            type : 'post',
            processData : false,
            cache : false,
            dataType : 'json',
            contentType: false
        }
        },
        xhr : {value : EMPTY},
        fileDataName : {value : EMPTY},
        form : {value : {}},
        fileInput : {value : EMPTY}
    }
    });
    return AjaxType;
}, {requires:['node','./base']});