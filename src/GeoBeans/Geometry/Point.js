/**
 * @classdesc
 * Point几何要素
 * @class
 * @extends {GeoBeans.Geometry}
 * @param {double} x x坐标
 * @param {double} y y坐标
 */
GeoBeans.Geometry.Point = GeoBeans.Class(GeoBeans.Geometry,{
	
	/**
	 * @type {double}
	 * @private
	*/
	x : 0.0,
	y : 0.0,
	
	type : GeoBeans.Geometry.Type.POINT,
	
	initialize : function(x, y){
		
		this.x = parseFloat(x);
		this.y = parseFloat(y);

		this.extent = new GeoBeans.Envelope(this.x, this.y,this.x,this.y);
	}
	//,
	
	// hit : function(x, y, t){		
	// 	var d = Math.abs(this.x-x) + Math.abs(this.y-y);
	// 	return (d<t);
	// },

	// getCentroid : function(){
	// 	return new GeoBeans.Geometry.Point(this.x,this.y);
	// }
});

/**
 * 返回Point的x坐标。
 * @public
 * @return {double} Point的x坐标
 */
GeoBeans.Geometry.Point.prototype.getX = function(){
	return this.x;
}

/**
 * 返回Point的y坐标。
 * @public
 * @return {double} Point的y坐标
 */
GeoBeans.Geometry.Point.prototype.getY = function(){
	return this.y;
}

/**
 * 计算中心点。
 * @public
 * @return {GeoBeans.Geometry.Point} 中心点。
 */
GeoBeans.Geometry.Point.prototype.getCentroid = function(){
 	return new GeoBeans.Geometry.Point(this.x,this.y);
}

/**
 * 计算Buffer
 * @param  {float} radius 缓冲区半径
 * @return {GeoBeans.Geometry.Polygon|GeoBeans.Geometry.MultiPolygon} Geometry的缓冲区
 * @public
 * @override
 */
GeoBeans.Geometry.prototype.buffer = function(radius){

	var theta = 0;
	var steps = 24;
	var span  = steps * Math.PI / 180;	//degree
	var dx = 0.0;
	var dy = 0.0;
	var pts = [];
	for(var i=0; i<steps; i++){
		dx = radius * Math.cos(theta);
		dy = radius * Math.sin(theta);

		console.log(dx + ", " + dy);
		pts.push(new GeoBeans.Geometry.Point(this.x+dx, this.y+dy));

		theta = theta + span;
	}

	var ring = new GeoBeans.Geometry.LinearRing(pts);
	var polygon = new GeoBeans.Geometry.Polygon([ring]);

	return polygon;
}

/**
 * 判断点是否被选中。
 * @public
 * @deprecated 这个函数用法不对，要删掉。
 * @return {boolean} 是否被选中。
 */
GeoBeans.Geometry.Point.prototype.hit = function(x, y, t){
 	var d = Math.abs(this.x-x) + Math.abs(this.y-y);
	return (d<t);
}

