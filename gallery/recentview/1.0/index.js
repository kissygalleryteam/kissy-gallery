/**
 * 最近浏览过的宝贝
 * @author 兰七<yuxia0025@gmail.com>
 *
 */
KISSY.add('gallery/recentview/1.0/index', function (S, FLASH) {

              var $ = S.all,
                  JSON = S.JSON,
                  config = {
                      key:'TB_recentViewedItems', // 写入flash的key值
                      maxCount:6, //存储宝贝的数目
                      flashUrl:"http://a.tbcdn.cn/app/tbskip/lsoSaver.swf?t=_1.swf", // swf地址
                      itemData:'', //当前写入的宝贝
                      type:'r' //操作类型分读和写，默认是读
                  };

              function recentView(cfg) {
                  var self = this;
                  self.config = S.merge(config, cfg);
                  self.init();
              }

              S.augment(recentView, {
                  //初始化
                  init:function () {
                      var self = this;
                      // 是读操作么
                      self.isRead = self.config.type.toLowerCase() == 'r' ? true : false;
                      self.initSwf();
                  },
                  //初始化flash
                  initSwf:function () {
                      var self = this,
                          cfg = self.config,
                          id = parseInt(Math.random() * 10000).toString(32), //swf的id
                          times = 0;

                      FLASH.add(id + '-container', {
                          src:cfg.flashUrl,
                          attrs:{width:1, height:1},
                          params:{
                              allowScriptAccess:'always'
                          },
                          id:id
                      }, function () {
                          self.fl = FLASH.get(id);
                          if (self.fl && self.fl.read && self.fl.save) {
                              //初始成功化以后
                              self.isRead ? self.readData() : self.saveData();
                          } else {
                              //再试几次
                              if (times > 5) {
                              } else {
                                  S.later(arguments.callee, 400);
                                  times++;
                              }
                          }
                      });
                  },
                  //读数据
                  readData:function () {
                      var self = this,
                          cfg = self.config,
                          items;
                      //根据key值读宝贝信息列表
                      items = self.fl.read(cfg.key);
                      items = JSON.parse(items);
                      items = self.format(items);
                      //回调
                      cfg.callback && cfg.callback(items);
                  },
                  //处理宝贝信息，例如图片链接拼接，宝贝id校验
                  format:function (items) {
                      var self = this,
                          cfg = self.config,
                          basePic = 'http://img0{x}.taobaocdn.com/bao/uploaded/',
                          isDaily = window.location.hostname.indexOf('.daily.') > -1 ? true : false,
                          baseUrl = 'http://' + (isDaily ? 'item.daily.taobao.net' : 'item.taobao.com') + '/item.htm?id=',
                          x;

                      S.each(items, function (item, index) {
                          S.each(item, function (val, key) {
                              item[key] = decodeURIComponent(val);
                              if (key == 'pic') {
                                  x = Math.ceil(Math.random() * 4);
                                  item[key] = S.substitute(basePic, {x:x}) + item[key];
                              } else if (key == 'itemId') {
                                  if (isNaN(item[key])) {
                                      //宝贝id校验不成功，将数据从本地存储中删除
                                      items.splice(index, 1);
                                      self.clear(item[key]);
                                  }
                              }
                              if (items[index]) {
                                  item['url'] = baseUrl + item['itemId'];
                                  items[index] = item;
                              }
                          });
                      });
                      return items;
                  },
                  //写数据
                  saveData:function () {
                      var self = this,
                          cfg = self.config,
                          items,
                          key = cfg.key;

                      //获取已存储的宝贝列表
                      debugger;
                      if (self.getCurrentItem()) {
                          items = self.fl && self.fl.read(key);
                      }
                      if (!items) {
                          items = JSON.stringify([].concat(self.currentItem));
                          self.fl.save(key, items);
                      }
                      else if (items && !self.isExsit(items)) {
                          items = JSON.parse(items);
                          //如果本地存储的宝贝总数超过
                          while (items.length > cfg.maxCount) items.pop();
                          items.push(self.currentItem);
                          items = JSON.stringify(items);
                          self.fl.save(key, items);
                      }
                      self.items = items;
                      S.log('write data success');
                  },
                  //清除存储的宝贝
                  clear:function (id) {
                      var self = this,
                          key = self.config.key,
                          newItems = [];

                      if (self.fl && (self.items = self.fl.read(key))) {
                          var items = JSON.parse(self.items);
                          if (arguments.length == 1) {
                              S.each(items, function (item) {
                                  item.itemId != id && newItems.push(item);
                              });
                              self.items = newItems;
                              newItems = newItems.length > 0 ? JSON.stringify(newItems) : null;
                              self.fl.save(key, newItems);
                          } else {
                              self.fl.save(key, null);
                          }
                          S.log('clear data success');
                      }
                  },
                  //判断宝贝是否已存储
                  isExsit:function (items) {
                      var self = this;
                      return items.indexOf(self.currentItem.itemId) == -1 ? false : true;
                  },
                  //获取当前要写入的宝贝
                  getCurrentItem:function () {
                      var self = this,
                          cfg = self.config,
                          item = cfg.itemData;

                      if (item) {
                          item = typeof item == 'string' ? JSON.parse(item) : item;
                          S.each(item, function (val, key) {
                              item[key] = encodeURIComponent(val);
                          })
                      }
                      self.currentItem = item;
                      return JSON.stringify(item);
                  }
              })
              ;

              return recentView;
          },
          {requires:['flash']}
);