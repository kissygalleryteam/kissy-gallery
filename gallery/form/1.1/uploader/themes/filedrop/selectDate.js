KISSY.add(function(S, Calendar) {
	var $ = S.all;

	var SelectDate = function(config) {
		var self = this;
		config = S.merge(SelectDate.config, config);
		SelectDate.superclass.constructor.call(self, config);
	};

	var getFormatDate = function(d) {
		if(!d) return '';
		return d.getFullYear() + '/' + d.getMonth() + '/' + d.getDate();
	}

	S.extend(SelectDate, S.Base, {
		render: function() {
			var self = this,
				trigger = $(self.get('triggerCls')),
				rangeDate = self._getRangeDate(),
				c;
			c = new Calendar(self.get('triggerCls'), {
	                popup:true,
	                triggerType:['click'],
	                closable:false,
	                pages:2,
	                range: rangeDate,
	                rangeSelect:true
	            }).on('rangeSelect', function(ev) {
	            	self._selectHandle(ev.start, ev.end);
					// console.log(getFormatDate(ev.start), getFormatDate(ev.end));
				}).on('select', function(ev) {
	            	self._selectHandle(ev.date);
					// console.log(ev.date.getFullYear() + '-' + ev.date.getMonth() + '-' + ev.date.getDate());
				});
			self.set('calendar', c);
			self._displaySelectRange();
		},
		_getRangeDate: function() {
			// console.log($(this.get('triggerCls')));
			var self = this,
				trigger = $(self.get('triggerCls')),
				data = S.JSON.parse(trigger.attr('data-date')),
				start = data.start,
				end = data.end;
				// t = new Date();
				// console.log(data);
				start = start.split('-');
				 data.start = new Date();
				data.start.setFullYear(start[0], start[1], start[2]);
				end = end.split('-');
				 data.end = new Date();
				data.end.setFullYear(end[0], end[1], end[2]);
				// console.log(data);
			return data;
		},
		_bind: function() {
			var self = this,
				c = self.get('calendar');
			console.log(c);
			// c.on('rangeSelect', function(ev) {
			// 	console.log(ev.start, ev.end);
			// });
		},
		_selectHandle: function(start, end) {
			var self = this,
				range = self.get('range');
			// console.log(range);
			if(!end && !range.end) {
				range.end = getFormatDate(start);
			}
			range.start = getFormatDate(start);
			range.end = getFormatDate(end);
			self.set('range', range);
			self._displaySelectRange();
		},
		_displaySelectRange: function(){
			var self = this,
				range = self.get('range'),
				tpl = self.get('tpl'),
				dateRange = $(self.get('dateRangeCls')),
				startDateInput = $(self.get('startDateId')),
				endDateInput = $(self.get('endDateId')),
				html;
			startDateInput.val(range.start);
			endDateInput.val(range.end);
			tpl = tpl[range.start ? 'range' : 'waiting'];
			// console.log(tpl, S.substitute(tpl, range));
			html = S.substitute(tpl, range);
			dateRange.html(html);
			// dateRange.append(html);
		}
	}, {
		ATTRS: {
			tpl: {
				value: {
					waiting: '选择时间范围&nbsp;&nbsp;',
					range: '{start}&nbsp;&nbsp;--&nbsp;&nbsp;{end}&nbsp;&nbsp;',
				}
			},
			range: {
				value: {}
			}
		}
	});

	return SelectDate;
}, {
	requires: ['calendar']
});