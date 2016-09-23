/**
 * @classdesc
 * 信息弹窗
 * @class
 * @extends {GeoBeans.Widget}
 */
GeoBeans.Widget.InfoWindowWidget = GeoBeans.Class(GeoBeans.Widget,{

	initialize : function(map){
		this.attach(map);
		this.createContainer();
	},
});


/**
 * 设置容器
 * @return {[type]} [description]
 */
GeoBeans.Widget.InfoWindowWidget.prototype.createContainer = function(){

	var mapContainer = this._map.getContainer();

	$(mapContainer).find(".infoWindow").remove();

	var infoWindowHtml = "<div class='infoWindow' data-toggle='popover' "
	+ 	"title='Info' data-content=''></div>";

	$(mapContainer).append(infoWindowHtml);

	this._container = $(mapContainer).find(".infoWindow")[0];

	$(this._container).popover({
		animation: false,
		trigger: 'manual',
		placement : 'top',
		html : true
	});			

};

/**
 * 设置位置
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
 * @param {Object} option 参数，包括content 、title
 */
GeoBeans.Widget.InfoWindowWidget.prototype.setOption = function(option){
	var content = option.content;
	var title = option.title;
	
	$(this._container).popover("hide")
			.attr("data-content",content)
			.attr("data-original-title",title);
};


/**
 * 显示
 * @param  {[type]} v [description]
 * @return {[type]}   [description]
 */
GeoBeans.Widget.InfoWindowWidget.prototype.show  = function(v){
	this._visible = v;
	var mapContainer = this._map.getContainer();
	var viewer = this._map.getViewer();

	if(this._visible){
		$(this._container).popover("show");

		// 超过地图范围，则不显示
		var left = $(this._container).css("left");
		var top = $(this._container).css("top");
		left = parseInt(left.slice(0,left.indexOf("px")));
		top = parseInt(top.slice(0,top.indexOf("px")));

		var width = viewer.getWindowWidth();
		var height = viewer.getWindowHeight();

		var popover = $(mapContainer).find(".popover");
		var popoverWidth = popover.css("width");
		var popoverHeihgt = popover.css("height");
		popoverWidth = parseInt(popoverWidth.slice(0,popoverWidth.indexOf("px")));
		popoverHeihgt = parseInt(popoverHeihgt.slice(0,popoverHeihgt.indexOf("px")));

		// 超出地图范围
		if((left- popoverWidth/2) < 0 || (left + popoverWidth/2) > width || (top - popoverHeihgt) < 0 || (top) > height){
			$(this._container).popover('hide');
		}else{

			$(this._container).popover("show");

			var mapContainer = this._map.getContainer();

			$(mapContainer).find(".popover-title")
				.append('<button type="button" class="close">&times;</button>');
			$(mapContainer).find(".popover-title .close").click(function(){
				$(this).parents(".popover").popover('hide');
			});
		}
		
	}else{
		$(this._container).popover("hide");
	}
};



/**
 * 地图视口更新时，更新infowindow
 * @return {[type]} [description]
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
