KISSY.add(function(S) {	
	var $ = S.all;

	function posXY(ev){
	 var posX = ev.pageX || (ev.clientX +
	         (document.documentElement.scrollLeft || document.body.scrollLeft));
	 var posY = ev.pageY || (ev.clientY +
	         (document.documentElement.scrollTop || document.body.scrollTop));
	 return {x:posX, y:posY};
	}

	var RegionSelector = function(config) {
		var self = this,
			_regions;
		self.config = config = S.merge(RegionSelector.config, config);
		RegionSelector.superclass.constructor.call(self, config);
	};

	S.mix(RegionSelector, {
		event: {
			SELECTED: 'selected'
		}
	});

	S.extend(RegionSelector, S.Base, {
		render: function() {
			var self = this;
			self._bind();
		},
		_init: function() {},
		_bind: function() {
			var self = this,
				container = $(self.get('container')),
				selectedCls = self.get('selectedCls'),
				selectedRegions = self.get('selectedRegions');
			// container.delegate('mousedown', '.img', function(ev) {
			// 	var target = $(ev.target);
			// 	if(target.hasClass(selectedCls)) {
			// 		target.removeClass(selectedCls);
			// 		selectedRegions.remove(target);
			// 	}else {
			// 		target.addClass(selectedCls);
			// 		selectedRegions.push(target);
			// 	}
			// 	self.set('selectedRegions', selectedRegions);
			// });
			container.delegate('click', '.img-content', function(ev) {
				ev.stopPropagation();
				var target = $(ev.target).parent('.img-content');
				// console.log(target);
				self.fire(RegionSelector.event.SELECTED, {'selected': [target]});
				// self._displaySelected(target);
			});

			// $(document).on('mousedown', function(ev) {
			// 	ev.stopPropagation();
			// 	ev.preventDefault();
			// 	self.onBeforeSelect(ev);
			// });

			// $(document).on('mousemove', function(ev) {
			// 	ev.stopPropagation();
			// 	ev.preventDefault();
			// 	self.onSelect(ev);
			// });

			// $(document).on('mouseup', function(ev) {
			// 	ev.stopPropagation();
			// 	ev.preventDefault();
			// 	self.onEnd(ev);
			// });
		},
		onBeforeSelect: function(ev) {
			var self = this,
				selectDiv = self.get('selectDiv');
			if(!selectDiv){
				self._createSelContainer();
	     	}
	     
		    self.set('startX', posXY(ev).x);
		    self.set('startY', posXY(ev).y);
		    self.set('isSelect', true);
		},
		onSelect: function(ev) {
			var self = this,
				selectDiv = self.get('selectDiv'),
				startX = self.get('startX'),
				startY = self.get('startY');
		    if(self.get('isSelect')){
		    	if(selectDiv.hasClass('hide')) selectDiv.removeClass('hide');
		      
		      	var posX = posXY(ev).x;
		      	var poxY = posXY(ev).y;
		      
		      	selectDiv.css('left', Math.min(posX, startX) + 'px');
		     	selectDiv.css('top', Math.min(poxY, startY) + 'px');
		    	selectDiv.css('width', Math.abs(posX - startX) + 'px');
		     	selectDiv.css('height', Math.abs(poxY - startY) + 'px');  
		     
		     	
		   }
		},
		onEnd: function() {
			var self = this,
				selectDiv = self.get('selectDiv'),
				regions = $(self.get('regionCls')),
				selectedCls = self.get('selectedCls'),
				selectedRegions = self.get('selectedRegions');
			//console.log(regions[0]);
			S.each(regions, function(r) {
				var sr = self.innerRegion(selectDiv, r);
				// console.log(sr);
				sr && selectedRegions.push(r);
			});
			self.set('selectedRegions', selectedRegions);
			self.set('isSelect', false);
			selectDiv.addClass('hide');
			// console.log(selectedRegions);
			self.fire(RegionSelector.event.SELECTED, {'selected': selectedRegions});
			self.set('selectedRegions', []);
			// self._displaySelected();
		},
		innerRegion: function(selDiv, region) {
			region = $(region);
			var s_top = parseInt(selDiv.css('top'));
			var s_left = parseInt(selDiv.css('left'));
			var s_right = s_left + parseInt(selDiv.width());
			var s_bottom = s_top + parseInt(selDiv.height());
			// console.log(s_top, s_left);

			var r_top = parseInt(region.offset().top);
			var r_left = parseInt(region.offset().left);
			var r_right = r_left + parseInt(region.width());
			var r_bottom = r_top + parseInt(region.height());
			// console.log(r_top, r_left);


			var t = Math.max(s_top, r_top);
			var r = Math.min(s_right, r_right);
			var b = Math.min(s_bottom, r_bottom);
			var l = Math.max(s_left, r_left);

			// console.log(b, t, r, l);

			if (b > t+5  &&  r > l+5) {
				return region;
			} else {
				return null;
			}
		},
		clearSelections: function(regions) {
			for(var i=0; i<regions.length;i++){
				regions[i].removeClass(self.config.selectedClass);
     			regions[i].className = regions[i].className.replaceAll(this.selectedClass,"");
    		}
		},
		_createSelContainer: function() {
			var self = this,
				tpl = self.get('tpl'),
				selContainer = $(tpl);
			selContainer.addClass(self.get('selContainerCls'));
			selContainer.appendTo(document.body);
			self.set('selectDiv', selContainer);
		},
		_displaySelected: function(selected) {
			var self = this,
				selectedRegions = self.get('selectedRegions'),
				selectedCls = self.get('selectedCls');
			if(selected) selectedRegions = [selected];	
			S.each(selectedRegions, function(r) {
				r = $(r);
				if(r.hasClass(selectedCls)) {
					r.removeClass(selectedCls);
				}else {
					r.addClass(selectedCls);
				}
			});
			selectedRegions = [];
			self.set('selectedRegions', selectedRegions);
		}
	}, {
		ATTRS: {
			selectedRegions: {
				value: []
			},
			selectDiv: {
				value: null
			},
			startX: {
				value: null
			},
			startY: {
				value: null
			},
			tpl: {
				value: '<div></div>'
			},
			selContainerCls: {
				value: 'select-container'
			}
		}
	});


	return RegionSelector;
});