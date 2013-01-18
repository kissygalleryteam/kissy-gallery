KISSY.add('gallery/kcharts/1.0/piechart/index',function(S,Paper,Ft,Label){
  var D = S.DOM
	,ColorMap = [
	  {DEFAULT:"#FF8F44",HOVER:"#FF8F44"},
	  {DEFAULT:"#4573a7",HOVER:"#5E8BC0"},
	  {DEFAULT:"#aa4644",HOVER:"#C35F5C"},
	  {DEFAULT:"#89a54e",HOVER:"#A2BE67"},
	  {DEFAULT:"#806a9b",HOVER:"#9982B4"},
	  {DEFAULT:"#3e96ae",HOVER:"#56AFC7"},
	  {DEFAULT:"#d9853f",HOVER:"#F49D56"},
	  {DEFAULT:"#808080",HOVER:"#A2A2A2"},
	  {DEFAULT:"#188AD7",HOVER:"#299BE8"},
	  {DEFAULT:"#90902C",HOVER:"#B7B738"}
	]

  function helperRand(a,b){
    return Math.floor(Math.random()*(b-a+1)+a);
  }
  function pad(s){
    return s.length===1?'0'+s:s;
  }
  function randColor(){
    var r,g,b;
    r = pad((helperRand(0,255)).toString(16));
    g = pad((helperRand(0,255)).toString(16));
    b = pad((helperRand(0,255)).toString(16));
    return '#'+r+g+b;
  }
  function fixNumber(n,m){
    m = typeof m == undefined ? m : 2;
    return n.toFixed(m);
  }
  function normalizeNum(n,forward){
    return parseFloat(n.toFixed(4));
  }

  var dftCfg = {
      labelPadding:20
  };
  /*
   * cfg = {cx:cx,cy:cy,r:r,values,opts}
   * */
  function PieChart(id,cfg){
    this.colorseed = 0;
    this.container = S.get(id);
    this.paper = Paper(S.get(id));
    this.labelLayer = this.paper.group();
    this.cfg = S.mix(dftCfg,cfg);
    this.sectors = null;
    this.percentData = null;
    this.drawSector();
  }
  var methods = {
    bindEvent:function(){
      var sectors = this.sectors
        ,that = this
        ,cfg = this.cfg
        ,cx = cfg.cx
        ,cy = cfg.cy
        ,events = cfg.events || {}

      if(events.enterleave){

      }else if(events.click){

      }
      for(var i=0;i<sectors.length;i++){
        (function(i){
          sectors[i].on('mouseenter',function(e){
            that.fire('mouseenter',{target:this});
            //that.scaleSector(this,1.1,1.1,cx,cy);
          },sectors[i])
          .on('mouseleave',function(e){
            that.fire('mouseleave',{target:this});
            //that.scaleSector(this,1,1,cx,cy);
          },sectors[i])
          .on('click',function(e){
            that.fire('click',{target:this});
            //that.transformSector(this);
          },sectors[i]);
        })(i);
      }
    },
    onend:function(){
      this.drawLabel();
      this.bindEvent();
      this.fire('afterRender');
    },
    sectorFull:function (cx, cy, r, startAngle, endAngle, fill) {
      var rad = Math.PI / 180,
          angel= (startAngle + endAngle)/ 2,
          x = cx + r * Math.cos(-angel * rad),
          x1 = cx + r * Math.cos(-startAngle * rad),
          x2 = cx + r * Math.cos(-endAngle * rad),
          y = cy + r * Math.sin(-angel * rad),
          y1 = cy + r * Math.sin(-startAngle * rad),
          y2 = cy + r * Math.sin(-endAngle * rad),
          res = [
            "M", fixNumber(cx), cy,
            "L", fixNumber(x1), fixNumber(y1),
            "A", r, r, 0, +(Math.abs(endAngle - startAngle) > 180), 1, fixNumber(x2), fixNumber(y2),
            "z"
          ];

      /*
      this.paper.circle(x1,y1,3);
      var x3 = cx + r*Math.cos(-angel*rad)
        ,y3 = cy + r*Math.sin(-angel*rad)
      this.paper.circle(x3,y3,2).attr('fill','blue');
      */
      var from
        ,to;
      if(startAngle>endAngle){
        from = startAngle;
        to = endAngle;
      }else{
        from = endAngle;
        to = startAngle;
      }
      res.middle = {from:from,to:to,angel:angel,x:x,y:y};//天使
      return res;
    },
    sector:function (cx, cy, r,_r/* 内部空心 */, startAngle, endAngle, fill) {
      var rad = Math.PI / 180,
          angel= (startAngle + endAngle)/ 2,
          x = cx + r * Math.cos(-angel * rad),
          x1 = cx + r * Math.cos(-startAngle * rad),
          x2 = cx + r * Math.cos(-endAngle * rad),
          _x1 = cx + _r * Math.cos(-startAngle * rad),
          _x2 = cx + _r * Math.cos(-endAngle * rad),

          y = cy + r * Math.sin(-angel * rad),
          y1 = cy + r * Math.sin(-startAngle * rad),
          y2 = cy + r * Math.sin(-endAngle * rad),
          _y1 = cy + _r * Math.sin(-startAngle * rad),
          _y2 = cy + _r * Math.sin(-endAngle * rad),

          res = [
            "M", fixNumber(_x1), fixNumber(_y1),
            "L", fixNumber(x1), fixNumber(y1),
            "A", r, r, 0, +(Math.abs(endAngle - startAngle) > 180), 1, fixNumber(x2), fixNumber(y2),
            "L", fixNumber(_x2),fixNumber(_y2),
            "A",_r,_r, 0, +(Math.abs(endAngle - startAngle) > 180), 0, fixNumber(_x1), fixNumber(_y1)
          ];
      var from
        ,to;
      if(startAngle>endAngle){
        from = startAngle;
        to = endAngle;
      }else{
        from = endAngle;
        to = startAngle;
      }
      res.middle = {from:from,to:to,angel:angel,x:x,y:y};//天使
      return res;
    },
    drawSector:function(){
      var paper = this.paper
        ,that = this
        ,cfg = this.cfg
        ,data = cfg.data
        ,sum = 0
        ,percentData = []//转化后的百分比
        ,fromAngel//开始的角度
        ,toAngel
        ,rad
        ,cx = cfg.cx
        ,cy = cfg.cy
        ,r = cfg.r
        ,path
        ,pathString
      this.percentData = percentData;

      for(var i=0;i<data.length;i++){
        sum+=data[i];
      }
      for(var i=0;i<data.length;i++){
        percentData.push(data[i]/sum);
      }
      var sectors = that.sectors = []
        ,len = percentData.length
        ,emptyRadius = cfg.emptyRadius

      //扇形展开动画
      function _draw1(e){
        var s = e.s,t = e.t;
        var _r = cfg.animater ? s*r:r
          ,_from
          ,_to

        for(var j=0;j<len;j++){
          if(j){
            _from = _to;
            _to = _from - s*percentData[j]*360;
          }else{
            fromAngel = 90 + percentData[0]/2 * 360;
            toAngel = 90 - percentData[0]/2 * 360;
            _from = fromAngel+s*(90-fromAngel);
            _to = _from+s*(toAngel-fromAngel);
          }

          if(emptyRadius){
            path = that.sector(cx,cy,_r,emptyRadius,_from,_to);
          }else{
            path = that.sectorFull(cx,cy,_r,_from,_to);
          }
          pathString = path.join(' ');

          if(sectors[j]){
            sectors[j].attr('path',pathString);
          }else{
            var sector = paper.path(pathString);
            sectors[j] = sector
            var colorindex = (that.colorseed++)%10;
            var color = ColorMap[colorindex].DEFAULT;
            sectors[j].attr({'fill':color,stroke:'#fff'});
          }
          if(s === 1){
            //扇形的平分线与圆的交点
            sectors[j].middle = path.middle;
          }
        }
      }
      //半径展开动画
      function _draw2(e,s,t){
        s = e.s,t = e.t;
        var _r = s*r
          ,_from
          ,_to
        for(var j=0;j<len;j++){
          if(j){
            _from = _to;
            _to = _from - percentData[j]*360;
          }else{
            fromAngel = 90 + percentData[0]/2 * 360;
            toAngel = 90 - percentData[0]/2 * 360;
            _from = fromAngel+(90-fromAngel);
            _to = _from+(toAngel-fromAngel);
          }
          path = that.sectorFull(cx,cy,_r,_from,_to);
          pathString = path.join(' ');
          if(sectors[j]){
            sectors[j].attr('path',pathString);
          }else{
            var sector = paper.path(pathString);
            sectors[j] = sector
            var colorindex = (that.colorseed++)%10;
            var color = ColorMap[colorindex].DEFAULT;
            sectors[j].attr({'fill':color,stroke:'#fff'});
          }
          if(s === 1){
            //扇形的平分线与圆的交点
            sectors[j].middle = path.middle;
          }
        }
      }
      var types = {
          'sector':_draw1,
          'r':_draw2
      };
      var _draw
        ,anim_cfg = S.mix({type:'sector'},cfg.anim)
      _draw = types[anim_cfg.type];
      if(cfg.anim){
        var ft = new Ft(anim_cfg);
        ft.on('step',_draw,this);
        ft.on('end',this.onend,this);
        ft.run();
      }else{
        _draw({s:1,t:1});
        this.onend();
      }
    },
    drawOneSector:function(e,s,t){
      s = e.s,t = e.t;
      var paper = this.paper
        ,cfg = this.cfg
        ,that = this
        ,r = cfg.r
        ,percentData = this.percentData
        , _r = cfg.animater ? s*r:r
        ,fromAngel//开始的角度
        ,toAngel
        ,_from
        ,_to
        ,cx = cfg.cx
        ,cy = cfg.cy
        ,path
        ,pathString
        ,len = percentData.length
        ,sectors = []
      that.sectors = sectors;
      for(var j=0;j<len;j++){
        if(j){
          _from = _to;
          _to = _from - s*percentData[j]*360;
        }else{
          fromAngel = 90 + percentData[0]/2 * 360;
          toAngel = 90 - percentData[0]/2 * 360;
          _from = fromAngel+s*(90-fromAngel);
          _to = _from+s*(toAngel-fromAngel);
        }


        path = that.sector(cx,cy,_r,60,_from,_to);
        pathString = path.join(' ');

        if(sectors[j]){
          sectors[j].attr('path',pathString);
        }else{
          var sector = paper.path(pathString);
          sectors[j] = sector
          var colorindex = (that.colorseed++)%10;
          var color = ColorMap[colorindex].DEFAULT;
          sectors[j].attr({'fill':color,stroke:'#fff'});
        }
        if(s === 1){
          //扇形的平分线与圆的交点
          sectors[j].middle = path.middle;
        }
      }
    },
    scaleSector:function(sector,scalex,scaley,cx,cy){
      sector.scale(scalex,scaley,cx,cy);
    },
    transformSector:function(sector,unit){
      if(this.currentTransformedSector == sector)
        return;

      var x,y,angel
      unit || (unit = 10);
      if(this.currentTransformedSector){
        angel = this.currentTransformedSector.middle.angel*Math.PI/180;
        x = unit*Math.cos(angel);
        y = -unit*Math.sin(angel);
        this.currentTransformedSector.translate(-x,-y);
      }

      angel = sector.middle.angel*Math.PI/180;
      x = unit*Math.cos(angel);
      y = -unit*Math.sin(angel);
      sector.translate(x,y);
      this.currentTransformedSector = sector;
    },
    getLabelXY:function(x,y,content,left){
      var util = this.textlabel || (this.textlabel = new Label())
        ,size
        ,x1
        ,y1
      size = util.getTextSize(content)
      if(left){
        x1 = x- size.width;
        y1 = y - size.height/2;
      }else{
        x1 = x+5;
        y1 = y - size.height/2;
      }
      return {
        "x":normalizeNum(x1),
        "y":normalizeNum(y1)
      }
    },
    //label算法二：最靠近扇形的角平分线
    drawLabel:function(){
      var paper = this.labelLayer
        ,cfg = this.cfg
        ,cx = cfg.cx
        ,cy = cfg.cy
        ,sectors = this.sectors
        ,sector
        ,middle
        ,len = sectors.length
        ,labels = cfg.labels
        ,olabels = []//生成的label
        ,label
        ,RAD = Math.PI/180
        ,cos = Math.cos
        ,sin = Math.sin
        ,asin = Math.asin
        ,abs = Math.abs
        ,round = Math.round
        ,rad
        ,x,y
        ,x1,y1
        ,x2,y2
        ,r = cfg.r
        ,R = cfg.r+cfg.labelPadding
        ,Rm = cfg.r+2*cfg.labelPadding/3
        ,labelO
        ,labelRight = []
        ,labelLeft = []
        ,labelRightLen
        ,labelLeftLen

      for(var i=0;i<len;i++){
        sector = sectors[i];
        middle = sector.middle;
        labelO = {};
        if(-90<=middle.angel && middle.angel<=90){
          labelRight.push(labelO);
        }else{
          labelLeft.push(labelO);
        }
        rad = (middle.angel%360)*RAD;
        x = normalizeNum(cx+r*cos(-rad));
        y = normalizeNum(cy+r*sin(-rad));
        x1 = normalizeNum(cx+Rm*cos(-rad));
        y1 = normalizeNum(cy+Rm*sin(-rad));
        x2 = normalizeNum(cx+R*cos(-rad));
        y2 = normalizeNum(cy+R*sin(-rad));
        labelO.i = i;
        labelO.x = x;
        labelO.y = y;
        labelO.x1 = x1;
        labelO.y1 = y1;
        labelO.x2 = x2;
        labelO.y2 = y2;
        sector.label = labelO;
      }
      labelLeftLen = labelLeft.length
      var ileft=0
        ,ileftInterval = Math.round(2*cfg.r/labelLeftLen)
        ,x3
        ,y3
        ,prevLabelO
        ,p
        ,prevy3
        ,rate//不超过1

      var offset = D.offset(this.container);
      while(labelLeftLen>ileft){
        labelO = labelLeft[ileft];
        y3 = labelO.y2;
        rate = (y3-cy)/R;
        rate = rate>1?1:
          rate<-1? -1 : rate
        rad = Math.PI+asin(rate);
        x3 = normalizeNum(cx+R*cos(rad));

        if(ileft>0){
          prevLabelO = labelLeft[ileft-1];
          prevy3 = prevLabelO.y3;
          if(prevy3-14<y3){
            y3 = prevy3-14;
          }
        }
        x3-=5;

        labelO.x3 = x3;
        labelO.y3 = y3;
        p = ["M",labelO.x,labelO.y,"Q",labelO.x2,labelO.y2,' ',x3,y3];

        //标注
        label = labels[labelO.i];
        labelO.text = label;
        var posxy = this.getLabelXY(x3,y3,label,true);
        var textspan = D.create('<span class="ks-charts-label"/>');
        D.html(textspan,label);
        /*
        D.css(textspan,{position:'absolute',left:(offset.left+posxy.x)+'px',top:(offset.top+posxy.y)+'px'});
        D.append(textspan,document.body);
         */

        D.css(this.container,'position','relative');
        D.css(textspan,{position:'absolute',left:(posxy.x)+'px',top:(posxy.y)+'px'});
        D.append(textspan,this.container);

        paper.path(p.join(','));
        ileft++;
      }
      labelRightLen = labelRight.length
      var iright=0
        ,irightInterval = Math.round(2*cfg.r/labelRightLen)

      var labelRightCopy = labelRight.slice(0);
      while(labelRightLen>iright){
        var flag;
        labelO = labelRightCopy[iright];
        y3 = labelO.y2;
        if(labelRightLen>0){
          prevLabelO = labelRightCopy[labelRightLen-1];
          if(prevLabelO.y3+14>y3){
            y3 = prevLabelO.y3+14;
          }
        }
        rate = (y3-cy)/R;
        rate = rate>1?1:
          rate<-1? -1 : rate

        rad = asin(rate);
        x3 = normalizeNum(cx+R*cos(rad));

        x3 += 5;
        labelO.x3 = x3;
        labelO.y3 = y3;
        p = ["M",labelO.x,labelO.y,"Q",labelO.x2,labelO.y2," ",x3,y3,"L"];
        label = labels[labelO.i];
        labelO.text = label;
        var posxy = this.getLabelXY(x3,y3,label);
        var textspan = D.create('<span class="ks-charts-label"/>');
        D.css(textspan,{position:'absolute',left:(offset.left+posxy.x)+'px',top:(offset.top+posxy.y)+'px'});
        D.html(textspan,label)
        D.append(textspan,document.body);

        paper.path(p.join(','));
        iright++;
      }
    },
    //label算法三：label标注在扇形区域内
    drawInsideLabel:function(){

    }
  }
  S.extend(PieChart,S.Base,methods);

  return PieChart;
},{
  requires:['../core','../common/ft','../label/piechart-label']
});

