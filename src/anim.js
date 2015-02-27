;(function(){
    var anim = {
        /**
         * @method build 
         * @param {Object} cfg
         * @param {String} cfg.type css|js
         * @param {Object} cfg.data 导出的动画数据
         * @param {String} cfg.image 图片地址
         * @param {HTMLElement|Container} cfg.container 动画的容器
         * @param {Number} cfg.time 循环次数，0为无限循环，默认无限循环 
         * @param {Number} cfg.fps 帧频，默认为导出数据中的帧频
         * @param {DisplayBridge} bridge 显示对象桥梁
        */
        build:function(cfg, bridge){
            if(cfg.type === "css"){
                anim.css.build(cfg);
            }
            else{
                anim.js.build(cfg, bridge);
            }
        }
    };

    window.anim = window.anim||{};
})();