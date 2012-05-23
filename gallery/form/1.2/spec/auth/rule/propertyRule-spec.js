/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
describe('property rule test suite', function() {
    KISSY.use('form/auth/rule/html/propertyRule, dom', function (S, PropertyRule, D) {
        var $ = S.all;
        beforeEach(function() {
            D.remove('#J_Test');
        });
        it('create a rule', function() {
            $('body').append('<input value="0" test="true"  id="J_Test"');
            var rule = new PropertyRule('test', function(pv, value) {
                return value > 1;
            }, {
                propertyValue:'',
                el:$('#J_Test')
            });
            var result = rule.validate();
            expect(result).toBeFalsy();
        });

        it('change value', function() {
            $('body').append('<input value="0" test="true"  id="J_Test"');
            var rule = new PropertyRule('test', function(pv, value) {
                return value > 1;
            }, {
                propertyValue:'',
                el:$('#J_Test')
            });
            //change value
            $('#J_Test').val(2);
            var result = rule.validate();
            expect(result).toBeTruthy();
        });

        it('all args', function() {
            $('body').append('<input value="0" test="true"  id="J_Test"');
            var rule = new PropertyRule('test', function(a, b ,c) {
                return c > 1;
            }, {
                propertyValue:'',
                el:$('#J_Test'),
                msg:{
                    success:'pass',
                    error:'fail'
                },
                args:3
            });
            var result = rule.validate();
            expect(result).toBeTruthy();
        });

        it('overwrite params', function() {
            $('body').append('<input value="0" test="true"  id="J_Test"');
            var rule = new PropertyRule('test', function(a, b ,c, d) {
                return c > 1 && d>c;
            }, {
                propertyValue:'',
                el:$('#J_Test'),
                msg:{
                    success:'pass',
                    error:'fail'
                },
                args:[3, 4]
            });
            //overwrite
            var result = rule.validate(1,2);
            expect(result).toBeFalsy();

            //要保留上一次的值
            result = rule.validate();
            expect(result).toBeFalsy();
        });

        it('get msg', function() {
            $('body').append('<input value="2" test="true"  id="J_Test"');
            var rule = new PropertyRule('test', function(a, b) {
                return b > 1;
            }, {
                propertyValue:'',
                el:$('#J_Test'),
                msg:{
                    success:'pass',
                    error:'fail'
                },
                args:3
            });

            rule.on('validate', function(e) {
                if(e.result) {
                    expect(e.msg).toEqual('pass');
                } else {
                    expect(e.msg).toEqual('fail');
                }

            });

            rule.validate();

            $('#J_Test').val('x');
            rule.validate();
        });

    });
});