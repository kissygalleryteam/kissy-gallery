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
});