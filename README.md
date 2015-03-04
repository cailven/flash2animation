# flash to css3 animation
flash插件导出css3 animation动画

## demo 
* [css3 animation](http://06wj.github.io/flash2animation/index.html)  
    注意，ie9及以下不支持css3 animation
* [js demo](http://06wj.github.io/flash2animation/index-js.html)  
    目前支持原生js, hilo库, gama库，添加新的渲染库支持可参考[hiloBridge.js](https://github.com/06wj/flash2animation/blob/master/src/bridge/hiloBridge.js) 

## 使用方法
1. 导出动画数据
   * 安装[插件](https://github.com/06wj/flash2animation/raw/master/tools/animationPanel.zxp)，在菜单Window->Extensions打开animationPanel面板，点击导出按钮导出动画数据
   * 也可以直接双击运行tools/animationPanel/animation.jsfl
2. 播放动画
    * 首先要引入build/anim.min.js
    * css3 animation版
        
        执行Anim.AnimCSS.build(cfg), cfg定义见下面注释;
       
        ```
        /**
         * @method anim.build 
         * @param {Object} cfg
         * @param {Object} cfg.data 导出的动画数据
         * @param {String} cfg.image 图片地址
         * @param {HTMLElement} cfg.container 动画的容器，默认为document.body
         * @param {Number} cfg.time 循环次数，0为无限循环，默认无限循环 
         * @param {Number} cfg.fps 帧频，默认为导出数据中的帧频
         * @return {AnimCSS}
        */
        ```
    * js版
        
        执行Anim.AnimJS.build(cfg), cfg定义见下面注释;
       
        ```
        /**
         * @method build 
         * @param {Object} cfg
         * @param {Object} cfg.data 导出的动画数据
         * @param {String} cfg.image 图片地址
         * @param {Container} cfg.container 动画的容器
         * @param {Number} cfg.time 循环次数，0为无限循环，默认无限循环 
         * @param {Number} cfg.fps 帧频，默认为导出数据中的帧频
         * @param {DisplayBridge} bridge 显示对象桥梁
         * @return {AnimJS}
        */
        ```
    * 使用其他渲染库（目前支持Hilo, Gama库）
        * 首先需要引入build/hiloBridge.js 或 build/gamaBridge.js
        * 执行Anim.AnimJS.build(cfg, Anim.hiloBridge) 或 Anim.AnimJS.build(cfg, Anim.gamaBridge)
   
## flash动画规范
* 每个图层只允许有一个元件,元素必须先转换成元件
* 只允许使用传统补间
* 不能元件嵌套元件
* 不支持滤镜，遮罩
* 可建一个空图层命名为action，在该图层对应的动作帧上命名，方便程序控制播放指定帧动画

## 动画数据格式文档
* [spec](https://github.com/06wj/flash2animation/blob/master/spec.md)

## build
项目使用gulp构建, 生成文件在build目录

1. 安装gulp

    ```
    npm install -g gulp
    ```
1. 下载项目依赖

    ```
     npm install
    ```
1. 直接gulp构建项目或gulp watch监听文件变化build

    ```
    gulp watch
    gulp
    ```
    
## todo
* 支持元件嵌套元件
* 支持逐帧动画

## changelog
* [changelog](https://github.com/06wj/flash2animation/blob/master/changelog.md)
