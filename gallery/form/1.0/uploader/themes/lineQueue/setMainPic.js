/**
 * @fileoverview 设置为主图功能，本来想作为插件去写，但是发现这么简单的功能不适合做插件，做成插件反而复杂了。
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-03-07
 * @requires KISSY 1.2+
 */
KISSY.add('gallery/form/1.0/uploader/themes/lineQueue/setMainPic', function(S, Node){
	
	var $ = Node.all,
		LOG_PRE = '[LineQueue: setMainPic] '
		_config = {
			'mainPicInput': 'main-pic',
			'tpl': '<input id="J_UploadMainPicInput" name="{name}" type="hidden" value="" />'
		};
	
	function SetMainPic(container, queueContainer, config){
		var self = this,
			container = $(container),
			queueContainer = $(queueContainer);
		config = S.mix(_config, config);
		if(!container || container.length <= 0){
			S.log(LOG_PRE + 'cannot find container');
			return false;
		}
		if(!queueContainer || queueContainer.length <= 0){
			S.log(LOG_PRE + 'cannot find queue container');
			return false;
		}
		self.container = container;
		self.queueContainer = queueContainer;
		self.input = $(S.substitute(config.tpl, {
			'name': config.mainPicInput
		})).appendTo(self.container);
	}
	
	S.augment(SetMainPic, {
		/**
		 * 将队列项设置为主图
		 * @param {HTMLElement} liElem
		 */
		setMainPic: function(liElem){
			var self = this,
				// container = self.container,
				queueContainer = self.queueContainer,
				curMainPic = self.getMainPic(),
				liElem = $(liElem);
			if(!liElem || liElem.length <= 0){
				var uploadQueue = $('li', queueContainer);
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
});