/*

 Copyright (c) 2010 Taobao Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/
KISSY.add("gallery/local-storage/1.0/index",function(d){var e=window,d=d.UA.ie&&9>d.UA.e,c=document.documentElement;d&&(c.style.behavior="url(#default#userData)");var f={setItem:function(b,a,c){return e.localStorage.setItem(b,a,c)},getItem:function(b,a){return e.localStorage.getItem(b,a)},removeItem:function(b,a){return e.localStorage.removeItem(b,a)},clear:function(){return e.localStorage.clear()}},g={setItem:function(b,a,d){try{c.setAttribute(b,a);return c.save(d||"default")}catch(e){}},getItem:function(b,
a){try{c.load(a||"default");return c.getAttribute(b)||""}catch(d){}},removeItem:function(b,a){try{a=a||"default";c.load(a);c.removeAttribute(b);return c.save(a)}catch(d){}},clear:function(){try{c.expires=-1}catch(b){}}};return d?g:f});
