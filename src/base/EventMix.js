/**
 * @module Anim/EventMix
 * @requires Anim
*/
var EventMix = {
    /**
     * 监听事件
     * @param {String} type 事件类型
     * @param {Function} listener
    */
    on:function(type, listener){
        this._listener = this._listener||{};
        this._listener[type] = this._listener[type]||[];
        this._listener[type].push(listener);
    },
    /**
     * 触发事件
     * @param {String} type 事件类型
     * @param {Object} data 
    */
    fire:function(type, data){
        this._listener = this._listener||{};
        var listeners = this._listener[type];
        if(listeners && listeners.length){
            listeners = listeners.slice();
            for(var i = 0, l = listeners.length;i < l;i ++){
                var e = {
                    target:this,
                    type:type
                };
                Anim.merge(e, data||{});
                listeners[i] && listeners[i].call(this, e);
            }
        }
    },
    /**
     * 取消监听
     * @param {String} type 要删除的事件类型, 若不填删除所有事件监听
     * @param {Function} listener 要删除的事件回调函数，若不填删除该类型所有事件监听
    */
    off:function(type, listener){
        if(!type){
            this._listener = {};
        }

        this._listener = this._listener||{};
        var listeners = this._listener[type];
        if(listeners){
            if(listener){
                var index = listeners.indexOf(listener);
                if(index > -1){
                    listeners.splice(index, 1);
                }
            }
            else{
                delete this._listener[type];
            }
        }
    }
};