/**
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
    ,scale: 1 //一个刻度单位的最小值 默认：天
    ,minScale: 1
    ,setData: function(newData){
      this.myData = newData;
      this.myData = this.myData.sort(function(a,b){
        //字符串比较
        return a.time > b.time;
      });
      return this;
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
      var reg_songtime = /(\d{4})[^0-9]*(\d{2})?[^0-9]*(\d{2})?/;

      this.beginYear = parseInt( this.myData[0].time && (this.myData[0].time.match(reg_songtime)[1]) );

      this.endYear = parseInt( this.myData[this.myData.length-1].time && (this.myData[this.myData.length-1].time.match(reg_songtime)[1]) );

      this.maxInterval = this.endYear - this.beginYear;

      //nav width
      this.widthRate = this.rate / (1 / 200);

      this.navWidth = parseInt( this.widthRate * this.maxInterval, 10);
      
      // this.spacer = parseInt( $(document.body).width() * 3 / 3, 10);
      this.spacer = parseInt( panel.width() * 3 / 3, 10);

      this.realWidth = this.navWidth + this.spacer * 2;

      this.minLeft = parseInt(0 - this.navWidth + this.spacer / 3, 10);
      this.maxLeft = parseInt(this.spacer / 3);
      return this;
    }
  }

  return Config;

});