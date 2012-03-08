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
	            setMainPic = new SetMainPic(self.get('form'), self.get('queueTarget'));
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
            	setMainPic.setMainPic();
            	// message.send();
            })
		}
	}, {
		ATTRS: {
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
				value: '#J_UploaderForm'
			}
		}
	})
	
	return LineQueue;
	
}, {
	requires: [
		'node',
		'../default/index',
		'./queue',
		'../../plugins/preview/preview',
		'./message',
		'./setMainPic',
		'./style.css'
	]
});
