/**
 * @fileoverview Countdown
 * @desc 实用的倒计时组件。
 *       传统的倒计时组件通常的做法是在实例化的时候初始化一个计时器，然后将操作放在回调函数中，这么做有2个缺点
 *       1.灵活性差，所有的操作都写在回调中
 *       2.回调中操作耗时，会导致倒计时不准。请参考定时器工作原理http://www.cnblogs.com/rainman/archive/2008/12/26/1363321.html
 *       simplecountdown实现原理很简单，实例化的时候记录开始时间和结束时间，可能根据实际情况实时fetch剩余事件
 * @author 常胤<satans17@gmail.com>
 * @date 20110604
 * @version 1.0
 * @depends kissy core
 */
KISSY.add("gallery/easycountdown/1.0/easycountdown",function(S, undefined){
    var $ = S.all, DOM = S.DOM,
		//时间单位
		timeUnitsKey = ["d","h","m","s","i"],
		//时间单位对应的毫秒数
        timeUnits = {
            "d": 86400000,//24*60*60*1000,
            "h": 3600000,//60*1000*60
            "m": 60000,//60*1000
            "s": 1000,
            "i":1
        },
        //字符串格式的时间,暂时只支持1900-12-12 12:12:12 这种格式
        parseDate = function(str){
			if(S.isDate(str)){
				return str;
			}else if(/^(\d{4})\-(\d{1,2})\-(\d{1,2})(\s+)(\d{1,2}):(\d{1,2}):(\d{1,2})$/ig.test(str.replace(/\./g,"-"))){
                var d = str.match(/\d+/g);
                return new Date(d[0],d[1]-1,d[2],d[3],d[4],d[5]);
            }else{
                return null;
            }
        };




    /**
     * Count down core
     * @param finish {Date | Number} 结束时间|剩余时间
     * @param config {Object} 配置项
     */
    function Core(finish,config){
        var self = this;
            cfg = {
				//开始时间
                timeBegin: new Date(),
				//校准url
                collateurl:"#",
                //校准指
				collateval:0
            };

		/**
		 * 记录开始计时时间
		 */
        self._timeStart = new Date();
		
		/**
		 * 配置
		 */
        self.config = S.merge(cfg,config||{});

		/**
		 * 剩余时间
		 */
        self.timeRemain = self._countTime(finish);	
		
    }

    Core.prototype = {
        // 计算剩余时间
        _countTime: function(finish){
            var self = this, cfg = self.config,
                begin = cfg.timeBegin,
                end = 0;

			
				
            //finish为Date类型
            if(S.isDate(finish)){
                finish = finish;
            }
            //finish为字符串日期类型
            else if(parseDate(finish)){
                finish = parseDate(finish);
            }
            //直接配置剩余时间，剩余毫秒数
            else if(!isNaN(parseInt(finish))){
                finish = parseInt(finish);
            }
            //没有配置正确的剩余时间就设置为0
            else {
                return -1;
            }

            //计算剩余时间 都为Date类型
            if( S.isDate(finish) && S.isDate(parseDate(begin)) ){
                end = finish - parseDate(begin);
            }
            //都为int类型
            else if(S.isNumber(finish) && S.isNumber(begin)){
                end = finish - begin;
            }
			//begin为Date，end 为int
			//else if(S.isNumber(finish) && S.isDate(begin)){
			//	end = finish;
			//}
			else if(S.isNumber(finish)){
				end = finish
			}

            return end;
        },

        /**
         * 获取剩余时间,不依赖计时器,简单，方便，实用
         */
        getRemain: function(){
            var time = parseInt(this.timeRemain-(new Date()-this._timeStart));
            if(isNaN(time) || time<=0){
                return 0;
            }else{
                return time;
            }
        },

        /**
         * 格式化剩余时间
         * @param time 需要格式化的毫秒数
         * @param 按照你配置timeUnitsKey进行格式化
         */
        format: function(time /*timeUnitsKey*/){
            var units = Array.prototype.slice.call(arguments, 1);
            var result = [];
            S.each(units,function(unit){
               if(timeUnits[unit]){
                   var t = Math.floor(time/timeUnits[unit]);
                   time = time - t*timeUnits[unit];
                   result.push(t);
               }
            });
            return result;
        },

        /**
         * 相当于传统定时器的那个回调,使用这个方法，可以自定义出任何你想要的显示想过
         * @param interval 间隔时间
         * @param run 计时进行中的回调方法
         * @param finish 计时结束后的回调方法
         */
        fetch: function(interval,run,finish){
            var self = this,
                timer = setInterval(function(){
                    var remain = self.getRemain();
                    if(remain>0){
                        run && run.call(self,remain);
                    }else{
                        run && run.call(self,0);
                        finish && finish.call(self);
                        clearInterval(timer);
                    }
                },interval);
            return timer;
        }

    }


    /**
     * Countdown widget
     * @param container 计时器显示的容器
     * @param finish 结束时间
     * @param config 其他配置
     */
    function EasyCountdown(container,finish,config) {
        var cfg = S.merge(EasyCountdown.Config,config||{});

        //校验fun & end 回调
        if(cfg.run && !S.isFunction(cfg.run)){
            delete cfg.run;
        }
        if(cfg.end && !S.isFunction(cfg.end)){
            delete cfg.end;
        }

        //校验定时器
        if(!S.isNumber(cfg.interval)){
            cfg.interval = 200;
        }

        EasyCountdown.superclass.constructor.call(this, finish, cfg);
        this.counter(container);
    }

    /**
     * 默认配置
     */
    EasyCountdown.Config = {
        "prefix": "ks-",
        "interval": 1000,
        "minDigit": 2,
        "timeRunCls": 'countdown-run',
        "timeEndCls": 'countdown-end',
        "timeUnitCls" : {"d": "d", "h": "h", "m": "m", "s": "s", "i": "i"}
    }

    //继承Count down Core
    S.extend(EasyCountdown, Core, {
        counter: function(container){
            var self = this,
                cfg = self.config,
                div = [],
                keys = [],
                //计时器过程中的回调
                run = function(time){
                    var args = [time].concat(keys), times = self.format.apply(self,args);
                    S.each(div,function(item,index){
                        item.text(times[index]);
                    })
                    cfg.run && cfg.run.call(self,args,times);
                },
                //计时器结束回调
                end = function(){
                    runDiv.hide();
                    endDiv.show();
                    cfg.end && cfg.end.call(self);
                },
                //class前缀
                prefix = cfg.prefix,
                //时间单位对应的class
                timeUnitCls = cfg.timeUnitCls,
                //容器
                container = $(container),
                //计时过程中显示的div
                runDiv = container.all("."+prefix+cfg.timeRunCls),
                //及时结束后显示的div
                endDiv = container.all("."+prefix+cfg.timeEndCls);

            //获取用户通过el.class配置要格式化的时间格式
            S.each(timeUnitsKey,function(unit){
                var el =  container.all("."+prefix+timeUnitCls[unit]);
                if(timeUnitCls[unit] && el.length>0){
                    div.push(el);
                    keys.push(unit);
                }
            });

            //开始计时动作
            runDiv.show();
            endDiv.hide();
            self.fetch(cfg.interval,run,end);
        }
    });



    /**
     * 取服务器当前时间,为了校准
     * @param url
     * @param callback
     */
    function getServerTime(url,callback){
        var times = 0;
        function chktime(request,date){
            if(request<1000){
                callback(date)
            }else{
                if(times<3){
                    act();
                }else{
                    callback(new Date(date.setMilliseconds(date.getMilliseconds()+request/2)))
                }
            }
        }
        function act(){
            var flag = new Date();
            times++;
            S.io({
                url:url,
                type:'HEAD',
                success:function(d,s,xhr){
                    chktime(new Date()-flag,new Date(xhr.getResponseHeader('date')));
                },
                error:function(){
                    chktime();
                },
                cache:false
            });
        }
        act();
    }


    /**
     * 类似Switchable的autoRender
     * @param hook
     * @param container
     * @param url
     */
    function autoRender(hook, container, url){
        hook = '.' + (hook || 'J_TWidget');
        var f = function(timeBegin){
            S.query(hook, container).each(function(elem) {
                var type = DOM.attr(elem,"data-widget-type"),
                    config = DOM.attr(elem,"data-widget-config");
                if(type!=="Countdown"){
                    return;
                }
                if(S.isNull(config)){
                    config = {};
                }else{
                    config = JSON.parse(config.replace(/'/g, '"'));
                }
                if(timeBegin && S.isDate(timeBegin)){
                    config.timeBegin = timeBegin;
                }
				
                new EasyCountdown(elem,config.endTime,config);
            });
        };
        if(url){
            getServerTime(url,f)
        }else{
            f();
        }
    }



    EasyCountdown.autoRender = autoRender;
    EasyCountdown.Core = Core;
    EasyCountdown.getServerTime = getServerTime;
    return EasyCountdown;

});KISSY.add("gallery/easycountdown/1.0/index",function(S, SimpleCountdown){
    return EasyCountdown;
}, {
    requires:["./easycountdown"]
});
