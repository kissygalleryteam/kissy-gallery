/**
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
});