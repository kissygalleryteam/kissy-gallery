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

});