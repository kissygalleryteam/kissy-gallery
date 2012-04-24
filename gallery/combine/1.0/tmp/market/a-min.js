KISSY.config({
  combine: true
});
KISSY.Config.debug = true;
KISSY.use('sizzle', function(S){
});
KISSY.config({
    packages:[
        {
            name: "market",
            path: "/test/", 
            charset: "utf-8"
        }
    ]
});
KISSY.use('market/b, market/c, sizzle, waterfall', function(S, e){
  console.log(e);
});
KISSY.use('market/e, market/f', function(S, e){
});
