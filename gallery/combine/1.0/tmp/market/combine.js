/**
 * @fileOverView combine.js为kissy 1.2.0增加自动combine功能
 */
KISSY.add('combine', function(S){

  /*
   *只对1.2.进行合并
   */
  if (S.version.indexOf('1.2') !== 0) return {config: function(){}};

  var _use = S.use;
  var _add = S.add;
  var getMappedPath = S.__getMappedPath;
  var SYSPACKAGE = 'default';
  //var MAX_URL_LEN = 200;
  var MAX_URL_LEN = 2042;

  /*
   *url映射
   */
  var maps = {};

  /*
   *依赖关系
   */
  var requires = {};

  /**
   * 是否开启自动合并
   */
  var autoCombine = false;

  /*
   *记录加载过的模块
   */
  var _mods = {};

  /*
   *允许被合并的包, *表示所有
   */
  var allowPackages = {'*': false, 'allPackageNumber': 0};
  var kissyPath = S.Config.base;

  /**
   * 是否设置自动combine，是指方式通过S.Config.autoCombine来设置，
   * @return {bool}
   */
  function isAutoCombine(){
    if (autoCombine){
      allowPackages['*'] = true;
      return true;
    } else {
      allowPackages['*'] = false;
      return false;
    }
  }

  /**
   * 是否允许combine
   * @param packageVal {string} package名字
   * @param isForce {bool} 是否强制设置
   * @return {bool} 某个package是否允许被combine到一起
   */
  function isAlowPackage(packageName, isForce){
    return isForce || allowPackages['*'] || allowPackages[packageName];
  }

  /**
   * 合并依赖关系, 把加载中的模块，找到他们所依赖的模块，然后合并到一起
   * @param mods {array} 模块名，表示正在加载的模块
   * @return {array} 模块数组，包括mods的所有模块，和他们所依赖的模块
   */
  function mergeRequire(mods){
    var ret = mods.concat();
    S.each(mods, function(mod){
      var requireArr = requires[mod];
      if(requireArr && S.isArray(requireArr)){
        ret = ret.concat(requireArr);
      }
    });

    return ret;
  }

  /**
   * 判断模块是否加载过
   * @return {bool}
   */
  function isLoaded(mod){
    var mods = S.Env.mods;
    return _mods[mod] || mod in mods;
  }

  /**
   * 构建url映射
   * @param mods {array} 模块名数组, 把mods中的所有模块合并成一个combine的url，
   * 形如url??mod/a.js,mod/b.js,mod/c.js，构建的url映射贮存在maps变量中
   * @param isForce {bool} 是否强制合并，强制合并可以忽略是否模块可合并规则
   */
  function buildPath(mods, isForce){
    mods = mergeRequire(mods);
    var pks = {};

    /*
     *默认为kissy package
     */
    pks[SYSPACKAGE] = {
      path: kissyPath,
      tag: S.buildTime,
      mods: []
    };

    /*
     *获取所有的packages
     */
    var packages = S.Config.packages || S.__packages;

    for (var i = 0; i < mods.length; i++) {

      var mod = mods[i];
      var modFind = false;

      /*
       *是否加载过,如果加载过则不合并此模块
       */
      if (isLoaded(mod)) {
        mods.splice(i, 1);
        continue;
      }

      if (mod.indexOf('/') > 0) {

        S.each(packages, function(packageVal, packageName){
          var path = packageVal.path;
          if(!pks[packageName]){
            pks[packageName] = {
              path: path,
              tag: packageVal.tag || '',
              mods: []
            };
          }
          /*
           *模块名以package名开头，为自定义package
           */
          if (mod.indexOf(packageName) === 0 && isAlowPackage(packageName, isForce)){
            pks[packageName]['mods'].push(mod);
            modFind = true;
          }
        });

      }

      if (isAlowPackage('*', isForce) && !modFind) pks[SYSPACKAGE]['mods'].push(mod);
      _mods[mod] = true;
    }

    S.each(pks, function(myPackage){

      var mods = myPackage.mods;
      var path = myPackage.path;
      if (mods.length > 1){
        var tag = myPackage.tag ? '?t=' + myPackage.tag : '';
        var combineUriFn = _urlGenerate(path, tag);

        var combineUri = combineUriFn(mods, false);
        var uris = splitUrl(combineUri, mods, combineUriFn);

        var combineMinUri = combineUriFn(mods, true);
        var urisMin = splitUrl(combineMinUri, mods, combineUriFn);

        var nowIndex = 0;
        S.each(uris, function(uri, index){
          for (; nowIndex < index; nowIndex++) {
            var mod = mods[nowIndex];
            var fullpath = path + mod + '.js' + tag;
            maps[fullpath] = uri;
          }
        });

        nowIndex = 0;

        S.each(urisMin, function(uri, index){
          for (; nowIndex < index; nowIndex++) {
            var mod = mods[nowIndex];
            var fullpathMin = path + mod + '-min.js' + tag;
            maps[fullpathMin] = uri;
          }
        });

      }

    });
  }

  /** 
   * 合并package，允许两个或者两个以上的包合并，不过需要满足两个package最多一个
   * 可以有tag属
   */
  function combinePackage(names, pks){
    var canCombine = true;
    S.each(names, function(name){
    });
  }

  /**
   * 处理url过长的问题
   * @param url {string}
   */
  function splitUrl(url, mods, urlGenFn){
    var len = url.length;
    var ret = {};
    var isMin = url.indexOf('-min.js') > -1;
    var modLen = mods.length;

    if (len > MAX_URL_LEN){
      _splitUrl(url, 0, modLen - 1);
    } else {
      ret[modLen] = url;
    }

    function _splitUrl(url, fromIndex, toIndex){
      if (fromIndex + 1 < toIndex){
        var len = url.length;
        var n = Math.ceil(len / MAX_URL_LEN);
        var num = Math.ceil((toIndex - fromIndex) / n);
        var i = 0;
        while (i < n){
          var begin = i * num + fromIndex;
          var end   = begin + num;
          var part = mods.slice(begin, end);
          var tmp  = urlGenFn(part, isMin);
          if (tmp.length > MAX_URL_LEN){
            _splitUrl(tmp, begin, end);
          } else {
            ret[end] = tmp;
          }
          i++;
        }
      } else {
        ret[toIndex] = url;
      }
    }

    return ret;

  }


  function _urlGenerate(path, tag){
    return function(mods, isMin){
      var endPart = isMin ? '-min.js' : '.js';
      return path + '??' + mods.join(endPart + ',') + endPart + tag;
    };
  }

  /*
   *重写use方法，捕获参数
   */
  S.use = function(modNames, callback, cfg){
    //如果是自动combine或者存在某些包是需要自动combine
    if (isAutoCombine() || allowPackages.allPackageNumber){
      var _modNames = modNames.replace(/\s+/g, "").split(',');
      buildPath(_modNames);
    }
    return _use.call(this, modNames, callback, cfg);
  };

  /*
   *重写add方法，捕获requires依赖关系
   */
  S.add = function(name, def, config){

    if (isAutoCombine() || allowPackages.allPackageNumber){
      if (config && config.requires){
        if(config.requires.length > 1){
          buildPath(config.requires);
        }
      } else if(S.isPlainObject(name)) {
        S.each(name, function(cfg, mod){
          if (cfg.requires){
            buildPath([mod].concat(cfg.requires));
          }
        });
      }
    }

    return _add.call(this, name, def, config);
  };

  S.__getMappedPath = function(path){
    return maps[path] || getMappedPath(path);
  };

  /*
   * 合并指定包
   */
  function addPackage(pkg){
    allowPackages[pkg] = true;
    allowPackages.allPackageNumber++;
  }

  function removePackage(pkg){
    delete allowPackages[pkg];
    allowPackages.allPackageNumber--;
  }

  /**
   * 增加依赖关系，对于通过requires来加载的模块，需要预定义依赖关系
   * @param obj {object} {mod, [mod1, mod2]}表示mod依赖mod1和mod2,加载mod的时候,
   * mod1和mod2会被自动combine到相对于的包中
   */
  function addRequires(obj){
    S.each(obj, function(val, key){
      if (S.isArray(val)){
        requires[key] = val;
      }
    });
  }

  var walk = function(fn){
    return function(objs){
      S.each(objs, fn);
    };
  };

  function combMods(mods){
    buildPath(mods, true);
  }

  var _apiMap = {
    autoCombine: function(is){
      autoCombine = !!is;
    },
    packages: walk(addPackage),
    requires: addRequires,
    mods: walk(combMods)
  };

  return {
    removePackage: removePackage,
    /**
     * 配置自动加载方式
     * @param cfg {object} 配置
     * @example cfg = {
     *    autoCombine: true | false,
     *    packages: ['mod1', 'mod2'],
     *    requires: {
     *        'mod1/a': ['mod1/b', 'mod1/c']
     *    },
     *    mods: [['waterfall', 'template'], ['mod2/a', 'mod2/b']]
     * }
     * autoCombine设置是否自动combine
     */
    config: function(cfg){
      S.each(cfg, function(obj, key){
        if (S.isFunction(_apiMap[key])){
          _apiMap[key](obj);
        }
      });
    }
  };

});
