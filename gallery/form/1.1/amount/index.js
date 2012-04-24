/**
 * @fileoverview 将数字转化成大写金额
 * @author: 伯方<bofang.zxj@taobao.com>
 **/
KISSY.add('gallery/form/1.1/amount/index', function(S, Base) {
    /**
     * @name Amount
     * @class 将数字金额转化成大写中文金额
     * @constructor
     * @param {String | Number} num,传入需要格式化的参数，必填
     * @param {Boolean} hasDecimal *，是否需要小数点，默认是false,即不用小数点    
     * @example
     KISSY.use('gallery/form/1.1/amount/index', function (S, Amount) {
       var r = new Amount('23135.25',true);
       console.log(r.convertAmount()); //结果是贰万叁仟壹佰叁拾伍点贰伍
     })
    */
    function Amount(num, hasDecimal) {
        var self = this;
        Amount.superclass.constructor.call(self);
        //设值       
        self.set('num', num);
        self.set('hasDecimal', hasDecimal);
    }
    //方法
    S.extend(Amount, Base, /** @lends Amount.prototype*/ {
        /**
         * 进一步处理参数，返回转换后的大写金额
         * @return {String}
         */
        convertAmount: function() {
            var self = this,
                getNum = self.get('num'),
                isDecimal = self.get('hasDecimal'),
                decimalNum, newNum = '',
                afterDecimal, beforeDecimal;
            //判断是否需要小数点，考虑到很多个点的情况，选择第一个          
            if (isDecimal) {
                newNum = getNum.replace(/\.+/g, '.').replace(/(\.*$)/, '');
                decimalNum = newNum.indexOf('.');
                //如果本身有小数点
                if (decimalNum !== -1) {
                    //小数点前
                    beforeDecimal = newNum.substr(0, decimalNum);
                    //小数点之后
                    afterDecimal = newNum.substr(decimalNum, 4).replace(/\./g, '').substr(0, 2);
                    //考虑只有一个小数的情况，自动添加一个小数点
                    if (afterDecimal.length === 1) {
                        afterDecimal += '0';
                    }
                    //本身没有小数点的话，就自动设置有两个0
                } else {
                    beforeDecimal = newNum;
                    afterDecimal = '00';
                }
                //返回 小数点前 + 小数点之后 的 转换数据
                return self._convertNatural(beforeDecimal) + self._convertDecimal(afterDecimal);
            } else {
                newNum = getNum.toString().replace(/\./g, '');
                return self._convertNatural(newNum);
            }
        },
        /**
         * 对小数点之前的数字进行转换
         * @return {String}
         */
        _convertNatural: function(beforeNum) {
            var self = this,
                getChineseArr = self.get('_chineseArr'),
                //['', '拾', '佰', '仟', '万', '亿', '点', '']
                unitArr = ['', '\u62FE', '\u4F70', '\u4EDF', '\u4E07', '\u4EBF', '\u70B9', ''],
                endStr = '',
                temp = 0,
                len = beforeNum.length;
            //为空返回零
            if (beforeNum === '') {
                return '\u96F6';
            }
            //开始遍历，从高位到低位          
            for (i = len - 1; i >= 0; i--) {
                //首先要判断位数
                switch (temp) {
                    //1位
                case 0:
                    endStr = unitArr[7] + endStr;
                    break;
                    //5位数：万
                case 4:
                    endStr = unitArr[4] + endStr;
                    break;
                    //9位数：亿
                case 8:
                    endStr = unitArr[5] + endStr;
                    unitArr[7] = unitArr[5];
                    temp = 0;
                    break;
                }
                //如果位数是0就设置为零
                if (temp % 4 === 2 && beforeNum.charAt(i) === '0' && beforeNum.charAt(i + 2) !== '0') {
                    endStr = getChineseArr[0] + endStr;
                }
                //如果当前位数字不为0
                if (beforeNum.charAt(i) !== '0') {
                    endStr = getChineseArr[beforeNum.charAt(i)] + unitArr[temp % 4] + endStr;
                }
                temp++;
            }
            return endStr;
        },
        /**
         * 对小数点之后的数字进行转换
         * @return {String}
         */
        _convertDecimal: function(AfterNum) {
            //默认有个‘点’
            var endStr = '\u70B9',
                getChineseArr = this.get('_chineseArr');
            endStr += getChineseArr[AfterNum.charAt(0)] + getChineseArr[AfterNum.charAt(1)];
            return endStr;
        }
    }, {
        ATTRS: /** @lends Amount.prototype*/
        {
            /**
             * 需要格式化的数字或者字符串
             * @type {String | Number}
             */
            num: {
                value: '',
                setter: function(v) {
                    if (!S.isString(v) && !S.isNumber(v)) {
                        console.log('请传入正确格式的参数');
                        return '';
                    }
                    //过滤除了数字和点意外的字符，删除前面的0                     
                    return v.toString().replace(/[^0-9\.]/g, '').replace(/(^0*)/, '');
                },
                getter: function(v) {
                    return v;
                }
            },
            /**
             * 是否需要小数点
             * @type {Boolean}
             * @default false
             */
            hasDecimal: {
                value: false,
                setter: function(v) {
                    return v;
                },
                getter: function(v) {
                    return v;
                }
            },
            /*
             * 大写金额数组，可以避免编码不同形成乱码，原先是['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
             *type {Array}
             */
            _chineseArr: {
                value: ['\u96F6', '\u58F9', '\u8D30', '\u53C1', '\u8086', '\u4F0D', '\u9646', '\u67D2', '\u634C', '\u7396']
            }
        }
    })
    return Amount;
}, {
    requires: ['base']
});
