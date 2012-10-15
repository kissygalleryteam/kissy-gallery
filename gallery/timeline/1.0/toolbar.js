/**
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