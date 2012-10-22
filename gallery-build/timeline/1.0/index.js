/**
 * User: g.gaokai@gmail.com
 * Date: 12-09-16
 * describe: timeline background 
 */

KISSY.add('gallery/timeline/1.0/background', function(S, Base, TT){
  var $ = S.all;
  var ATTRS = {
    html: {
      /*
      value: '<div class="timenav-bg">\
                <div class="top-highlight"></div>\
                <div class="bottom-highlight"></div>\
                <div class="middle-line K_MiddleLine"></div>\
                <div class="timenav-indicator K_Indicator"><i></i></div>\
              </div>'
              */
      value: '<div class="timenav-bg">\
                <div class="middle-line K_MiddleLine"><i></i></div>\
              </div>'
    }
    ,bgBox: {
      value: null
    }
    ,middleLine: {
      value: null
    }
    ,indicator: {
      value: null
    }
  };

  function BG(config){
    this.config = config;

    this.ATTRS = S.clone(ATTRS);
    
    this._init();

  }


  var o = {
    
    _init: function(){
      var self = this, config = self.config;

      self.render();

      self.adjustStyle();

      self.monitorEvent();

    }

    ,render: function(){
      var self = this, config = self.config;
      self.set('bgBox', $( self.get('html') ));
      self.get('bgBox').appendTo(config.panel);

      self.set('middleLine', $('.K_MiddleLine', self.get('bgBox')));


      self.fire('uiReady');
    }

    ,adjustStyle: function(info){
      var self = this, config = self.config;

      //中间线
      self.get('middleLine').css('left', ( self.config.panel.width() - self.get('middleLine').width() )/2 - 1);

      self.fire('styleReload');
    }

    ,monitorEvent: function(){
      var self = this, config = self.config;
      $(window).on('resize', function(){
        self.adjustStyle();
      });
    }

  };

  S.augment(BG, Base, S.EventTarget, o);

  return BG;

},{
  attach: false,
  requires: ['./base', 'template']
});/**
 * User: g.gaokai@gmail.com
 * Date: 12-09-16
 * describe: timeline base 
 */

KISSY.add('gallery/timeline/1.0/base', function(S){
  function Base(){

  }
  Base.prototype = {
    get: function(key){
      var ATTRS = this.ATTRS;
      if( undefined === ATTRS[key] ){
        return undefined;
      }
      if( S.isObject( ATTRS[key] ) ){
        if( S.isFunction(ATTRS[key].value)){
          return ATTRS[key].value();
        }
        else{
          return ATTRS[key].value;
        }
      }
      else{
        return ATTRS[key];
      }
    }
    ,set: function(key, value){
      var ATTRS = this.ATTRS;
      if( undefined === ATTRS[key] ){
        ATTRS[key] = {};
        return (ATTRS[key].value = value);
      }
      if( S.isObject( ATTRS[key] ) ){
        if( undefined === ATTRS[key].setter ){
          return ATTRS[key].value = value;
        }
        else{
          return ATTRS[key].setter();
        }
      }
      else{
        return (ATTRS[key].value = value);
      }
    }
  }

  return Base;
});/**
 * User: g.gaokai@gmail.com
 * Date: 12-09-16
 * describe: timeline config singleton 
 */
KISSY.add('gallery/timeline/1.0/config', function(S){

  var Config = {
    myData: null //日志数据
    ,beginYear: null //最早篇日志的年份
    ,endYear: null //最老一篇日志的年份
    ,maxInterval: null //最早 到 最老的时间跨度
    ,widthRate: null //
    ,navWidth: null //导航条有内容区域宽度
    ,spacer: null //导航两边留白宽度
    ,realWidth: null //导航条实际宽度（包含留白）
    ,minLeft: null //导航条最小 css left 值
    ,maxLeft: null //导航条最大 css left 值
    ,rate: 10
    ,isScaling: false
    ,reg_songtime: /(\d{4})[^0-9]*(\d{1,2})?[^0-9]*(\d{1,2})?/
    //用户可配置
    ,scale: 200 //初始化时，一月的在标尺上的宽度 默认100px
    ,minRate: 3 //最大放大倍数
    ,maxRate: 3 //最小缩小倍数
    ,setData: function(newData){
      this.myData = newData;
      for(var i = 0; i < this.myData.length; ++i){
        var matchRet = this.myData[i].time.match(this.reg_songtime);
        this.myData[i].time = '' + matchRet[1];
        if(matchRet[2]){
          this.myData[i].time += '' + ( (parseInt(matchRet[2],10)>9)?(parseInt(matchRet[2],10)):('0'+parseInt(matchRet[2],10) ) ); 
        }
        if(matchRet[3]){
          this.myData[i].time += '' + ( (parseInt(matchRet[3],10)>9)?(parseInt(matchRet[3],10)):('0'+parseInt(matchRet[3],10)) );
        }
      }
      this.myData = this.myData.sort(function(a,b){
        //字符串比较
        return a.time > b.time;
      });
      return this;
    }
    ,config: function(config){
      config.minRate && (this.minRate = config.minRate);
      config.maxRate && (this.maxRate = config.maxRate);
      config.scale && (this.scale = config.scale);
    }
    ,largeRate: function(panel){
      this.rate = this.rate * 2;
      this.initAll(panel);
      return this;
    }
    ,miniRate: function(panel){
      this.rate = this.rate / 2;
      this.initAll(panel);
      return this;
    }
    ,initAll: function(panel){
      this.beginYear = parseInt( this.myData[0].time && (this.myData[0].time.match(this.reg_songtime)[1]) );

      this.endYear = parseInt( this.myData[this.myData.length-1].time && (this.myData[this.myData.length-1].time.match(this.reg_songtime)[1]) ) + 1;
      this.maxInterval = this.endYear - this.beginYear;

      //nav width
      this.widthRate = this.rate / (1/1.2/this.scale);
      // console.log('[log widthRate]',this.widthRate)

      this.navWidth = parseInt( this.widthRate * this.maxInterval, 10);
      // console.log('[log]',this.navWidth)
      
      // this.spacer = parseInt( $(document.body).width() * 3 / 3, 10);
      this.spacer = parseInt( panel.width() * 3 / 3, 10);

      this.realWidth = this.navWidth + this.spacer * 2;

      this.minLeft = parseInt(0 - this.navWidth + this.spacer / 3, 10);
      this.maxLeft = parseInt(this.spacer / 3);
      return this;
    }
  }

  return Config;

});/**
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
});/**
  * 普通元素拖拽
  */
KISSY.add('gallery/timeline/1.0/dd', function(S, Base){
  var $ = S.all, D = S.DOM;
  function DD(panel, config){

    if(panel && typeof panel === 'string'){     
      this.panel = $( ( (/^\s*[#|.]/.test(panel) )?(''):('#') ) + panel );
    }
    else{
      this.panel = panel; 
    }
    if( undefined == this.panel ){
      alert('[DD] panel is undefined')
      return false;
    }
    this.__attr = config;
    this._init();
  }

  var o = {
    _init: function(){
      var self = this;
      self.dragEle = $(self.get('dragEle'), self.panel);
      //记录拖拽过程中 (x,y)足迹
      self.set('dragInfoX', [] );
      self.set('dragInfoY', [] );
      self.set('dragInfoTime', [])
      self.set('ddMask', null);

      self.panel.on('mousedown', function(e){
        e.halt();
        if(e.button && e.button == 2){
          return ;
        }
        self.set('ix', e.pageX);
        self.set('iy', e.pageY);
        self.set('tx', parseInt( self.dragEle.css('left'), 10) );
        self.set('ty', parseInt( self.dragEle.css('top'), 10 ));
        //坐标打点
        self.set('dragInfoX', [] );
        self.set('dragInfoY', [] );
        self.set('dragInfoTime', [])

        self._bindWindowEvent();
      });
    }
    ,_bindWindowEvent: function(){
      var self = this;

      // $(document.body).addClass('userselectClose');

      $(document).on('mouseup', self._handleWindowMouseup, self);
      $(document).on('mousemove', self._handleWindowMousemove, self);
    }
    ,_cancelWindowEvent: function(){
      var self = this;
      // $(document.body).removeClass('userselectClose');

      $(document).detach('mouseup', self._handleWindowMouseup, self);
      $(document).detach('mousemove', self._handleWindowMousemove, self);
    }

    ,_handleWindowMousemove: function(e){
      e.preventDefault();
      var self = this;
      
      if( self.get('ddMask') == null ){
        self.set('ddMask', D.create('<div class="timeline-dd-mask"></div>'));
        document.body && document.body.appendChild(self.get('ddMask'));
      }
      //坐标打点
      self.get('dragInfoX').push(e.pageX);
      self.get('dragInfoY').push(e.pageY);
      self.get('dragInfoTime').push(new Date().getTime());

      self.fire('moving', {
          ox: e.pageX - self.get('ix') + self.get('tx')
          ,oy: e.pageY - self.get('iy') + self.get('ty')
      });
    }
    ,_handleWindowMouseup: function(e){
      var self = this;
      self._cancelWindowEvent();

      self.get('dragInfoX').push(e.pageX);
      self.get('dragInfoY').push(e.pageY);
      self.get('dragInfoTime').push(new Date().getTime());

      // log(self.get('dragInfoX'), self.get('dragInfoY'));
      self.fire('mouseup', {
        buffer: self._calculateBuffer()
      });

      //remove dd mask
      D.remove(self.get('ddMask'));
      self.set('ddMask', null);
    }

    ,_calculateBuffer: function(){
      var self = this;
      if(self.get('dragInfoX').length < 3){
        return undefined;
      }
      var retBuffer = {
        a: 10000
        ,v: 100 // px/s
        ,isLeft: true
      };

      var dragInfoX = self.get('dragInfoX'), len = dragInfoX.length
      ,dragInfoTime = self.get('dragInfoTime') ;

      //求末速度 取50ms 时间间距
      var t = 1, x0 = dragInfoX[len-1]
      ,t0 = dragInfoTime[len-1], s;

      //Y，居然死循环了  害我排查了半天
      // while( !(t < len && ( t0 - dragInfoTime[len - (++t)] ) > 50  ) ){
      while(t < len && ( t0 - dragInfoTime[len - (++t)] ) < 50  ){
        
        //该节点判定为 远古节点
        if( t == 2 && x0 - dragInfoTime[len - t] > 500 ){
          return undefined;
        }
      }
      if( t <= len ){
        t1 = dragInfoTime[len-t+1];
        s = dragInfoX[len-1] - dragInfoX[len-t];

        retBuffer.v = s / (t0 - t1) * 1000;
        (s > 0)?(retBuffer.isLeft=true):(retBuffer.isLeft=false);
      }
      else{
        retBuffer.v = 100;
        (dragInfoX[len-1] > dragInfoX[0])?(retBuffer.isLeft = true):(retBuffer.isLeft = false);
      }

      retBuffer.absDistance = retBuffer.v * retBuffer.v / 2 / retBuffer.a;

      retBuffer.addLeft = (retBuffer.isLeft)?('+=' + retBuffer.absDistance):('-=' + retBuffer.absDistance);

      retBuffer.duration = Math.abs( parseInt( retBuffer.v / retBuffer.a * 1000, 10));

      // log(retBuffer)
      //求运动方向
      // return undefined;
      return retBuffer;

    }

    ,set: function(k, v){
      return (this.__attr[k] = v);
    }
    ,get: function(k){
      return this.__attr[k];
    }
  };

  S.augment(DD, Base, S.EventTarget, o);

  return DD;
},{
  attach: false
  ,requires: ['./base']
});/**
 * User: g.gaokai@gmail.com
 * Date: 12-09-15
 * describe: track 入口
 */

KISSY.add('gallery/timeline/1.0/index', function(S, Control){
  var $ = S.all;
  //class
  /**
    * @param{config} 
    */
  function KSTrack(config){
    return new Control(config);
  }
  return KSTrack;
},{
  requires: ['./control']
});/**
 * User: g.gaokai@gmail.com
 * Date: 12-09-16
 * describe: timeline main-content
 * log: [20121010] add window.location.hash tag, add prev,next,switchTo, add dd mask on mousemove
 *      [20121011] add 时间刻度的月份的支持
 *      [20121019] bugfix 快速点击放大|缩小，markers偏移出错、被hover的marker，z-index为最高层； add 提供resizeWidth功能
 *      [20121021] add scale,minRate,maxRate可配置
 */

KISSY.add('gallery/timeline/1.0/main-content', function(S, Base, TT, Anim){
  var $ = S.all;

  var ATTRS = {
    html: {
      value: '<div class="timenav K_Timenav" style="left:0;">\
                <div class="time-points K_MarkerBox">\
                </div>\
                <div class="time-interval">\
                  <div class="time-interval-major K_IntervalBox"></div>\
                </div>\
                <div class="time-ruler K_TimeRuler"></div>\
              </div>'
    }
    ,tpl_marker: {
      value: '<div class="marker K_Marker" id="marker_{{id}}" style="left: {{left}}px;" data-req=\'{{data}}\'>\
                <div class="flag" style="top:{{top}}px">\
                  <div class="flag-content">\
                    <div class="thumbnail"></div>\
                    <h3>{{title}}</h3>\
                  </div>\
                </div>\
                <div class="dot"></div>\
                <div class="line">\
                  <div class="event-line"></div>\
                </div>\
              </div>'
    }
    ,tpl_interal: {
      value: '<div class="a-interval" style="left: {{left}}px;">{{time}}</div>'
    }
    ,cBox: {
      value: null
    }
    ,markerBox: {
      value: null
    }
    ,intervalBox: {
      value: null
    }
    ,timeRuler: {
      value: null
    }
    ,timenav: {// timenav === cBox
      value: null
    }
  };

  function MainContent(config){
    this.config = config;
    this.ATTRS = S.clone(ATTRS);
    this._init();
  }


  var o = {
    ATTRS: ATTRS
    ,_init: function(){
      var self = this, config = self.config;
      
      self.dragBufferAnim = null;

      self.isRating = false;

      self.cdY = 1;

      self.markerEles = [];
      self.activeMarkerIdx = null;

      self.render();

      //init style
      self.adjustStyle();

      self.monitorEvent();
    }

    //left scroll
    ,leftScroll: function(d){
      var self = this;
      self.stopAnim();
      self.dragBufferAnim = new Anim(self.get('timenav')[0], {
        'left': '+=' + $(document.body).width() * 4 / 5
      },{
        duration: 1
        ,easing: 'easeOutStrong'
        // ,frame: function(){
        //   if( self.isOverflow() ){
        //     return 1;
        //   }
        // }
      }).run();
      self.dragBufferAnim.on('step', function(){
        if( self.isOverflow() ){
            return false;
          }
      })
    }

    //right scroll
    ,rightScroll: function(d){
      var self = this;
      self.stopAnim();
      self.dragBufferAnim = new Anim(self.get('timenav')[0], {
        'left': '-=' + $(document.body).width() * 4 / 5
      },{
        duration: 1
        ,easing: 'easeOutStrong'
        // ,frame: function(){
        //   if( self.isOverflow() ){
        //     return 1;
        //   }
        // }
      }).run();
      self.dragBufferAnim.on('step', function(){
        if( self.isOverflow() ){
          return false;
        }
      });
    }

    //timenav left reset
    ,rigidResetOffset: function(pos){
      var self = this;
      self.stopAnim();

      (pos.left != undefined) && self.get('timenav').css('left', pos.left + 'px');
      (pos.top != undefined) && self.get('timenav').css('top', pos.top + 'px');
    }

    //拖拽运动 
    ,dragBuffer: function(buffer){
      var self = this;

      self.stopAnim();
      self.dragBufferAnim = new Anim(self.get('timenav')[0],{
        'left': buffer.addLeft
      }, {
        duration: buffer.duration/1000
        ,easing:'easeOutStrong'
        // ,frame: function(){
        //   if( self.isOverflow() ){
        //     return 0;
        //   }
        // }
      }).run();
      self.dragBufferAnim.on('step', function(){
        if( self.isOverflow() ){
          return false;
        }
      });
    }

    //判断是否 超出容器的left值 上限 或 下限
    ,isOverflow: function(){
      var self = this, trackConfig = self.config.trackConfig;
      var left = 0;
      if( trackConfig.minLeft > parseInt(self.get('timenav').css('left'), 10) ){
        self.stopAnim();
        left = trackConfig.minLeft;
      }
      else if(trackConfig.maxLeft < parseInt(self.get('timenav').css('left'), 10) ){
        self.stopAnim();
        left = trackConfig.maxLeft;
      }
      else{
        return ;
      }

      //回到最左边|最右边      
      self.dragBufferAnim = self.get('timenav').animate({
        'left': left + 'px'
      },{
        'duration': 0.4
        ,'easing': 'easeOutStrong'
      });
      return true;
    }

    //停止当前正在进行中的动画
    ,stopAnim: function(){
      // this.isRating = false;
      this.dragBufferAnim && this.dragBufferAnim.stop && this.dragBufferAnim.stop();
    }



    //reset timenav left
    ,resetTimenavPos: function(pos, isAnim){
      var self = this;
      self.stopAnim();

      if( isAnim && isAnim === false){
        // self.get('timenav').css('left', left);
      }
      else{
        self.dragBufferAnim = self.get('timenav').animate(pos, {
          'duration': 1
          ,'easing': 'easeOutStrong'
        });
      }
    }

    //初始化渲染dom
    ,render: function(infos){
      var self = this, config = self.config;

      //base html frame
      self.set('cBox', $(self.get('html')) );
      self.set('timenav', self.get('cBox'));

      
      self.set('markerBox', $('.K_MarkerBox', self.get('timenav')));

      self.set('intervalBox', $('.K_IntervalBox', self.get('timenav')));

      self.set('timeRuler', $('.K_TimeRuler', self.get('timenav')));

      self.get('timenav').appendTo(config.panel);

      self.resetTimenavPos({
        left: parseInt(self.get('timenav').css('left'),10) + config.panel.width()/3
      });

      if( infos && S.isArray(infos)){
        self.renderMarkers(infos);
      }

      self.fire('uiReady');

      //marker mousehover
      if(S.UA && S.UA.ie == 6){
        self.get('timenav').delegate('mouseenter', '.K_Marker', function(e){
          $(this).addClass('hover');
        });
        self.get('timenav').delegate('mouseleave', '.K_Marker', function(e){
          $(this).removeClass('hover');
        });
      }
    }

    //渲染 marker 们
    ,renderMarkers: function(infos){
      var self = this, config = self.config
      , len = infos.length;
      for(var i = 0; i < len; ++i){
        var newMarker = $(TT(self.get('tpl_marker')).render({
          id: infos[i].time
          ,title: infos[i].title
          ,data: KISSY.JSON.stringify(S.merge({'count': i}, infos[i]) ) 
          ,left: infos[i].__left
          ,top: (infos[i].top || (parseInt(Math.random() * 55, 10))) + 10
        }));
        newMarker.appendTo(self.get('markerBox'));
        self.markerEles.push(newMarker);
      }
    }

    //渲染标尺上的时间点
    ,renderInterval: function(onlyStyle){
      var self = this, trackConfig = this.config.trackConfig;

      // self.stopAnim();

      var yDistance = trackConfig.widthRate;
      var _y = 1, _m = 1;
      
      if( yDistance >= 2000 ){
        _y = 1;
        _m = 1;
      }
      else if( yDistance < 2000 && yDistance >= 1000){
        _y = 1;
        _m = 2;
      }
      else if( yDistance < 1000 && yDistance >= 500){
        _y = 1;
        _m = 3;
      }
      else if( yDistance < 500 && yDistance >= 250){
        _y = 1;
        _m = 4;
      }
      else if( yDistance < 250 && yDistance >= 125){
        _y = 1;
        _m = 6;
      }
      else if( yDistance < 125){
        _y = 2;
        _m = 12;  
      }

      if( !onlyStyle || onlyStyle == false ){
        self._renderInterval(_y, _m);
      }
      else{
        self._styleInterval(_y, _m);
      }

    }

    ,_renderInterval: function(_y, _m){
      var self = this, trackConfig = this.config.trackConfig;
      self.get('intervalBox').html('');
      for( var y = -1; y < trackConfig.endYear - trackConfig.beginYear + 1; ++y){
        // log(self.Config.beginYear + y, y * self.Config.widthRate);
        var newY = $(TT(self.get('tpl_interal')).render({
          'left': parseInt(y * trackConfig.widthRate / 5 , 10) * 5 - 2
          ,'time': trackConfig.beginYear + y - 1 + '.12'
        }));
        newY.appendTo(self.get('intervalBox'));
        if( Math.abs(y)%_y != 0 ){
          newY.hide();
        }
        //[20121011]
        for(var m = 1; m <= 11; ++m){
          var newM = $(TT(self.get('tpl_interal')).render({
            'left': parseInt( (y * trackConfig.widthRate + trackConfig.widthRate/12*m)/5,10)*5 - 2
            ,'time': trackConfig.beginYear + y + '.' + m
          }));
          newM.appendTo(self.get('intervalBox'));
          if( m%_m != 0){
            newM.hide();
          }
        }
      }
    }
    //放大缩小时，修改刻度值的left偏移量
    ,_styleInterval: function(_y, _m){
      var self = this, trackConfig = this.config.trackConfig;
      var intervals = $('.a-interval', self.get('intervalBox'));
      for( var y = -1 ; y < trackConfig.endYear - trackConfig.beginYear + 1; ++y){
        //[20121011]
        // var _year = (y+2);
        var _year = (y+1) * 12;
        intervals.item( _year ).animate({
          'left': parseInt( ( y * trackConfig.widthRate) / 5 , 10)*5 - 2
        },0.5);
        if( Math.abs(y)%_y != 0 ){
          intervals.item(_year).hide();
        }
        else{
          intervals.item(_year).show();
        }
        // [20121011]
        for( var m = 1; m <= 11; ++m){
          intervals.item(_year+m).animate({
            'left': parseInt( (y*trackConfig.widthRate + trackConfig.widthRate/12*m)/5, 10)*5 - 2
          },0.5);
          if( m%_m != 0 ){
            intervals.item(_year+m).hide();
          }
          else{
            intervals.item(_year+m).show();
          }
        }
        
      }
    }

    //让被点击的marker 居中
    ,gotoMarker: function(markerLeft, target, idx){
      var self = this, config = self.config;
      
      self.get('timenav').all('.marker').removeClass('hover');
      target.addClass('hover');

      self.stopAnim();
      var addLeft = markerLeft + parseInt(self.get('timenav').css('left'),10) - config.panel.width()/2 + 3;// 3 为补视觉差值
      self.dragBufferAnim = self.get('timenav').animate({
        left: '-=' + addLeft
      },0.5,'easeOutStrong');
    }

    //根据全局 config.js中的参数重置 timenva样式
    ,adjustStyle: function(){
      var self = this, trackConfig = self.config.trackConfig;
      
      //导航实际宽度
      self.get('timenav').width(trackConfig.navWidth);

      //时间刻度值 区域
      self.get('intervalBox').width(trackConfig.navWidth);

      //时间标尺
      self.get('timeRuler').width(trackConfig.realWidth + 2*Math.abs(trackConfig.spacer)).css('left', 0-Math.abs(2*trackConfig.spacer));
    }

    //根据比例rate 缩放timenav
    ,rate: function(rate){
      var self = this, config = self.config;
      if(self.isRating == true){
        return ;
      }
      // self.isRating = true;
      config.trackConfig.isScaling = true;
      self.stopAnim();
      var markers = $('.marker', self.get('timenav'));
      
      markers.each(function(ele){
        $(ele).animate({
          left: parseInt($(ele).css('left'), 10) * Math.abs(rate)
        },0.5);
      });

      var timenavLeft = parseInt(self.get('timenav').css('left'),10);
      var timenavWidth = self.get('timenav').width();
      var _width = config.panel.width();
      
      var newLeft = _width/2 - (0-timenavLeft+_width/2) * rate;

      self.get('timenav').animate({
        left: newLeft,
        width: '*=' + rate
      }, 0.5, 'easeNone', function(){
        self.adjustStyle();
        self.isRating = false;
        config.trackConfig.isScaling = false;
      });

      self.renderInterval(true);
    }

    //全局事件 和 外部接口
    ,monitorEvent: function(){
      var self = this, config = self.config;
      $(window).on('resize', function(){
        self.adjustStyle();
      });

      self.get('timenav').on('click', function(e){
        e.halt();
        var target = $(e.target);
        if( target.hasClass('marker') ){
          target = target;
        }
        else if( target.parent('.marker') != null ){
          target = target.parent('.marker');
        }
        else{
          return false;
        }

        self.clickThisMarder(target);
      });

    }

    ,clickThisMarder: function(target){
      var self = this;
      var dataQeq = S.JSON.parse( target.attr('data-req') );

      self.gotoMarker( parseInt(target.css('left'), 10) , target);
      
      if( self.activeMarkerIdx == dataQeq.count ){
        return false;
      }
      self.activeMarkerIdx = dataQeq.count;
      self.fire('marker', {
        data: dataQeq
        ,target: target
      });


      //location.hash modify
      self.setHash();
      // window.location.hash = '!timeline{idx:' + self.activeMarkerIdx + '}';
    }
    ,setHash: function(){
      return false;
      var hash = window.location.hash;
      var reg = /\!timeline{idx:(\d+)}/i;
      var regret =  hash.match(reg);
      if(regret){
        window.location.hash = hash.replace(regret[0], '!timeline{idx:'+this.activeMarkerIdx+'}');
      }else{
        window.location.hash += '!timeline{idx:'+this.activeMarkerIdx+'}';
      }
    }

    ,prev: function(){
      var idx = ( (this.activeMarkerIdx-1+this.markerEles.length) % this.markerEles.length) || 0;
      
      this.clickThisMarder(this.markerEles[idx]);
      this.activeMarkerIdx = idx;
    }
    ,next: function(){
      var idx = ( (this.activeMarkerIdx+1+this.markerEles.length) % this.markerEles.length) || 0;
      this.clickThisMarder(this.markerEles[idx]);
      this.activeMarkerIdx = idx;
    }
    ,switchTo: function(idx){
      if( idx < 0 || idx >= this.markerEles.length){
        return false;
      }
      this.clickThisMarder(this.markerEles[idx]);
    }
  };

  S.augment(MainContent, Base, S.EventTarget, o);

  return MainContent;

},{
  attach: false
  ,requires: ['./base', 'template', 'anim']
});/**
 * User: g.gaokai@gmail.com
 * Date: 12-09-16
 * describe: timeline toolbar
 */

KISSY.add('gallery/timeline/1.0/toolbar', function(S, Base){
  var $ = S.all;

  var ATTRS = {
    html: {
      value: '<div class="timenav-toolbar">\
                <a hidefocus href="#" class="hide-timenav K_HideTimenav">hide</a>\
                <a hidefocus href="#" class="largen K_LargeRate">large</a>\
                <a hidefocus href="#" class="mini K_MiniRate">mini</a>\
                <a hidefocus href="#" class="left-scroll H_LeftScroll">left</a>\
                <a hidefocus href="#" class="right-scroll H_RightScroll">right</a>\
                <a hidefocus href="#" class="goto-last H_GotoLast">goto-last</a>\
              </div>'
    }
    ,cBox: {
      value: null
    }
    ,hideTimenav: {
      value: null
    }
    ,largeRate: {
      value: null
    }
    ,miniRate: {
      value: null
    }
    ,leftScroll: {
      value: null
    }
    ,rightScroll: {
      value: null
    }
  };

  function Toolbar(config){
    this.config = config;
    this.ATTRS = S.clone(ATTRS);
    this._init();
  }


  var o = {_init: function(){
      var self = this, config = self.config;
      self.render();
      self.monitorEvent();
    }

    ,render: function(){
      var self = this, config = self.config;

      self.set('cBox', $( self.get('html') ));

      self.get('cBox').appendTo(config.panel);

      self.set('hideTimenav', $('.K_HideTimenav', self.get('cBox')));
      self.set('largeRate', $('.K_LargeRate', self.get('cBox')));
      self.set('miniRate', $('.K_MiniRate', self.get('cBox')));
      self.set('leftScroll', $('.H_LeftScroll', self.get('cBox')));
      self.set('rightScroll', $('.H_RightScroll', self.get('cBox')));
      self.set('gotoLast', $('.H_GotoLast', self.get('cBox')));

      self.fire('uiReady');
    }

    ,adjustStyle: function(info){
      var self = this, config = self.config;
      self.fire('styleReload');
    }

    ,monitorEvent: function(){
      var self = this, config = self.config;
      
      self.get('hideTimenav').on('click', function(e){
        e.halt();
        self.fire('toggle');
      });

      self.get('largeRate').on('click', function(e){
        e.halt();
        self.fire('large');
      });

      self.get('miniRate').on('click', function(e){
        e.halt();
        self.fire('mini');
      });

      self.get('leftScroll').on('click', function(e){
        e.halt();
        self.fire('leftScroll');
      });

      self.get('rightScroll').on('click', function(e){
        e.halt();
        self.fire('rightScroll');
      });
      self.get('gotoLast').on('click', function(e){
        e.halt();
        self.fire('gotoLast');
      });
    }
  };

  S.augment(Toolbar, Base, S.EventTarget, o);

  return Toolbar;

},{
  attach: false
  ,requires: ['./base']
});
