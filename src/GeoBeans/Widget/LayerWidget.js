
/**
 * @classdesc
 * 图层面板
 * @class
 * @extends {GeoBeans.Widget}
 */
GeoBeans.Widget.LayersWidget = GeoBeans.Class(GeoBeans.Widget,{

	initialize : function(map){
		this.attach(map);
		this.createContainer();
	},

});


GeoBeans.Widget.LayersWidget.prototype.createContainer = function(){

	var mapContainer = this._map.getContainer();

	$(mapContainer).find(".map5-layer-widget").remove();

	var html = "<div class='map5-layer-widget'>aa</div>";

	$(mapContainer).append(html);

	this._container = $(mapContainer).find(".map5-layer-widget")[0];
};


GeoBeans.Widget.LayersWidget.prototype.refresh = function(){
	var layers = this._map.layers;
	var html = "";
		
	var collepsed = false;
	var layerItems = $(this._container).find(".layer-item");
	if(layerItems.css("display") == "none"){
		collepsed = true;
	}

	html += "<div class='layer-widget-title'>"
		 +  "<div>图层面板</div>"
		 +	"<div class='close'></div>"
		 +	"<div class='checkdown'></div>"
		 +	"</div>";
	for(var i = 0; i < layers.length;++i){
		var layer = layers[i];
		var layerIcon = "layer-type-custom";
		if(layer instanceof GeoBeans.Layer.TileLayer){
			layerIcon = "layer-type-tile";
		}else if(layer instanceof GeoBeans.Layer.FeatureLayer){
			var geomType = layer.getGeomType();
			switch(geomType){
				case GeoBeans.Geometry.Type.POINT:
				case GeoBeans.Geometry.Type.MULTIPOINT:{
					layerIcon = "layer-type-point";
					break;
				}
				case GeoBeans.Geometry.Type.LINESTRING:
				case GeoBeans.Geometry.Type.MULTILINESTRING:{
					layerIcon = "layer-type-line";
					break;
				}
				case GeoBeans.Geometry.Type.POLYGON:
				case GeoBeans.Geometry.Type.MULTIPOLYGON:{
					layerIcon = "layer-type-polygon";
					break;
				}
				default:
					break;
			}

		}else if(layer instanceof GeoBeans.Layer.WMSLayer){
			layerIcon = "layer-type-image";
		}

		var layerVisible = layer.isVisible() ? "layer-visible" : "layer-invisible";
		html += "<div class='layer-item' style='display:" + (collepsed? "none" :"block") + "'>"
			+ "<div class='layer-type "+ layerIcon + "'></div>"
			+ "<div class='layer-name' title='"+ layer.name +"'>" + layer.name +　"</div>"
			+ "<div class='" + layerVisible + "'></div>"
			+ "</div>";
	}

	this._container.innerHTML = html;

	var that = this;
	$(this._container).find(".layer-visible,.layer-invisible").click(function(){
		var visible = null;
		if($(this).hasClass("layer-visible")){
			$(this).removeClass("layer-visible");
			$(this).addClass("layer-invisible");
			visible = false;
		}else{
			$(this).addClass("layer-visible");
			$(this).removeClass("layer-invisible");
			visible = true;
		}
		var layerName = $(this).prev().html();
		var layer = that._map.getLayer(layerName);
		if(isValid(layer)){
			layer.setVisible(visible);
			that._map.refresh();
		}
	});

	//收缩
	$(this._container).find(".checkdown").click(function(){
		var layerItems = $(that._container).find(".layer-item");
		if(layerItems.css("display") == "block"){
			layerItems.slideUp();
		}else{
			layerItems.slideDown();
		}
	});

	$(this._container).find(".close").click(function(){
		that.show(false);
	});
};


/**
 * 设置是否显示
 * @param  {boolean} v 是否显示
 */
GeoBeans.Widget.LayersWidget.prototype.show = function(v){
	this._visible = v;
	if(this._visible){
		$(this._container).show();
	}else{
		$(this._container).hide();
	}
};