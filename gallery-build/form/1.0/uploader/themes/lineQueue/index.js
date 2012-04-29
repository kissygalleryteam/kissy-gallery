/**
 * @fileoverview 横排队列上传主题
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-01-11
 */
KISSY.add('gallery/form/1.0/uploader/themes/lineQueue/index', function(S, Node, DefaultTheme, Queue, Preview, Message, SetMainPic){
	
	var $ = Node.all,
		LOG_PRE = '[LineQueue:index] ';
	
	function LineQueue(config){
		var self = this;
		self.set('queueTarget', config.queueTarget);
        //调用父类构造函数
        LineQueue.superclass.constructor.call(self, config);
	}
	
	S.extend(LineQueue, DefaultTheme, /** @lends GrayQueue.prototype*/{
		
		_init: function(){
			var self = this,
				queueTarget = self.get('queueTarget'),
				queue;
            queue = new Queue(queueTarget);
            self.set('queue',queue);
            // S.log(queue);
            var setMainPic = new SetMainPic(self.get('mainPicInput'), self.get('queueTarget'));
            self.set('setMainPic', setMainPic);
            queue.on('restore', function(e){
            	var curMainPicUrl = setMainPic.getMainPicUrl();
            	setMainPic.setMainPic(curMainPicUrl);
            });
            S.log(LOG_PRE + 'inited.');
		},
		/**
		 * 父类渲染成功后模板执行的自定义方法。
		 */
		afterUploaderRender: function(uploader){
			var self = this,
				queueTarget = self.get('queueTarget'),
				// elemButtonTarget = uploader.get('buttonTarget'),
                queue = uploader.get('queue'),
                button = uploader.get('button'),
                elemButtonTarget = button.get('target'),
                auth = uploader.get('auth'),
                elemTempFileInput = $('.original-file-input', elemButtonTarget),
                elemFileInput = button.get('fileInput'),
                maxFileAllowed = 5,
                defaultMsg = self.get('defaultMsg'),
                leftMsg = self.get('leftMsg');
            
            if(auth){
            	maxFileAllowed = auth.getRule('max');
            }else{
            	S.log(LOG_PRE + 'Cannot get auth');
            }
            
            $(elemTempFileInput).remove();
            S.log(LOG_PRE + 'old input removed.');
            
            // 初始化一些附加模块+插件
            var preview = new Preview(),
            	message = new Message({
	            	'msgContainer': self.get('msgContainer'),
	            	'successMsgCls': self.get('successMsgCls'),
	            	'hintMsgCls': self.get('hintMsgCls'),
	            	'errorMsgCls': self.get('errorMsgCls')
	            }),
	            setMainPic = self.get('setMainPic');
            // message.set('msgContainer', '#J_MsgBoxUpload');
            uploader.set('message', message);
            
            queue.on('add',function(ev){
            	var elemImg = $('.J_ItemPic', ev.target),
            		successFiles = queue.getFiles('success');
        		preview.preview(ev.file.input, elemImg);
        		S.log(LOG_PRE + 'preview done for file: ' + ev.file.id);
        		if(successFiles.length + 1){
        			message.send(S.substitute(leftMsg, {
	        			'left': maxFileAllowed - successFiles.length - 1
	        		}), 'hint');
        		}
            });
            
            if(uploader.get('type') == 'ajax'){
            	S.log(LOG_PRE + 'advance queue');
            	$(self.get('queueTarget')).addClass('advance-queue');
            }
            
            // 删除图片
            $(queueTarget).delegate('click', '.J_DeleltePic', function(e){
            	e.preventDefault();
            	var delBtn = e.currentTarget,
            		fileid = $(delBtn).attr('data-file-id');
        		queue.remove(fileid);
            	// var target = e.target;
            	// if($(target).hasClass('J_DeleltePic')){
            		// var fileid = $(target).attr('data-file-id');
            		// queue.remove(fileid);
            	// }else if($(target).hasClass('J_DeleltePic')){
//             		
            	// }
            });
            
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
		}
	}, {
		ATTRS: {
            cssUrl:{value:'gallery/form/1.0/uploader/themes/lineQueue/style.css'},
			// 消息容器，为空则不初始化消息
			'msgContainer': {
				value: '#J_MsgBoxUpload'
			},
			// 默认消息
			'defaultMsg': {
				value: '最多上传{max}张照片，每张图片小于5M'
			},
			// 剩余多少张的消息
			'leftMsg': {
				value: '还可以上传{left}张图片，每张小于5M。主图将在搜索结果中展示，请认真设置。'
			},
			'successMsgCls': {
				value: 'msg-success'
			},
			'hintMsgCls': {
				value: 'msg-hint'
			},
			'errorMsgCls': {
				value: 'msg-error'
			},
			// 设置主图的input，如果不存在，则不初始化设置主图功能
			'mainPicInput': {
				value: '#J_MainPicUrl'
			}
		}
	});
	
	return LineQueue;
	
}, {
	requires: [
		'node',
		'../default/index',
		'./queue',
		'../../plugins/preview/preview',
		'./message',
		'./setMainPic'
	]
});
/**
 * @fileoverview 横排队列发送消息
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-01-11
 */
KISSY.add('gallery/form/1.0/uploader/themes/lineQueue/message', function(S, Node){
	
	var $ = Node.all,
		LOG_PRE = '[LineQueue: Message] ';
	
	function Message(config){
		var self = this;
		self.config = S.mix({
			msgContainer: '#J_MsgBoxUpload',
			successMsgCls: 'msg-success',
			hintMsgCls: 'msg-hint',
			errorMsgCls: 'msg-error'
		}, config);
		// Message.superclass.constructor.call(self, config);
		S.log(LOG_PRE + 'Constructed');
	}
	
	S.augment(Message, {
		
		/**
		 * 向msg容器发送消息
		 */
		send: function(msg, type){
			var self = this;
			if(!msg){
				S.log(LOG_PRE + 'You did not tell me what to show.');
				return false;
			}
			var msgBox = self.config.msgContainer,
				newClsName = self.config[type + 'MsgCls'],
				successCls = self.config.successMsgCls,
				hintCls = self.config.hintMsgCls,
				errorCls = self.config.errorMsgCls;
			if(msgBox){
				switch(type){
					case 'success':
					case 'hint':
					case 'error':
						$(msgBox).html(msg);
						$(msgBox).replaceClass([successCls, hintCls, errorCls].join(' '), newClsName);
						return true;
						break;
					default:
						S.log(LOG_PRE + 'type error');
						return false;
						break;
				}
			}
		}
		
	});
	
	return Message;
	
}, {
	requires: [
		'node'
	]
});
/**
 * 二手模板队列处理
 * @author 紫英(橘子)<daxingplay@gmail.com>
 */
KISSY.add('gallery/form/1.0/uploader/themes/lineQueue/queue',function(S, Node, QueueBase, Status) {
    var EMPTY = '',
    	$ = Node.all,
    	LOG_PRE = '[LineQueue:queue] ';

    /**
     * @name LineQueueQueue
     * @class 模板的队列类
     * @constructor
     * @extends Base
     * @requires Node
     */
    function Queue(config) {
        var self = this;
        //调用父类构造函数
        Queue.superclass.constructor.call(self, config);
    }
    S.extend(Queue, QueueBase, /** @lends Queue.prototype*/{
        /**
         * 运行Status
         * @param {Object} file  文件数据
         * @return {Status} 状态实例
         */
        _renderStatus : function(file) {
            var self = this,
            	file = file.target,
            	elStatus;
            if (!file.length){
            	S.log(LOG_PRE + 'Cannot get file data.');
            	return false;
            };
            // S.log(file, 'dir');
            //状态层
            elStatus = file.children('.J_FileStatus');
            //实例化状态类
            return new Status(elStatus, {
            	queue : self,
            	file : file
        	});
        }
    }, {ATTRS : /** @lends Queue*/{
        /**
         * 模板
         */
        tpl: {
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
        }
    }});
    return Queue;
}, {
	requires : [
		'node',
		'../../queue/base',
		'./status'
	]
});/**
 * @fileoverview 设置为主图功能，本来想作为插件去写，但是发现这么简单的功能不适合做插件，做成插件反而复杂了。
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-03-07
 * @requires KISSY 1.2+
 */
KISSY.add('gallery/form/1.0/uploader/themes/lineQueue/setMainPic', function(S, Node){
	
	var $ = Node.all,
		LOG_PRE = '[LineQueue: setMainPic] ';
	
	function SetMainPic(mainPicInput, queueContainer){
		var self = this,
			mainPicInput = $(mainPicInput),
			queueContainer = $(queueContainer);
		// config = S.mix(_config, config);
		if(!mainPicInput || mainPicInput.length <= 0){
			S.log(LOG_PRE + 'cannot find mainPicInput, SetMainPic function disabled.');
			return false;
		}
		if(!queueContainer || queueContainer.length <= 0){
			S.log(LOG_PRE + 'cannot find queue container');
			return false;
		}
		self.queueContainer = queueContainer;
		self.input = mainPicInput;
	}
	
	S.augment(SetMainPic, {
		/**
		 * 将队列项设置为主图
		 * @param {HTMLElement|String} liElem 需要设置主图的li元素或者是主图路径
		 */
		setMainPic: function(liElem){
			var self = this,
				// container = self.container,
				queueContainer = self.queueContainer,
				uploadQueue = $('li', queueContainer);
			if(S.isString(liElem)){
				S.each(uploadQueue, function(item, index){
					var url = $(item).attr('data-url');
					if(url == liElem){
						liElem = item;
						return true;
					}
				});
			}
			var	curMainPic = self.getMainPic(),
				liElem = $(liElem);
			if(!liElem || liElem.length <= 0){
				// var uploadQueue = $('li', queueContainer);
				if(!uploadQueue[0]){
					S.log(LOG_PRE + 'There is no pic. I cannot set any pic as main pic. So I will empty the main pic input.');
					$(self.input).val('');
					return null;
				}else{
					if(curMainPic.length > 0){
						S.log(LOG_PRE + 'Already have a main pic. Since you do not tell me which one to set as main pic, I will do nothing.');
						return curMainPic;
					}else{
						S.log(LOG_PRE + 'No li element specified. I will set the first pic as main pic.');
						liElem = uploadQueue[0];
					}
				}
			}
			var	liWrapper = $('.J_Wrapper', liElem),
				mainPicLogo = $('<span class="main-pic-logo">主图</span>'),
				mainPicUrl = $(liElem).attr('data-url');
			if(curMainPic.length > 0){
				$(curMainPic).removeClass('main-pic');
				$('.main-pic-logo', curMainPic).remove();
			}
			$(liElem).addClass('main-pic');
			$(mainPicLogo).appendTo(liWrapper);
			$(self.input).val(mainPicUrl);
			S.log(LOG_PRE + 'write main pic url to :' + mainPicUrl);
			return liElem;
		},
		
		/**
		 * 获取当前主图所在li
		 */
		getMainPic: function(){
			var self = this;
			return $(self.queueContainer).children('.main-pic');
		},
		/**
		 * 获取当前主图的路径
		 */
		getMainPicUrl: function(){
			var self = this;
			return $(self.input).val();
		}
	});
	
	// S.extend(SetMainPic, Base, {
// 		
		// _init: function(){
			// var self = this,
				// container = $(self.get('container'));
			// if(!container || container.length <= 0){
				// S.log(LOG_PRE + 'cannot find container');
				// return false;
			// }
		// },
// 		
		// /**
		 // * 将所选id的图片设置为主图
		 // */
		// setMainPic: function(id){
			// var self = this;
		// },
// 		
		// /**
		 // * 获取当前主图
		 // */
		// getMainPic: function(){
			// var self = this;
// 			
		// }
// 		
	// }, {
		// ATTRS: {
// 			
			// 'mainPicInput': {
				// value: '#J_MainPic'
			// },
			// 'container': {
				// value: ''
			// }
// 			
		// }
	// });
	
	return SetMainPic;
	
}, {
	requires: [
		'node'
	]
});/**
 * 二手模板状态处理
 * @author 紫英(橘子)<daxingplay@gmail.com>
 */
KISSY.add('gallery/form/1.0/uploader/themes/lineQueue/status',function(S, Node, StatusBase, ProgressBar) {
    var $ = Node.all,
    	LOG_PRE = '[LineQueue: status] ';
    
    /**
     * @name LineQueueStatus
     * @class 状态类
     * @constructor
     * @extends Base
     * @requires Node
     */
    function Status(target, config) {
        var self = this;
        //调用父类构造函数
        Status.superclass.constructor.call(self,target, config);
        self.set('target', $(target));
    }
    Status.type = StatusBase.type;
    S.extend(Status, StatusBase, /** @lends Status.prototype*/{
        /**
         * 等待上传时状态层内容
         */
        _waiting : function() {
            var self = this, 
                uploader = self.get('uploader'),
                queue = self.get('queue'),
                fileContainer = self.get('file'),
                id = $(fileContainer).attr('data-file-id');
            //不存在文件大小，直接退出
            if(fileContainer.length <= 0){
            	S.log(LOG_PRE + 'Cannot find this file');
            	return false;
            }
            $(fileContainer).addClass('upload-waiting');
        },
        /**
         * 开始上传后改成状态层内容
         */
        _start : function(data) {
            var self = this, 
            	// tpl = self.get('tpl'),
            	// startTpl = tpl.start,
                target = self.get('target'),
                uploader = self.get('uploader'),
                curQueueItem = self.get('file'),
                uploadType = uploader.get('type');
            $(curQueueItem).replaceClass('upload-waiting', 'uploading');
            //如果是ajax异步上传，加入进度显示
            if (uploadType == 'ajax') {
                var progressContainer = $('.J_ProgressBar', curQueueItem),
                	progressBar = $('.J_UploadingProgress', progressContainer);
                self.set('progressBar', progressBar);
                // var	progressBar = new ProgressBar(progressContainer);
                // progressBar.set('width', $(progressContainer).width());
                // progressBar.set('tpl', '<span class="progress-mask J_UploadingProgress" style="width: {value}; "></span>')
                // progressBar.render();
                // progressBar.set('value', '100');
                // self.set('progressBar', progressBar);
            }
        },
        /**
         * 正在上传时候刷新状态层的内容
         * @param data
         */
        _progress : function(data){
            var self = this,
                //已经加载的字节数
                loaded = data.loaded,
                //当前文件字节总数
                total = data.total,
                //百分比
                val = Math.ceil(loaded/total * 100),
                uploader = self.get('uploader'),
                // fileContainer = self.get('file'),
                // id = $(fileContainer).attr('id'),
                //进度条
                progressBar = self.get('progressBar');
            if(!progressBar){
            	S.log(LOG_PRE + 'Cannot find progress bar');
            	return false;
            };
            // progressBar.set('value', (100 - val));
            $(progressBar).width(100 - val + '%');
        },
        /**
         * 文件上传成功后
         */
        _success : function(){
            var self = this, 
                curQueueItem = self.get('file'),
                uploader = self.get('uploader'),
                loaded = uploader.get('loaded');
            $(curQueueItem).replaceClass('uploading', 'upload-success');
            setTimeout(function(){
            	$(curQueueItem).replaceClass('upload-success', 'upload-done');
            	
				// D.attr(curQueueItem, 'data-url', fileUrl);
				// if(!mainPic){
					// AjaxUploader.setMainPic(curQueueItem);
				// }
			}, 1000);
			// S.log(uploader.get('queue'), 'dir');
        },
        _restore: function(){
       		var self = this, 
                curQueueItem = self.get('file'),
                uploader = self.get('uploader'),
                loaded = uploader.get('loaded');
            $(curQueueItem).replaceClass('upload-waiting', 'upload-done');
        },
        /**
         * 上传失败后改成状态层内容
         */
        _error : function(data) {
            if(!S.isObject(data) || !data.msg){
                data = {
                	msg : '文件上传失败！'
            	};
            }
            var self = this, 
                curQueueItem = self.get('file'),
                id = $(curQueueItem).attr('data-file-id'),
                uploader = self.get('uploader'),
                queue = self.get('queue'),
                message = uploader.get('message');
            message.send(data.msg, 'error');
            $(curQueueItem).replaceClass('uploading', 'upload-error');
            setTimeout(function(){
            	queue.remove(id);
				// $(curQueueItem).remove();
			}, 1000);
        }
    }, {ATTRS : /** @lends Status*/{
        /**
         * 模板
         */
        tpl : {value : {
            waiting : '<div class="clearfix"><div class="f-l">0%</div><div class="f-l uploader-icon del-icon J_DelFile"></div></div>',
            start : '<div class="clearfix"><div class="J_ProgressNum"><img class="loading" src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" /></div>' +
                '</div> ',
            success : '<div class="uploader-icon success-icon">100%</div>',
            cancel : '<div>已经取消上传，<a href="#reUpload" class="J_ReUpload">点此重新上传</a> </div>',
            error : '<div class="upload-error">{msg}<a href="#fileDel" class="J_FileDel">点此删除</a></div>'
        }
        }
    }});
    return Status;
}, {
	requires : [
		'node',
		// '../../queue/progressBar',
		'../../queue/status',
		'../../plugins/progressBar/progressBar'
	]
});