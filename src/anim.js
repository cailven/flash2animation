;(function(){
    var animID = 0;
    /**
     * @module anim
    */
    var anim = {
        /**
         * @method build 
         * @param {Object} data
         * @param {HTMLElement} container
        */
        build:function(data, container, image){
            var that = this;
            container = container||document.body;
            data.layers.forEach(function(layer, index){
                if(layer.name != "action"){
                   that.parseLayer(container, layer, image, index, data);
                }
            });
        },
        /**
         * @method parseLayer
         * @param {HTMLElement} container
         * @param {Object} layerData
         * @param {Number} index
        */
        parseLayer:function(container, layerData, image, index, allData){
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
            var imgData = allData.texture[layerData.image];
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
                    var rotation = elem.rotation;
                    rotation += r;

                    if(frame.rotateType == "clockwise"){
                        r += 360 * frame.rotateTime;
                    }
                    else if(frame.rotateType == "counter-clockwise"){
                        r -= 360 * frame.rotateTime;
                    }
                    else if(frame.rotateType == "auto"){
                        if(lastStyle && Math.abs(lastStyle.rotation - rotation) > 180){
                            rotation += rotation > lastStyle.rotation?-360:360;
                        }
                    }

                    var isTween = frame.tween == "motion";
                    styles.push({
                        x:elem.x - elem.originX,
                        y:elem.y - elem.originY,
                        scaleX:elem.scaleX,
                        scaleY:elem.scaleY,
                        rotation:rotation,
                        originX:elem.originX,
                        originY:elem.originY,
                        tween:isTween,
                        num:t/duration*100,
                        alpha:elem.alpha * .01,
                        timing:isTween?"":timingCss
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
                time:duration/24,
                image:image
            };
            var animName = layerData.name + (animID++);
            that.addStyle(styles, elemData, animName);
            var elem = document.createElement("div");
            elem.className = animName + " flashAnim";            
            container.appendChild(elem);
        },
        /**
         * @method addStyle
         * @param {Array} styles
         * @param {Object} elemData
         * @param {String} animName
        */
        addStyle:function(styles, elemData, animName){
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
                    -{cssVendor}-animation:{anim} {time}s linear 0s infinite;\n\
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
                anim:animName,
                content:content,
                cssVendor:cssVendor
            },elemData));

            var styleElem = document.getElementById("flashAnimStyle");
            styleElem = document.createElement("style");
            styleElem.innerHTML = style;
            styleElem.id = "flashAnimStyle_" + animName;
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

    window.anim = anim;
})(window);