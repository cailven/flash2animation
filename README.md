# flash to css3 animation
flash插件导出css3 animation动画

## demo 
* [css3 animation](http://06wj.github.io/flash2animation/index.html)
* [js animation](http://06wj.github.io/flash2animation/index-js.html)  
  目前支持hilo库, gama库，添加新的渲染库支持可参考[hiloBridge.js](https://github.com/06wj/flash2animation/blob/master/src/bridge/hiloBridge.js)

## 使用方法
1. 导出动画数据
   * 安装[插件](https://raw.githubusercontent.com/06wj/flash2animation/master/tools/animationPanel.zxp)，在菜单Window->Extensions打开animationPanel面板，点击导出按钮导出动画数据
   * 也可以直接双击运行tools/animationPanel/animation.jsfl
2. 播放动画
   1. 引用src/anim-css.js
   2. 执行anim.css.build(cfg), cfg定义见下面注释;
   
        ```
        /**
         * @method anim.build 
         * @param {Object} cfg
         * @param {Object} cfg.data 导出的动画数据
         * @param {String} cfg.image 图片地址
         * @param {HTMLElement} cfg.container 动画的容器，默认为document.body
         * @param {Number} cfg.time 循环次数，0为无限循环，默认无限循环 
         * @param {Number} cfg.fps 帧频，默认为导出数据中的帧频
        */
        ```
   
   
## flash动画规范
* 每个图层只允许有一个元件,元素必须先转换成元件
* 只允许使用传统补间
* 不能元件嵌套元件
* 不支持滤镜，遮罩

## 数据格式文档
* [spec](https://github.com/06wj/flash2animation/blob/master/spec.md)



## todo
* 支持元件嵌套元件
* 支持逐帧动画
