/**
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
});