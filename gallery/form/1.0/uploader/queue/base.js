/**
 * @fileoverview 文件上传队列列表显示和处理
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.0/uploader/queue/base', function (S, Node, Base, Status) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploader-queue]:';

    /**
     * @name Queue
     * @class 文件上传队列
     * @constructor
     * @extends Base
     * @requires Node,Status
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
            //添加完文件后触发
            ADD:'add',
            //批量添加文件后触发
            ADD_FILES:'addFiles',
            //删除文件后触发
            REMOVE:'remove',
            //清理队列所有的文件后触发
            CLEAR:'clear',
            //当改变文件状态后触发
            FILE_STATUS : 'fileStatus',
            //更新文件数据后触发
            UPDATE_FILE : 'updateFile',
            // 恢复文件后触发
            RESTORE: 'restore'
        },
        /**
         * 文件的状态
         */
        status:Status.type,
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
                self.fire(Queue.event.ADD, {index:index, file:fileData, target:fileData.target});
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
                    var s = url.split(':'),name = EMPTY;
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
			            fileData.status.set('curType', Queue.status.SUCCESS);
			            filesData[index] = fileData;
	        		}
	        	});
        	}
        	self.fire(Queue.event.RESTORE, {
            	'files': filesData
            });
        },
        /**
         * 获取或设置文件状态
         * @param {Number} index 文件数组的索引值
         * @param {String} status 文件状态
         * @return {Object}
         */
        fileStatus:function (index, status, args) {
            if (!S.isNumber(index)) return false;
            var self = this, file = self.getFile(index), oStatus;
            if (!S.isPlainObject(file)) return false;
            //状态实例
            oStatus = file['status'];
            if (status) oStatus.change(status, args);
            self.fire(Queue.event.FILE_STATUS,{index : index,status : status});
            return  oStatus;
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
         * param {String} type 状态类型
         * @return {Array}
         */
        getIndexs:function (type) {
            var self = this, files = self.get('files'),
                status, indexs = [];
            if (!files.length) return indexs;
            S.each(files, function (file, index) {
                if (S.isObject(file)) {
                    status = file.status;
                    //文件状态
                    if (status.get('curType') == type) {
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
         */
        getFiles:function (status) {
            var self = this, files = self.get('files'), oStatus, statusFiles = [];
            if (!files.length) return [];
            S.each(files, function (file) {
                if (file) {
                    oStatus = file.status;
                    oStatus.get('curType') == status && statusFiles.push(file);
                }
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
                files = self.get('files'),
                uploader = self.get('uploader');
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_updateFileData()参数file不合法！');
                return false;
            }
            //设置文件唯一id
            if (!file.id) file.id = S.guid(Queue.FILE_ID_PREFIX);
            //转换文件大小单位为（kb和mb）
            if (file.size) file.textSize = Status.convertByteSize(file.size);
            //文件信息元素
            file.target = self._appendFileHtml(file);
            //状态实例
            file.status = self._renderStatus(file);
            //传递Uploader实例给Status
            if (S.isObject(uploader)) file.status.set('uploader', uploader);
            files.push(file);
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

        },
        /**
         * 运行Status
         * @param {Object} file  文件数据
         * @return {Status} 状态实例
         */
        _renderStatus:function (file) {
            var self = this, $file = file.target,
                hook = Queue.hook.STATUS, elStatus,
                statusConfig = self.get('statusConfig');
            if (!$file.length) return false;
            //状态层
            elStatus = $file.children(hook);
            //合并参数
            S.mix(statusConfig,{queue:self, file:file});
            //实例化状态类
            return new Status(elStatus, statusConfig);
        }
    }, {ATTRS:/** @lends Queue*/{
        /**
         * 模板
         * @type String
         */
        tpl:{ value:Queue.tpl.DEFAULT },
        /**
         * 动画速度
         */
        duration:{value:0.3},
        /**
         * 队列元素
         */
        target:{value:EMPTY},
        /**
         * 文件信息数据
         */
        files:{value:[]},
        /**
         * 状态类配置，queue和file参数会被组件内部覆盖，传递无效
         */
        statusConfig : {
            value : {}
        },
        //上传组件实例
        uploader:{value:EMPTY}
    }});

    return Queue;
}, {requires:['node', 'base', './status']});
