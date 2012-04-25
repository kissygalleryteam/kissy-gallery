(function(S) {
  // 仅patch KISSY 1.1.6 or 1.1.7
  if (S.version.indexOf('1.1.') !== 0){
    //test
    S.$use = S.use;
    S.use = function(modNames, callback, cfg){
      // 不处理market跟旧的mod混用.
      if( modNames.indexOf('market/') !== 0 ) {
        return S.$use.call(this, modNames, callback, cfg);
      }

      var reg;
      var url;
      var tempA = 'http:\/\/a.tbcdn.cn\/p\/market\/r\/111116\/market\/(?:';
      var tempB = ')-min.js$';
      var tempC = 'http://a.tbcdn.cn/p/market/r/111116/market/??';
      var map= [];
      map[0] = [];
      var mod = [];
      var modName;
      var modArray = modNames.replace(/\s+/g, '').split(',');
      var len = modArray.length;

      for(i=0; i<len; i++) {
        modName = modArray[i];
        if(modName.indexOf('market/') !== 0 ){
          continue;
        }else{
          mod.push(modName.replace('market/',''));
        }
      }
      reg = tempA;
      reg = reg + mod.join('|') + tempB;
      map[0][0] = new RegExp(reg);
      url = tempC + mod.join('-min.js,');
      map[0][1] = url + '-min.js';
      KISSY.config({
        'map':map
      });

      return S.$use.call(this, modNames, callback, cfg);
    };
    return;
  }

  var LOADING = 1, LOADED = 2, ERROR = 3, ATTACHED = 4;

  S.__packages = S.__packages || {};
  S.config = function(cfg) {
    S.each(cfg.packages, function(pkg) {
      S.__packages[pkg.name] = pkg;
    });
  };
  S.$add = S.add;
  S.add = function(name, def, cfg) {
    if(cfg && cfg.requires) {
      var mod = this.Env.mods[name] || {};

      mod.requires = cfg.requires;

      this.Env.mods[name] = mod;
    }
    // 兼容S.app()出来的东西:(
    return S.$add.call(this, name, def, cfg);
  };

  S.$use = S.use;

  S.use = function(modNames, callback, cfg) {
    // 不处理market跟旧的mod混用.
    if( modNames.indexOf('market/') !== 0 ) {
      return S.$use.call(this, modNames, callback, cfg);
    }

    var me = this,
        mods = this.Env.mods,
        ready = true, 
        fired = false,
        i, len, mod, modName;

    modNames = modNames.replace(/\s+/g, '').split(',');
    len = modNames.length;

    for(i=0; i<len; i++) {
      modName = modNames[i];
      mod = mods[modName];

      if(!mod) {
        mod = mods[modName] = {
          charset: 'utf-8',
          fullpath: me.__packages.market.path + '/' + modName + (S.Config.debug ? '' : '-min') + '.js',
          name: modName,
          status: 0
        };
      }

      if(mod.status !== ATTACHED) {
        ready = false;
        me.__load(mod, load);
      }
    }
    // 已经全部 attached, 直接执行回调即可.
    ready && runCallback();

    function runCallback() {
      if(fired) return;
      fired = true;

      var args = [me];
      S.each(modNames, function(modName) {
        args.push(mods[modName].value);
      });

      callback && callback.apply(me, args);
    }

    function load() {
      me.__attach(mod, function() {
        if( me.__isAttached(modNames) ) {
          runCallback();
        }
      });
    }

    return true;

  };
  S.__attachMod = function(mod) {
    var me = this;

    if (mod.fns) {
      S.each(mod.fns, function(fn) {
        var args = [me];

        mod.requires && S.each(mod.requires, function(req) {
          args.push(me.Env.mods[req].value);
        });

        mod.value = fn.apply(me, args);
      });
      mod.fns = undefined; // 保证 attach 过的方法只执行一次
      //S.log(mod.name + '.status = attached');
    }

    mod.status = ATTACHED;
  };
})(KISSY);
KISSY.config({packages: [{name: "market",path: "http://a.tbcdn.cn/p/market/r/111116",charset: "utf-8"}]});
