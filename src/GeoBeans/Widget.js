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

	/**
	 * 创建widget的div容器
	 * @type {函数}
	 * @return {div element object} [返回创建widget的div容器对象]
	 */
	createContainer : null,
	
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
	INFO_WINDOW	: "InfoWindow"
};


/**
 * 获得widget的宽度
 * @return {[_type]} widget的宽度
 */
GeoBeans.Widget.prototype.getWidth = function(){
	return this._width;
}

/**
 * 获得widget的高度
 * @return {[_type]} widget的高度
 */
GeoBeans.Widget.prototype.getHeight = function(){
	return this._height;
}

/**
 * 获得widget的位置
 * @return {[_type]} [description]
 */
GeoBeans.Widget.prototype.getPosition = function(){
	return this._pos;
}

/**
 * 设置widget的位置
 * @param {x:0,y:0} _pos [widget左上角的位置]
 */
GeoBeans.Widget.prototype.setPosition = function(_pos){
	this._pos = _pos;
}