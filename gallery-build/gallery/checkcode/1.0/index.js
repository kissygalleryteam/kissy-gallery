/**
 * @fileoverview 统一验证码组件
 * @desc 图片、语音验证码交互组件，验证码接口由aliyun提供
 * @author 棪木<wondger@gmail.com>
 */

KISSY.add('gallery/checkcode/1.0/index', function (S) {
    var D = S.DOM,
        E = S.Event,
        uid = 1,
        regexp = /^[\da-zA-Z]{4}$/,
        isWin = navigator.userAgent.indexOf("Windows") !== -1,
        isie = S.UA.ie,
        isfirefox = S.UA.firefox,

        dplStyle = '.{{prefixCls}}checkcode-img,.{{prefixCls}}checkcode-audio{width:175px;height:32px;line-height:32px;position:absolute;}'
                 + '.{{prefixCls}}checkcode-audio{display:none;}'
                 + '.{{prefixCls}}checkcode-img img,.{{prefixCls}}checkcode-audio audio{float:left;display:inline;width:100px;height:30px;border:1px solid #CDCDCD;cursor:pointer;}'
                 + '.{{prefixCls}}checkcode-refresh{display:none;width:100px;height:30px;vertical-align:middle;border:1px solid #CDCDCD;position:absolute;left:0;top:0;cursor:pointer;}'
                 + '.{{prefixCls}}audio-state{float:left;display:inline;width:100px;height:30px;border:1px solid #CDCDCD;position:relative;}'
                 + '.{{prefixCls}}audio-state-text{display:block;width:70px;height:30px;padding-left:30px;font-size:12px;color:#999;text-decoration:none;background:url(http://img01.taobaocdn.com/tps/i1/T1HVriXnVeXXbjRy2i-21-169.png) no-repeat 10px -93px;z-index:1;position:absolute;cursor:text;}'
                 + '.{{prefixCls}}audio-state-text:hover{text-decoration:none;}'
                 + '.{{prefixCls}}audio-state-progress{width:0;height:30px;background-color:#186BCA;position:absolute;left:0;top:0;z-index:0;}'
                 + '.{{prefixCls}}audio-over{width:100px;padding-left:0;color:#186BCA;text-align:center;background:none;cursor:pointer;}'
                 + '.{{prefixCls}}audio-over:hover{text-decoration:underline;}'
                 + '.{{prefixCls}}checkcode-refresher{float:left;display:inline;width:32px;height:32px;vertical-align:top;text-indent:-9999em;outline:none;border-right:1px solid #DDD;background:url(http://img01.taobaocdn.com/tps/i1/T1HVriXnVeXXbjRy2i-21-169.png) no-repeat 7px -145px;}'
                 + '.{{prefixCls}}checkcode-switcher{float:left;display:inline;width:32px;height:32px;vertical-align:top;text-indent:-9999em;outline:none;background:url(http://img01.taobaocdn.com/tps/i1/T1HVriXnVeXXbjRy2i-21-169.png) no-repeat 0 0;}'
                 + '.{{prefixCls}}checkcode-refresher,.{{prefixCls}}checkcode-switcher{filter:alpha(opacity=70);opacity:0.7;}'
                 + '.{{prefixCls}}checkcode-refresher:hover,.{{prefixCls}}checkcode-switcher:hover{filter:alpha(opacity=100);opacity:1;border-color:#EAEAEA;}'
                 + '.{{prefixCls}}audio-switcher{background-position:6px -40px;}'
                 + '.{{prefixCls}}img-switcher{background-position:5px 10px;}',

        CONSTANTS = {
            template:'<div class="{prefixCls}checkcode-img" id="J_ImgCode{uid}">'
                    +'<img id="J_CheckCodeImg{uid}" width="100" height="30" onmousedown="return false;"/>'
                    +'<a href="#nogo" onmousedown="return false;" role="button" title="重新获取验证码" aria-label="重新获取验证码" id="J_ImgRefresher{uid}" class="{prefixCls}checkcode-refresher">重新获取验证码</a>'
                    +'<a href="#nogo" onmousedown="return false;" role="button" title="获取语音验证码" aria-label="获取语音验证码" id="J_AudioSwitcher{uid}" class="{prefixCls}checkcode-switcher {prefixCls}audio-switcher">获取语音验证码</a>'
                    +'</div>'
                    +'<div class="{prefixCls}checkcode-audio" id="J_AudioCode{uid}">'
                    +'<span class="{prefixCls}audio-state" id="J_AudioState{uid}"><a href="#nogo" class="{prefixCls}audio-state-text" id="J_AudioStateText{uid}" onmousedown="return false;"></a><span class="{prefixCls}audio-state-progress" id="J_AudioStateProgress{uid}"></span></span>'
                    +'<a href="#nogo" role="button" onmousedown="return false;" title="重新获取验证码" aria-label="重新获取验证码" id="J_AudioRefresher{uid}" class="{prefixCls}checkcode-refresher">重新获取验证码</a>'
                    +'<a href="#nogo" role="button" onmousedown="return false;" title="获取图片验证码" aria-label="获取图片验证码" id="J_ImgSwitcher{uid}" class="{prefixCls}checkcode-switcher {prefixCls}img-switcher">获取图片验证码</a>'
                    +'</div>',
            getImgURL:'{apiserver}/get_img?identity={identity}&sessionid={sessionid}&kjtype=default',
            checkImgURL:'{apiserver}/check_img?identity={identity}&sessionid={sessionid}&delflag=0',
            getAudioURL:'{apiserver}/get_audio?identity={identity}&sessionid={sessionid}',
            checkAudioURL:'{apiserver}/check_audio?identity={identity}&sessionid={sessionid}&delflag=0'
        },
        
        // log checkcode加载到校验完成时间
        loadT0 = S.now(),
        // log checkcode输入到校验完成时间
        typeT0 = S.now(),

        // callbacks
        callbacks = {};

    var CheckCode = function(cfg) {
        if (!(this instanceof CheckCode)) {
            return new CheckCode(cfg);
        }
        
        this.input = cfg.input && S.one(cfg.input);
        this.container = cfg.container && S.one(cfg.container);
        this.prefixCls = S.isString(cfg.prefixCls) ? cfg.prefixCls : '';
        this.identity = S.isString(cfg.identity) ? cfg.identity : '';
        this.sessionid = S.isString(cfg.sessionid) ? cfg.sessionid : '';
        this.apiserver = S.isString(cfg.apiserver) && cfg.apiserver ? cfg.apiserver : 'http://pin.aliyun.com';

        this.checkedCode = '';

        this.uid = uid++;
    };

    S.augment(CheckCode, S.EventTarget, {
        init: function() {
            if(!this.container || !this.input || !this.identity || !this.sessionid) return;

            if(this.INITED) return this;

            this.createStyle();
            this.create();
            this.bind();

            this.INITED = true;

            return this;
        },
        createStyle: function() {
            var style = dplStyle.replace(/{{prefixCls}}/g,this.prefixCls),
                ele = D.create('<style>',{'type':'text/css'});
            if (ele.styleSheet) {
                ele.styleSheet.cssText = style;
            }
            else {
                ele.appendChild(document.createTextNode(style));
            }

            D.append(ele, 'head');
        },
        create: function() {
            var uid = this.uid;
            var html = S.substitute(CONSTANTS.template,{
                prefixCls:this.prefixCls,
                uid:uid
            });
            this.container.html(html);

            this.imgCode = S.one('#J_ImgCode'+uid);
            this.audioCode = S.one('#J_AudioCode'+uid);
            this.imgSwitcher = S.one('#J_ImgSwitcher'+uid);
            this.audioSwitcher = S.one('#J_AudioSwitcher'+uid);
            this.refresher = S.all('.'+this.prefixCls+'checkcode-refresher');
            this.img = S.one('#J_CheckCodeImg'+uid);
            this.audioState = S.one('#J_AudioState'+uid);
            this.audioStateText = S.one('#J_AudioStateText'+uid);
            this.audioProgress = S.one('#J_AudioStateProgress'+uid);

            var urlParams = {
                apiserver:this.apiserver,
                identity:this.identity,
                sessionid:this.sessionid
            };
            this.getImgURL = S.substitute(CONSTANTS.getImgURL,urlParams);
            this.checkImgURL = S.substitute(CONSTANTS.checkImgURL,urlParams);
            this.getAudioURL = S.substitute(CONSTANTS.getAudioURL,urlParams);
            this.checkAudioURL = S.substitute(CONSTANTS.checkAudioURL,urlParams);

            this.CREATED = true;
        },
        bind: function() {
            var self = this;

            this.bindImg();
            this.bindAudio();

            this.refresher.on('click',function(evt){
                evt.halt();
                self.refresh();
                self.focus();
            });

            this.input.on('valuechange',function(e){
                if((!e.prevVal || e.prevVal.length === 0 || e.prevVal.length === 4) && e.newVal.length === 1){
                    typeT0 = S.now();
                }
            }).on('paste',function(){
                if(this.value.length !== 0){
                    return;
                }

                typeT0 = S.now();
            });

        },
        bindImg: function() {
            if(!this.img) return this;

            var self = this;
            this.img && this.img.on('click',function(){
                self.refresh();
                self.focus();
            }).on('load',function(){
            }).on('error',function(){
                self.log({
                    e:'IMGERROR'
                });
            })

            this.imgSwitcher && this.imgSwitcher.on('click',function(evt){
                evt.halt();
                
                self.switchTo('img');

                self.focus();
            });

            return this;
        },
        bindAudio: function() {
            var self = this;
            this.audioSwitcher.on('click',function(evt){
                evt.halt();

                self.switchTo('audio');
                self.refresh();

                self.focus();
            });

            this.audioStateText.on('click',function(evt){
                evt.halt();
                if(!self.audioOver) return;

                self.refresh();
                self.focus();
            });

            return this;
        },
        bindAudioProgress: function() {
            var self = this;
            if(this.audioSupport){
                this.audio.on('timeupdate',function(){
                    // firefox can not get duration
                    if(isfirefox && (!this.duration || this.duration === Infinity)){
                        self.progress(100);
                    }else{
                        self.progress(parseInt(100*this.currentTime/this.duration));
                    }
                }, this.audio[0])
                .on('play',function(){
                }, this.audio[0])
                .on('ended',function(){
                    self.progress(100);
                }, this.audio[0]);
            }
        },
        switchTo: function(type) {
            if(!type || !S.isString(type)) return this;

            var type = type.toUpperCase();

            if(type === 'IMG'){
                this.audioCode.hide();
                this.stopAudio();
                this.imgCode.css({'display':'block'});

                this.codeType = type;
            }else if(type === 'AUDIO'){
                this.imgCode.hide();
                this.audioProgress.width(0);
                this.audioStateText.removeClass(this.prefixCls+'audio-replay');
                this.audioCode.css({'display':'block'});

                this.codeType = type;
            }

            this.checkedCode = '';

            this.toggleRefresher();

            this.SHOWED = true;

            this.fire('switch');

            return this;
        },
        toggleRefresher: function() {
            if(this.codeType !== 'AUDIO'){
                this.refresher.show();
                return;
            };

            // firefox can not get duration
            if(!this.audioSupport || isfirefox){
                this.refresher.hide();
            }
        },
        refreshImg: function() {
            if(!this.getImgURL) return this;

            var getURL = this.getImgURL + (this.getImgURL.indexOf('?')>=0 ? '&t=' : '?t=') + S.now();

            this.img.attr('src',getURL);

            return this;
        },
        refreshAudio: function() {
            if(!this.getAudioURL) return this;

            var getURL = this.getAudioURL + (this.getAudioURL.indexOf('?')>=0 ? '&t=' : '?t=') + S.now();

            this.stopAudio();
            this.audioOver = false;

            if(this.audioSupport){
                this.audioDuration = 0;
                this.audio = S.one(new Audio(getURL));
                this.audio[0].play();
                this.bindAudioProgress();
            }else if(!isie){
                S.one('body').append('<embed src="'+getURL+'" id="J_EmbedSound'+this.uid+'"'+(isWin?'type="application/x-mplayer2"':'type="audio/x-wav"')+' autostart hidden />');
                this.player = S.one('#J_EmbedSound'+this.uid);
                this.progress('NOPROGRESS');
            }else{
                // bgsound支持的音频类型取决于media
                // player版本，mid、wav支持较好
                var bgsound = D.create('<bgsound>',{
                    autostart: true,
                    id: 'J_BgSound' + this.uid,
                    src: getURL
                });
                D.append(bgsound, 'head');
                this.player = S.one('#J_BgSound'+this.uid);
                this.progress('NOPROGRESS');
            }

            return this;
        },
        refresh: function(type) {
            var type = S.isString(type) && type ? type.toUpperCase() : this.codeType;

            if (type === 'IMG') {
                this.refreshImg();
            }
            else if (type === 'AUDIO') {
                this.refreshAudio();
            }

            this.checkedCode = '';

            this.fire('refresh');
            // 计时
            loadT0 = typeT0 = S.now();
        },
        focus: function() {
            this.input[0].focus();
            this.input[0].select();
        },
        stopAudio: function() {
            if(this.audioSupport){
                if(this.audio && this.audio[0]){
                    this.audio[0].pause();
                }
            }else{
                if(this.player){
                    // ie9 need set src empty at first
                    this.player[0].src = '';
                    this.player.remove();
                    this.player = null;
                }
            }
        },
        replayAudio: function() {
            if(!this.audioSupport || !this.audio) return;

            this.audio[0].currentTime = 0;
            this.audio[0].pause();
            this.audio[0].play();
        },
        showImg: function() {
            this.switchTo('img');
            this.refresh();

            return this;
        },
        showAudio: function() {
            this.switchTo('audio');

            return this;
        },
        audioSupport: (function(){
            try{
                // IE9 不支持 'audio/x-wav'
                return "Audio" in window && (new Audio()).canPlayType('audio/x-wav');
            }catch(e){
                return false;
            }
        })(),
        progress: function(flag) {
            switch(flag){
                case -1:
                    this.audioStateText.text('正在加载');
                    break;
                case 100:
                case 'NOPROGRESS':
                    this.audioOver = true;
                    this.audioProgress.css({'width':'0'});
                    this.audioStateText.addClass(this.prefixCls+'audio-over').text('点击播放语音');
                    break;
                default:
                    this.audioStateText.removeClass(this.prefixCls+'audio-over').text('请仔细收听');
                    this.audioProgress.css({'width':flag+'%'});
                    break;
            }
        },
        check: function(callback) {
            var val = S.trim(this.input.val()),
                callback = S.isFunction(callback) ? callback : function(){};

            // 格式校验
            if(!regexp.test(val)){
                callback({success:false,codeType:this.codeType});
                return;
            }

            // 已校验通过
            if(this.checkedCode && this.checkedCode === val){
                callback({success:true,codeType:this.codeType});
                return;
            }

            callbacks[val] = callback;
            // 正在校验
            if (this.checkingCode) {
                if (this.checkingCode === val) {
                    return;
                }else{
                    this.io && this.io.abort && this.io.abort();
                }
            }

            // checkingCode初始化
            this.checkingCode = val;
            // 延迟校验，防止audioState click的刷新行为
            S.later(function(){
                this._check(callback);
            }, 500, false, this);
        },
        _check: function(callback) {
            var checkURL = this.codeType == 'IMG' ? this.checkImgURL : this.checkAudioURL,
                val = S.trim(this.input.val());

            var self = this;

            self.io = S.io({
                url: checkURL,
                data: {
                    code: val
                },
                dataType: 'jsonp',
                success: function(data) {
                    self.checkingCode = '';

                    // 记录整个操作时间
                    self.log({
                        // 验证码输入到验证完成时间
                        t1: S.now() - typeT0,
                        // 验证码载入到验证完成时间
                        t2: S.now() - loadT0,
                        // 验证结果
                        s: data && data.message === 'SUCCESS.',
                        // 验证码类型
                        t: self.codeType
                    });

                    if (data && data.message==='SUCCESS.') {
                        self.progress(100);
                        self.stopAudio();
                        self.checkedCode = val;

                        callbacks[val] && callbacks[val]({success:true,codeType:self.codeType});
                    }
                    else {
                        failureCallback();
                    }
                },
                error: function(){
                    failureCallback();
                }
            });

            function failureCallback() {
                if (self.codeType==='IMG') {
                    self.refresh();
                }
                else {
                    self.progress(100);
                    self.stopAudio();
                }

                // 校验失败后清空
                self.checkedCode = '';

                callbacks[val] && callbacks[val]({success:false,codeType:self.codeType});
            }
        },
        log: function(msg) {
            if(!msg) return;

            var img = new Image();
            img.src = 'http://acjs.aliyun.com/captchaerror?' + S.param(msg);
        }
    });

    S.checkcode = CheckCode;

    return CheckCode;
});
