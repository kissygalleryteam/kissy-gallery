KISSY.add(function(S, RS, PM, CM) {
	var $ = S.all;

	var ImgMananger = function(config) {
		var self = this;
		ImgMananger.superclass.constructor.call(self, config);
	};

	S.extend(ImgMananger, S.Base, {
		render: function() {
			var self = this,
				rs = new RS(self.get('regionSelectorCfg')),
				pm = new PM(),
				cm = new CM();
			rs.render();
			pm.render();
			cm.render();
			self.set('regionSelector', rs);
			self.set('copyManager', cm);
			self.set('popManager', pm);
			self._bind();
			// console.log('img manager render');
		},
		_bind: function() {
			var self = this,
				cm = self.get('copyManager'),
				rs = self.get('regionSelector'),
				pm = self.get('popManager'),
				copyTrigger = $(self.get('copySelectedCls')),
				clearTrigger = $(self.get('clearSelectedCls')),
				container = $(self.get('container')),
				copySingleTrigger = $(self.get('copySingleCls')),
				moreImgs = $(self.get('moreImgsCls'));

			copyTrigger.on('click', function(ev) {
				ev.preventDefault();
				self._copyHandler();
			});

			clearTrigger.on('click', function(ev) {
				ev.preventDefault();
				self._clearHandler();
			});

			container.delegate('mouseover', '.img-file', function(ev) {
				var target = $(ev.currentTarget),
					img = target.all('img');
				cm.setMode('single');
				cm.setPosition(target, img.attr('src'));
			});

			container.delegate('mouseout', '.img-file', function(ev) {
				// console.log('mouseout');
				cm.hide(ev);
			});

			pm.on('mouseover', function(ev) {
				var data = pm.getCopyData();
				// console.log(data);
				cm.setMode('multi');
				cm.setPosition(ev.target, data);
			});

			// pm.on('mouseout', function(ev) {
			// 	cm.hide(ev);
			// });

			rs.on('selected', function(ev) {
				self._displaySelected(ev.selected);
			});

			moreImgs.on('click', function(ev) {
				ev.preventDefault();
				self.getMoreImgs();
			});
		},		
		_displaySelected: function(selected) {
			var self = this,
				selectedCls = self.get('regionSelectorCfg').selectedCls;
			S.each(selected, function(r) {
				r = $(r);
				if(r.hasClass(selectedCls)) {
					r.removeClass(selectedCls);
				}else {
					r.addClass(selectedCls);
				}
			});
		},
		/**
		 * 清除以选中的
		 */
		_clearHandler: function() {
			var self = this,
				selectedCls = self.get('regionSelectorCfg').selectedCls,
				selectedList = self._getSelectedImg();
			selectedList.removeClass(selectedCls);
		},
		_copyHandler: function() {
			var self = this,
				imgsData = self._getSelectedImgData(),
				pm = self.get('popManager');
			if(!imgsData) {return;}
			// console.log(imgsData);
			pm.addImgs(imgsData);
		},
		/**
		 * 获取选中的img
		 * @return {[type]}
		 */
		_getSelectedImg: function() {
			var self = this,
				container = $(self.get('container')),
				selectedCls = self.get('regionSelectorCfg').selectedCls,
				selectedList = $(selectedCls, container);
			return selectedList;
		},
		_getSelectedImgData: function() {
			var self = this,
				selectedList = self._getSelectedImg(),
				imgsData = [];
			if(selectedList.length < 1) {
				alert('还没有选择任何图片');
				return;
			}
			if(selectedList.length > 10) {
				alert('选择图片不能大于10张');
				return;
			}
			S.each(selectedList, function(sel) {
				var img = $('img', sel),
					imgData = {};
				imgData.url = img.attr('src');
				imgData.name = img.attr('alt');
				imgsData.push(imgData);
			});
			return imgsData;
		},
		getMoreImgs: function() {
			var self = this,
				o = S.IO({
					url: self.get('getMoreImgsApi'),
					type: 'post',
					dataType: 'json',
					cache: false,
					success: function(result) {
						// console.log('get more img success:', result);
						self.addImgs(result);
					},
					error: function() {},
					timeout: 1000
				});
		},
		addImgs: function(array) {
			var self = this,
				html = [],
				tpl = self.get('tpl'), 
				imgList = $(self.get('container')).all('.img-list');
			S.each(array, function(d) {
				html.push(S.substitute(tpl, d));
			});

			imgList.prepend($(html.join('')));
			self.fire('addimg', {});
		},
		addImg: function(data) {
			var self = this,
				container = $(self.get('container')),
				imgList = $('.img-list', container),
				tpl = self.get('tpl'),
				html = $(S.substitute(tpl, data));
			imgList.prepend(html)
			self.fire('addimg', {});
		}
	},{
		ATTRS: {
			tpl: {
				value: '<li class="img-content">' +
	                    '<div class="img-file">' +
	                        '<img src="{url}" alt="{name}" />' +
	                            '<div class="selected" title="已选择">已选择</div>' +
	                    '</div>' +                            
	                    '<p class="img-name" title="{name}">{name}</p>' +
	                '</li>'
	            }
		}
	});

	return ImgMananger;
}, {
	requires: ['./regionselector', './popManager', './copymanager']
});