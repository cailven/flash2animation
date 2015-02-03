function log() {
	[].forEach.call(arguments, function (elem) {
		fl.trace(elem)
	});
}

function logstr() {
	[].forEach.call(arguments, function (elem) {
		fl.trace(JSON.stringify(elem))
	});
}

function clear() {
	fl.outputPanel.clear();
}

fl.init = function(){
	window.doc = fl.doc = fl.getDocumentDOM();
	window.timeline = fl.timeline = doc.getTimeline();
	var layers = fl.layers = timeline.layers;
	var frames = fl.frames = layers[0].frames;
	var elems = fl.elems = frames[0].elements;
	fl.elem = elems[0];
	window.lib = fl.doc.library;
}
fl.init();

fl.stringify = function (obj) {
	return JSON.stringify(obj);
};

fl.parse = function (str) {
	return JSON.parse(str);
};

fl.setElement = function (elem) {
	elem = elem instanceof Layer ? elem.frames[0].elements[0] : elem;
	fl.doc.selectNone();
	fl.doc.selection = [elem];
};

fl.getElementProperty = function (elem, prop) {
	fl.setElement(elem);
	return fl.doc.getElementProperty(prop);
};

fl.getLayerByName = function (name) {
	return fl.layers.filter(function (elem) {
		return elem.name.indexOf(name) != -1
	})[0];
};

fl.rgbToColor = function (r, g, b) {
	var str = (r << 16 | g << 8 | b).toString(16);
	while (str.length < 6) {
		str = "0" + str;
	}
	return "#" + str;
};

fl.isSame = function (a, b, props) {
	return props.every(function (n) {
		return a[n] === b[n]
	})
};

fl.editItem = function (name) {
	var success = lib.editItem(name);
	fl.init();
	fl.initTimeline();
    if(!success){
        log("edit " + name + " error!");
    }
	return success;
};

fl.exit = function(){
    doc.exitEditMode();
    fl.init();
    fl.initTimeline();
};

fl.getItem = function (name) {
	lib.selectItem(name);
	return lib.getSelectedItems()[0]
};

fl.getLibraryName = function (elem) {
	if (elem instanceof SymbolInstance) {
		return elem.libraryItem.name.split("/").pop();
	} else {
		log("getLibraryName::" + typeof (elem));
		return false;
	}

};


//fl.getBounds = function(obj){
//var x = obj.x, y = obj.y, w = obj.width, h = obj.height, angle = obj.rotation;
//  
//  var sin = Math.sin(angle/180*Math.PI);
//  var cos = Math.cos(angle/180*Math.PI);
//      
//  var points = [];
//  points.push(fl.rotate(w, 0, sin, cos));
//  points.push(fl.rotate(w, h, sin, cos));
//  points.push(fl.rotate(0, h, sin, cos));
//  log(fl.rotate(0,h,sin, cos).x + x);
//  
//  var minx = 0,miny = 0,maxx = 0,maxy = 0;
//  
//  points.forEach(function(p){
//      maxx = p.x>maxx?p.x:maxx;
//      minx = p.x<minx?p.x:minx; 
//      maxy = p.y>maxy?p.y:maxy;
//      miny = p.y<miny?p.y:miny; 
//  });
//  
//  return {minx:minx + x, maxx:maxx + x, miny:miny + y,maxy:maxy + y}

//}

fl.rotate = function (x, y, ang) {
	var cos, sin;
	var a = arguments;
	if (a.length == 3) {
		a[2] = a[2] * Math.PI / 180;
		sin = Math.sin(a[2]);
		cos = Math.cos(a[2]);
	} else {
		sin = a[2];
		cos = a[3];
	}
	var rx = x * cos - y * sin;
	var ry = x * sin + y * cos;
	return {
		x: rx,
		y: ry
	};
}

fl.getFrameBounds = function (n) {
	timeline.setSelectedFrames(n, n);
	fl.doc.selectAll();
	return document.getSelectionRect();
}

fl.getAllBounds = function (num) {
	var rect = fl.getFrameBounds(0);
	for (var i = 1; i < num; i++) {
		var tmp = fl.getFrameBounds(i);
		rect.left = rect.left < tmp.left ? rect.left : tmp.left;
		rect.right = rect.right > tmp.right ? rect.right : tmp.right;
		rect.top = rect.top < tmp.top ? rect.top : tmp.top;
		rect.bottom = rect.bottom > tmp.bottom ? rect.bottom : tmp.bottom;
	}
	return rect;
};

fl.renameAllLayers = function () {
	fl.layers.forEach(function (layer, i) {
		if (fl.getLibraryName(layer.frames[0].elements[0]) != layer.name) {
			layer.name = fl.getLibraryName(layer.frames[0].elements[0]);
		}
	})
}
fl.initTimeline = function () {
	fl.layers.forEach(function (layer, i) {
		timeline.setSelectedLayers(i, false);
		timeline.setLayerProperty('locked', false);
		// timeline.convertToKeyframes();   
	});
};

fl.write = function (uri, text) {
	var url = FLfile.uriToPlatformPath(uri);
	if (FLfile.write(uri, text)) {
		log(url + " 创建成功！");
		return;
	};

	FLfile.createFolder(uri.slice(0, uri.lastIndexOf("/")));
	if (FLfile.write(uri, text)) log(url + " 创建成功！");
	else log(url + " 创建失败！");
};

fl.addLinkage = function (itemName, linkageName) {
	fl.getDocumentDOM().library.selectItem(itemName);

	var lib = fl.getDocumentDOM().library;
	if (lib.getItemProperty('linkageImportForRS') == true) {
		lib.setItemProperty('linkageImportForRS', false);
	}
	lib.setItemProperty('linkageExportForAS', true);
	lib.setItemProperty('linkageExportForRS', false);
	lib.setItemProperty('linkageExportInFirstFrame', true);
	lib.setItemProperty('linkageClassName', linkageName);
};

fl.getElem = function(layer){
	var elem;
	var frames = layer.frames;
	for(var i = 0, l = frames.length;i < l;i ++){
			var frame = frames[i];
			if(frame.elements && frame.elements[0]){
					return frame.elements[0];
			}
	}
	return null;
};

var JSON = {
    stringify:function(obj){  
        switch(typeof(obj)){  
            case 'string':  
                return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';  
            case 'array':  
                return '[' + obj.map(this.stringify).join(',') + ']';  
            case 'object':  
                 if(obj instanceof Array){  
                    var strArr = [];  
                    var len = obj.length;  
                    for(var i=0; i<len; i++){  
                        strArr.push(this.stringify(obj[i]));  
                    }  
                    return '[' + strArr.join(',') + ']';  
                }else if(obj==null){  
                    return 'null';  

                }else{  
                    var string = [];  
                    for (var p in obj) string.push('"' + p + '"'+ ':' + this.stringify(obj[p]));  
                    return '{' + string.join(',') + '}';  
                }  
            case 'number':  
                return obj;  
            case false:  
                return obj;  
        }  
    },
    parse : function(str){
        eval("var obj = " + str);
        return obj;
    }
};





// var u = FLfile.platformPathToURI("F:/newSanguo/armyCode/army/media/fx/")

// fl.init();

// lib.items.forEach(function(i){
//  if(i instanceof SymbolItem && i.name.indexOf("fx")>=0){
//      lib.selectItem(i.name);
//      // if (lib.getItemProperty('linkageImportForRS') == true) {
//      //  lib.setItemProperty('linkageImportForRS', false);
//      // }
//      // else {
//      //  lib.setItemProperty('linkageExportForAS', false);
//      //  lib.setItemProperty('linkageExportForRS', false);
//      // }


//      i.exportSWF(u+i.name+".swf")
//  }
// })

// doc.clipCopy()
// // fl.createDocument()

// var elements = layers[1].frames[0].elements;
// log(elements)
// elements.forEach(function(e){
//  fl.editItem(e.name);
// })

// lib.items.forEach(function(t){
//  if(t.symbolType == "button"){
//      log(t)
//      lib.setItemProperty('symbolType', 'movie clip');
//  }
// });
//      lib.setItemProperty('symbolType', 'movie clip');



// var lib = fl.getDocumentDOM().library;
// lib.setItemProperty('symbolType', 'movie clip');
// if (lib.getItemProperty('linkageImportForRS') == true) {
// lib.setItemProperty('linkageImportForRS', false);
// }
// else {
// lib.setItemProperty('linkageExportForAS', false);
// lib.setItemProperty('linkageExportForRS', false);
// }
// lib.setItemProperty('sourceFilePath','file:///');
// lib.setItemProperty('sourceLibraryName','');
// lib.setItemProperty('sourceAutoUpdate',false);
// lib.setItemProperty('scalingGrid',  false);



/**
 *  add new layer and write "this.stop();"
 *  @see http://bitmap.dyndns.org/blog/archives/001389.html
 */
// var items = fl.getDocumentDOM().library.getSelectedItems();
// for (var i = 0; i < items.length; i++) {
//   fl.getDocumentDOM().library.editItem(items[i].name);
//   var timeline = fl.getDocumentDOM().getTimeline();
//   timeline.addNewLayer("script");
//   timeline.layers[0].frames[0].actionScript = "this.stop();"; 
// }


// elems.forEach(function(e){
//  e.name = fl.getLibraryName(e);
// });



// log(frames[2].setCustomEase("all",[ {x:0,y:0}, {x:.3,y:.3}, {x:.7,y:.7}, {x:1,y:1} ]))
// log(frames[2].getCustomEase("x"))
clear();
log("load");