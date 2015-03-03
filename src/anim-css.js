;(function(){
    var animID = 0;
    var baseStyleID = "baseAnimStyle";
    /**
     * @module anim
    */
    var animCSS = {
        /**
         * @method build 
         * @param {Object} cfg
         * @param {Object} cfg.data 导出的动画数据
         * @param {String} cfg.image 图片地址
         * @param {HTMLElement} cfg.container 动画的容器，默认为document.body
         * @param {Number} cfg.time 循环次数，0为无限循环，默认无限循环 
         * @param {Number} cfg.fps 帧频，默认为导出数据中的帧频
        */
        build:function(cfg){
            var that = this;
            var data = cfg.data;
            var image = cfg.image;
            var elems = [];
            if(data && image){
                var container = cfg.container||document.body;
                var fps = cfg.fps||data.stage.fps;
                var time = cfg.time||"infinite";

                var animContainer = document.createElement("div");
                animContainer.className = "flashAnimContainer";
                animContainer.style.position = "relative";
                animContainer.style.width = cfg.data.stage.width + "px";
                animContainer.style.height = cfg.data.stage.height + "px";
                animContainer.style.overflow = "hidden";
                container.appendChild(animContainer);

                data.layers.forEach(function(layer, index){
                    var elem = that._parseLayer(animContainer, layer, image, index, data.texture, fps, time);
                    if(elem){
                        elems.push(elem);
                    }   
                });
            }

            var baseStyleElem = document.getElementById(baseStyleID);
            if(!baseStyleElem){
                this.createStyle(' \
                    .flashAnim{ \
                        position:absolute; \
                        left:0px; \
                        top:0px; \
                        -webkit-animation-fill-mode: both !important \
                        -Moz-animation-fill-mode: both !important \
                        animation-fill-mode: both !important \
                    } \
                ', baseStyleID);
            }

            return {
                play:function(){
                    elems.forEach(function(elem){
                        var animName = elem.getAttribute("data-anim");
                        elem.className = "flashAnim";
                        setTimeout(function(){
                            elem.className = animName + " flashAnim"
                        }, 100);
                        elem.style[that.getCSSVendor() + "AnimationPlayState"] = "running";
                    });
                },
                stop:function(){
                    elems.forEach(function(elem){
                        var animName = elem.getAttribute("data-anim");
                        elem.className = "flashAnim";
                        setTimeout(function(){
                            elem.className = animName + " flashAnim"
                        }, 100);
                        elem.style[that.getCSSVendor() + "AnimationPlayState"] = "paused";
                    });
                },
                pause:function(){
                    elems.forEach(function(elem){
                        elem.style[that.getCSSVendor() + "AnimationPlayState"] = "paused";
                    });
                },
                resume:function(){
                    elems.forEach(function(elem){
                        elem.style[that.getCSSVendor() + "AnimationPlayState"] = "running";
                    });
                }
            }
        },
        /**
         * @method _parseLayer
         * @param {HTMLElement} container
         * @param {Object} layerData 层数据
         * @param {String} image 图片地址
         * @param {Number} index 层级
         * @param {Object} texture 图片数据
         * @param {Number} fps 帧频 
         * @param {Number} time 播放次数
        */
        _parseLayer:function(container, layerData, image, index, texture, fps, time){
            var that = this;
            var cssVendor = that.getCSSVendor();
            var frames = layerData.frames;
            if(!frames || frames.length == 0){
                console.warn("no frames:", layerData.name);
                return;
            }

            var duration = frames.reduce(function(item, next){
                return {
                    duration:item.duration + next.duration
                }
            }).duration;

            var styles = [];
            var t = 0;
            var r = 0;
            var lastStyle;
            var imgData = texture[layerData.image];
            if(!imgData){
                console.warn("no image data! ","layerName:"+ layerData.name, " imageName:"+layerData.image);
                return;
            }

            frames.forEach(function(frame, i){
                var timingCss = "";
                var useStep = false;
                if(useStep){
                    timingCss = "-" + cssVendor + "-animation-timing-function:step-end;\n";
                }
                else if(lastStyle && !lastStyle.tween){
                    lastStyle.num = t/duration*100 - .0001;
                    styles.push(lastStyle);
                };

                var elem = frame.elem;
                if(elem){            
                    styles.push({
                        x:elem.x - elem.originX,
                        y:elem.y - elem.originY,
                        scaleX:elem.scaleX,
                        scaleY:elem.scaleY,
                        rotation:elem.rotation,
                        originX:elem.originX,
                        originY:elem.originY,
                        tween:frame.tween,
                        num:t/duration*100,
                        alpha:elem.alpha * .01,
                        timing:frame.tween?"":timingCss
                    });
                }
                else{
                    styles.push({
                        num:t/duration*100,
                        scaleX:1,
                        scaleY:1,
                        alpha:0,
                        rotation:0,
                        x:0,
                        y:0,
                        originX:0,
                        originY:0,
                        tween:false,
                        timing:timingCss
                    });
                }

                lastStyle = that.merge({}, styles[styles.length-1]);
                t+=frame.duration;
            });

            var endStyle = that.merge({}, styles[styles.length-1]);
            endStyle.num = 100;
            endStyle.timing = "";
            styles.push(endStyle);
            
            var elemData = {
                width:imgData.w,
                height:imgData.h,
                imgX:imgData.x,
                imgY:imgData.y,
                index:100-index,
                duration:duration/fps,
                image:image
            };
            var animName = layerData.name + (animID++);
            that.addStyle(styles, elemData, animName, time);
            var elem = document.createElement("div");
            elem.className = animName + " flashAnim";   
            elem.setAttribute("data-anim", animName);  
            elem.setAttribute("data-layer", layerData.name);       
            container.appendChild(elem);

            return elem;
        },
        /**
         * @method addStyle
         * @param {Array} styles
         * @param {Object} elemData
         * @param {String} animName
        */
        addStyle:function(styles, elemData, animName, time){
            var that = this;
            var cssVendor = that.getCSSVendor();
            var keyTpl = '\n\
                @-{cssVendor}-keyframes {anim}{\n\
                {content}\n\
                }\n\
                .{anim}{\n\
                    width:{width}px;\n\
                    height:{height}px;\n\
                    background:url({image}) no-repeat;\n\
                    background-position:-{imgX}px -{imgY}px;\n\
                    z-index:{index};\n\
                    -{cssVendor}-animation:{anim} {duration}s linear 0s {time};\n\
                }\n\
                ';

            var percentTpl = '\
                {num}% {\n\
                    opacity:{alpha};\n\
                    -{cssVendor}-transform:translate3d({x}px, {y}px, 0px) rotateZ({rotation}deg) scale3d({scaleX}, {scaleY}, 1);\n\
                    -{cssVendor}-transform-origin:{originX}px {originY}px;\n\
                    {timing}\
                }\n';

            var content = "";
            styles.forEach(function(s){
                s.cssVendor = cssVendor;
                content += that.renderTpl(percentTpl, s);
            });
            var style = that.renderTpl(keyTpl, that.merge({
                time:time,
                anim:animName,
                content:content,
                cssVendor:cssVendor
            },elemData));

            this.createStyle(style, "flashAnimStyle_" + animName);
        },
        createStyle:function(content, id){
            var styleElem = document.createElement("style");
            styleElem.innerHTML = content;
            styleElem.id = id;
            document.getElementsByTagName("head")[0].appendChild(styleElem);
        },
        /**
         * @method 获取css前缀
        */
        getCSSVendor:function(){
            if(this._cssVendor){
                return this._cssVendor;
            }
            var userAgent = navigator.userAgent;
            this._cssVendor = /webkit/i.test(userAgent)?"webkit":/firefox/i.test(userAgent)?"Moz":/msie/i.test(userAgent)?"ms":/opera/i.test(userAgent)?"O":"webkit";
            return this._cssVendor;
        },
        /**
         * @method merge
         * @param {Object} to
         * @param {Object} from
        */
        merge:function(to, from){
            for(var i in from){
                to[i] = from[i];
            }
            return to;
        },
        /**
         * @method renderTpl 替换模板
         * @param {String} tpl
         * @param {Object} data
        */
        renderTpl:function(tpl, data){
            data = data||{};
            for(var i in data){
                var reg = new RegExp("{" + i + "}", "g");
                tpl = tpl.replace(reg, data[i]);
            }
            return tpl;
        }
    };

    window.Anim = window.Anim||{};
    Anim.css = animCSS;
})(window);