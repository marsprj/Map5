/**
 * 图例控件
 */
GeoBeans.Control.LegendControl = GeoBeans.Class(GeoBeans.Control, {
	
		initialize : function(map){
		GeoBeans.Control.prototype.initialize.apply(this, arguments);		
		this.map = map;
		this.type = "LegendControl";
	}
});