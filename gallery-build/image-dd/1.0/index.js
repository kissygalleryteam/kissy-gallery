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
  * ������ק
  */
KISSY.add('gallery/image-dd/1.0/index', function(S, Base, Template, Anim){
  var D = S.DOM, E = S.Event, $ = S.all;
  
  //asd
  var ATTRS = {
    //constant variables
    WHEEL_STEP: 1 //����м����δ�����Ϊ
    ,WHEEL_PIX: 50 //һ���������ֵ
    ,SHOW_DOWN: 0 //�����˶��ļ��ٶȴ�С
    ,MOUSE_MOVE_AUTO_CLOSE_TIMER: 5000 // ����ھ��� �趨��ʱ����û�з���move����Ϊ���߼���ת��mouseup
    ,DEGRADATION: 2 //���������move�¼�����Ƶ�ʣ�

    ,popup: null //ȫ�x�������
    ,activeImg: null //��ǰ��Ծ��img��ǩ
    ,activeImgPos: {left:0, top:0} //mousedownʱͼƬ����λ��
    ,mousedownCoo: {} //���mousedownλ�õ����
    ,anim: null//���ֿ��ƷŴ���С�Ķ�������
    ,initAnim: null//��ʼ����λͼƬ��������
    ,bigImgObj: new Image()//��ͼimg����
    ,initWidth: 0
    ,defaultMaxWidth: 10000//ͼƬ�Ŵ������
    ,defaultMinWidth: 50 //ͼƬ��С����С���
    ,ieIframeMask: null
    
    ,dragInfoX: [] //��קͼƬ������¼
    ,dragInfoY: []
    ,dragInfoTime: [] //��ק�����ʱ���¼
    ,autoSlideAnim: null //Anim obj

    ,popupBd: null //����㣬ͼƬ����
    ,popupOpacityBg: null
    ,popupBox: null
    ,popupHd: null
  };

  var STATUS = {
    inited: false //��Ƭ�Ƿ��ʼ����
  }

  var DATAS = {
    POPUP_HD_TPL: '<div class="box-hd close-rt-wrap" ><a href="#" title="���˳��Ҳ���Թر�Ŷ" class="close-rt J_Close" id="J_CloseImageDD"></a></div>'

    ,POPUP_IMG: '<img title="�����ֿ��ԷŴ�ͼƬ" class="G_K" style="width:{{showWidth}}px;left:{{left}}px;top:{{top}}px;" src="{{imgSrc}}"  />'

    ,POPUP_TPL: '<div class="img-dd-popup">\
                    <div class="img-dd-opacity-bg"></div>\
                    <div class="img-dd-box">\
                    <div class="box-bd"></div>\
                    </div>\
                 </div>'
    ,POPUP_IFRAME_TPL: '<iframe class="ie-popup-mask hidden"></iframe>'
  }
   
  var CFG = {
    ele: []
  };
  /**
    * @param{HTMLIMGElement} һ��img��ǩ���������
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
      
      //��ʼ�� new ����ʱ��
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
    
    //��add��4��img �� img������ע��click�¼�
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
          //��ʼ����Ƭ
          self._createPopup();
          self._initHTMLElement();
          self._bindPopupMousedown();
          self.STATU('inited', true);
        }
        
        self._showPopupImg(target.getAttribute('data-original-url'),  target.getAttribute('src') );
        D.show(self.ATTR('popup'));
        
        D.show(self.ATTR('ieIframeMask'));
        D.show(self.ATTR('closeBtn'));
      });
      
      //mouse move   add: move settime close action
      //mouse up
    }
    
    //��ʼ����ʾͼƬ��ͼ
    ,_showPopupImg: function(srcUrl, srcUrlThunmb){
      var self = this
      ,clientWidth  = document.body.clientWidth  || doucment.doucmentElement.clientWidth
      ;
      
      //��ӵ�ǰͼƬ
      self.ATTR('popupBd').innerHTML = Template(self.DATA('POPUP_IMG')).render({
        imgSrc: srcUrlThunmb//��ʼ����ʾСͼ
        ,imgAlt: 'ͼƬ��ͼ'
        ,showWidth: parseInt(clientWidth/2,10)
        ,left: parseInt(clientWidth/4,10) //��ͼƬ��ʾ�����м�
        ,top: 0
      });
      
      //------------------------------------------------------------------��ʼ��һЩ���
      if( S.UA.ie && S.UA.ie == 6){
        self.ATTR('popup').style.height = (document.body.scrollHeight || document.documentElement.scrollHeight) + 'px';
        self.ATTR('popup').style.width  = (document.body.scrollWidth || document.documentElement.scrollWidth) + 'px';
      }
      self.ATTR('initWidth', parseInt(clientWidth/2,10));//��ʼ��ͼƬ��ʾ�Ŀ��
      
      self.cleanRecords(true);
      
      self.ATTR('activeImg', D.get('IMG', self.ATTR('popupBd') ) );//��ȡ�²����ͼƬ��DOM����
      
      //����ͼƬ�����ڿɼ�����
      self.ATTR('initAnim') && self.ATTR('initAnim').stop(false);
      self.ATTR('initAnim', new Anim(self.ATTR('activeImg'), {
        top: (document.body.scrollTop || document.documentElement.scrollTop) + 30 + 'px'
      },1,'easeOutStrong').run() );
      
      //��ͼ���غú� ��ʾ��ͼ
      self.ATTR('bigImgObj').onload = null;
      if( srcUrl || srcUrl != ''){
        self.ATTR('bigImgObj', null);
        self.ATTR('bigImgObj', new Image());
        self.ATTR('bigImgObj').onload = function(){
          self.ATTR('activeImg').src = srcUrl;
        }
        
      };
      self.ATTR('bigImgObj').src = srcUrl;
      
      //ע������м�����¼�
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
    
    //ȫ���ɰ� this function run only one time
    ,_createPopup: function(){
      var self = this, cfg = self.config;
      self.ATTR('popup', D.create( self.DATA('POPUP_TPL') ) );
      self.ATTR('closeBtn', D.create( self.DATA('POPUP_HD_TPL') ) );
      if(S.UA.ie && S.UA.ie == 6){
        self.ATTR('ieIframeMask', D.create( self.DATA('POPUP_IFRAME_TPL') ) );
        self.ATTR('ieIframeMask').style.width = document.documentElement.scrollWidth + 'px';
        self.ATTR('ieIframeMask').style.height = document.documentElement.scrollHeight + 'px';
        document.body.appendChild(self.ATTR('ieIframeMask'));
      }
      document.body.appendChild(self.ATTR('popup'));
      self.ATTR('popup').appendChild(self.ATTR('closeBtn'));
    }
    
    //�����mousedown�¼�ע�ᣬ this function execute just one time , event will never remove
    ,_bindPopupMousedown: function(){
      var self = this, cfg = self.config;
      // E.on(self.ATTR('popup'),"dragstart",function(e){
        // e.preventDefault();
      // });
      E.on(self.ATTR('popup'), 'mousedown', function(e){
        var target = e.target;
        if( target.tagName.toUpperCase() != 'IMG'){
          return ;
        }
        e.halt();
        
        //ֹͣ��ʼ���Ķ�λ����
        self.ATTR('initAnim') && self.ATTR('initAnim').stop(false);
        self.ATTR('initAnim', null);
        
        //��ʼ����ק��Ϣ
        self.cleanRecords(true);
        
        self.ATTR('dragInfoX').push(getCurrentStyle(target, 'left')); //��קͼƬ������¼
        self.ATTR('dragInfoY').push(getCurrentStyle(target, 'top'));
        self.ATTR('dragInfoTime').push(new Date().getTime()); //��ק�����ʱ���¼
        
        
        self.ATTR( 'activeImg', target);
        
        self.ATTR('mousedownCoo', getMouseCoo(e) );
        self.ATTR('activeImgPos',{
          left: getCurrentStyle(target, 'left')
          ,top: getCurrentStyle(target, 'top')
        });
        
        //ȡ���ı�ѡ��
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
      
      E.on(self.ATTR('popup'), 'click', function(e){
        if(S.UA.ie && S.UA.ie == 6){
          if( D.hasClass( e.target, 'img-dd-opacity-bg')){
            e.halt();
            self.closePopup();
          }
        }
      });
      
      
      return true;
    }
    
    //������������ ��hd��bd��bt������
    ,_initHTMLElement: function(){
      var self = this;
      self.ATTR('popupOpacityBg', D.get('.img-dd-opacity-bg', self.ATTR('popup') ) );
      self.ATTR('popupBox', D.get('.img-dd-box', self.ATTR('popup') ) );
      self.ATTR('popupHd', D.get('.box-hd', self.ATTR('popup')) );
      self.ATTR('popupBd', D.get('.box-bd', self.ATTR('popup') ) );
    }
    
    
    //���ߣ� �����ק����м�¼�� x��y��time ���� ��קmouseup��Ļ���Ч��
    ,afterUserDrag_MyShowTime: function(){
      var self = this;
      // self.ATTR('dragInfoX', []); //��קͼƬ������¼
      // self.ATTR('dragInfoY') = [];
      // self.ATTR('dragInfoTime') = []; //��ק�����ʱ���¼
      var len = self.ATTR('dragInfoX').length;
      
      if(true || len < 3){
        //��ֱ��
        self.slide_straightLine();
        return false;
      }
      else{//closed
        //��һ��ԲȦ
        var x1 = self.ATTR('dragInfoX')[len-3], y1 = self.ATTR('dragInfoY')[len-3]
        ,x2 = self.ATTR('dragInfoX')[len-2], y2 = self.ATTR('dragInfoY')[len-2]
        ,x3 = self.ATTR('dragInfoX')[len-1], y3 = self.ATTR('dragInfoY')[len-1]
        ;
      }
    }
    
    //ʹ��kissy anim��һ��ֱ��
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
    
    //������ק��¼����  ��ֹ��ס����ʱ�����������޴�����
    ,cleanRecords: function(clearAll){
      var self = this;
      self.ATTR('dragInfoX', []); //��קͼƬ������¼
      self.ATTR('dragInfoY', []);
      self.ATTR('dragInfoTime', []); //��ק�����ʱ���¼
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
      D.hide(self.ATTR('popup'));
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
      
    if(moveCtlTimer < ATTRS.DEGRADATION){//������
      ++moveCtlTimer;
      return false;
    }
    moveCtlTimer = 0;
    var self = this;
    
    var currentMouseCoo = getMouseCoo(e);//��ǰ����������
    
    var distance = {
      left: currentMouseCoo.x - self.ATTR('mousedownCoo').x
      ,top: currentMouseCoo.y - self.ATTR('mousedownCoo').y
    };
    var new_top = parseInt(self.ATTR('activeImgPos').top,10) + distance.top
    ,new_left = parseInt(self.ATTR('activeImgPos').left,10) + distance.left
    ;
    
    //��¼��ק����Ϣ
    self.ATTR('dragInfoX').push(new_left); //��קͼƬ������¼
    self.ATTR('dragInfoY').push(new_top);
    self.ATTR('dragInfoTime').push(new Date().getTime()); //��ק�����ʱ���¼
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
    //��ռ��ٻ�������
    self.cleanRecords();
    
    var action = '';
    
    //��¼ �Ŵ� | ��С
    if(e.deltaY){action = (e.deltaY > 0)?('zoom'):('shrunk');}
    // else if( e.detail){action = (e.detail == -3)?('zoom'):('shrunk');}
    if(action == '')return false;
    //������Ϊ��currentAction��¼����
    if(action != currentAction){currentAction = action;return false;}
        
    //ͼƬ��ǰ ���
    var activeImgSize = {
      width: getCurrentStyle(self.ATTR('activeImg'), 'width')
      ,height: getCurrentStyle(self.ATTR('activeImg'), 'height')
    };
    
    //ͼƬ�ĳߴ絽������ �� ����
    if( (action == 'shrunk' && activeImgSize.width < self.ATTR('defaultMinWidth')) 
      || ( action == 'zoom' && activeImgSize.width > self.ATTR('defaultMaxWidth') ) ){
      return false;
    }
    
    //------------------------------------------------------------------��ʼ����ͼƬ���
    //��ǰ�������λ��
    var mouseCoo = getMouseCoo(e);
    //��ǰͼƬ��ƫ��λ��(���body)
    var activeImgCoo = {
      'x': parseInt(self.ATTR('activeImg').style.left, 10)
      ,'y': parseInt(self.ATTR('activeImg').style.top, 10)
    };

    //��ǰͼƬ��ƫ��λ�� (���offsetParent)
    var activeImgOffset = {
      left: getCurrentStyle(self.ATTR('activeImg'),'left')
      ,top: getCurrentStyle(self.ATTR('activeImg'),'top')
    }

    var new_left = activeImgOffset.left
    ,new_top = activeImgOffset.top
    ,new_width = activeImgSize.width 
    ,additionWidth = ATTRS.WHEEL_PIX * 3 * (activeImgSize.width/self.ATTR('initWidth'))//additionWidth ��һ����仯������������ֵ
    ,additionHeight = additionWidth * (activeImgSize.height/activeImgSize.width)
    ;
    //����Ƿ�����ͼƬ��
    if( mouseCoo.x >= activeImgCoo.x && mouseCoo.x <= (activeImgCoo.x + activeImgSize.width)
      && mouseCoo.y >= activeImgCoo.y && mouseCoo.y <= (activeImgCoo.y + activeImgSize.height) ){//����������
      var ratio = 1, ratioX = 1, ratioY = 1;
      ratioX = (mouseCoo.x - activeImgCoo.x)/(activeImgSize.width);
      ratioY = (mouseCoo.y - activeImgCoo.y)/(activeImgSize.height);
      if(action == 'shrunk'){//��С
        new_left += additionWidth*ratioX;
        new_top  += additionHeight*ratioY;
      }
      else{//�Ŵ�
        new_left -= additionWidth*ratioX;
        new_top  -= additionHeight*ratioY;
      }
    }
    else{//�������
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
    //��¼��ק����Ϣ
    var currentMouseCoo = getMouseCoo(e);//��ǰ����������
    var distance = {
      left: currentMouseCoo.x - self.ATTR('mousedownCoo').x
      ,top: currentMouseCoo.y - self.ATTR('mousedownCoo').y
    };
     var new_top = parseInt(self.ATTR('activeImgPos').top,10) + distance.top
    ,new_left = parseInt(self.ATTR('activeImgPos').left,10) + distance.left
    ;
    self.ATTR('dragInfoX').push(new_left); //��קͼƬ������¼
    self.ATTR('dragInfoY').push(new_top);
    self.ATTR('dragInfoTime').push(new Date().getTime()); //��ק�����ʱ���¼
    self.cancelEvent();
    //��ʼ��е����
    self.afterUserDrag_MyShowTime();
  }
  
  
  //------------------------------------------------------------------------------------base|hack functions
  function getMouseCoo(e){
    return {
      x: e.pageX || (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft))
      ,y: e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop))
    }
  }
  
  //get real style ��ȡ�߶ȡ���ȡ��ȱ���Ϣ (*IE�� img��ǩ ��width��src���ԣ�������Ȼ��ȡ����heightֵ
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
    ,'template'
    ,'anim'
    ,'./assets/image-dd.css'
  ]
});
