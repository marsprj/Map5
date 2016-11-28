/**
 * @classdesc
 * Map5的Earth类,实现Earth相关的各类算法。
 * @class
 */
GeoBeans.Earth = {

	RADIUS : 6378136,	//unit: meter

}

/**
 * 计算球面上两点之间的距离。
 * @param  {float} lon1 pt1的经度
 * @param  {float} lat1 pt1的纬度
 * @param  {float} lon2 pt2的经度
 * @param  {float} lat2 pt2的纬度
 * @param  {GeoBeans.Unit} unit 距离单位
 * @return {float}      球面上两点之间的距离两点间的距离 
 * @description 计算球面上两点之间的距离。<br>点坐标为WGS84坐标系下的经纬度坐标，单位为度。<br>距离的默认单位为米。。<br>球面上两点之间的距离是通过两点的大圆的小弧的长度。
 * @public
 */
GeoBeans.Earth.distance = function(lon1, lat1, lon2, lat2, unit){

	var c = Math.PI / 180.0;
	var x1 = lon1 * c;
	var y1 = lat1 * c;
	var x2 = lon2 * c;
	var y2 = lat2 * c;
	
	var d = this.RADIUS * Math.acos(Math.sin(y1)*Math.sin(y2) + Math.cos(y1)*Math.cos(y2)*Math.cos(x1-x2));

	switch(unit){
		case GeoBeans.Unit.meter: //meter
		break;
		case GeoBeans.Unit.kilometer: //kilometer
			d = d / 1000.0;
		break;
	}

	return d;
}