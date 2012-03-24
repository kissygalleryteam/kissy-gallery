KISSY.add(function(S) {
	var $ = S.all,
		Clipboard;

	var CopyManager = function(config) {
		var self = this;
		config = S.merge(CopyManager.config, config);
		CopyManager.superclass.constructor.call(self, config);
	};

	S.extend(CopyManager, S.Base, {
		render: function() {
			var self = this,
				tpl = self.get('tpl'),
				container = $(tpl),
				input;			
			container.appendTo(document.body);
			input = container.all('#clipboard-content');
			self.set('container', container);
			self.set('input', input);
			S.getScript('http://localhost/project/tps/assets-dev/clipboard/clipboard-pkg.js', {
				success: function() {
					self._createClipboard();
					self._bind();
				}
			});
		},
		_createClipboard: function() {
			var self = this,
				container = self.get('container'),
				clip = new AJBridge.Clipboard('#J_ClipboardContainer', {
                    src: '../assets-dev/clipboard/clipboard.swf',
                    attrs: {
                        width: container.width() + 10,
                        height: container.height() + 10
                    },
                    params: {
                        bgcolor: '#FCC',
                        wmode: 'transparent',
                        scale: 'showall'
                    },
                    hand: true,
                    btn: true
                });
			self.set('clipboard', clip);
            
            clip.init();
		},
		_bind: function() {
			var self = this, 
				container = self.get('container'),
				input = self.get('input'),
				clip = self.get('clipboard');
			clip.on('mouseDown', function(ev) {
                var oValue = input.val();
                // console.log(clip.getData(), oValue);
                clip.setData(oValue);

                if(clip.getData() !== oValue) {
                    // window.prompt('你的浏览器不支持自动复制', oValue);
                    console.log('你的浏览器不支持自动复制', oValue);
                }else {
                    container.attr('data-content', clip.getData());    
                }
                
                input.select();
            });

            clip.on('mouseUp', function(ev) {
                if(container.attr('data-content')) {
                    // var cliptip = new S.MED.Tip()
                    console.log('代码已复制到剪贴板：', container.attr('data-content'));
                    alert(container.attr('data-content'));
                }        
            });
		},
		setMode: function(str) {
			var self = this,
				container = self.get('container');
			if(str === 'multi') {
				container.removeClass('clipboard-container-single');
				container.addClass('clipboard-container-multi');
			}else {
				container.removeClass('clipboard-container-multi');
				container.addClass('clipboard-container-single');
			}
			this.set('mode', str === 'multi' ? 'multi' : 'single');
		},
		setPosition: function(target, data) {
			var self = this,
				oTarget = self.get('target'),
				container = self.get('container'),
				input = self.get('input'),
				pos;
			target = $(target);
			if(oTarget == target) {return;}
			
			self.set('target', target);
			// if(target.)
			input.val(data);
			// console.log(target, img, img.attr('src'));
			pos = target.offset();
			container.css({
				'top': pos.top + target.outerHeight()/2 - container.outerHeight()/2,
				'left': pos.left + target.outerWidth()/2 - container.outerWidth()/2
			});
			self.show();
		},
		show: function() {
			var self = this,
				container = self.get('container');
			container.removeClass('hide');
		},
		hide: function(ev) {
			var self = this,
				// oTarget = self.get('target'),
				container = self.get('container'),
				pos = container.offset();
				// posTarget = target.offset();
			// if(oTarget == target) {return;}
			if(ev.pageX >= pos.left && ev.pageX <= pos.left + container.outerWidth() && ev.pageY >= pos.top && ev.pageY <= pos.top + container.outerHeight()) {return;}
			container.addClass('hide');
		}
	}, {
		ATTRS: {
			/**
			 * 复制模式，单张 or 多张
			 * @type {Object}
			 */
			mode: {
				value: ''
			},
			tpl: {
				value: '<div id="J_ClipboardContainer" class="clipboard-container"><input value="" type="hidden" id="clipboard-content" /></div>'
			}
		}
	});

	return CopyManager;
});