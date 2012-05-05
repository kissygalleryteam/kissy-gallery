/**
 * @fileoverview
 * @author уем╕ <zhangting@taobao.com>
 *
 */
KISSY.add('gallery/form/1.1/auth/utils', function (S) {
    var Utils = {
        toJSON:function (cfg) {
            cfg = cfg.replace(/'/g, '"');
            try {
                eval("cfg=" + cfg);
            } catch (e) {
                S.log('data-valid json is invalid');
            }
            return cfg;
        },
        guid:function () {
            return 'AUTH_' + S.guid();
        }
    };

    return Utils;
});