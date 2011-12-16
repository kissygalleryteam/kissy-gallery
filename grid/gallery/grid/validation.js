/*
	新增校验规则
*/
KISSY.add("gallery/grid/validation",function(S, Validation) {

	var DOM = S.DOM, Event = S.Event ;

	Validation.Rule.add('dateCompare','',function(value,text,config){
		var startDate = Date.parse(DOM.val(config.start).replace(/\-/g,"/")),
			endDate = Date.parse(DOM.val(config.end).replace(/\-/g,"/")) ;
		if(!startDate){
			return config.startText ? config.startText : "请输入有效的开始时间!" ;
		}
		else if(!endDate){
			return config.endText ? config.endText : "请输入有效的结束时间!" ;
		}
		else if(startDate > endDate){
			return config.bigText ? config.bigText : "开始时间不能大于结束时间!" ;
		}
	});

	Validation.Rule.add('date','请输入有效的时间!',function(value,text,isDate){
		if(isDate){
			var time = Date.parse(value.replace(/\-/g,"/"));
			if(!time){
				return text;
			}
		}
	});

	Validation.Rule.add("cardId","身份证号码不正确",function(value,text){
		if(!(/^(\d{6})(18|19|20)?(\d{2})([01]\d)([0123]\d)(\d{3})(\d|x|X)?$/.test(value))){
			return text;
		}
	});

	Validation.Rule.add('grouprequires','体积填写不正确！',function(value,text,group){
		var flag = "" ;
		S.each(group,function(item){
			if(flag) return ; 
			var node = DOM.get(item),
				val = DOM.val(node);
			if(!(/^\d+(\.\d+)?$/.test(val))){
				flag = text ;
				return ;
			}
			else if(val.length > 9){
				flag = "长度不能大于9个字符！" ;
				return ;
			}
		});
		if(flag) return flag ;
	});

	Validation.Rule.add('exclude','不能包含关键字{0}。',function(value,text,key){
		var flag = "" ;
		S.each(key,function(val){
			if(new RegExp(val,"ig").test(value)){
				flag = Validation.Util.format(text,val);
				return ;
			}
		});
		return flag ;
	});

	Validation.Rule.add('empty','不能为空！',function(value,text){
		if(!S.trim(value)){
			return text;
		}
	});

	Validation.Rule.add('unique','不能有重复项！',function(value,text,itemList){
		var flag = 0 ,
			DomList = DOM.query(itemList) ;
		S.each(DomList,function(item){
			if(S.trim(value) === S.trim(DOM.val(item))){
				flag ++ ;
			}
		});
		if(flag > 1) return text ;
	});

	var symbol = Validation.Define.Const.enumvalidsign;

	function FloatTips() {
        return {
            init: function() {
                var self = this, tg = self.target,
                    panel,label,estate,tipBox;

                panel = DOM.create(self.template);
                estate = DOM.get('.estate', panel),
				label = DOM.get('.label', panel),
				tipBox = DOM.get(".float-tip-box", panel);
                tg.parentNode.appendChild(panel);
                DOM.hide(panel);
				DOM.hide(tipBox) ;

                S.mix(self, {
                        panel: panel,
                        estate: estate,
                        label: label
                    });

                self._bindEvent(self.el, self.event, function(ev) {
                    var result = self.fire("valid", {event:ev.type});
                    if (S.isArray(result) && result.length == 2) {
                        self.showMessage(result[1], result[0], ev.type);
                    }
                });

				Event.on(panel,'mouseenter',function(){
					if(self.result != symbol.ok){
						DOM.show(tipBox);
					}
				});
				Event.on(panel,'mouseleave',function(){
					DOM.hide(tipBox) ;
				});
            },

            showMessage: function(result, msg) {
                var self = this,
                    panel = self.panel, estate = self.estate, label = self.label;

				self.result = result ;

                if (self.invalidClass) {
                    if (result == symbol.ignore && result == symbol.ok) {
                        DOM.removeClass(self.el, self.invalidClass);
                    } else {
                        DOM.addClass(self.el, self.invalidClass);
                    }
                }

                if (result == symbol.ignore) {
                    DOM.hide(panel);
                } else {
                    var est = "error";
                    if (result == symbol.error) {
                        est = "error";
                    } else if (result == symbol.ok) {
                        est = "ok";
                    } else if (result == symbol.hint) {
                        est = "tip";
                    }
                    DOM.removeClass(estate, "ok tip error");
                    DOM.addClass(estate, est);
                    DOM.html(label, msg);
                    DOM.show(panel);
                }
            },

            style: {
                floatTips: {
                    template: '<span class="validation-float-tips"><span class="estate"><em class="estate-icon"></em><span class="float-tip-box"><label class="label"></label><span class="pointyTipShadow"></span><span class="pointyTip"></span></span></span></span>',
                    event: 'focus blur keyup'
                }
            }


        };
    }

	Validation.Warn.extend("floatTips",FloatTips);

	return Validation;

}, { requires: ["validation"] });