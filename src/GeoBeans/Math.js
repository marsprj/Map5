/**
 * @classdesc
 * 数学算法类
 * @class
 */
GeoBeans.Math = {

	//弧度->角度转换系数
	RAD_2_DGR : 57.29577951308232,
	//角度->弧度转换系数
	DGR_2_RAD : 0.017453292519943295,	

}

/**
 * 角度转换为弧度
 * @param  {float} d  角度
 * @return {float}    弧度
 * ＠public
 */
GeoBeans.Math.toRadian = function(d){
	return d * this.DGR_2_RAD;
}

/**
 * 弧度转换为角度
 * @param  {float} r  弧度
 * @return {float}    角度
 * ＠public
 */
GeoBeans.Math.toDegree = function(r){
	return r * this.RAD_2_DGR;
}

