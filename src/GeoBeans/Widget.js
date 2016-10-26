/**
 * @classdesc
 * 小控件基类。
 * @class
 */
GeoBeans.Widget = GeoBeans.Class({
	_type : null,
	_map  : null,

	//widget容器属性
	_id : null,
	_container : null,

	//widget控制属性	
	_enabled : true,
	_visible : true,
	_pos 	 : {x:0,y:0},
	_width 	 : 200,
	_height  : 200,
	
	initialize : function(name){
		//GeoBeans.Class.prototype.initialize.apply(this, arguments);
	},
	
	destory : function(){
		//GeoBeans.Class.prototype.destory.apply(this, arguments);
	},
	
	attach : function(map){
		this._map = map;
	},
	
	detach : function(){
		this._map = null;
	},
	
	enable : function(f){
		this._enabled = f;
	},

	show : function(v){
		this._visible = v;
		if(this._visible==True){

		}
		else{

		}
	}
});

GeoBeans.Widget.Type = {
	COPYRIGHT	: "Copyright",
	INFO_WINDOW	: "InfoWindow",
	LAYERS_WIDGET : "LayersWidget",
	LEGEND_WIDGET : "LegendWidget"
};


/**
 * 获得widget的宽度
 * @public
 * @return {int} widget的宽度
 */
GeoBeans.Widget.prototype.getWidth = function(){
	return this._width;
}

/**
 * 获得widget的高度
 * @public
 * @return {int} widget的高度
 */
GeoBeans.Widget.prototype.getHeight = function(){
	return this._height;
}

/**
 * 获得widget的位置
 * @public
 * @return {GeoBeans.Geometry.Point} widget的位置
 */
GeoBeans.Widget.prototype.getPosition = function(){
	return this._pos;
}

/**
 * 设置widget的位置
 * @public
 * @param {GeoBeans.Geometry.Point} pos widget左上角的位置
 */
GeoBeans.Widget.prototype.setPosition = function(pos){
	this._pos = pos;
}

/**
 * 创建widget的div容器
 * @public
 * @return {div} widget的div容器
 */
GeoBeans.Widget.prototype.createContainer = function(){
	return null;
}

GeoBeans.Widget.prototype.refresh = function(){

};


GeoBeans.Widget.Widgets = GeoBeans.Class({
	_map : null,
	_widgets : null,


	initialize : function(map){
		this._map = map;

		this._widgets = [];

		var copyRightWidget = new GeoBeans.Widget.CopyRightWidget(this._map);
		this.add(copyRightWidget);

		var infoWindowWidget = new GeoBeans.Widget.InfoWindowWidget(this._map);
		this.add(infoWindowWidget);

		var legendWidget = new GeoBeans.Widget.LegendWidget(this._map);
		this.add(legendWidget); 
	},

	destory : function(){
		this._widgets = null;
	}
});

GeoBeans.Widget.Widgets.prototype.add = function(w){
	if(!isValid(w)){
		return;
	}

	var i = this.find(w.type);
	if(i < 0){
		w.attach(this._map);
		this._widgets.push(w);
	}else{
		this._widgets[i] = null;
		this._widgets[i] = w;
	}
};


GeoBeans.Widget.Widgets.prototype.remove = function(w){
	if(!isValid(w)){
		return;
	}
	var i = this.find(w.type);
	if(i > 0){
		this._widgets[i].destory();
		this._widgets[i] = null;
		this._widgets.splice(i,1);
	}
};

GeoBeans.Widget.Widgets.prototype.get = function(i){
	return this._widgets[i];
};

GeoBeans.Widget.Widgets.prototype.find = function(t){
	for(var i = 0; i < this._widgets.length;++i){
		var w = this._widgets[i];
		if(isValid(w) && w.type == t){
			return i;
		}
	}
	return -1;
};

GeoBeans.Widget.Widgets.prototype.cleanup = function(){
	for(var i = 0; i < this._widgets.length;++i){
		this._widgets[i].destory();
		this._widgets[i] = null;
	}
	this._widgets = [];
};


GeoBeans.Widget.Widgets.prototype.refresh = function(){
	for(var i = 0; i < this._widgets.length;++i){
		var w = this._widgets[i];
		w.refresh();
	}
};

