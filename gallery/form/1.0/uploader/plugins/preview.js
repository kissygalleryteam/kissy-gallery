/**
 * @fileoverview 本地图片预览组件
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-01-10
 * @requires KISSY 1.2+
 */

KISSY.add(function(S){
	
	var D = S.DOM,
		E = S.Event,
		LOG_PRE = '[Plugin: Preview] ';
		
	function UploaderPreview(config){
		var self = this,
			_config = {
				mode: 'filter',
				maxWidth: 40,
				maxHeight: 40,
				// TODO change it to on and fire
				// use this to check whether the file uploaded is what you want, for example, I can check whether the file uploaded by user is image.
				// onCheck: function(){
					// return 1;
				// },
				// onGet: function(){
					// return 1;
				// },
				// // when the thumb of the uploaded image is shown, the function will exec.
				// onShow: function(){
					// return 1;
				// },
				onError: function(){
					return 1;
				},
				preview: true,
				destroy: true
			};
		
		self.event = {
			'check': 'check',
			'show': 'show',
			'error': 'error'
		};
		
		// prefer to use html5 file api
		if(typeof window.FileReader === "undefined"){
			switch(S.UA.shell){
				case 'firefox':
					_config.mode = 'domfile';
					break;
				case 'ie':
					switch(S.UA.ie){
						case 6:
							_config.mode = 'simple';
							break;
						case 8:
						case 7:
						// IE 9 and above should also use filter mode.
						default:
							_config.mode = 'filter';
							break;
					}
					break;
				default:
					_config.mode = 'simple';
					_config.preview = false;
					break;
			}
		}else{
			_config.mode = 'html5';
		}
		
		self.config = S.mix(_config, config);
		
		S.log(LOG_PRE + 'Preview initialized.');
	}
	
	S.augment(UploaderPreview, S.EventTarget, {
		
		preview: function(file, img){
			var self = this, 
				doc = document, 
				showFunc;
			
			// the html element of the input(type="file")
			self.file = file;
			// the html element of the thumb image element or preview image element
			self.img = img;
			self.preload = null;
			self.data = null;
			// self.TRANSPARENT = S.UA.ie == 6 || S.UA.ie == 7 ? "mhtml:" + doc.scripts[doc.scripts.length - 1].getAttribute("src", 4) + "!blankImage" : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
			// self.TRANSPARENT = S.UA.ie == 6 || S.UA.ie == 7 ? "mhtml:" + window.location.href.replace(/^https?/g,'').replace(/[^\/]+$/,'') + "!blankImage" : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
			self.TRANSPARENT = S.UA.ie == 6 || S.UA.ie == 7 ? "http://a.tbcdn.cn/p/fp/2011a/assets/space.gif" : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
			// S.log(self.config, 'dir');
			
			function getImgData(){
				switch(self.config.mode){
					case 'filter':
						// S.log(self.file);
						self.file.select();
						showFunc = filterPreview;
						// S.log(doc.selection, 'dir');
						// return self.file.value();
						// S.log('Filter data is ' + doc.selection.createRange().text);
						// S.log(self.file.outerHTML);
						try{
							return doc.selection.createRange().text;
						}catch(e){
							S.log('[UploadPreview] Get image data error, the error is: ');
							S.log(e, 'dir');
						}finally {
							doc.selection.empty();
						}
						break;
					case 'domfile':
						showFunc = simplePreview;
						return self.file.files[0].getAsDataURL();
						break;
					case 'html5':
						// TODO Mathon3
						var reader = new FileReader();
						// alert(self.file.files[0]);
						reader.onload = function(event){
							// alert(event.target.result);
							// self.img.src = event.target.result;
							showImg(event.target.result);
						}
						reader.onerror = function(e){
							S.log('[UploadPreview] File Reader Error. Your browser may not fully support html5 file api', 'warning');
						}
						reader.readAsDataURL(self.file.files[0]);
						// alert(reader.readAsDataURL);
						// S.log(reader, 'dir');
						return false;
						break;
					case 'remote':
						showFunc = remotePreview;
						S.log('[UploadPreview] This function is not supported right now.');
						return ;
					case 'simple':
					default:
						showFunc = simplePreview;
						// alert(self.file.value());
						// S.log('The file previewed is ' + self.file.value());
						return self.file.value;
				}
			}
			
			function showImg(src, width, height){
				self.img.src = src;
				if(width > 1 && height > 1){
					var ratio = Math.min( 1,
                        Math.max( 0, self.config.maxWidth ) / width  || 1,Math.max( 0, self.config.maxHeight ) / height || 1
                    );
					self.img.style.width = Math.round( width * ratio ) + "px";
               		self.img.style.height = Math.round( height * ratio ) + "px";
               		self.img.setAttribute('data-ratio', ratio);
				}
				// for ImageZoom
				var imagezoomSrc = self.config.mode == 'filter' ? self.data : src;
				D.attr(self.img, 'data-ks-imagezoom', imagezoomSrc);
				// self.config.onShow();
				self.fire(self.event.show);
			}
			
			function onError(){
				// self.config.onError();
				self.fire(self.event.error);
			}
			
			function simplePreview(){
				// S.log('Self.data is '+ self.data);
				// S.log('Self.preload is '+self.preload);
				// S.log('Self.img is ' + self.img);
				// if(!self.preload){
					// self.preload = new Image();
					// self.preload.src = self.data;
					// E.on(self.preload, 'load', function(e){
						// showImg(self.data);
					// });
					// // self.preload.onerror = function(){
						// // S.log('error');
					// // };
				// }
				// self.img.src = self.data;
				showImg(self.data);
			}
			
			function filterPreview(){
				// debugger;
				if(!self.preload){
					self.preload = document.createElement("div");
					D.css(self.preload, {
						// width: "1px", 
						// height: "1px",
                        visibility: "hidden", 
                        position: "absolute", 
                        left: "-9999px", 
                        top: "-9999px",
                        filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image')"
					});
					//TODO
					var body = document.body;
					body.insertBefore( self.preload, body.childNodes[0] );
					// preload = null;
					body = null;
					// self.preload = null;
				}
				// var preload = self.preload;
				self.data = self.data.replace(/[)'"%]/g, function(s){
					return escape(escape(s)); 
				});
				S.log('[UploadPreview] This escaped data is ' + self.data);
				try{
					// preload.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image', src='" + self.data +"')";
					// self.preload.style.filter ="progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image',src=\"" + self.data + "\")";
					self.preload.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = self.data;
				}catch(e){ 
					self._error("[UploadPreview] Filter error"); 
					// return; 
				}
				// S.log(self.img, 'dir');
				// var parent = self.img.parentNode,
					// tempWrapper = document.createElement("div");
				
				self.img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src=\"" + self.data + "\")";
				self.img.zoom = 1;
				self.img.setAttribute('data-ks-imagezoom', self.data);
				// tempWrapper.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src=\"" + self.data + "\")";
				// tempWrapper.style.zoom = 1;
				// D.append(self.img, tempWrapper);
				// parent.innerHTML = '';
				// D.append(tempWrapper, parent);
				// D.get('img', tempWrapper).setAttribute('data-ks-imagezoom', self.data);
				// var parent = self.img.parentNode;
				// parent.innerHTML = '';
				
				// D.html(parent, '');
				// var tempImg = D.create('img');
				// tempImg.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src=\"" + self.data + "\")";
				// D.append(parent, tempImg);
				// this.showImg( self.TRANSPARENT, preload.offsetWidth, preload.offsetHeight );
				// showImg( self.TRANSPARENT, self.preload.offsetWidth, self.preload.offsetHeight );
				showImg( self.TRANSPARENT, self.preload.offsetWidth, self.preload.offsetHeight );
			}
			
			if(self.file){
				
				// alert(self.config.onShow);
				
				// S.log(self.config.onCheck());
				S.log('[UploadPreview] One file selected. Using ' + self.config.mode + ' mode to preview.');
				// S.log(self.config, 'dir');
				
				var checkResult = self.fire(self.event.check);
				
				if(checkResult !== false){
					var data = getImgData();
					
					// S.log(data);
					// alert(data);
					S.log('[UploadPreview] Get data done. The data is ' + data);
					
					if(!!data && data !== self.data){
						// S.log('[UploadPreview] Self data does not exists');
						 // && self.config.onGet(data)
						// var tempImg = new Image();
							// tempImg.src = data;
							// fileSize = tempImg.fileSize;
							// // S.log(tempImg, 'dir');
							// alert(tempImg.fileSize);
							// tempImg.onload = function(){
								// alert(tempImg.fileSize);
							// }
							// if(fileSize/1024 > 500){
								// alert('ͼƬ��С���ܳ���500K!');
							// }
							// tempImg = null;
						self.data = data;
						data = null;
						// exec preview show function according to the show type
						showFunc();
						// if(self.config.destroy){
							// self.destroy();
						// }
					}
				}else{
					S.log('[UploadPreview] Check error.');
				}
				
			}
			
		},
		
		/*
		 * set config, this is mainly used for setting functions such as onShow, onCheck after new UploaderPreview;
		 */
		setConfig: function(config){
			// S.log(config, 'dir');
			self.config = S.mix(self.config, config);
		},
		
		// release memory, prevent memory leak
		destroy: function() {
			var self = this;
			//destroy remote upload objects(only for remote mode).
			if ( self._upload ) {
				self._upload.dispose();
				self._upload = null;
			}
			//destroy preload images.
			// if ( self.preload ) {
				// var preload = self.preload, 
					// parent = preload.parentNode;
				// // self.preload = preload.onload = preload.onerror = null;
				// self.preload = null;
				// parent && parent.removeChild(preload);
			// }
			//destroy related objects.
			self.file = self.img = self.data = self.preload = null;
		},
		
		_error: function(e){
			S.log(e);
		}
		
	})
	
	// S.UploaderPreview = UploaderPreview;
	
	return UploaderPreview;
	
});