describe('LocalStorage',  function() {
  var cache,
      expire_period = 0;

  it('set no expire cache', function() {
    cache = new BrowserCache(0);
    var obj = {
      'myhere': 'zhanglin',
      age: 25
    };
    cache.set('test localstorage clear method', obj);
  });

  it('test localstorage clear method', function() {
    cache = new BrowserCache(0);
    var o = cache.get('test localstorage clear method');
    expect(o.myhere  + ':' + o.age).toBe('zhanglin:25');
    localStorage.clear();
    var o2 = cache.get('test localstorage clear method');
    expect(o2).toBeNull();
  });
});
