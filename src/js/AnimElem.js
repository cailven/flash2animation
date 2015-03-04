var zeroData = {
    alpha:0,
    scaleX:1,
    scaleY:1,
    x:0,
    y:0,
    rotation:0,
    originX:0,
    originY:0
}; 

/**
 * @module Anim/AnimElem
 * @requires Anim
 * @requires Anim/EventMix
 * @property {Bridge} bridge
 * @property {Display} display
 * @property {Array} frames
 * @property {Number} frameTime
 * @property {Object} layer
 * @property {String} name
 * @param {Object} data
*/
function AnimElem(data){
    this._diaplayData = null;
    this._currentTime = 0;
    this._currentIndex = 0;
    this.bridge = data.bridge;
    this.display = data.display;
    this.frames = data.frames;
    this.layer = data.layer;
    this.frameTime = data.frameTime;
    this.name = data.name;

    Anim.merge(this, EventMix);
}

AnimElem.prototype = {
    constructor:AnimElem,
    /**
     * @param {Object} data
    */
    _renderDisplay:function(data){
        if(this._diaplayData !== data){
            this._diaplayData = data;
            if(data){
                this.bridge.renderDisplay(this.display, data);
            }
            else{
                this.bridge.renderDisplay(this.display, zeroData);
            }
        }
    },
    /**
     * 跳转到某时间
     * @param  {Number} time 时间，单位毫秒
     */
    gotoTime:function(time){
        var frames = this.frames;
        var index, deltaTime, currentFrame, nextFrame;
        
        if(time >= this._currentTime){
            index = this._currentIndex;
        }
        else{
            index = 0;
        }
        this._currentTime = time;

        for(var i = index, l = frames.length;i < l;i ++){
            var frame = frames[i];
            if(time <= frame.endTime){
                deltaTime = time - frame.startTime;
                currentFrame = frame;
                nextFrame = frames[i + 1];
                this._currentIndex = i;
                break;
            } 
        }
       
        if(currentFrame.tween && nextFrame && nextFrame.elem){
            var t = deltaTime/currentFrame.duration;
            var deltaData = {};
            for(var i in currentFrame.elem){
                deltaData[i] = currentFrame.elem[i] + t * (nextFrame.elem[i] - currentFrame.elem[i]);
            }
            this._renderDisplay(deltaData);
        }
        else{
            this._renderDisplay(currentFrame.elem);
        }
    },
    /**
     * 跳转到某帧
     * @param {Number} frameNum
    */
    gotoFrame:function(frameNum){
        this.gotoTime(frameNum * this.frameTime);
    },
    /**
     * 获取总时间
    */
    getTotalTime:function(){
        return this.frames[this.frames.length - 1].endTime;
    }
};