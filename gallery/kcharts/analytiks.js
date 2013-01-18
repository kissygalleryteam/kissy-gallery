(function(S){

  var $ = S.all,Evt = S.Event;

  S.config({
    packages:[
      {
        name:"gallery",
        tag:"20130118",
        path:"../../",  // 开发时目录, 发布到cdn上需要适当修改
        charset:"utf-8"
      }
    ]
  });

    var colors = [
        {DEFAULT:"#48BAF4",HOVER:"#48BAF4"},
        {DEFAULT:"#ff7b6c",HOVER:"#ff7b6c"},
        {DEFAULT:"#999",HOVER:"#999"},
        {DEFAULT:"#c17e7e",HOVER:"#c17e7e"}
      ];

    var xGrids = {css:{borderLeft:"1px solid #f7f7f7"}};

    var yGrids = {css:{"border-top":"1px dashed #eee"}};

    var points = {
            attr:{
              stroke:"{COLOR}",
              fill:"#fff",
              "r":4,
              "stroke-width":2
            },
            hoverAttr:{
              stroke:"{COLOR}",
              fill:"#fff",
              "r":5,
              "stroke-width":2
            }
        };

    var tip = {
        template:"总支出<br/><span>{{y}}</span> 元",
        css:{
          "background-color":"{COLOR}"
        },
        alignY:"bottom"  //top middle bottom
    };

 S.use('gallery/kcharts/1.0/linechart/index,gallery/kcharts/1.0/legend/index',function(S,LineChart,Legend){
  
    var lineChart1 = new LineChart({
      renderTo:"#J_line1",
      canvasAttr:{
        height:120,
        width:480,
        x:50,
        y:50
      },
      yGrids:yGrids,
      xGrids:xGrids,
      colors:colors,
      themeCls:"ks-chart-analytiks",
      anim:{},
      title:{
              content:"简单线图",
              css:{
              }
            },
            subTitle:{
              content:"simple linechart",
              css:{

              }
            },
      points:points,
       xAxis: {
          text:['星期一','星期二','星期三','星期四','星期五','星期六','星期日']
            },
            yAxis:{
              min:0
            },
      series:[
        {
          data:[{y:100,week:'星期一'},{y:4000,week:'星期二'},{y:120,week:'星期三'},{y:234,week:'星期四'},{y:234,week:'星期五'},{y:234,week:'星期六'},{y:234,week:'星期日'}]
        }
      ],
      defineKey:{
        x:"week",
        y:"y"
      },
      tip:tip
    });

    var lineChart2 = new LineChart({
      renderTo:"#J_line2",
       canvasAttr:{
        height:120,
        width:480,
        x:50,
        y:50
      },
      anim:{},
      yGrids:yGrids,
      xGrids:xGrids,
      colors:colors,
      points:points,
      tip:tip,
      themeCls:"ks-chart-analytiks",
      title:{
              content:"简单曲线图",
              css:{
              }
            },
            subTitle:{
              content:"simple arc linechart",
              css:{

              }
            },
       xAxis: {
          text:['星期一','星期二','星期三','星期四','星期五','星期六','星期日']
            },
            yAxis:{
              min:0
            },
      series:[
        {
          data:[{y:100,week:'星期一'},{y:4000,week:'星期二'},{y:120,week:'星期三'},{y:234,week:'星期四'},{y:234,week:'星期五'},{y:234,week:'星期六'},{y:234,week:'星期日'}]
        }
      ],
      defineKey:{
        x:"week",
        y:"y"
      },
      lineType:"arc"
      
    });

    var lineChart3 = new LineChart({
      renderTo:"#J_line3",
      canvasAttr:{
        height:120,
        width:480,
        x:50,
        y:50
      },
       yGrids:yGrids,
      xGrids:xGrids,
      colors:colors,
      points:points,
      anim:{},
      title:{
              content:"多线图",
              css:{
              }
            },
            subTitle:{
              content:"multiple linechart",
              css:{

              }
            },
       line:{
        attr:{
          "stroke-width":"3px"
        }
       },
       xAxis: {
          text:['星期一','星期二','星期三','星期四','星期五','星期六','星期日'],
                    css:{

                    }
              },
              yAxis:{
                    min:0
               },
      series:[
        {
            data:[{y:400,week:'星期一'},{y:1000,week:'星期二'},{y:400,week:'星期三'},{y:800,week:'星期四'},{y:2000,week:'星期五'},{y:100,week:'星期六'},{y:600,week:'星期日'}],
            text:"张三"
        },
        {
            data:[{y:800,week:'星期一'},{y:1500,week:'星期二'},{y:4200,week:'星期三'},{y:4000,week:'星期四'},{y:2900,week:'星期五'},{y:2000,week:'星期六'},{y:2000,week:'星期日'}],
            text:"李四"
        },
        {
            data:[{y:1200,week:'星期一'},{y:300,week:'星期二'},{y:2200,week:'星期三'},{y:400,week:'星期四'},{y:900,week:'星期五'},{y:300,week:'星期六'},{y:500,week:'星期日'}],
            text:"王五"
        }
      ],
      defineKey:{
        x:"week",
        y:"y"
      },
      tip:tip
    });


    var legend3 = new Legend({
      container:"#J_legend3",
      chart:lineChart3
    });

    Evt.on($("li",$("#J_legend3")),"click",function(e){

      var $li = $(e.currentTarget).toggleClass("disable");

      var index = S.indexOf(e.currentTarget,$("li",$("#J_legend3")));

      if(!$li.hasClass("disable")){

        lineChart3.showLine(index);

      }else{

        lineChart3.hideLine(index);

      }

    });

    var lineChart4 = new LineChart({
      renderTo:"#J_line4",
     canvasAttr:{
        height:120,
        width:480,
        x:50,
        y:50
      },
      anim:{},
       yGrids:yGrids,
      xGrids:xGrids,
      colors:colors,
      points:points,
      themeCls:"ks-chart-analytiks",
      title:{
              content:"比较线图",
              css:{
              }
            },
            subTitle:{
              content:"comparable linechart",
              css:{

              }
            },
      comparable:true,
      line:{
        attr:{
          "stroke-width":"3px"
        }
      },
      xGrids:{
        isShow:false
      },
      xAxis: {
          text:['星期一','星期二','星期三','星期四','星期五','星期六','星期日'],
                    css:{

                    }
             },
             yAxis:{
                    min:0
             },
      pointLines:{
          isShow:true
      },
      series:[
        {
            data:[{y:400,week:'星期一'},{y:1000,week:'星期二'},{y:400,week:'星期三'},{y:800,week:'星期四'},{y:2000,week:'星期五'},{y:100,week:'星期六'},{y:600,week:'星期日'}],
            text:"张三"
        },
        {
            data:[{y:800,week:'星期一'},{y:1500,week:'星期二'},{y:4200,week:'星期三'},{y:4000,week:'星期四'},{y:2900,week:'星期五'},{y:2000,week:'星期六'},{y:2000,week:'星期日'}],
            text:"李四"
        },
        {
            data:[{y:1200,week:'星期一'},{y:300,week:'星期二'},{y:2200,week:'星期三'},{y:400,week:'星期四'},{y:900,week:'星期五'},{y:300,week:'星期六'},{y:500,week:'星期日'}],
            text:"王五"
        }
      ],
      defineKey:{
        x:"week",
        y:"y"
      },
      tip:{
        template:"{{#each datas as data index}}{{#if index == 0}}<h3 class='tip-title'>{{data.week}}</h3>{{/if}}<span style='color:{{data.color}}'>{{data.text}} <span class='num'>{{data.y}}</span> <span class='unit'>元</span></span><br/>{{/each}}",
        css:{
          background:"#f7f7f7"
        },
        alignX:"right",
        alignY:"bottom",
        offset:{
          x:-10,
          y:-10
        },
        boundryDetect:true
      }
    });

    var legend4 = new Legend({
      container:"#J_legend4",
      chart:lineChart4
    });

    Evt.on($("li",$("#J_legend4")),"click",function(e){

      var $li = $(e.currentTarget).toggleClass("disable");

      var index = S.indexOf(e.currentTarget,$("li",$("#J_legend4")));

      if(!$li.hasClass("disable")){

        lineChart4.showLine(index);

      }else{

        lineChart4.hideLine(index);

      }

    });


    S.use('gallery/kcharts/1.0/barchart/index,gallery/kcharts/1.0/legend/index',function(S,BarChart,Legend){

    var barChart1 = new BarChart({
      renderTo:"#J_bar1",
      anim:{},
      themeCls:"ks-chart-analytiks",
      colors:colors,
      canvasAttr:{
        height:120,
        width:480,
        x:50,
        y:50
      },
      title:{
              content:"简单柱形图",
              css:{
              }
            },
            subTitle:{
              content:"simple barchart",
              css:{

              }
            },
       xAxis: {
          text:['星期一','星期二','星期三','星期四','星期五','星期六','星期日']
            },
            yAxis:{
              min:0
            },
            bars:{
              css:{
              }
            },
       series:[
        {
            data:[{y:400,week:'星期一'},{y:1000,week:'星期二'},{y:400,week:'星期三'},{y:800,week:'星期四'},{y:2000,week:'星期五'},{y:100,week:'星期六'},{y:600,week:'星期日'}]
        }
      ],
      defineKey:{
        x:"week",
        y:"y"
      },
      xGrids:xGrids,
      yGrids:yGrids,
      tip:{
        template:"总支出<br/><span>{{y}}</span> 元",
        alignX:"right",
        css:tip.css,
        offset:{
          y:-10
        }
      }
    });
  
    var barChart2 = new BarChart({
      renderTo:"#J_bar2",
      anim:{},
       themeCls:"ks-chart-analytiks",
      colors:colors,
      canvasAttr:{
        height:120,
        width:480,
        x:50,
        y:50
      },
      title:{
              content:"多柱形图",
              css:{
              }
            },
            subTitle:{
              content:"multiple barchart",
              css:{

              }
            },
       xAxis: {
          text:['星期一','星期二','星期三','星期四','星期五','星期六','星期日']
            },
            yAxis:{
              min:0
            },
            bars:{
              css:{
              }
            },
       series:[
        {
            data:[{y:400,week:'星期一'},{y:1000,week:'星期二'},{y:400,week:'星期三'},{y:800,week:'星期四'},{y:2000,week:'星期五'},{y:100,week:'星期六'},{y:600,week:'星期日'}],
            text:"张三"
        },
        {
            data:[{y:800,week:'星期一'},{y:1500,week:'星期二'},{y:4200,week:'星期三'},{y:4000,week:'星期四'},{y:2900,week:'星期五'},{y:2000,week:'星期六'},{y:2000,week:'星期日'}],
            text:"李四"
        },
        {
            data:[{y:1200,week:'星期一'},{y:300,week:'星期二'},{y:2200,week:'星期三'},{y:400,week:'星期四'},{y:900,week:'星期五'},{y:300,week:'星期六'},{y:500,week:'星期日'}],
            text:"王五"
        }
      ],
      defineKey:{
        x:"week",
        y:"y"
      },
       tip:{
        template:"总支出<br/><span>{{y}}</span> 元",
        alignX:"right",
        css:tip.css,
        offset:{
          y:-10
        }
      }
    });

    var legend2 = new Legend({
      container:"#J_legend2",
      chart:barChart2
    });

    Evt.on($("li",$("#J_legend2")),"click",function(e){

      var $li = $(e.currentTarget).toggleClass("disable");

      var index = S.indexOf(e.currentTarget,$("li",$("#J_legend2")));

      if(!$li.hasClass("disable")){

        barChart2.showBar(index);

      }else{

        barChart2.hideBar(index);

      }

    });

  });

    

  });

})(KISSY);