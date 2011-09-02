/**
 * @fileoverview Countdown
 * @desc function 倒计时组件
 * @author 常胤<satans17@gmail.com>
 */
 


KISSY.add("gallery/countdown",function(S){
    
    var DOM = S.DOM,
        timeUnits = {
            "d": 86400000,//24*60*60*1000,
            "h": 3600000,//60*1000*60
            "m": 60000,//60*1000
            "s": 1000,
            "i":1
        },
        timeUnitsKey = ["d","h","m","s","i"];

    /**
     * count down core
     * @param finish {Date | Number} 结束时间|剩余时间
     * @param config {Object} 配置项
     */
    function Core(finish,config){
        var self = this;
            //default config
            cfg = {
                timeBegin: 0,
                collateurl:"",
                collateval:0
            };

        self.timeStart = new Date();
        self.config = S.merge(cfg,config||{});

        self._countTime(finish);
    }

    Core.prototype = {

        // 计算时间
        _countTime: function(finish){
            var self = this, cfg = self.config,
                begin = cfg.timeBegin, end = 0;
            if(/^(\d{4})\-(\d{1,2})\-(\d{1,2})(\s+)(\d{1,2}):(\d{1,2}):(\d{1,2})$/ig.test(finish.replace(/\./g,"-"))){
                var d = finish.match(/\d+/g);
                finish = new Date(d[0],d[1]-1,d[2],d[3],d[4],d[5]);
            }else if(/^\d+&/.test(finish)){
                finish = parseInt(finish);
            }

            if(S.isNull(begin) || isNaN(begin) || begin <= 0){
                if(S.isDate(finish)){
                    end = finish-new Date();
                }else{
                    end = parseInt(finish);
                }
            }else{
                end = (typeof begin == typeof finish)?finish-begin:0;
            }
            if(!S.isNumber(end) || end<0){
                end = 0;
            }
            self.timeRemain = end;
        },

        getRemain: function(){
            var time = parseInt(this.timeRemain-(new Date()-this.timeStart));
            if(isNaN(time) || time<=0){
                return 0;
            }else{
                return time;
            }
        },

        format: function(time){
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
        }

    }







    function Countdown(container,finish,config) {
        var timeUnitCls = {
                "d": ".ks-d", "h": ".ks-h", "m": ".ks-m", "s": ".ks-s", "i": ".ks-i"
            },
            def = {
                "interval": 1000,
                "timeUnitCls":timeUnitCls,
                "minDigit": 2,
                "timeRunCls": '.ks-countdown-run',
                "timeEndCls": '.ks-countdown-end'
            },
            cfg = S.merge(def,config);

            if(cfg.run && !S.isFunction(cfg.run)){
                delete cfg.run;
            }

            if(cfg.end && !S.isFunction(cfg.end)){
                delete cfg.end;
            }

            cfg.interval = parseInt(cfg.interval);
            if(isNaN(cfg.interval) || cfg.interval<200){
                cfg.interval = 200;
            }

        Countdown.superclass.constructor.call(this, finish, cfg);
        this.counter(container);
    }

    S.extend(Countdown, Core,{
        counter: function(container){
            var self = this, cfg = self.config,

                run = function(time){
                    var args = [time].concat(keys),
                        times = self.format.apply(this,args);
                    S.each(div,function(item,index){
                        item.text(times[index]);
                    })
                    cfg.run && cfg.run.call(self,args,times);
                },

                end = function(){
                    runDiv.hide();
                    endDiv.show();
                    cfg.end && cfg.end.call(self);
                },

                timeUnitCls = cfg.timeUnitCls,
                container = S.one(container),
                runDiv = container.all(cfg.timeRunCls), endDiv = container.all(cfg.timeEndCls),

                div = [],keys = [];

            S.each(timeUnitsKey,function(unit){
                if(timeUnitCls[unit] && container.one(timeUnitCls[unit])){
                    div.push(container.one(timeUnitCls[unit]));
                    keys.push(unit);
                }
            });

            runDiv.show();
            endDiv.hide();
            self.fetch(cfg.interval,run,end);

        }
    });


    function getServerTime(url,callback){
        var f = function(d){
            if(!S.isDate(d)){
                d = new Date();
            }
            if(S.isFunction(callback))callback(d);
        };
        S.io({
            url:url,
            type:'HEAD',
            success:function(d,s,xhr){
                f(new Date(xhr.getResponseHeader('date')));
            },
            error:function(){
                f(new Date());
            },
            cache:false
        });
    }

    /**
     * 取服务器当前时间
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
                new S.Gallery.Countdown(elem,config.endTime,config);
            });
        };
        if(url){
            getServerTime(url,f)
        }else{
            f();
        }
    }



    Countdown.autoRender = autoRender;
    Countdown.Core = Core;
    Countdown.getServerTime = getServerTime;
    //S.Countdown = Countdown;
	S.namespace('Gallery');
	S.Gallery.Countdown = Countdown;
    return Countdown;

});