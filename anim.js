;(function(){
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
            var duration = frames.reduce(function(item, next){
                return {
                    duration:item.duration + next.duration
                }
            }).duration;

            var styles = [];
            var t = 0;
            var r = 0;
            var lastStyle;
            var imgData = allData.texture[layerData.name];
            frames.forEach(function(frame, i){
                var elem = frame.elem;
                if(elem){
                    var m = elem.matrix;
            
                    var rotation =- Math.atan2(m.c, m.d) * 180 / Math.PI;
                    rotation += r;

                    if(frame.rotateType == "clockwise"){
                        r += 360 * frame.rotateTime;
                    }
                    else if(frame.rotateType == "counter-clockwise"){
                        r -= 360 * frame.rotateTime;
                    }
                    
                    if(lastStyle && !lastStyle.tween){
                        lastStyle.num = t/duration*100 - .00001;
                        styles.push(lastStyle);
                    }

                    styles.push({
                        tween:frame.tween == "motion",
                        num:t/duration*100,
                        alpha:elem.alpha * .01,
                        x:elem.transformX - imgData.w * .5,
                        y:elem.transformY - imgData.h * .5,
                        scaleX:Math.sqrt(m.a * m.a + m.b * m.b),
                        scaleY:Math.sqrt(m.c * m.c + m.d * m.d),
                        rotation:rotation
                    });

                    if(i == frames.length-1){
                        var s = that.merge({}, styles[styles.length-1]);
                        s.num = 100;
                        styles.push(s);
                    }
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
                        originY:0
                    });
                }

                lastStyle = that.merge({}, styles[styles.length-1]);
                t+=frame.duration;
            });

            that.addKeyframe(styles, layerData.name);
            var elem = document.createElement("div");
            elem.className = "flashAnim";
            var style = elem.style;
            
            style["animation"] = style[cssVendor + "Animation"] = layerData.name + " " + (duration/24) + "s linear 0s infinite";
            style[cssVendor + "TransformOrigin"] = "50% 50%";
            style.background = "url(" + image + ") no-repeat";
            style.width = imgData.w + "px";
            style.height = imgData.h + "px";
            style.backgroundPosition = (-imgData.x) + "px " + (-imgData.y) + "px";
            style.zIndex = 100-index;

            container.appendChild(elem);
        },
        /**
         * @method addKeyFrame
         * @param {Array} styles
         * @param {String} animName
        */
        addKeyframe:function(styles, animName){
            var that = this;
            var cssVendor = that.getCSSVendor();
            var keyTpl = '\n\
                @-{cssVendor}-keyframes {anim}{\n\
                {content}\n\
                }\n';

            var percentTpl = '\
                {num}% {\n\
                    opacity:{alpha};\n\
                    -{cssVendor}-transform:translate3d({x}px, {y}px, 0px) rotateZ({rotation}deg) scale3d({scaleX}, {scaleY}, 1);\n\
                }\n';

            var content = "";
            var last = "";
            styles.forEach(function(s){
                s.cssVendor = cssVendor;
                content += that.renderTpl(percentTpl, s);
            });
            var style = that.renderTpl(keyTpl, {
                anim:animName,
                content:content,
                cssVendor:cssVendor
            });

            var styleElem = document.getElementById("flashAnimStyle");
            if(styleElem){
                styleElem.innerHTML += style;
            }
            else{
                styleElem = document.createElement("style");
                styleElem.innerHTML = style;
                styleElem.id = "flashAnimStyle";
                document.getElementsByTagName("head")[0].appendChild(styleElem);
            }
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