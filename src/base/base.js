/**
 * @module Anim
 */
var Anim = {
    merge:function(to, from){
        for(var i in from){
            to[i] = from[i];
        }
    }
}