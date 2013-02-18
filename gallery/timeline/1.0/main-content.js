/**
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
  ,requires: ['./base', 'gallery/template/1.0/index', 'anim']
});