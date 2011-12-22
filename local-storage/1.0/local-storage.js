/**
 * @fileoverview Local Storage (original: changtian, modified for buy platform).
 * @author 文河<wenhe@taobao.com>
 * for tlive
 *
 * @license
 * Copyright (c) 2010 Taobao Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
KISSY.add('gallery/1.0/local-storage', function(S, undefined) {
    var win = S.__HOST,
        doc = document, useObject = doc.documentElement;
    useObject.style.behavior = 'url(#default#userData)';

    // html5
    /**
     * @name localStorage
     * @class 本地存储.
     *
     * @description
     * 提供兼容IE及其他浏览器的本地存储入口
     * @see http://msdn.microsoft.com/en-us/library/cc197062(v=vs.85).aspx
     */
    var localStorage = {};

    /**
     * 存储数据.
     * @param {String} key 存储key.
     * @param {String} value 存储value.
     * @param {Object} [context] 存储范围，IE only.
     */
    localStorage.setItem = function(key, val, context) {
        return win.localStorage.setItem(key, val, context);
    };

    /**
     * 获取数据.
     * @param {String} key 存储key.
     * @param {Object} [context] 存储范围，IE only.
     */
    localStorage.getItem = function(key, context) {
        return win.localStorage.getItem(key, context);
    };

    /**
     * 删除数据.
     * @param {String} key 存储key.
     * @param {Object} [context] 存储范围，IE only.
     */
    localStorage.removeItem = function(key, context) {
        return win.localStorage.removeItem(key, context);
    };

    /**
     * 清除整个本地存储所有数据信息.
     */
    localStorage.clear = function() {
        return win.localStorage.clear();
    };

    // Tubie IE 678 only
    var userBehavor = {
        setItem: function(key, value, context) {
            try {
                useObject.setAttribute(key, value);
                return useObject.save(context || 'default');
            } catch (e) {}
        },
        getItem: function(key, context) {
            try {
                useObject.load(context || 'default');
                return useObject.getAttribute(key) || '';
            } catch (e) {}
        },
        removeItem: function(key, context) {
            try {
                context = context || 'default';
                useObject.load(context);
                useObject.removeAttribute(key);
                return useObject.save(context);
            } catch (e) {}
        },
        clear: function() {
            try {
                useObject.expires = -1;
            } catch (e) {}
        }
    };
    return localStorage;
});