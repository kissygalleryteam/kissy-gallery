KISSY.add(function(S, Overlay, Template, DD) {
	var $ = S.all;

	var PopManager = function(config) {
		var self = this;
		config = S.merge(PopManager.config, config);
		PopManager.superclass.constructor.call(self, config);
	};

	S.extend(PopManager, S.Base, {
		render: function() {
			var self = this;
			self._createPop();
				
		},
		show: function() {
			var self = this,
				pop = self.get('pop');
			pop.center();
			pop.show();
		},
		hide: function() {},
		/**
		 * 弹出层中添加图片
		 * @param {[type]} array [description]
		 */
		addImgs: function(array) {
			var self = this,
				imgTmp = self.get('imgTmp'),
				pop = self.get('pop'),
				popContainer = $(pop.get('contentEl')),
				imgContainer = popContainer.all('.img-container'), 
				data = self._adapterData(array),
				node = Template(imgTmp).render(data);
			// console.log(pop, popContainer, imgContainer);
			imgContainer.append(node);
			// node.appendTo(imgContainer);
			self.show();
		},
		getCopyData: function() {
			var self = this,
				pop = self.get('pop'),
				popContainer = $(pop.get('contentEl')),
				imgFiles = popContainer.all('.img-file'),
				data = [];
			S.each(imgFiles, function(f) {
				var img = $(f).all('img');
				data.push(img.attr('src'));	
			});
			return data.join('\n');
		},
		/**
		 * 创建弹出层 并绑定事件
		 */
		_createPop: function() {
			var self = this,
				pop = new Overlay({
					content: self.get('popTpl'),
					closable: true,
					width: 600,
					height: 'auto',
					mask: true
				});
			pop.render();
			pop.hide();
			// pop.show();
			
			self.set('pop', pop);
			self._bind();
		},
		_bind: function() {
			var self = this,
				pop = self.get('pop'),
				popContainer = $(pop.get('contentEl')),
				imgContainer = popContainer.all('.img-container'),
				copyAll = popContainer.all('.J_CopyAll'),
				cancle = popContainer.all('.J_Cancel');

			//监听pop隐藏显示事件
			pop.on('beforeVisibleChange', function(ev) {
				// console.log(ev);
				if(ev.newVal) {return;}
				self._clearPop();
			});

			self._addDragEvent();	

			cancle.on('click', function(ev) {
				ev.preventDefault();
				pop.hide();
			});

			copyAll.on('mouseover', function(ev) {
				self.fire('mouseover', {'target': ev.target});
			});

			copyAll.on('mouseout', function(ev) {
				self.fire('mouseout', ev);
			});

			imgContainer.delegate('mouseover', '.img-content', function(ev) {
            	// var target = $(ev.currentTarget);
            	$(ev.currentTarget).addClass('hover');
            });

			imgContainer.delegate('mouseout', '.img-content', function(ev) {
            	// var target = $(ev.currentTarget);
            	$(ev.currentTarget).removeClass('hover');
            });

			imgContainer.delegate('click', '.delete-img', function(ev) {
				ev.preventDefault();
            	// var target = $(ev.target).parent('.img-content');
				// console.log(target, target.parent());
				$(ev.target).parent('.img-content').remove();
            });
		},
		/**
		 * 添加拖拽的功能
		 */
		_addDragEvent: function() {
			var self = this,
				pop = self.get('pop'),
				popContainer = $(pop.get('contentEl')),
				imgContainer = popContainer.all('.img-container'),
				DDM = DD.DDM,
                DraggableDelegate = DD.DraggableDelegate,
                DroppableDelegate = DD.DroppableDelegate,
                Draggable = DD.Draggable,
                Droppable = DD.Droppable,
                Scroll = DD.Scroll,
                Proxy = DD.Proxy,
                proxy, dragDelegate, dropDelegate, p, s;
            proxy = new Proxy({
                    node: function(drag) {
                        var n = $(drag.get('dragNode').clone(true));
                        n.attr('id', S.guid('ks-dd-proxy'));
                        n.css('opacity', 0.2);
                        return n;
                    },
                    destroyOnEnd: true,
                    moveOnEnd: false
                });

            dragDelegate = new DraggableDelegate({
                container: imgContainer,
                selector: '.img-content',
                handlers: ['.img-file'],
                move: true 
            });

            proxy.attach(dragDelegate);

            dropDelegate = new DroppableDelegate({
                container: imgContainer,
                selector: '.img-content'
            });

            dragDelegate.on('dragstart', function(ev) {
                var c = this;
                p = c.get('dragNode').css('position');
            });

            dragDelegate.on('dragend', function(ev) {
                var c = this;
                c.get('dragNode').css('position', p);
            });

            dragDelegate.on('dragover', function(ev) {
                var drag = ev.drag,
                    drop = ev.drop,
                    dropNode = drop.get('node'),
                    dragNode = drag.get('dragNode'),
                    middleDropX = (dropNode.offset().left * 2 + dropNode.width())/2;

                if(ev.pageX > middleDropX) {
                    var next = dropNode.next();
                    if(next && next[0] == dragNode[0]) {
                    }else {
                        dragNode.insertAfter(dropNode);
                    }
                }else {
                    var prev = dropNode.prev();
                    if(prev && prev[0] == dropNode[0]) {
                    }else {
                        dragNode.insertBefore(dropNode);
                    }
                }
            });

            s = new Scroll({
                node: imgContainer
            });

            s.attach(dragDelegate);
		},
		/**
		 * 关闭pop时清除里面的img
		 */
		_clearPop: function() {
			// console.log('clear pop');
			var self = this,
				pop = self.get('pop'),
				popContainer = $(pop.get('contentEl')),
				imgContainer = popContainer.all('.img-container');
			// console.log(imgContainer);
			imgContainer.html('');
		},
		/**
		 * 生成img列表的数据
		 * @param  {Array} array [description]
		 * @return {Object}
		 */
		_adapterData: function(array) {
			var data = {};
			data.imgs = array;
			return data;
		}
	}, {
		ATTRS: {
			popTpl: {
				value: '<div class="copy-pop">' +
							'<h4>排序和复制链接</h4>' +
							'<div class="img-container">' +
							'</div>' +
							'<div class="copy-operate">' +
								'<a class="copy J_CopyAll multi" href="#">复制所有链接</a>' +
								'<a class="cancle J_Cancel" href="#">取消</a>' +
							'</div>' +
				'</div>'
			},
			imgTmp: {
				value: '{{#each imgs as img}}<div class="img-content">' +
							'<div class="img-file">' +
								'<img src="{{img.url}}" alt="{{img.name}}" />' +
								'<a class="delete-img" title="删除" href="#">删除</a>' +
							'</div>' +
							'<p class="img-name">{{img.name}}</p>' + 
						'</div>{{/each}}'
			}
		}
	});

	return PopManager;
}, {
	requires: ['overlay', 'template', 'dd']
});