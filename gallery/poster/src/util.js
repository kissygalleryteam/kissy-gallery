/**
 * A pack of utilities for huabao.
 *
 * @author  fahai
 */
KISSY.add("poster/util", function (S) {

    /**
     * Img element onload handler.
     *
     * @param img       {HTMLImageElement}
     * @param callback  {Function}
     * @static
     */
    function attachImgOnload(img, callback) {

        if ((img && img.complete && img.clientWidth)) {
            callback();
            return;
        }
        img.onload = function () {
            setTimeout(callback, 100);
        }
    }

    return {
        attachImgOnload: attachImgOnload
    };
});
