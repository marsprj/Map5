/**
 * @classdesc
 * Map5的地图样式类。
 * 定义图层的渲染样式，包括颜色、线性、填充等。
 * @class
 */
GeoBeans.Style = GeoBeans.Class({
	name : null,
	type : null,

	initialize : function(name){
		this.name = name;
	}
});

GeoBeans.Style.Type = {
	FeatureType : "featureType",
	RasterType : "rasterType"
};