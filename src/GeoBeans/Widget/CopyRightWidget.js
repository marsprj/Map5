/**
 * 版权控件
 */
GeoBeans.Control.LegendControl = GeoBeans.Class(GeoBeans.Control, {
	
		initialize : function(map){
		GeoBeans.Control.prototype.initialize.apply(this, arguments);

		this.map = map;
		this.type = GeoBeans.Widget.Type.COPYRIGHT;

		var html = "<div class='map5-copyright'>© GeoBeans</div>";
		this.map.mapDiv.append(html);
	}
});