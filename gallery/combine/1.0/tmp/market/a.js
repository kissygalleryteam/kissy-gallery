//KISSY.use('sizzle, waterfall', function(S){});
KISSY.Config.debug = false;

KISSY.use('combine', function(S, Combine){

  S.config({
    packages:[
      {
        name: "mods",
        path: "../tmp/", 
        charset: "utf-8"
      },
      {
        name: 'market',
        path: '../tmp/',
        charset: 'utf-8'
      }
    ]
  });

  Combine.config({
    autoCombine: true,
    //packages: ['mods', 'market'],
    requires: {
      'market/d' : ['market/e', 'market/f']
    }
    //mods: [['mods/a', 'mods/b'], ['sizzle', 'waterfall']]
  });

});

KISSY.add({
  myMod: {
    fullpath: '../tmp/myMod.js',
    requires: ['market/d']
  }
});


KISSY.use('market/b123456789012345678901234567890, market/c123456789012345678901234567890, market/e, market/f, market/g1234567890, market/h1234567890, market/i1234567890, market/j1234567890', function(S, e, f, g, h){ 
  //console.log(arguments);
}); 

KISSY.use('market/d, sizzle, waterfall, mods/a, mods/b', function(S, e){
  console.log(arguments);
});

/**
 * myMod依赖market/d, market/d依赖market/e, market/f，合并url
 * http://market/test/??market/d.js,market/e.js,market/f.js
 */
KISSY.use('myMod', function(S, A){
  console.log(A);
});
