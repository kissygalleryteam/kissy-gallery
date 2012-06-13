/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
describe('field test suite', function() {
    KISSY.use('form/validation/field/field, dom, json', function(S, Field, D, JSON) {
        var $ = S.all;
        beforeEach(function() {
            D.remove('#J_Test');
        });

        it('create html field', function() {
            $('body').append('<input value="3" required  id="J_Test"');
            var f = new Field('#J_Test');
            expect(f).toBeDefined();
        });

        it('more property', function() {
            $('body').append('<input value="x" required  pattern="[0-9]" id="J_Test"');
            var f = new Field('#J_Test');

            //validate all
            expect(f.validate()).toBeFalsy();

            //validate single rule
            expect(f.validate('required')).toBeTruthy();

            //validate pattern
            expect(f.validate('pattern')).toBeFalsy();

            //use new value to validation
            $('#J_Test').val(2);
            expect(f.validate('pattern')).toBeTruthy();
        });

        xit('use property config json', function() {
            $('body').append('<input value="x" required  pattern="[0-9]" id="J_Test"');
            var valid = {
                required:'hello world',
                pattern:'good pattern'
            };

            S.one('#J_Test').attr('data-valid', JSON.parse(valid));
            var f = new Field('#J_Test');

            //validate all
            expect(f.validate()).toBeFalsy();

            //validate single rule
            expect(f.validate('required')).toBeTruthy();
        });

        it('use json param', function() {
            $('body').append('<input value="x" required pattern="[0-9]" id="J_Test"');
            var valid = {
                event:'focus',
                rules:{
                    required: {
                        success:'hello world',
                        error:'required error'
                    },
                    pattern:{
                        success:'good pattern',
                        error:'pattern error'
                    }
                }
            };

            var f = new Field('#J_Test', valid);
            $('#J_Test').fire('blur');
            expect(f.get('message')).toEqual('');

            $('#J_Test').fire('focus');
            expect(f.get('message')).toEqual('pattern error');

            //change value
            $('#J_Test').val('2');
            f.on('validate', function(e){
                expect(e.msg).toEqual('good pattern');
            });
            f.validate();
            expect(f.get('message')).toEqual('good pattern');
        });

        it('use simple message json param2', function() {
            $('body').append('<input value="x" required pattern="[0-9]" id="J_Test"');
            var valid = {
                event:'focus',
                rules:{
                    required:'required error',
                    pattern:'pattern error'
                }
            };

            var f = new Field('#J_Test', valid);

            $('#J_Test').fire('focus');
            expect(f.get('message')).toEqual('pattern error');
        });

        it('get success rule msg', function() {
            $('body').append('<input value="1" required pattern="[0-9]" id="J_Test"');
            var valid = {
                event:'focus',
                rules:{
                    required: {
                        success:'hello world',
                        error:'required error'
                    },
                    pattern:{
                        success:'good pattern',
                        error:'pattern error'
                    }
                }
            };

            var f = new Field('#J_Test', valid);

            $('#J_Test').fire('focus');
            expect(f.get('message')).toEqual('good pattern');
        });

        xit('test equalto property', function() {
            $('body').append('<input value="1" equalTo="#J_Test1" id="J_Test"');
            $('body').append('<input value="2"  id="J_Test1"');
            var valid = {
                event:'focus',
                rules:{
                    equalTo: {
                        success:'the same',
                        error:'not the same'
                    }
                }
            };

            var f = new Field('#J_Test', valid);

            f.validate();
            expect(f.get('message')).toEqual('not the same');
        });

        it('add custom rule', function() {
            $('body').append('<input value="4" required  pattern="[0-9]" id="J_Test"');
            var f = new Field('#J_Test');
            f.add('test', function(value) {
                return value == 1;
            }, {
                msg:'test fail'
            });

            //如果初始化没有放入value，那么自动将表单的value填入
            expect(f.validate()).toBeFalsy();
        });

        xit('group validation', function() {
            $('body').append('<input value="x" required pattern="[0-9]" id="J_Test"');
            var valid = {
                required:'hello world',
                pattern:'good pattern',
                groups:{
                    a:['require']
                }
            };

            S.one('#J_Test').attr('data-valid', JSON.parse(valid));
            var f = new Field('#J_Test');

            //validate group
            expect(f.validate({
                groups:['a']
            })).toBeTruthy();
        });
    });
});