/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.use('form/validation/rule/ruleParser', function (S, Parser) {
    describe('new parser', function () {
        it('new parser', function() {
            var parser = new Parser();
            parser.add(function(a, b) {
                return a<b;
            }, {
                a:1,
                b:2
            });

            expect(parser.validateAll()).toBeTruthy();
        });

        it('get null rule', function() {
            var parser = new Parser();
            expect(parser.get('test')).toBeNull();
        });

        it('get rule', function() {
            var parser = new Parser();
            parser.add('test', function(a, b) {
                return a<b;
            });

            var rule = parser.get('test');

            expect(rule.validate(2, 2)).toBeFalsy();
        });
    });
});