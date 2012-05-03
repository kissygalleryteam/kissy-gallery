/**
 * @fileoverview 二手市场图片上传主题
 * @author 紫英(橘子)<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.2/uploader/themes/ershouUploader/index', function (S, Node, Theme, Message, SetMainPic) {
    var EMPTY = '', 
    	$ = Node.all,
    	LOG_PRE = '[Theme-ershou] ';

    /**
     * @name ErshouUploader
     * @class 二手市场图片上传主题
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 紫英（橘子）<daxingplay@gmail.com>
     */
    function ErshouUploader(config) {
        var self = this;
        //调用父类构造函数
        ErshouUploader.superclass.constructor.call(self, config);
    }
    
    S.extend(ErshouUploader, Theme, /** @lends ErshouUploader.prototype*/ {
    	/**
         * 在上传组件运行完毕后执行的方法
         * 本例主要是用来绑定事件，初始化一些附加模块
         * @param {Uploader} uploader
         */
		afterUploaderRender: function(uploader){
			var self = this,
				Plugins = self.get('oPlugin'),
				queue = uploader.get('queue'),
                button = uploader.get('button'),
                auth = uploader.get('auth'),
                queueTarget = self.get('queueTarget');
			
			// 初始化成功后将默认的input隐藏掉。这个默认的input是用来防止uploader无法初始化成功的fallback方案
			var elemButtonTarget = button.get('target'),
				elemTempFileInput = $('.original-file-input', elemButtonTarget);
			$(elemTempFileInput).remove();
			S.log(LOG_PRE + 'old input removed.');
			
			// 取得最大上传数量
			var maxFileAllowed = 5;
			if(auth){
            	maxFileAllowed = auth.getRule('max');
            }else{
            	S.log(LOG_PRE + 'Cannot get auth');
            }
            self.set('maxFileAllowed', maxFileAllowed);
            
            // 初始化插件+附加模块
			var preview = new Plugins.preview(),
				message = new Message({
	            	'msgContainer': self.get('msgContainer'),
	            	'successMsgCls': self.get('successMsgCls'),
	            	'hintMsgCls': self.get('hintMsgCls'),
	            	'errorMsgCls': self.get('errorMsgCls')
	            }),
	            setMainPic = new SetMainPic(self.get('mainPicInput'), self.get('queueTarget'));
            self.set('message', message);
            self.set('preview', preview);
            self.set('setMainPic', setMainPic);
            
            // 如果是ajax上传模式，添加一个class
            if(uploader.get('type') == 'ajax'){
            	S.log(LOG_PRE + 'advance queue');
            	$(self.get('queueTarget')).addClass('advance-queue');
            }
            
            // 设置主图
            $(queueTarget).delegate('click', '.J_SetMainPic', function(e){
            	e.preventDefault();
            	var setMainPicBtn = e.currentTarget,
            		// fileid = $(setMainPicBtn).attr('data-file-id'),
            		// fileIndex = queue.getFileIndex(fileid),
            		// file = queue.getFile(fileIndex),
            		curQueueItem = $(setMainPicBtn).parent('li');
        		setMainPic.setMainPic(curQueueItem);
            });
            
            // 删除图片
            $(queueTarget).delegate('click', '.J_DeleltePic', function(e){
            	e.preventDefault();
            	var delBtn = e.currentTarget,
            		fileid = $(delBtn).attr('data-file-id');
        		queue.remove(fileid);
            });
            
            return true;
            
            queue.on('restore', function(e){
            	var curMainPicUrl = setMainPic.getMainPicUrl(),
            		successFiles = queue.getFiles('success'),
            		queueLength = successFiles ? parseInt(successFiles.length, '10') : 0 + parseInt(e.filesData.length, '10');
            	setMainPic.setMainPic(curMainPicUrl);
            	if(queueLength){
        			message.send(S.substitute(leftMsg, {
	        			'left': maxFileAllowed[0] - queueLength
	        		}), 'hint');
        		}
            });
            
            queue.on('add',function(ev){
            	var elemImg = $('.J_ItemPic', ev.target),
            		successFiles = queue.getFiles('success');
        		preview.preview(ev.file.input, elemImg);
        		S.log(LOG_PRE + 'preview done for file: ' + ev.file.id);
        		if(successFiles.length + 1){
        			message.send(S.substitute(leftMsg, {
	        			'left': maxFileAllowed[0] - successFiles.length - 1
	        		}), 'hint');
        		}
            });
            
            
            
            
            queue.on('remove', function(e){
            	var successFiles = queue.getFiles('success'),
            		msg;
            	setMainPic.setMainPic();
            	if(successFiles.length){
            		msg = S.substitute(leftMsg, {
	        			'left': maxFileAllowed - successFiles.length
	        		});
        			
        		}else{
        			msg = S.substitute(defaultMsg, {
	        			'max': maxFileAllowed
	        		});
        		}
        		message.send(msg, 'hint');
            });
            
            uploader.on('success', function(e){
            	// debugger;
            	// var successFiles = queue.getFiles('success'),
            		// successFilesLength = successFiles ? successFiles.length : 0;
        		var file = e.file,
        			curQueueItem = file.target,
        			serverUrl = file.sUrl;
    			$(curQueueItem).attr('data-url', serverUrl);
            	setMainPic.setMainPic();
            	// message.send();
            });
		},
		/**
		 * 更新文件数目
		 */
		_updateCount: function(){
			var self = this,
				queue = self.get('queue'),
				successFiles = queue.getFiles('success'),
            	maxFileAllowed = self.get('maxFileAllowed')[0],
                message = self.get('message'),
                defaultMsg = self.get('defaultMsg'),
                leftMsg = self.get('leftMsg'),
                msg;
            if(successFiles.length){
        		msg = S.substitute(leftMsg, {
        			'left': maxFileAllowed - successFiles.length
        		});
    		}else{
    			msg = S.substitute(defaultMsg, {
        			'max': maxFileAllowed
        		});
    		}
    		message.send(msg, 'hint');
    		S.log(LOG_PRE + 'file count updated. Message sent.')
            // if(successFiles.length + 1){
            	// var leftNum = maxFileAllowed[0] - successFiles.length - 1;
            	// message.sendLeftMsg(leftNum);
    		// }
		},
		/**
         * 向队列添加完文件后触发的回调函数（在add事件前触发）
         * @param {Number} index 文件索引值
         * @param {Object} file 文件数据
         * @return {Object} file
         */
		_addCallback: function(index, file){
			var self = this,
                queue = self.get('queue'),
                queueItem = self._appendFileDom(file);
            //将状态层容器写入到file数据
            queue.updateFile(index, {
                target: queueItem
            });
            //更换文件状态为等待
            queue.fileStatus(index, 'waiting');
            self.displayFile(true, queueItem);
            
            // 更新剩余文件数量
            self._updateCount();
            return queue.getFile(index);
		},
		/**
         * 文件处于等待上传状态时触发
         * 进行图片预览
         */
        _waitingHandler:function (ev) {
            var self = this,
            	preview = self.get('preview'),
            	file = ev.file,
            	queueItem = file.target,
                elemImg = $('.J_ItemPic', queueItem);
    		preview && preview.preview(file.input, elemImg);
    		S.log(LOG_PRE + 'preview done for file: ' + ev.file.id);
    		// 添加waiting状态
    		$(queueItem).addClass('upload-waiting');
        },
        /**
         * 在完成文件dom插入后执行的方法
         * @param {Object} ev 类似{index:0,file:{},target:$target}
         */
        _addHandler: function(ev){
        	S.log(LOG_PRE + 'add done.');
        },
        /**
         * 文件处于开始上传状态时触发
         */
        _startHandler: function(ev){
        	var self = this,
        		file = ev.file,
        		queueItem = file.target;
    		$(queueItem).replaceClass('upload-waiting', 'uploading');
        	S.log(LOG_PRE + 'start upload');
        },
        /**
         * 文件处于上传成功状态时触发
         */
        _successHandler: function(ev){
        	var self = this,
        		file = ev.file,
        		queueItem = file.target,
        		setMainPic = self.get('setMainPic');
    		$(queueItem).replaceClass('uploading', 'upload-done').attr('data-url', file.result.data.url);
    		setMainPic.setMainPic();
    		// 更新剩余文件数量
            self._updateCount();
        },
        /**
         * 删除图片后触发
         */
        _removeFileHandler: function(ev){
        	var self = this,
        		file = ev.file,
        		queueItem = file.target;
        	// 更新剩余文件数量
            self._updateCount();
            $(queueItem).remove();
            S.log(LOG_PRE + 'file deleted.');
        }
    }, {
    	ATTRS: /** @lends ErshouUploader.prototype*/ {
    		/**
	         *  主题名
	         * @type String
	         * @default "ershouUploader"
	         */
	        name: {
	        	value: 'ershouUploader'
        	},
	        /**
	         * css模块路径
	         * @type String
	         * @default "gallery/form/1.2/uploader/themes/ershouUploader/style.css"
	         */
	        cssUrl: { 
	        	value: 'gallery/form/1.2/uploader/themes/ershouUploader/style.css'
			},
	        /**
	         * 队列使用的模板
	         * @type String
	         */
	        fileTpl:{
	        	value: ['<li id="J_LineQueue-{id}" data-file-id="{id}" data-url="{sUrl}" data-name="{name}" data-size="{textSize}">',
							'<div class="J_Wrapper wrapper">',
								'<div class="tb-pic120">',
									'<a href="javascript:void(0);"><img class="J_ItemPic" src="{sUrl}" /></a>',
								'</div>',
								'<div class="pic-mask"></div>',
								'<div class="tips-uploading"><div class="progress-bar J_ProgressBar"><span class="progress-mask J_UploadingProgress"></span></div><p class="tips-text">上传中，请稍候</p></div>',
								'<div class="tips-upload-success"><span class="progress-bar"></span><p class="tips-text">上传成功！</p></div>',
								'<div class="tips-upload-error"><span class="progress-bar"></span><p>上传失败</p><p>请重新尝试！</p></div>',
								'<div class="tips-upload-waiting">等待上传，请稍候</div>',
								'<div class="upload-op-mask"></div>',
								'<div class="upload-operations">',
									'<a class="J_SetMainPic set-as-main" data-file-id="{id}" href="#">设为主图</a>',
									'<a class="J_DeleltePic del-pic" data-file-id="{id}" href="#">删除</a>',
								'</div>',
							'</div>',
						'</li>'].join('')
	        },
	        /**
	         * 需要加载的插件，需要手动实例化
	         * @type Array
	         */
			plugins: { 
				value: [
					'preview', 
					'progressBar'
				]
			},
			
			/**
			 * 显示错误消息的容器id
			 * @type String
			 */
			'msgContainer': {
				value: '#J_MsgBoxUpload'
			},
			/**
			 * 默认的提示消息
			 * @type String
			 */
			'defaultMsg': {
				value: '最多上传{max}张照片，每张图片小于5M'
			},
			/**
			 * 剩余多少张的消息
			 * @type String
			 */
			'leftMsg': {
				value: '还可以上传{left}张图片，每张小于5M。主图将在搜索结果中展示，请认真设置。'
			},
			/**
			 * 成功消息的class
			 * @type String
			 */
			'successMsgCls': {
				value: 'msg-success'
			},
			/**
			 * 提示消息的class
			 * @type String
			 */
			'hintMsgCls': {
				value: 'msg-hint'
			},
			/**
			 * 错误消息的class
			 * @type String
			 */
			'errorMsgCls': {
				value: 'msg-error'
			},
			/**
			 * 设置主图的input，如果不存在，则不初始化设置主图功能
			 * @type String
			 */
			'mainPicInput': {
				value: '#J_MainPicUrl'
			}
    	}
    });

    return ErshouUploader;
}, {
	requires:[
		'node', 
		'../../theme',
		'./message',
		'./setMainPic'
	]
});