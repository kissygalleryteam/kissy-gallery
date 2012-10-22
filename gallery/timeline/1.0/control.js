/**
 * User: g.gaokai@gmail.com
 * Date: 12-09-16
 * describe: timeline control center
 */

KISSY.add('gallery/timeline/1.0/control', function(S, Base, BG, Toolbar, MainContent, DD, TrackConfig){
  var $ = S.all;

  var reg_songtime = /(\d{4})(\d{1,2})?(\d{1,2})?/;

  var ATTRS = {
  };

  function Control(config){
    this.config = config;
    this.ATTRS = S.clone(ATTRS);
    this._init();
  }


  var o = {
    _init: function(){
      var self = this, config = self.config;

      config.trackConfig = S.clone(TrackConfig);
      config.trackConfig.setData(config.data);
      config.trackConfig.config({
        minRate: config.minRate
        ,maxRate: config.maxRate
        ,scale: config.scale
      });
      config.trackConfig.initAll(config.panel);

      //实例化 各组成插件
      self.set('bg', new BG(config));
      self.set('toolbar', new Toolbar(config));
      self.set('mainContent', new MainContent(config));
      self.set('dd', new DD(config.panel, {
        'dragEle': '.K_Timenav'
      }));
      
      //开始插件的事件调度
      self.monitorEvent();

      self.get('mainContent').renderMarkers( self.transAjaxData(config.data) );
      self.get('mainContent').renderInterval();

      var trackConfig = config.trackConfig;
      self.set('maxRate', Math.pow(2,trackConfig.maxRate-1)*trackConfig.rate);
      self.set('minRate', Math.pow(0.5,trackConfig.minRate-1)*trackConfig.rate);
      
      // dd event handle
      self.get('dd').on('moving', function(e){
        self.get('mainContent').rigidResetOffset({
          left: e.ox
        });
      });

      self.get('dd').on('mouseup', function(e){
        // console.log('-----------------------mouseup');
        // console.log(e.offset.ox, e.offset.oy);
        // console.log('-----------------------mouseup');
        if( !e.buffer){
          return ;
        }
        self.get('mainContent').dragBuffer({
          'duration': e.buffer.duration
          ,'addLeft': e.buffer.addLeft
        });
      });
    }

    //转化为可供maincontent.js渲染markers 的数据格式
    ,transAjaxData: function(data, reRender){
      var self = this, ret = [];

      for(var i = 0; i < data.length; ++i){
        if(data[i].hidden && data[i].hidden == true){
          continue;
        }
        ret.push(S.merge(data[i], {__left: self.timeToPosLeft(data[i].time)}));
      }
      return ret;
    }

    //根据年份（月份，日等）计算，这个marker的偏移值
    ,timeToPosLeft: function(time){
      var self = this, config = self.config, left = 0;
      var regRet = time.match(reg_songtime)
      ,year = config.trackConfig.beginYear
      , month = 0, date = 0;

      if( regRet[1] ){
        year = regRet[1];
      }
      if( regRet[2] ){
        month = regRet[2];
      }
      if( regRet[3] ){
        date = regRet[3];
      }

      left = (year - config.trackConfig.beginYear + month / 12 + date / 12 / 30) * config.trackConfig.widthRate;

      return left;
    }
    ,_timeToPosTop: function(time){

    }

    //控制调度器
    ,monitorEvent: function(){
      var self = this, config = self.config;
      var trackConfig = config.trackConfig;
      $(document).on('resize', function(e){
        trackConfig.initAll(config.panel);
      });

      var isToggling = false, type = 1;
      self.get('toolbar').on('toggle', function(e){
        if( isToggling == true){
          return false;
        }
        else if(type == 0){
          var left = 0;
          type = 1;
        }
        else if(type == 1){
          var left = $(document.body).width()
          type = 0;
        }
        isToggling = true;
        $('#KT_Navigation').animate({
          left: left
        }, 1 , 'swing', function(){
          isToggling = false;
        });
      });

      self.get('toolbar').on('large', function(e){
        if( trackConfig.rate > self.get('maxRate') || trackConfig.isScaling === true){
          return;
        }
        trackConfig.largeRate( this.config.panel );
        self.get('mainContent').rate(2);
      });

      self.get('toolbar').on('mini', function(e){
        if( trackConfig.rate < self.get('minRate') || trackConfig.isScaling === true){
          return ;
        }
        trackConfig.miniRate(config.panel);
        self.get('mainContent').rate(1/2);
      });

      self.get('toolbar').on('leftScroll', function(e){
        self.get('mainContent').leftScroll();
      });

      self.get('toolbar').on('rightScroll', function(e){
        self.get('mainContent').rightScroll();
      });

      self.get('toolbar').on('gotoLast', function(e){
        self.get('mainContent').switchTo(config.data.length-1);
      });

      //异步获取数据，填充主内容区
      self.get('mainContent').on('marker', function(e){
        self.fire('change',{
          data: e.data
          ,target: e.target
        });
      });

      self.get('mainContent')

    }

    //外部接口
    ,prev: function(){
      this.get('mainContent').prev();
    }
    ,next: function(){
      this.get('mainContent').next();
    }
    ,switchTo: function(idx){
      this.get('mainContent').switchTo(idx);
    }
    ,resetWidth: function(w){
      this.get('mainContent').adjustStyle();
      this.get('bg').adjustStyle();
    }
  };

  S.augment(Control, Base, S.EventTarget, o);

  return Control;

},{
  attach: false
  ,requires: ['./base', './background', './toolbar', './main-content', './dd', './config']
});