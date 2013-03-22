KISSY.add('gallery/kcharts/1.0/legend/index',function(S,HtmlPaper,Raphael,Template){

	var $ = S.all,
		Evt = S.Event;

	function Legend(cfg){
		var self = this;

		self._cfg = S.mix({
			themeCls:"ks-charts-legend",
			css:{},
			iconType:"rect",
			evtBind:false  //为了向前兼容
		},cfg);

		self.init();
	}

	S.augment(Legend,{
		init:function(){
			var self = this,
				_cfg = self._cfg,
				chart = _cfg.chart,
				len = 0;

			if(_cfg.container){
				self.$ctn = $(_cfg.container);

				if(!self.$ctn[0]) return;
			}
			self._infos = {};
			for(var i in chart._datas['total']){
				len +=1;
			}
			S.log(chart.color.getColors(0,len))
			S.mix(self._infos,{
				colors:chart.color.getColors(0,len),
				series:chart._cfg.series
			});
			self.render();
		},
		render:function(){
			var self = this,
				_cfg = self._cfg,
				chart = _cfg.chart,
				ictn = chart._innerContainer;

			self._html = "<div class="+_cfg.themeCls+"><ul>";
			
			self.createIcon(_cfg.iconType);

			self._html += "</ul></div>";

			$(self._html).appendTo(self.$ctn);

			self.$legend = $("."+_cfg.themeCls,self.$ctn);

			self.renderIcon();

			self.$legend.css({
				marginLeft:ictn.width,
				marginTop:0
			}).css(_cfg.css);
			_cfg.evtBind && chart.on("afterRender",function(){
				self.bindEvt();
			});
			S.log(self)
		},
		renderIcon:function(){
			var self = this;

			if(self._cfg.iconType != "rect"){
				$(".legend-icon",self.$legend).each(function(obj,index){
					var color = self._infos.colors[index]['DEFAULT'];
					var paper = Raphael(this[0]);
					paper.circle(5,5,3).attr({
						fill:color,
						"stroke":color
					});
					paper.path("M0,5L10,5").attr({
						"stroke":color,
						"stroke-width":2
					});
			});	
			}
		},
		createIcon:function(iconType){
			var self = this;
			if(iconType == "rect"){
				self.createHtmlIcon();
			}else{
				self.createCanvasIcon();
			}
		},
		//矢量图标
		createCanvasIcon:function(){
			var self = this,
				_cfg = self._cfg,
				chart = _cfg.chart,
				_infos = self._infos;
			for(var i in chart._datas['total']){
				var defaultColor = _infos['colors'][i]['DEFAULT'],
					hoverColor = _infos['colors'][i]['HOVER'];

				var	cls = _infos['series'][i]['isShow'] == false ? "clearfix disable" : "clearfix";

				self._html += Template("<li class="+cls+"><div class='legend-icon'></div><div class='legend-text'>{{text}}</div></li>").render(_infos['series'][i]);
			}
		},
		//html图标
		createHtmlIcon:function(){
			var self = this,
				_cfg = self._cfg,
				chart = _cfg.chart,
				_infos = self._infos;
			for(var i in chart._datas['total']){
				var defaultColor = _infos['colors'][i]['DEFAULT'],
					hoverColor = _infos['colors'][i]['HOVER'];

				var	cls = _infos['series'][i]['isShow'] == false ? "clearfix disable" : "clearfix";

				self._html += Template("<li class="+cls+"><div class='legend-icon' style='background-color:"+defaultColor+"''></div><div class='legend-text'>{{text}}</div></li>").render(_infos['series'][i]);
			}
		},
		destroy:function(){
			var self = this;
			//unbind evt
			Evt.detach($("li",_cfg.container),"click");
			//clear node
			self.$ctn.html("");
		},

		bindEvt:function(){
		  var self = this,
		  	  _cfg = self._cfg,
				chart = _cfg.chart,
				chartType = chart.chartType,
				$ctn = self.$ctn;

		  Evt.on($("li",$ctn),"click",function(e){
	          var $li = $(e.currentTarget).toggleClass("disable"),
	          	  index = S.indexOf(e.currentTarget,$("li",$ctn));
	          if(!$li.hasClass("disable")){
	            "linechart" === chartType && chart.showLine(index);
	            "barchart" === chartType && chart.showBar(index);
	          }else{
	            "linechart" === chartType && chart.hideLine(index);
	            "barchart" === chartType && chart.hideBar(index);
	          }
	      });
		}
	});

	return Legend;

},{requires:['gallery/kcharts/1.0/tools/htmlpaper/index','gallery/kcharts/1.0/raphael/index','gallery/template/1.0/index','./assets/legend.css']});