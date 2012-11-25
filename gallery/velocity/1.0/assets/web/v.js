KISSY.config({
  packages: [
    {
      name:"gallery",
      path:"../../../../../",  // cdn上适当修改对应路径
    },
    {
      name: 'web',
      path: '../'
    }
  ]
});

KISSY.use('gallery/velocity/1.0/index, web/directives', function(S, Velocity, asts){
  var compile = new Velocity(asts);
  S.all('.content').html(compile.render());
});
