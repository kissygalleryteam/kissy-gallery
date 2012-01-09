
KISSY.add("gallery/grid/1.0/calendar",function(S,Calendar){
	function calendar(list){
		var DOM = S.DOM 
			Event = S.Event,
			date = {} ;
		S.each(list,function(item){
			var node = DOM.get(item.selector);
			if(!node) return ;
			
			//给时间控件添加小按钮，设置长度,取消只读
			var timeInput = S.one(item.selector);
			if(timeInput.hasAttr('readonly')){
				timeInput.removeAttr('readonly');
			}
			if(!timeInput.hasClass('ks-select-calendar')){
				timeInput.addClass('ks-select-calendar');
			}
			if(item.showTime){
				if(!timeInput.hasClass('calendar-time')){
					timeInput.addClass('calendar-time');
				}
			}
			var datatime ,
				method = item.showTime ? "timeSelect" : "select" ,
				format = item.showTime ? "yyyy-mm-dd HH:MM:ss" : "yyyy-mm-dd",
				min = item.min ? showdate(item.min, new Date()) : (item.min == 0 ? new Date() : null ) ,
				max = item.max ? showdate(item.max, new Date()) : (item.max == 0 ? new Date() : null );
				
			if(item.config){
				datatime = new S.Calendar(item.selector,item.config) ;
			}
			else{
				var selected = Date.parse(DOM.val(item.selector).replace(/\-/g,"/"));
				datatime = new S.Calendar(item.selector,{
					minDate:min,
					maxDate:max,
					selected:selected ? new Date(selected) : null ,
					showTime:item.showTime,
					popup:true,
					triggerType:['click']
				});
			}
			datatime.on(method,function(ev){
				var p = DOM.get(item.selector) ;
				DOM.val(p,getDate(ev.date)) ;
				this.hide();
				p.focus();
			});

			Event.on(item.selector,"valuechange",function(ev){
				if(!(ev.keyCode == 8 || ev.keyCode == 46)){
					DOM.val(this,"");
				}
			});

			function getDate(date){
				return Calendar.Date.format(date,format)
			}

			date[item.selector] = datatime ;
		});

		return date;
	}

	var showdate = function(n, d) {//计算d天的前几天或者后几天，返回date,注：chrome下不支持date构造时的天溢出
        var uom = new Date(d - 0 + n * 86400000);
        uom = uom.getFullYear() + "/" + (uom.getMonth() + 1) + "/" + uom.getDate();
        return new Date(uom);
	}

	return calendar;

},{requires: ["calendar"]});