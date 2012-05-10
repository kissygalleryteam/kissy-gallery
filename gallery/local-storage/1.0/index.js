/**
 * @description: 提供统一的 localStorage 接口
 * Author: changtian@taobao.com, <yyfrankyy>, linqian.zl@taobao.com
 *
 * Interface:
 *   - localStorage.setItem(key, value)
 *   - localStorage.getItem(key)
 *   - localStorage.removeItem(key)
 *   - localStorage.clear()
 */
KISSY.add('gallery/local-storage/1.0/index', function(S, UA) {
  var oStorage, _setItem, _getItem, _removeItem, _clear;

  function initByLocalStorage() {
    // for IE8+, FF 3+, Chrome 4.1+, Safari 4+, Opera 10.5+
    oStorage = localStorage;

    _setItem = function(key, value) {
      oStorage.setItem(key, value);
    };

    _getItem = function(key) {
      return oStorage.getItem(key);
    };

    _removeItem = function(key) {
      oStorage.removeItem(key);
    };

    _clear = function() {
      oStorage.clear();
    };
  }

  function initByUserData() {
    var IE_STORE_NAME = 'IELocalDataStore';

    generateDOMStorage();

    _setItem = function(key, value) {
      /*
       * 添加try...catch的原因是：某些用户的IE，可能将安全级别设置得过高，或当前站点被添加至"受限站点"中(会
       * 禁用掉"安全"tab下的"持续使用用户数据"选项，从而导致userData无法使用，这里通过try...catch来避免此
       * 情况下的JS报错，下同。
       */
      try {
        oStorage.setAttribute(key, value);
        oStorage.save(IE_STORE_NAME);
      } catch(e) { }
    };

    _getItem = function(key) {
      try {
        oStorage.load(IE_STORE_NAME);
        return oStorage.getAttribute(key);
      } catch(e) {}
    };

    _removeItem = function(key) {
      try {
        oStorage.removeAttribute(key);
        oStorage.save(IE_STORE_NAME);
      } catch(e) {}
    };

    _clear = function() {
      try {
        oStorage.expires = getUTCString();
        oStorage.save(IE_STORE_NAME);

        // 重新生成一个 elem, 因为 clear() 之后 setItem() 会失效
        reGenerateDOMStorage();
      } catch(e) {}
    };
  }

  function generateDOMStorage() {
    var doc = document;

    // borrowed from https://github.com/andris9/jStorage/blob/master/jstorage.js
    oStorage = doc.createElement('link');
    if(oStorage.addBehavior){
      /* Use a DOM element to act as userData storage */
      oStorage.style.behavior = 'url(#default#userData)';

      /* userData element needs to be inserted into the DOM! */
      doc.getElementsByTagName('head')[0].appendChild(oStorage);
    }
  }
  function reGenerateDOMStorage() {
    // 如果存在 oStorage 则删除
    if (oStorage) {
      try {
        document.body.removeChild(oStorage);
      } catch(e){}
    }

    generateDOMStorage();
  }

  function getUTCString() {
    // @see: http://msdn.microsoft.com/en-us/library/ms531095(v=vs.85).aspx
    var n = new Date;
    n.setMinutes(n.getMinutes() - 1);
    return n.toUTCString();
  }

  function init() {
    if (typeof localStorage !== 'undefined') {
      initByLocalStorage();
    } else if (S.UA.ie < 8) {
      initByUserData();
    }
  }

  init();

  var ret = {
    setItem: _setItem,
    getItem: _getItem,
    removeItem: _removeItem,
    clear: _clear
  };

  return ret;
},
{
  requires: ['ua'],
  attach: false
});

/**
 * NOTES: 
 *  originally writen by changtian
 *
 * [+] 增加 clear() 方法
 * [x] 创建 LINK 元素 instead of INPUT 元素, 避免 BODY 前调用出错
 */
