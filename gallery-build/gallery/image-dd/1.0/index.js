/**
 * User: g.gaokai@gmail.com
 * Date: 12-09-16
 * describe: attr, status, data  getter setter
 */

KISSY.add('gallery/image-dd/1.0/asdbase', function(S){
  function Base(){}

  Base.prototype = {
    ATTR: function(key, value){
      if(undefined === key || null === key){
        return undefined;
      }
      var attrs = this.ATTRS || {};
      if( undefined === attrs[key] ){
        if(undefined === value){//get
          return undefined;
        }else{//set
          return (attrs[key] = value);
        }
      }else{
        if(undefined === value){//get
          return attrs[key];
        }else{
          return (attrs[key] = value);
        }
      }
    }

    ,DATA: function(key, value){
      if(undefined === key || null === key){
        return undefined;
      }
      var datas = this.DATAS || {};
      if( undefined === datas[key] ){
        if(undefined === value){//get
          return undefined;
        }else{//set
          return (datas[key] = value);
        }
      }else{
        if(undefined === value){//get
          return datas[key];
        }else{
          return (datas[key] = value);
        }
      }
    }


    ,STATU: function(key, value){
      if(undefined === key || null === key){
        return undefined;
      }
      var status = this.STATUS || {};
      if( undefined === status[key] ){
        if(undefined === value){//get
          return undefined;
        }else{//set
          return (status[key] = value);
        }
      }else{
        if(undefined === value){//get
          return status[key];
        }else{
          return (status[key] = value);
        }
      }
    }
  }

  return Base;
});/**
  * yumen t=20120526
  */

/**
  * 单例拖拽
  */
KISSY.add('gallery/image-dd/1.0/index', function(S, Base, Template, Anim){
  var D = S.DOM, E = S.Event, $ = S.all;
  
  //asd
  var ATTRS = {
    //constant variables
    WHEEL_STEP: 1 //鼠标中键滚动几次触发行为
    ,WHEEL_PIX: 50 //一次缩放像素值
    ,SHOW_DOWN: 0 //减速运动的减速度大小
    ,MOUSE_MOVE_AUTO_CLOSE_TIMER: 5000 // 鼠标在经过 设定的时间内没有发生move的行为，逻辑跳转到mouseup
    ,DEGRADATION: 2 //降级（针对move事件触发频率）

    ,activeImg: null //当前活跃的img标签
    ,activeImgPos: {left:0, top:0} //mousedown时图片所在位置
    ,mousedownCoo: {} //鼠标mousedown位置的坐标
    ,anim: null//滚轮控制放大缩小的动画对象
    ,initAnim: null//初始化定位图片动画对象
    ,bigImgObj: new Image()//大图img对象
    ,initWidth: 0
    ,defaultMaxWidth: 10000//图片放大到最大宽度
    ,defaultMinWidth: 50 //图片缩小到最小宽度
    ,ieIframeMask: null
    
    ,dragInfoX: [] //拖拽图片的坐标记录
    ,dragInfoY: []
    ,dragInfoTime: [] //拖拽发生的时间记录
    ,autoSlideAnim: null //Anim obj

    ,popupMask: null //全屏浮框容器
    ,popupBd: null //弹出层，图片容器
    ,popupOpacityBg: null
    ,popupBox: null
    ,popupHd: null
  };

  var STATUS = {
    inited: false //垫片是否初始化过
  }

  var DATAS = {
    POPUP_HD_TPL: '<div class="box-hd close-rt-wrap" ><a href="#" title="按退出键，也可以关闭哦" class="close-rt J_Close" id="J_CloseImageDD"></a></div>'

    ,POPUP_IMG: '<img title="鼠标滚轮可以放大图片" class="G_K" style="width:{{showWidth}}px;left:{{left}}px;top:{{top}}px;" src="{{imgSrc}}"  />'

    ,POPUP_TPL: '<div class="img-dd-mask">\
                    <div class="img-dd-opacity-bg"></div>\
                 </div>'
    ,POPUP_BOX_TPL: '<div class="img-dd-box"></div>'
    ,POPUP_IFRAME_TPL: '<iframe class="ie-popup-mask hidden"></iframe>'
  }
   
  var CFG = {
    ele: []
  };
  /**
    * @param{HTMLIMGElement} 一个img标签对象的引用
    */
  function DDObj(ele){
    var self = this;
    self.config = S.clone(CFG);
    
    self.ATTRS = S.clone(ATTRS);
    self.STATUS = S.clone(STATUS);
    self.DATAS = S.clone(DATAS);

    S.mix(self.config, {
      ele: (ele)?(S.isArray(ele)?(ele):([ele])):([])
    });
    self._init();
  }
  
  var o = {
    _init: function(){
      var self = this, cfg = self.config;
      
      //初始化 new 对象时的
      S.each(cfg.ele, function(item){
        self._bindEvent(item);
      });
    }
        
    ,add: function(ele, className){
      var self = this, cfg = self.config;
      
      if(S.isArray(ele) ){
        cfg.ele = cfg.ele.concate(ele);
        S.each(ele, function(item){
          self._bindEvent(item, className);
        });
      }
      else{
        cfg.ele.push(ele);
        self._bindEvent(ele, className);
      }
      // console.log(cfg.ele)
    }
    
    //给add进来的img 或 img的容器，注册click事件
    ,_bindEvent: function(ele, className){
      var self = this, cfg = self.config;
      
      if(ele == null){return false;}
      
      //close
      //mouse down
      E.on(ele, 'click', function(e){
        var target = e.target;
        if(target.tagName.toUpperCase() != 'IMG'){
          return ;
        }
        if(className && !D.hasClass(target, className) ){
          return ;
        }

        if(target.className == 'G_K'){
          return ;
        }
             
        e.halt();
        //click img tag
        if( self.STATU('inited') != true ){
          //初始化垫片
          self._createPopup();
          self._initHTMLElement();
          self._bindPopupMousedown();
          self.STATU('inited', true);
        }
        
        self._showPopupImg(target.getAttribute('data-original-url'),  target.getAttribute('src') );
        D.show(self.ATTR('popupMask'));
        D.show(self.ATTR('popupBd'));
        
        D.show(self.ATTR('ieIframeMask'));
        D.show(self.ATTR('closeBtn'));
      });
      
      //mouse move   add: move settime close action
      //mouse up
    }
    
    //初始化显示图片大图
    ,_showPopupImg: function(srcUrl, srcUrlThunmb){
      var self = this
      ,clientWidth  = document.body.clientWidth  || doucment.doucmentElement.clientWidth
      ;
      
      //添加当前图片
      self.ATTR('popupBd').innerHTML = Template(self.DATA('POPUP_IMG')).render({
        imgSrc: srcUrlThunmb//初始化显示小图
        ,imgAlt: '图片大图'
        ,showWidth: parseInt(clientWidth/2,10)
        ,left: parseInt(clientWidth/4,10) //将图片显示在正中间
        ,top: 0
      });
      
      //------------------------------------------------------------------初始化一些数据
      if( S.UA.ie && S.UA.ie == 6){
        self.ATTR('popupMask').style.height = (document.body.scrollHeight || document.documentElement.scrollHeight) + 'px';
        self.ATTR('popupMask').style.width  = (document.body.scrollWidth || document.documentElement.scrollWidth) + 'px';
      }
      self.ATTR('initWidth', parseInt(clientWidth/2,10));//初始化图片显示的宽度
      
      self.cleanRecords(true);
      
      self.ATTR('activeImg', D.get('IMG', self.ATTR('popupBd') ) );//获取新插入的图片的DOM引用
      
      //调整图片到窗口可见区域
      self.ATTR('initAnim') && self.ATTR('initAnim').stop(false);
      self.ATTR('initAnim', new Anim(self.ATTR('activeImg'), {
        top: (document.body.scrollTop || document.documentElement.scrollTop) + 30 + 'px'
      },1,'easeOutStrong').run() );
      
      //大图加载好后 显示大图
      self.ATTR('bigImgObj').onload = null;
      if( srcUrl || srcUrl != ''){
        self.ATTR('bigImgObj', null);
        self.ATTR('bigImgObj', new Image());
        self.ATTR('bigImgObj').onload = function(){
          self.ATTR('activeImg').src = srcUrl;
        }
        
      };
      self.ATTR('bigImgObj').src = srcUrl;
      
      //注册鼠标中键滚轮事件
      self.registerWheelEvent();
      
    }
    
    //registerWheelScroll
    ,registerWheelEvent: function(){
      E.on(document, 'DOMMouseScroll', wheelScroll, this);
      E.on(document, 'mousewheel', wheelScroll, this);
      E.on(document, 'keyup', this.closePopup, this);
    }
    
    ,cancelWheelEvent: function(){
      E.remove(document, 'DOMMouseScroll', wheelScroll, this);
      E.remove(document, 'mousewheel', wheelScroll, this);
      E.remove(document, 'keyup', this.closePopup, this);
    }
    
    //regist event
    ,registerEvent: function(){
      var self = this;
      E.on(document, 'mouseup', mouseup, self);
      E.on(document, 'mousemove', move, self);
    }
    //cancel event
    ,cancelEvent: function(){
      var self = this;
      E.remove(document, 'mouseup', mouseup, self);
      E.remove(document, 'mousemove', move, self);
    }
    
    //全屏蒙板 this function run only one time
    ,_createPopup: function(){
      var self = this, cfg = self.config;
      self.ATTR('popupMask', D.create( self.DATA('POPUP_TPL') ) );
      self.ATTR('popupBd', D.create( self.DATA('POPUP_BOX_TPL') ) );
      self.ATTR('closeBtn', D.create( self.DATA('POPUP_HD_TPL') ) );
      if(S.UA.ie && S.UA.ie == 6){
        self.ATTR('ieIframeMask', D.create( self.DATA('POPUP_IFRAME_TPL') ) );
        self.ATTR('ieIframeMask').style.width = document.documentElement.scrollWidth + 'px';
        self.ATTR('ieIframeMask').style.height = document.documentElement.scrollHeight + 'px';
        document.body.appendChild(self.ATTR('ieIframeMask'));
      }
      document.body.appendChild(self.ATTR('popupMask'));
      document.body.appendChild(self.ATTR('popupBd'));
      self.ATTR('popupMask').appendChild(self.ATTR('closeBtn'));
    }
    
    //弹出框mousedown事件注册， this function execute just one time , event will never remove
    ,_bindPopupMousedown: function(){
      var self = this, cfg = self.config;
      // E.on(self.ATTR('popupMask'),"dragstart",function(e){
        // e.preventDefault();
      // });
      E.on(self.ATTR('popupBd'), 'mousedown', function(e){
        var target = e.target;
        if( target.tagName.toUpperCase() != 'IMG'){
          return ;
        }
        e.halt();
        
        //停止初始化的定位动画
        self.ATTR('initAnim') && self.ATTR('initAnim').stop(false);
        self.ATTR('initAnim', null);
        
        //初始化拖拽信息
        self.cleanRecords(true);
        
        self.ATTR('dragInfoX').push(getCurrentStyle(target, 'left')); //拖拽图片的坐标记录
        self.ATTR('dragInfoY').push(getCurrentStyle(target, 'top'));
        self.ATTR('dragInfoTime').push(new Date().getTime()); //拖拽发生的时间记录
        
        
        self.ATTR( 'activeImg', target);
        
        self.ATTR('mousedownCoo', getMouseCoo(e) );
        self.ATTR('activeImgPos',{
          left: getCurrentStyle(target, 'left')
          ,top: getCurrentStyle(target, 'top')
        });
        
        //取消文本选中
        // ( document.selection&&document.selection.empty&&document.selection.empty() ) || ( window.getSelection&&window.getSelection().removeAllRanges() );
        
        // console.log(self.ATTR('activeImgPos'));
        self.registerEvent();
      });
      
      E.on(self.ATTR('closeBtn'), 'click', function(e){
        //close
        // if( D.hasClass(e.target, 'J_Close') ){
          e.halt();
          self.closePopup();
        // }
      });
      
      E.on(self.ATTR('popupMask'), 'click', function(e){
        if(S.UA.ie && S.UA.ie == 6){
          if( D.hasClass( e.target, 'img-dd-opacity-bg')){
            e.halt();
            self.closePopup();
          }
        }
      });
      
      
      return true;
    }
    
    //创建弹出框盒子 的hd、bd、bt的引用
    ,_initHTMLElement: function(){
      var self = this;
      self.ATTR('popupOpacityBg', D.get('.img-dd-opacity-bg', self.ATTR('popupMask') ) );
      self.ATTR('popupBox', D.get('.img-dd-box', self.ATTR('popupMask') ) );
      self.ATTR('popupHd', D.get('.box-hd', self.ATTR('popupMask')) );
    }
    
    
    //鸡肋： 根据拖拽过程中记录的 x、y、time 制造 拖拽mouseup后的滑动效果
    ,afterUserDrag_MyShowTime: function(){
      var self = this;
      // self.ATTR('dragInfoX', []); //拖拽图片的坐标记录
      // self.ATTR('dragInfoY') = [];
      // self.ATTR('dragInfoTime') = []; //拖拽发生的时间记录
      var len = self.ATTR('dragInfoX').length;
      
      if(true || len < 3){
        //走直线
        self.slide_straightLine();
        return false;
      }
      else{//closed
        //走一个圆圈
        var x1 = self.ATTR('dragInfoX')[len-3], y1 = self.ATTR('dragInfoY')[len-3]
        ,x2 = self.ATTR('dragInfoX')[len-2], y2 = self.ATTR('dragInfoY')[len-2]
        ,x3 = self.ATTR('dragInfoX')[len-1], y3 = self.ATTR('dragInfoY')[len-1]
        ;
      }
    }
    
    //使用kissy anim走一段直线
    ,slide_straightLine: function(){
      var self = this;
      
      var retBuffer = {
        a: 100000
        ,vx: 0
        ,vy: 0
        ,new_left: 0
        ,new_top: 0
        ,is_left: true
        ,is_top: true
      };

      var dragInfoX = self.ATTR('dragInfoX'), dragInfoY = self.ATTR('dragInfoY'), 
      len = dragInfoX.length, dragInfoTime = self.ATTR('dragInfoTime')
      ,sx,sy;

      var t = 1, x0 = dragInfoX[len-1], y0 = dragInfoY[len-1]
      t0 = dragInfoTime[len-1];
      while( t < len && (t0 - dragInfoTime[len - (++t)]) < 50 );

      if( t == 2 && t0 - dragInfoTime[len-t] > 500){
        return ;
      }

      if( t <= len){
        t1 = dragInfoTime[len-t+1];
        sx = dragInfoX[len-1] - dragInfoX[len-t];
        sy = dragInfoY[len-1] - dragInfoY[len-t];
        
        retBuffer.vx = sx / (t0 - t1) * 1000;
        retBuffer.vy = sy / (t0 - t1) * 1000;
        (sx > 0)?(retBuffer.isLeft=true):(retBuffer.isLeft=false);
        (sy > 0)?(retBuffer.isTop=true):(retBuffer.isTop=false);
      }
      else{
        retBuffer.vx = 100;
        retBuffer.vy = 100;
        (dragInfoX[len-1] > dragInfoX[0])?(retBuffer.isLeft=true):(retBuffer.isLeft=false);
        (dragInfoY[len-1] > dragInfoY[0])?(retBuffer.isTop=true):(retBuffer.isTop=false);
      }


      retBuffer.duration = parseInt(Math.abs( retBuffer.v / retBuffer.a * 1000), 10);

      retBuffer.absDisX = retBuffer.vx * retBuffer.vx / 2 / retBuffer.a;
      retBuffer.absDisY = retBuffer.vy * retBuffer.vy / 2 / retBuffer.a;

      retBuffer.addLeft = ( (retBuffer.isLeft)?('+='):('-=') ) + retBuffer.absDisX;
      retBuffer.addTop = ( (retBuffer.isTop)?('+='):('-=') ) + retBuffer.absDisY;

      self.ATTR('autoSlideAnim', new Anim(self.ATTR('activeImg'),{
        left: retBuffer.addLeft
        ,top: retBuffer.addTop
      },retBuffer.duration,'easeOutStrong').run() );

    }
    
    //清理拖拽记录数组  防止按住不放时，数组变成无限大的情况
    ,cleanRecords: function(clearAll){
      var self = this;
      self.ATTR('dragInfoX', []); //拖拽图片的坐标记录
      self.ATTR('dragInfoY', []);
      self.ATTR('dragInfoTime', []); //拖拽发生的时间记录
      self.ATTR('autoSlideAnim') && self.ATTR('autoSlideAnim').isRunning&&self.ATTR('autoSlideAnim').stop(false);
    }
    
    ,closePopup: function(e){
      if(e != undefined && (e instanceof KISSY.EventObject ) ){
        var keyCode = e.keyCode || e.charCode;
        if( e.altKey || keyCode != 27){
          return false;
        }
      }
      var self = this, cfg = self.config;
      self.ATTR('activeImg', null);
      self.cancelWheelEvent();
      self.cancelEvent();
      D.hide(self.ATTR('popupMask'));
      D.hide(self.ATTR('popupBd'));
      D.hide(self.ATTR('closeBtn'));
      D.hide(self.ATTR('ieIframeMask'));
    }
    
    ,destory: function(){
      //todo
    }
    
  };
  
  // binded in document
  var moveCtlTimer = ATTRS.DEGRADATION;
  function move(e){
    e.halt();
      
    if(moveCtlTimer < ATTRS.DEGRADATION){//做限制
      ++moveCtlTimer;
      return false;
    }
    moveCtlTimer = 0;
    var self = this;
    
    var currentMouseCoo = getMouseCoo(e);//当前鼠标所在坐标
    
    var distance = {
      left: currentMouseCoo.x - self.ATTR('mousedownCoo').x
      ,top: currentMouseCoo.y - self.ATTR('mousedownCoo').y
    };
    var new_top = parseInt(self.ATTR('activeImgPos').top,10) + distance.top
    ,new_left = parseInt(self.ATTR('activeImgPos').left,10) + distance.left
    ;
    
    //记录拖拽的信息
    self.ATTR('dragInfoX').push(new_left); //拖拽图片的坐标记录
    self.ATTR('dragInfoY').push(new_top);
    self.ATTR('dragInfoTime').push(new Date().getTime()); //拖拽发生的时间记录
    // self.ATTR('autoSlideAnim') = null; //Anim obj
    
    D.css(self.ATTR('activeImg'), 'top', new_top + 'px');
    D.css(self.ATTR('activeImg'), 'left', new_left + 'px');
  }
    
  
  //wheel scroll
  var wheelCtlTimer = ATTRS.WHEEL_STEP
  ,currentAction = '';
    
  function wheelScroll(e){
    e.halt();
    if(wheelCtlTimer < ATTRS.WHEEL_STEP){
      ++wheelCtlTimer;
      return false;
    }
    wheelCtlTimer = 0;
    
    var self = this;
    //清空减速滑动动画
    self.cleanRecords();
    
    var action = '';
    
    //记录 放大 | 缩小
    if(e.deltaY){action = (e.deltaY > 0)?('zoom'):('shrunk');}
    // else if( e.detail){action = (e.detail == -3)?('zoom'):('shrunk');}
    if(action == '')return false;
    //反向行为，currentAction记录重置
    if(action != currentAction){currentAction = action;return false;}
        
    //图片当前 宽高
    var activeImgSize = {
      width: getCurrentStyle(self.ATTR('activeImg'), 'width')
      ,height: getCurrentStyle(self.ATTR('activeImg'), 'height')
    };
    
    //图片的尺寸到达上限 或 下限
    if( (action == 'shrunk' && activeImgSize.width < self.ATTR('defaultMinWidth')) 
      || ( action == 'zoom' && activeImgSize.width > self.ATTR('defaultMaxWidth') ) ){
      return false;
    }
    
    //------------------------------------------------------------------开始调整图片宽度
    //当前鼠标所在位置
    var mouseCoo = getMouseCoo(e);
    //当前图片的偏移位置(相对body)
    var activeImgCoo = {
      'x': parseInt(self.ATTR('activeImg').style.left, 10)
      ,'y': parseInt(self.ATTR('activeImg').style.top, 10)
    };

    //当前图片的偏移位置 (相对offsetParent)
    var activeImgOffset = {
      left: getCurrentStyle(self.ATTR('activeImg'),'left')
      ,top: getCurrentStyle(self.ATTR('activeImg'),'top')
    }

    var new_left = activeImgOffset.left
    ,new_top = activeImgOffset.top
    ,new_width = activeImgSize.width 
    ,additionWidth = ATTRS.WHEEL_PIX * 3 * (activeImgSize.width/self.ATTR('initWidth'))//additionWidth 是一个随变化比例增大而增大的值
    ,additionHeight = additionWidth * (activeImgSize.height/activeImgSize.width)
    ;
    //光标是否落在图片上
    if( mouseCoo.x >= activeImgCoo.x && mouseCoo.x <= (activeImgCoo.x + activeImgSize.width)
      && mouseCoo.y >= activeImgCoo.y && mouseCoo.y <= (activeImgCoo.y + activeImgSize.height) ){//长方形区域
      var ratio = 1, ratioX = 1, ratioY = 1;
      ratioX = (mouseCoo.x - activeImgCoo.x)/(activeImgSize.width);
      ratioY = (mouseCoo.y - activeImgCoo.y)/(activeImgSize.height);
      if(action == 'shrunk'){//缩小
        new_left += additionWidth*ratioX;
        new_top  += additionHeight*ratioY;
      }
      else{//放大
        new_left -= additionWidth*ratioX;
        new_top  -= additionHeight*ratioY;
      }
    }
    else{//居中缩放
      var ratio = 0.5;
      if(action == 'shrunk'){
        new_left += additionWidth*ratio;
        new_top  += additionHeight*ratio;
      }
      else{
        new_left -= additionWidth*ratio;
        new_top  -= additionHeight*ratio;
      }
    }
    
    if( action == 'shrunk'){
      new_width -= additionWidth;
    }
    else{
      new_width += additionWidth;
    }

    // log(new_left + ',' + new_top)
    self.ATTR('anim')&&self.ATTR('anim').isRunning&&self.ATTR('anim').stop(false);

    self.ATTR('anim', new Anim(self.ATTR('activeImg'),{
      left: parseInt(new_left * 1000,10)/1000 + 'px'
      ,top: parseInt(new_top * 1000,10)/1000 + 'px'
      ,width: parseInt(new_width ,10) + 'px'
    },0.1).run() );
  }
  
  //binded in document
  function mouseup(e){
    var self = this;
    //记录拖拽的信息
    var currentMouseCoo = getMouseCoo(e);//当前鼠标所在坐标
    var distance = {
      left: currentMouseCoo.x - self.ATTR('mousedownCoo').x
      ,top: currentMouseCoo.y - self.ATTR('mousedownCoo').y
    };
     var new_top = parseInt(self.ATTR('activeImgPos').top,10) + distance.top
    ,new_left = parseInt(self.ATTR('activeImgPos').left,10) + distance.left
    ;
    self.ATTR('dragInfoX').push(new_left); //拖拽图片的坐标记录
    self.ATTR('dragInfoY').push(new_top);
    self.ATTR('dragInfoTime').push(new Date().getTime()); //拖拽发生的时间记录
    self.cancelEvent();
    //开始机械滑动
    self.afterUserDrag_MyShowTime();
  }
  
  
  //------------------------------------------------------------------------------------base|hack functions
  function getMouseCoo(e){
    return {
      x: e.pageX || (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft))
      ,y: e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop))
    }
  }
  
  //get real style 获取高度、宽度、等标量信息 (*IE中 img标签 有width、src属性，不过依然获取不到height值
  function getCurrentStyle(ele, attr){
    var result = '';
    //todo: if style.attr is setted get that
    // if(ele.style && ele.style[transToHump(attr)]){
      // return parseFloat(ele.style[transToHump(attr)])
    // }
    
    if(S.UA && S.UA.ie && ele.tagName == 'IMG' && attr == 'height'){
      return ele.offsetHeight;
    }
    if(window.getComputedStyle){
      result = window.getComputedStyle(ele,null)[attr];
    }
    else{
      attr = transToHump(attr);
      result = ele.currentStyle[attr];
    }
    result = result.replace(/[^0-9+-\.]/g,'');
    return ( parseInt(result,10)?(0-(0-result)):(0) );
  }
  
  //margin-top => marginTop
  function transToHump(s){
    return s.replace(/-([a-z])/gi, function(i,j){return j.toUpperCase();});
  }
  
  S.augment(DDObj, Base, S.EventTarget, o);
  
  return DDObj;
},{
  requires: [
    './asdbase'
    ,'gallery/template/1.0/index'
    ,'anim'
    ,'./assets/image-dd.css'
  ]
});
