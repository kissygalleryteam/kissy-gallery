/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
describe('rule base test suite', function () {
    KISSY.use('form/validation/rule/base', function (S, Rule) {
        it('base rule', function () {
            var rule = new Rule(function (s) {
                return s > 0;
            });

            var result = rule.validate(-1);
            expect(result).toBeFalsy();
        });

        xit('another base rule', function () {
            var rule = Rule.add(function (s) {
                return s > 5;
            });

            var result = rule.validate(3);
            expect(result).toBeFalsy();
        });

        xit('obj rule', function () {
            var ruleObj = {
                validate:function (a, b) {
                    return a > b;
                }
            };
            var rule = new Rule(ruleObj);

            var result = rule.validate(2, 1);
            expect(result).toBeTruthy();
        });

        xit('obj another rule', function () {
            var ruleObj = {
                validate:function (a, b) {
                    return a > b;
                }
            };
            var rule = Rule.add(ruleObj);

            var result = rule.validate(2, 1);
            expect(result).toBeTruthy();
        });

        xit('add rule name', function () {
            Rule.add('test', function (a, b) {
                return a > b;
            });

            var rule = Rule.get('test');
            expect(rule).toBeDefined();
        });

        describe('trigger event', function() {
            it('event listener', function() {
                var rule = new Rule(function (a, b) {
                    return a > b;
                });

                rule.on('validate', function(e) {
                    expect(e.result).toBeFalsy();
                }).validate(2, 4);
            });

            it('event listener use method', function() {
                var rule = new Rule(function (a, b) {
                    return a > b;
                });

                rule.on('validate',function(e) {
                    expect(e.result).toBeFalsy();
                }).validate(2, 4);
            });

            it('include event and validate result', function() {
                var rule = new Rule(function (a, b) {
                    return a > b;
                });
                var result = rule.on('success', function(e) {
                }).on('error', function(e) {
                }).validate(2, 4);
                expect(result).toBeFalsy();
            });

        });

        describe('add test value and msg', function() {
            it('init rule use test value', function() {
                var rule = new Rule(function (s) {
                    return s > 0;
                }, {
                    args:4,
                    msg:{
                        success:'pass',
                        error:'fail'
                    }
                });

                var call = '';

                rule.on('success', function(e) {
                    call = e.msg;
                });

                rule.validate();
                expect(call).toEqual('pass');
            });

            it('overwrite value by validate method', function() {
                var rule = new Rule(function (a, b, c, d) {
                    return a+b+c+d>10;
                }, {
                    args:[4, 1, 3, 1],
                    msg:{
                        success:'pass',
                        error:'fail'
                    }
                });

                var call = '';

                rule.on('error',function (e) {
                    call = e.msg;
                }).on('success',function (e) {
                    call = e.msg;
                });

                rule.validate(4, 1, 5, 1);
                expect(call).toEqual('pass');
            });

            it('set message', function() {
                var rule = new Rule(function (a, b, c, d) {
                    return a+b+c+d>10;
                }, {
                    args:[4, 1, 3, 1],
                    msg:{
                        success:'pass',
                        error:'fail'
                    }
                });

                var call = '';

                rule.on('error',function (e) {
                    call = e.msg;
                }).on('success',function (e) {
                    call = e.msg;
                });

                rule.set('msg', {
                    success:'good luck'
                });

                rule.validate(4, 1, 5, 1);
                expect(call).toEqual('good luck');
            });
        });
    });
});