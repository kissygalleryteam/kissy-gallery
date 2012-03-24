/**
 * @fileoverview 文件上传队列列表显示和处理
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.1/uploader/queue/base', function (S, Node, Base) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploader-queue]:';

    /**
     * @name Queue
     * @class 文件上传队列基类，不同主题拥有不同的队列类
     * @constructor
     * @extends Base
     * @param {String} target *，目标元素
     * @param {Object} config Queue没有必写的配置
     * @param {Uploader} config.uploader Uploader的实例
     * @param {Number} config.duration 添加/删除文件时的动画速度
     * @example
     * <ul id="J_Queue"> </ul>
     * @example
     * S.use('gallery/form/1.1/uploader/queue/base,gallery/form/1.1/uploader/themes/default/style.css', function (S, Queue) {
     *    var queue = new Queue('#J_Queue');
     *    queue.render();
     * })
     */
    function Queue(target, config) {
        var self = this;
        //调用父类构造函数
        Queue.superclass.constructor.call(self, config);
        //队列目标
        self.set('target', $(target));
    }

    S.mix(Queue, /**@lends Queue*/ {
        /**
         * 模板
         */
        tpl:{
            DEFAULT:'<li id="queue-file-{id}" class="clearfix" data-name="{name}">' +
                '<div class="f-l sprite file-icon"></div>' +
                '<div class="f-l">{name}</div>' +
                '<div class="f-l file-status J_FileStatus"></div>' +
                '</li>'
        },
        /**
         * 支持的事件
         */
        event:{
            //成功运行后触发
            RENDER : 'render',
            //添加完file数据后触发（在add向页面插入dom之前）
            ADD_DATA : 'addData',
            //添加完文件后触发
            ADD:'add',
            //批量添加文件后触发
            ADD_FILES:'addFiles',
            //删除文件后触发
            REMOVE:'remove',
            //清理队列所有的文件后触发
            CLEAR:'clear',
            //当改变文件状态后触发
            FILE_STATUS : 'statusChange',
            //更新文件数据后触发
            UPDATE_FILE : 'updateFile',
            // 恢复文件后触发
            RESTORE: 'restore'
        },
        /**
         * 文件的状态
         */
        status:{
            WAITING : 'waiting',
            START : 'start',
            PROGRESS : 'progress',
            SUCCESS : 'success',
            CANCEL : 'cancel',
            ERROR : 'error',
            RESTORE: 'restore'
        },
        //样式
        cls:{
            QUEUE:'ks-uploader-queue'
        },
        hook:{
            //状态
            STATUS:'.J_FileStatus'
        },
        FILE_ID_PREFIX:'file-'
    });
    /**
     * @name Queue#addData
     * @desc  添加完file数据后触发（在add向页面插入dom之前）
     * @event
     * @param {Object} ev.file 文件数据
     */
    /**
     * @name Queue#add
     * @desc  添加完文件后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     * @param {KISSY.Node} ev.target 对应的li元素
     */
    /**
     * @name Queue#addFiles
     * @desc  批量添加文件后触发
     * @event
     * @param {Array} ev.files 添加后的文件数据集合
     */
    /**
     * @name Queue#remove
     * @desc  删除文件后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */
    /**
     * @name Queue#clear
     * @desc  清理队列所有的文件后触发
     * @event
     */
    /**
     * @name Queue#statusChange
     * @desc  当改变文件状态后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {String} ev.status 文件状态
     */
    /**
     * @name Queue#updateFile
     * @desc  更新文件数据后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */
    /**
     * @name Queue#restore
     * @desc  恢复文件后触发
     * @event
     * @param {Array} ev.files 文件数据集合
     */
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Queue, Base, /** @lends Queue.prototype*/{
        /**
         * 运行组件
         * @return {Queue}
         */
        render:function () {
            var self = this, $target = self.get('target');
            $target.addClass(Queue.cls.QUEUE);
            self.fire(Queue.event.RENDER);
            return self;
        },
        /**
         * 向上传队列添加文件
         * @param {Object | Array} files 文件数据，传递数组时为批量添加
         * @example
         * //测试文件数据
 var testFile = {'name':'test.jpg',
     'size':2000,
     'input':{},
     'file':{'name':'test.jpg', 'type':'image/jpeg', 'size':2000}
 };
 //向队列添加文件
 queue.add(testFile);
         */
        add:function (files, callback) {
            var self = this, event = Queue.event;
            //如果存在多个文件，需要批量添加文件
            if (files.length > 0) {
                self._addFiles(files,function(){
                    callback && callback.call(self);
                    self.fire(event.ADD_FILES,{files : files});
                });
                return false;
            } else {
                return self._addFile(files, function (index, fileData) {
                    callback && callback.call(self, index, fileData);
                });
            }
        },
        /**
         * 向队列添加单个文件
         * @param {Object} file 文件数据
         * @param {Function} callback 添加完成后执行的回调函数
         * @return {Object} 文件数据对象
         */
        _addFile:function (file,callback) {
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_addFile()参数file不合法！');
                return false;
            }
            var self = this,
                duration = self.get('duration'),
                //设置文件对象
                fileData = self._setAddFileData(file),
                index = self.getFileIndex(fileData.id);
            //更换文件状态为等待
            self.fileStatus(index, Queue.status.WAITING);
            //显示文件信息li元素
            fileData.target.fadeIn(duration, function () {
                self.fire(Queue.event.ADD, {index:index, file:fileData, target:fileData.target,uploader:self.get('uploader')});
                callback && callback.call(self, index, fileData);
            });
            return fileData;
        },
        /**
         * 向队列批量添加文件
         * @param {Array} files 文件数据数组
         * @param {Function} callback 全部添加完毕后执行的回调函数
         */
        _addFiles : function(files,callback){
            if (!files.length) {
                S.log(LOG_PREFIX + '_addFiles()参数files不合法！');
                return false;
            }
            var self = this;
            _run(0);
            function _run(index){
                if(index === files.length){
                    callback && callback.call(this);
                    return false;
                }
                self._addFile(files[index],function(){
                    index ++;
                    _run(index);
                });
            }
        },
        /**
         * 删除队列中指定id的文件
         * @param {Number} indexOrFileId 文件数组索引或文件id
         * @param {Function} callback 删除元素后执行的回调函数
         * @example
         * queue.remove(0,function(){
         *     alert(2);
         * });
         */
        remove:function (indexOrFileId, callback) {
            var self = this, files = self.get('files'), file, $file,
                duration = self.get('duration');
            //参数是字符串，说明是文件id，先获取对应文件数组的索引
            if (S.isString(indexOrFileId)) {
                indexOrFileId = self.getFileIndex(indexOrFileId);
            }
            //文件数据对象
            file = files[indexOrFileId];
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + 'remove()不存在index为' + indexOrFileId + '的文件数据');
                return false;
            }
            $file = file.target;
            $file.fadeOut(duration, function () {
                $file.remove();
                self.fire(Queue.event.REMOVE, {index:indexOrFileId, file:file});
                callback && callback.call(self,indexOrFileId, file);
            });
            //将该id的文件过滤掉
            files = S.filter(files, function (file, i) {
                return i !== indexOrFileId;
            });
            self.set('files', files);
            return file;
        },
        /**
         * 清理队列
         */
        clear:function () {
            var self = this, files;
            _remove();
            //移除元素
            function _remove() {
                files = self.get('files');
                if (!files.length) {
                    self.fire(Queue.event.CLEAR);
                    return false;
                }
                self.remove(0, function () {
                    _remove();
                });
            }
        },
        /**
         * 将数据恢复到队列中
         * @param {Array} 需要恢复的数据
         */
        restore: function(files){
        	var self = this,
        		filesData = [];
        	if(files && files.length > 0){
        		S.each(files, function(url, index){
                    var s = url.split('|'),name = EMPTY;
                    if(s.length > 1){
                        url = s[1];
                        name = s[0];
                    }
	        		if(url){
	        			var file = {
	        				input: null,
	        				name: name,
	        				sUrl: url,
	        				size: '',
	        				type: ''
	        			};
	        			var fileData = self._setAddFileData(file),
			                index = self.getFileIndex(fileData.id);
			            //更换文件状态为等待
			            self.fileStatus(index, Queue.status.RESTORE);
			            //显示文件信息li元素
			            $(fileData.target).show();
			            //fileData.status.set('curType', Queue.status.SUCCESS);
			            filesData[index] = fileData;
	        		}
	        	});
        	}
        	self.fire(Queue.event.RESTORE, {
            	'files': filesData
            });
        },
        /**
         * 获取或设置文件状态，默认的主题共有以下文件状态：'waiting'、'start'、'progress'、'success'、'cancel'、'error' ,每种状态的dom情况都不同，刷新文件状态时候同时刷新状态容器类下的DOM节点内容。
         * @param {Number} index 文件数组的索引值
         * @param {String} status 文件状态
         * @return {Object}
         * @example
         * queue.fileStatus(0, 'success');
         */
        fileStatus:function (index, status, args) {
            if (!S.isNumber(index) || !S.isString(status)) return false;
            var self = this, file = self.getFile(index),
                theme = self.get('theme'),
                curStatus,statusMethod;
            if (!file || !theme) return false;
            //状态
            curStatus = file['status'];
            //状态一直直接返回
            if(curStatus == status) return self;
            statusMethod = '_'+status+'Handler';
            //如果主题存在对应的状态变更监听器，予以执行
            if(S.isFunction(theme[statusMethod])){
                args = S.merge({uploader:self.get('uploader'),index:index,file:file,id:file.id},args);
                theme[statusMethod].call(theme,args);
            }
            //更新状态
            self.updateFile(index,{status:status});
            self.fire(Queue.event.FILE_STATUS,{index : index,status : status,args:args,file:file});
            return  self;
        },
        /**
         * 获取指定索引值的队列中的文件
         * @param  {Number} index 文件在队列中的索引
         * @return {Object}
         */
        getFile:function (index) {
            if (!S.isNumber(index)) return false;
            var self = this, files = self.get('files'),
                file = files[index];
            if (!S.isPlainObject(file)) file = false;
            return file;
        },
        /**
         * 根据文件id来查找文件在队列中的索引
         * @param {String} fileId 文件id
         * @return {Number} index
         */
        getFileIndex:function (fileId) {
            var self = this, files = self.get('files'), index = -1;
            S.each(files, function (file, i) {
                if (file.id == fileId) {
                    index = i;
                    return true;
                }
            });
            return index;
        },
        /**
         * 更新文件数据对象，你可以追加数据
         * @param {Number} index 文件数组内的索引值
         * @param {Object} data 数据
         * @return {Object}
         */
        updateFile:function (index, data) {
            if (!S.isNumber(index)) return false;
            if (!S.isObject(data)) {
                S.log(LOG_PREFIX + 'updateFile()的data参数有误！');
                return false;
            }
            var self = this, files = self.get('files'),
                file = self.getFile(index);
            if (!file) return false;
            S.mix(file, data);
            files[index] = file;
            self.set('files', files);
            self.fire(Queue.event.UPDATE_FILE,{index : index, file : file});
            return file;
        },
        /**
         * 获取等指定状态的文件对应的文件数组index的数组
         * @param {String} type 状态类型
         * @return {Array}
         * @example
         * //getFiles()和getFileIds()的作用是不同的，getFiles()类似过滤数组，获取的是指定状态的文件数据，而getFileIds()只是获取指定状态下的文件对应的在文件数组内的索引值。
         * var indexs = queue.getFileIds('waiting');
         */
        getIndexs:function (type) {
            var self = this, files = self.get('files'),
                status, indexs = [];
            if (!files.length) return indexs;
            S.each(files, function (file, index) {
                if (S.isObject(file)) {
                    status = file.status;
                    //文件状态
                    if (status == type) {
                        indexs.push(index);
                    }
                }
            });
            return indexs;
        },
        /**
         * 获取指定状态下的文件
         * @param {String} status 状态类型
         * @return {Array}
         * @example
         * //获取等待中的所有文件
         * var files = queue.getFiles('waiting');
         */
        getFiles:function (status) {
            var self = this, files = self.get('files'), oStatus, statusFiles = [];
            if (!files.length) return [];
            S.each(files, function (file) {
                if (file && file.status == status) statusFiles.push(file);
            });
            return statusFiles;
        },
        /**
         * 添加文件时先向文件数据对象追加id、target、size等数据
         * @param {Object} file 文件数据对象
         * @return {Object} 新的文件数据对象
         */
        _setAddFileData:function (file) {
            var self = this,
                files = self.get('files');
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_updateFileData()参数file不合法！');
                return false;
            }
            //设置文件唯一id
            if (!file.id) file.id = S.guid(Queue.FILE_ID_PREFIX);
            //转换文件大小单位为（kb和mb）
            if (file.size) file.textSize = S.convertByteSize(file.size);
            //文件信息元素
            file.target = self._appendFileHtml(file);
            //状态
            file.status = EMPTY;
            files.push(file);
            self.fire(Queue.event.ADD_DATA,{file:file,index:files.length-1});
            return file;
        },
        /**
         * 向列表添加li元素（文件信息）
         * @param {Object} data 文件对象数据
         * @return {NodeList}
         */
        _appendFileHtml:function (data) {
            var self = this, $target = self.get('target'),
                //文件信息显示模板
                tpl = self.get('tpl'),
                hFile = S.substitute(tpl, data);
            return $(hFile).hide().appendTo($target).data('data-file', data);

        }
    }, {ATTRS:/** @lends Queue.prototype*/{
        /**
         * 模板
         * @type String
         * @default  Queue.tpl.DEFAULT
         */
        tpl:{ value:Queue.tpl.DEFAULT },
        /**
         * 添加/删除文件时的动画速度
         * @type Number
         * @default 0.3
         */
        duration:{value:0.3},
        /**
         * 队列目标元素
         * @type KISSY.Node
         * @default ""
         */
        target:{value:EMPTY},
        /**
         * 队列内所有文件数据集合
         * @type Array
         * @default []
         * @example
         * var ids = [],
         files = queue.get('files');
         S.each(files, function (file) {
         ids.push(file.id);
         });
         alert('所有文件id：' + ids);
         */
        files:{value:[]},
        /**
         * 状态类配置，queue和file参数会被组件内部覆盖，传递无效
         * @type Object
         * @default {}
         */
        statusConfig : {
            value : {}
        },
        /**
         * 该队列对应的Uploader实例
         * @type Uploader
         * @default ""
         */
        uploader:{value:EMPTY},
        /**
         * 主题实例
         * @type Theme
         * @default ""
         */
        theme:{value:EMPTY}
    }});

    return Queue;
}, {requires:['node', 'base']});
