/**
 * @classdesc
 * Map的标注基类。
 * @class
 */
GeoBeans.Label = GeoBeans.Class({
	text 			: null,
	geometry 		: null,
	textSymbolizer 	: null,
	geometryType 	: null,

	initialize : function(){
		this.geometryType = GeoBeans.Geometry.Type.POINT;
	},

	isCollision : function(label){
		return true;
	},

	computePosition : function(render,transform){

	},

	adjustPosition : function(width,height){

	}

});

/**
 * 获得Label文本
 * @return {string} Label文本
 */
GeoBeans.Label.prototype.getText = function(){
	return this.text;
}

/**
 * 获得Label几何对象
 * @return {GeoBeans.Geometry} Label几何对象
 */
GeoBeans.Label.prototype.getGeometry = function(){
	return this.text;
}

/**
 * 获得Label的样式
 * @return {GeoBeans.Symbolizer} Label的样式
 */
GeoBeans.Label.prototype.getSymbolizer = function(){
	return this.text;
}
