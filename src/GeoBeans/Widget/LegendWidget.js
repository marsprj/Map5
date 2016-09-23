/**
 * @classdesc
 * 图例控件
 * @class
 * @extends {GeoBeans.Widget}
 */
GeoBeans.Widget.LegendControl = GeoBeans.Class(GeoBeans.Control, {
	
		initialize : function(map){
		GeoBeans.Control.prototype.initialize.apply(this, arguments);		
		this.map = map;
		this.type = "LegendControl";
	}
});
