(function(S){

  var Evt = S.Event,$ = S.all;

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

 S.use('gallery/kcharts/1.0/linechart/index,gallery/kcharts/1.0/legend/index',function(S,LineChart,Legend){
  
    var lineChart1 = new LineChart({
      renderTo:"#J_line1",
      canvasAttr:{
        height:120,
        width:480,
        x:50,
        y:50
      },
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
      tip:{
        template:"总支出：<span>{{y}}</span> 元<br/>",
        css:{
          "border-color":"{COLOR}"
        }
      }
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
      lineType:"arc",
      tip:{
        template:"总支出：<span>{{y}}</span> 元<br/>",
        css:{
          "border-color":"{COLOR}"
        }
      }
    });

    var lineChart3 = new LineChart({
      renderTo:"#J_line3",
      canvasAttr:{
        height:120,
        width:480,
        x:50,
        y:50
      },
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
               points:{
            attr:{
              stroke:"#fff",
              "radius":4,
              "stroke-width":1.5
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
        template:"总支出：<span>{{y}}</span> 元<br/>",
        css:{
          border:"3px solid {COLOR}"
        }
      }
    });


    var legend3 = new Legend({
      container:"#J_legend3",
      chart:lineChart3
    });

    lineChart3.on("afterRender",function(){
        Evt.on($("li",$("#J_legend3")),"click",function(e){

          var $li = $(e.currentTarget).toggleClass("disable");

          var index = S.indexOf(e.currentTarget,$("li",$("#J_legend3")));

          if(!$li.hasClass("disable")){

            lineChart3.showLine(index);

          }else{

            lineChart3.hideLine(index);

          }

        });  
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
             points:{
          attr:{
              stroke:"#fff",
              "radius":4,
              "stroke-width":1.5
          }
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
          border:"3px solid {COLOR}"
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

    lineChart4.on("afterRender",function(){

        Evt.on($("li",$("#J_legend4")),"click",function(e){

          var $li = $(e.currentTarget).toggleClass("disable");

          var index = S.indexOf(e.currentTarget,$("li",$("#J_legend4")));

          if(!$li.hasClass("disable")){

            lineChart4.showLine(index);

          }else{

            lineChart4.hideLine(index);

          }

      });

    });

    


    S.use('gallery/kcharts/1.0/barchart/index,gallery/kcharts/1.0/legend/index',function(S,BarChart,Legend){

    var barChart1 = new BarChart({
      renderTo:"#J_bar1",
      anim:{},
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
      tip:{
        template:"总支出：<span>{{y}}</span> 元<br/>",
        alignX:"right",
        css:{"border-color":"{COLOR}"},
        offset:{
          y:-10
        }
      }
    });
  
    var barChart2 = new BarChart({
      renderTo:"#J_bar2",
      anim:{},
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
        template:"总支出：<span>{{y}}</span> 元<br/>",
        css:{"border-color":"{COLOR}"},
        offset:{
          y:-10
        }
      }
    });

    var legend2 = new Legend({
      container:"#J_legend2",
      chart:barChart2
    });

    barChart2.on("afterRender",function(e){

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

  // S.use('gallery/kcharts/1.0/piechart/index',function(S,PieChart){

  //     var data = [100,4000,120,234,234,234,234];
  //     var labels = ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'];

  //     var piechart1 = new PieChart('#J_pie1',{
  //       cx:300,
  //       cy:150,
  //       r:80,
  //       data:data,
  //       labels:labels,
  //       anim:{type:'r',easing:'bounceOut',duration:1000}
  //     });

  //     var piechart2 = new PieChart('#J_pie2',{
  //       cx:300,
  //       cy:150,
  //       r:80,
  //       emptyRadius:40,
  //       data:data,
  //       labels:labels,
  //       anim:{type:'sector',easing:'bounceOut',duration:1000}
  //     });
  //   });
    

  });

})(KISSY);