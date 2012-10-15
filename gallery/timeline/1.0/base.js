/**
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
});