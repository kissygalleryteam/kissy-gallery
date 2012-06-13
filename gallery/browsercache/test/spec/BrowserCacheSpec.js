/**
 * @description: Test suit for BrowserCache Module
 * @author: linqian.zl@taobao.com
 */
describe('BrowserCache', function() {
  beforeEach(function() {
    localStorage.clear();
  });

  it('test set a value', function() {
    var cache = new BrowserCache(10000);

    cache.set('test set a value', 'hello - world');
    expect(cache.get('test set a value')).toBe('hello - world');

    cache.set('2', 'hello | world');
    expect(cache.get('2')).toBe('hello | world');
  });

  it('test has,remove method', function() {
    var cache = new BrowserCache();
    cache.set('test has,remove method', 'dummy text', 3000);
    expect(cache.has('test has,remove method')).toBeTruthy();

    cache.remove('test has,remove method');
    expect(cache.has('test has,remove method')).toBeFalsy();
  });

  it('test validateNumber method', function() {
    expect(BrowserCache.validateNumber(NaN, 2000)).toBe(2000);
    expect(BrowserCache.validateNumber('hello wrold', 2000)).toBe(2000);
    expect(BrowserCache.validateNumber(false, 2000)).toBe(2000);
    expect(BrowserCache.validateNumber(void(0), 2000)).toBe(2000);
  });

  it('test set update with expire', function() {
    var cache = new BrowserCache();
    cache.set('test set update with expire', 'test set update with expire');
    expect(cache.get('test set update with expire')).toBe('test set update with expire');

    cache.set('test set update with expire - 1', 'hello', 2000);
    waits(4000);
    runs(function() {
      expect(cache.get('test set update with expire - 1')).toBeNull();
    });
  });

  it('test constructor parameter "expire"', function() {
    var expire_period = 4000;
    var cache = new BrowserCache(expire_period);

    cache.set('test constructor parameter "expire"', 'def');
    expect(cache.get('test constructor parameter "expire"')).toBe('def');

    waits(expire_period + 500);
    // waits() only block runs()'s block
    runs(function() {
      expect(cache.get('test constructor parameter "expire"')).toBeNull();
    });
  });

  it('test set parameter "expire"', function() {
    var expire_period = 4000;
    var cache = new BrowserCache(expire_period);

    cache.set('test set parameter "expire"', 'def');
    waits(expire_period + 500);
    runs(function() {
      expect(cache.get('test set parameter "expire"')).toBeNull();
    });

    var expire_period = 3000;
    cache.set('test expire', 'hello world', expire_period);
    waits(expire_period + 500);
    runs(function() {
      expect(cache.get('test expire')).toBeNull();
    });
  });
});

