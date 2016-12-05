/**
 * @classdesc
 * 信息弹窗
 * @class
 * @extends {GeoBeans.Widget}
 */
GeoBeans.Widget.InfoWindowWidget = GeoBeans.Class(GeoBeans.Widget,{

	initialize : function(map){
		this.type = GeoBeans.Widget.Type.INFO_WINDOW;
		this.attach(map);
		this.createContainer();
	},
});


/**
 * 设置容器
 * @private
 */
GeoBeans.Widget.InfoWindowWidget.prototype.createContainer = function(){

	var mapContainer = this._map.getContainer();

	$(mapContainer).find(".infoWindow").remove();

	var infoWindowHtml = "<div class='infoWindow' data-toggle='popover' "
	+ 	"title='Info' data-content=''></div>";

	$(mapContainer).append(infoWindowHtml);

	this._container = $(mapContainer).find(".infoWindow")[0];

};

/**
 * 设置位置
 * @public
 * @param {GeoBeans.Geometry.Point} mp 地图上的点坐标
 */
GeoBeans.Widget.InfoWindowWidget.prototype.setPosition = function(mp){
	if(mp == null  || !(mp  instanceof GeoBeans.Geometry.Point)){
		return;
	}
	var viewer = this._map.getViewer();

	var point_s = viewer.toScreenPoint(mp.x,mp.y);

	$(this._container).attr("x",mp.x)
			.attr("y",mp.y);
	$(this._container).css("left",point_s.x + "px")
			.css("top",point_s.y + "px");
};

/**
 * 设置参数
 * @public
 * @param {Object} option 参数，包括content 、title
 */
GeoBeans.Widget.InfoWindowWidget.prototype.setOption = function(option){
	var content = option.content;
	var title = option.title;
	
	$(this._container)
			.attr("data-content",content)
			.attr("data-original-title",title);
};


/**
 * 地图视口更新时，更新infowindow
 * @private
 */
GeoBeans.Widget.InfoWindowWidget.prototype.refresh = function(){
	var mapContainer = this._map.getContainer();

	if($(mapContainer).find(".popover").length == 0){
		return;
	}

	var map_x = $(this._container).attr("x");
	var map_y = $(this._container).attr("y");

	var point = new GeoBeans.Geometry.Point(map_x,map_y);	

	this.setPosition(point);	
	this.show(true);
};

/**
 * 设置Widget是否显示
 * @public
 * @param  {boolean} v 显示标志
 */
GeoBeans.Widget.InfoWindowWidget.prototype.show  = function(v){
	this._visible = v;
	var mapContainer = this._map.getContainer();
	var viewer = this._map.getViewer();
	if(this._visible){
		$(mapContainer).find(".popover").remove();
		var content = $(this._container).attr("data-content");
		var title = $(this._container).attr("data-original-title");
		var html = '<div class="popover top in">'
			+ '<div class="arrow" style="left: 50%;"></div>'
			+ '<h3 class="popover-title">' + title + '<button type="button" class="close">×</button></h3>'
			+ '<div class="popover-content">' + content + '</div>'
			+ '</div>';
		$(mapContainer).append(html);
		var popoverHtml = $(mapContainer).find(".popover");
		popoverHtml.css("display","block");
		var width = popoverHtml.css("width");
		var height = popoverHtml.css("height");
		width = parseFloat(width.slice(0,width.lastIndexOf("px")));
		height = parseFloat(height.slice(0,height.lastIndexOf("px")));

		var left = $(this._container).css("left");
		var top = $(this._container).css("top");
		left = parseFloat(left.slice(0,left.lastIndexOf("px")));
		top = parseFloat(top.slice(0,top.lastIndexOf("px")));

		left = left - width/2;
		top = top - height;
		$(popoverHtml).css("left",left + "px").css("top",top + "px");


		$(mapContainer).find(".popover-title .close").click(function(){
			$(mapContainer).find(".popover").remove();
		});
	}else{
		$(mapContainer).find(".popover").remove();
	}
}