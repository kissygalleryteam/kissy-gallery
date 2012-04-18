 //监听加减按钮click事件，以及出价框keyup事件
            function registerEvent() {
                /*
                 * 监听click事件，实现数值加减功能
                 * */
                E.on(ELE_SIGN, 'click', function(e) {
                    if (D.hasClass(ELE_SIGN, 'sleepLink')) {
                        return;
                    } //通过sleepLink属性来判断是否启用加减按钮
                    e.halt(true);
                    var trigger = S.one(e.target),
                        inputEl = D.children(D.parent(trigger), 'input')[0],
                        inputValue = formatPrice(inputEl.value),
                        range = formatPrice(D.attr(inputEl, 'data-range')),
                        min = formatPrice(D.attr(inputEl, 'data-min')),
                        //如果是荷兰拍，需要取得最大值
                        max = parseInt(D.attr(inputEl, 'data-max'), 10);
                    if (trigger.hasClass('plus') || trigger.hasClass('plus-sign')) {
                        inputValue += +range;
                    } else if (trigger.hasClass('minus') || trigger.hasClass('minus-sign')) {
                        inputValue -= +range;
                    }

                    inputValue = inputValue >= min ? inputValue : min;
                    inputValue = Math.min(9999999.99, inputValue);
                    //荷兰拍限定购买数量
                    if (max) {
                        inputValue = inputValue >= max ? max : inputValue;
                        D.val(inputEl, inputValue.toFixed(0));
                        D.hide(CON_ERROR);//click会自动调整输入值，所以可以不用显示提示。
                        D.removeAttr(ELE_BUTTON, 'disabled');//同上，click时，按钮可用
                        return;
                    }
                    D.val(inputEl, inputValue.toFixed(2));
                }),

                    /*
                     * 监听数量框keyup事件，实现输入框内容的格式化
                     * */
                    E.on(ELE_QUANTITY_INPUT, 'keyup', function(e) {
                        var self = D.get(this),
                            min = formatPrice(D.attr(self, 'data-min')),
                            max = formatQuantity(D.attr(self, 'data-max')),
                            inputValue = formatPrice(D.val(self).replace(/[^\d\.]/g, ''));
                        //荷兰拍
                        if (max) {
                            if (!quantityValidation(D.val(self),max)) {
                                D.show(CON_ERROR);
                                D.get(ELE_BUTTON).disabled = true;
                                return;
                            }
                            else{
                                D.hide(CON_ERROR);
                                D.removeAttr(ELE_BUTTON, 'disabled');
                                D.val(self, inputValue.toFixed(0));
                                return;
                            }
                        }

                    });

                    /*
                    * 监听价格框blur事件，实现输入框内容的格式化
                    * */
                    E.on(ELE_PRICE_INPUT, 'blur', function() {
                        var self = D.get(this),
                            min = formatPrice(D.attr(self, 'data-min')),
                            inputValue = formatPrice(D.val(self).replace(/[^\d\.]/g, ''));
                        inputValue = isNaN(inputValue) ? min : Math.max(min, inputValue),
                            inputValue = Math.min(9999999.99, inputValue);

                        D.val(self, inputValue.toFixed(2));
                    });
            }

            return{
                init: registerEvent
            }
        }();