/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
describe('rule factory test suite', function() {
    KISSY.use('form/validation/rule/html/propertyFactory', function (S, PropertyFactory) {
        it('create factory', function() {
            var factory = new PropertyFactory();
            expect(factory).toBeDefined();
        });

        it('create rule', function() {
            var factory = new PropertyFactory();
            var rule = factory.create('required');
            var result = rule.validate();
            expect(result).toBeFalsy();
        });

        it('use init args', function() {
            var factory = new PropertyFactory();
            var rule = factory.create('required', {
                args:['', 1]
            });
            var result = rule.validate();
            expect(result).toBeTruthy();
        });

        it('init msg', function() {
            var factory = new PropertyFactory();
            var rule = factory.create('required', {
                msg:'fail'
            });
            var msg = '';
            var result = rule.on('validate', function(e) {
                msg = e.msg;
            }).validate();
            expect(result).toBeFalsy();
            expect(msg).toEqual('fail');
        });
    });
});