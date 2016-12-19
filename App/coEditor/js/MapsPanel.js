CoEditor.MapsPanel = CoEditor.Class({

	_panel : null,

	// 每页显示的个数
	_maxCount : null,

	// 页数
	_pageCount : null,
	
	// 显示的页数
	_pageNumber : 5,

	// 地图列表
	_maps : null,


	initialize : function(id){
		this._panel = $("#"+ id);
		this.registerPanelEvent();
	}
});

// 页面事件
CoEditor.MapsPanel.prototype.registerPanelEvent = function(){
	var that = this;
	this._panel.find(".btn-new-map").click(function(){
		that.createMap();
	});
};


// 创建地图
CoEditor.MapsPanel.prototype.createMap = function(){
	CoEditor.create_map_dialog.show();
};

// 获取地图列表
CoEditor.MapsPanel.prototype.getMaps = function(){
	if(user == null){
		return;
	}
	var mapManager = user.getMapManager();

	this._panel.find("#maps_list_ul").empty();
	this._panel.find("#maps_right_panel").removeClass("active");
	this._panel.find(".pagination").empty();
	mapManager.getMaps(this.getMaps_callback);
}


CoEditor.MapsPanel.prototype.getMaps_callback = function(maps){
	CoEditor.mapsPanel.setMaps(maps);
}


CoEditor.MapsPanel.prototype.setMaps = function(maps){
	if(maps == null){
		return;
	}

	this._maps = maps;

	var mapSize = 210;
	var rowCount = Math.floor($("#maps_left_panel").height()/mapSize);
	var colCount = Math.floor($("#maps_list_ul").width()/mapSize);	

	// 调整左右列之间的关系
	// 取整
	// 中间的范围
	var leftWidthB = $("#maps_list_ul").css("width");
	// var leftWidthB = $(".map-list-col").css("width");
	leftWidthB = parseInt(leftWidthB.slice(0,leftWidthB.lastIndexOf("px")));
	var rightWidthB = $("#maps_left_panel").css("width");
	rightWidthB = parseInt(rightWidthB.slice(0,rightWidthB.lastIndexOf("px")));
	var colCountFloor = Math.floor(leftWidthB/mapSize);

	var floorCountLeftWidth = mapSize * colCountFloor;
	var delta = leftWidthB - floorCountLeftWidth;
	var marginWidth = Math.floor(delta / colCountFloor);
	var mapSizeMarginRight = 5 + marginWidth;
	this._mapSizeMarginRight = mapSizeMarginRight;

	var count = rowCount * colCountFloor;
	this._maxCount = count;
	var pageCount = Math.ceil(maps.length / this._maxCount);

	// 设置总个数
	this._panel.find(".maps-count span").html(maps.length);

	// 页数
	this._pageCount = pageCount;
	console.log(this._pageCount);

	this.initPageControl(1,this._pageCount);


	// 设置页码的右边距
	var rightWidth = this._panel.find("#maps_right_panel").css("width");
	rightWidth = parseInt(rightWidth.slice(0,rightWidth.lastIndexOf("px")));
	this._panel.find(".map-page-div").css("right",rightWidth + "px");

	var mapsCountWidth = this._panel.find(".maps-count").css("width");
	mapsCountWidth = parseInt(mapsCountWidth.slice(0,mapsCountWidth.lastIndexOf("px")));
	var paginationWidth = this._panel.find(".pagination").css("width");
	paginationWidth = parseInt(paginationWidth.slice(0,paginationWidth.lastIndexOf("px")));
	var mapPageDivWidth =  mapsCountWidth + paginationWidth;
	this._panel.find(".map-page-div").css("width",mapPageDivWidth + "px");
}

// 初始化页码
CoEditor.MapsPanel.prototype.initPageControl = function(currentPage,pageCount){
	if(currentPage <=0 || currentPage > pageCount){
		return;
	}
	var html = "";
	// 前一页
	if(currentPage == 1){
		html += '<li class="disabled">'
			+ '		<a href="javascript:void(0)" aria-label="Previous">'
			+ '			<span aria-hidden="true">«</span>'
			+ '		</a>'
			+ '	</li>';
	}else{
		html += '<li>'
			+ '		<a href="javascript:void(0)" aria-label="Previous">'
			+ '			<span aria-hidden="true">«</span>'
			+ '		</a>'
			+ '	</li>';
	}
	// 如果页码总数小于要展示的页码，则每个都显示
	if(pageCount <= this._pageNumber){
		for(var i = 1; i <= pageCount; ++i){
			if(i == currentPage){
				html += '<li class="active">'
				+ 	'	<a href="javascript:void(0)">' + currentPage.toString() 
				+ 	'		<span class="sr-only">(current)</span>'
				// + 	'		<span class="sr-only">(' + currentPage + ')</span>'
				+	'</a>'
				+ 	'</li>';
			}else{
				html += "<li>"
					+ "<a href='javascript:void(0)'>" + i + "</a>"
					+ "</li>";	
			}
		}	
	}else{
		// 开始不变化的页码
		var beginEndPage = pageCount - this._pageNumber + 1;
		if(currentPage <= beginEndPage){
			for(var i = currentPage; i < currentPage + this._pageNumber;++i){
				if(i == currentPage){
					html += '<li class="active">'
					+ 	'	<a href="javascript:void(0)">' + currentPage
					// + 	'		<span class="sr-only">(current)</span>'
					+	'</a>'
					+ 	'</li>';
				}else{
					html += "<li>"
						+ "<a href='javascript:void(0)'>" + i + "</a>"
						+ "</li>";	
				}					
			}
		}else{
			for(var i = beginEndPage; i <= pageCount; ++i){
				if(i == currentPage){
					html += '<li class="active">'
					+ 	'	<a href="javascript:void(0)">' + currentPage
					// + 	'		<span class="sr-only">(current)</span>'
					+	'</a>'
					+ 	'</li>';
				}else{
					html += "<li>"
						+ "<a href='javascript:void(0)'>" + i + "</a>"
						+ "</li>";	
				}
			}
		}
	}
	
	// 最后一页
	if(currentPage == pageCount){
		html += '<li class="disabled">'
			+ '		<a href="javascript:void(0)" aria-label="Next">'
			+ '			<span aria-hidden="true">»</span>'
			+ '		</a>'
			+ '	</li>';
	}else{
		html += '<li>'
			+ '		<a href="javascript:void(0)" aria-label="Next">'
			+ '			<span aria-hidden="true">»</span>'
			+ '		</a>'
			+ '	</li>';
	}

	this._panel.find(".pagination").html(html);

	this.registerPageEvent();

	// show currentPage Map
	var startIndex = (currentPage-1) * this._maxCount;
	var endIndex = currentPage*this._maxCount - 1;
	this.showMaps(startIndex,endIndex);
}

// 注册翻页事件
CoEditor.MapsPanel.prototype.registerPageEvent = function(){
	var that = this;
	this._panel.find(".pagination li a").click(function(){
		var active = that._panel.find(".pagination li.active a").html();
		var currentPage = parseInt(active);

		var label = $(this).attr("aria-label");
		if(label == "Previous"){
			currentPage = currentPage - 1;
		}else if(label == "Next"){
			currentPage = currentPage + 1;
		}else{
			currentPage = parseInt($(this).html());
		}
		
		that.initPageControl(currentPage,that._pageCount);
	});	
}

// 展示地图列表
CoEditor.MapsPanel.prototype.showMaps = function(startIndex,endIndex){
	if(this._maps == null || startIndex == null || endIndex == null){
		return;
	}

	var html = "";
	for(var i = startIndex; i <= endIndex && i < this._maps.length; ++i){
		var map = this._maps[i];
		var name = map.name;
		var thumbnail = map.thumbnail;
		var aHtml = "";
		if(thumbnail != null){
			aHtml = 	"	<a href='javascript:void(0)' class='map-thumb' style=\"background-image:url("
					+			thumbnail + ")\"></a>";
		}else{
			aHtml = 	"	<a href='javascript:void(0)' class='map-thumb'></a>";
		}
		html += "<li class='maps-thumb' name='" + name + "'>"
			+	aHtml
			+ 	"	<div class='caption text-center'>"
			+ 	"		<h6>" + name + "</h6>"
			+ 	"	</div>"
			+ 	"</li>";	
	}
	this._panel.find("#maps_list_ul").html(html);

	// 展示第一个
	var firstMap = $("#maps_list_ul").find("li").first();
	firstMap.find("a").addClass("selected");
	var name = firstMap.attr("name");
	var mapManager = user.getMapManager();
	mapManager.getMapObj(name,this.showMapInfo);

	// 列表点击事件
	this.registerMapListClickEvent();
}

// 展示地图的具体信息
CoEditor.MapsPanel.prototype.showMapInfo = function(map){
	$("#maps_right_panel").addClass("active");
	if(map == null){
		return;
	}

	var name = map.name;
	var srid = map.srid;
	$("#maps_right_panel .map-info-name").html(name);
	$("#maps_right_panel .map-info-srid").html(srid);

	var extent = map.extent;
	if(extent != null){
		var extentStr = extent.xmin.toFixed(2) + " , " + extent.ymin.toFixed(2)
				+ " , " + extent.xmax.toFixed(2) + " , " + extent.ymax.toFixed(2);
		$("#maps_right_panel .map-info-extent").html(extentStr);
	}

	// layer
	$("#maps_right_panel .map-info-layers").empty();
	// var layers = map.getLayers();
	var layers = map.layers;
	var layer = null;
	var name = null;
	var extent = null;
	var geomType = null;
	var html = "";
	var baseLayer = map.baseLayer;
	if(baseLayer != null){
		var name = baseLayer.name;
		var type = null;
		if(baseLayer._source instanceof GeoBeans.Source.Tile.QuadServer){
			type = "QuadServer";
		}else if(baseLayer._source instanceof GeoBeans.Source.Tile.WMTS){
			type = "WMTS";
		}

		html += '<div class="map-info-layer-heading">'
			+	'	<span>' + name +  '</span>'
			+	'</div>';
		if(type != null){
			html +=	'<div class="map-info-row">'
					+ 	'	<span class="map-info-item">类型：</span>'
					+	'	<span class="map-info-name">' + type + '</span>'
					+	'</div>';
		}
		extent = baseLayer.extent;
		if(extent != null){
			var extentStr = extent.xmin.toFixed(2) + " , " + extent.ymin.toFixed(2)
				+ " , " + extent.xmax.toFixed(2) + " , " + extent.ymax.toFixed(2);
			html +=	'<div class="map-info-row">'
				+ 	'	<span class="map-info-item">范围：</span>'
				+	'	<span class="map-info-name">' + extentStr + '</span>'
				+	'</div>';
		}	

	}
	for(var i = 0; i < layers.length; ++i){
		layer = layers[i];
		if(layer == null){
			continue;
		}
		name = layer.name;
		geomType = layer.geomType;
		

		html += '<div class="map-info-layer-heading">'
			+	'	<span>' + name +  '</span>'
			+	'</div>';
		if(geomType != null){
			html +=	'<div class="map-info-row">'
				+ 	'	<span class="map-info-item">类型：</span>'
				+	'	<span class="map-info-name">' + geomType + '</span>'
				+	'</div>';
		}
		extent = layer.extent;
		if(extent != null){
			var extentStr = extent.xmin.toFixed(2) + " , " + extent.ymin.toFixed(2)
				+ " , " + extent.xmax.toFixed(2) + " , " + extent.ymax.toFixed(2);
			html +=	'<div class="map-info-row">'
				+ 	'	<span class="map-info-item">范围：</span>'
				+	'	<span class="map-info-name">' + extentStr + '</span>'
				+	'</div>';
		}	
	}
	$("#maps_right_panel .map-info-layers").append(html);
}


CoEditor.MapsPanel.prototype.registerMapListClickEvent = function(){
	var that = this;
	var DELAY = 300, clicks = 0, timer = null;
	this._panel.find("#maps_list_ul").find(".map-thumb").click(function(){
		clicks++;
		if(clicks == 1){
			var node = this;
			timer = setTimeout(function() {
		        console.log("Single Click");  //perform single-click action    
		        that._panel.find("#maps_list_ul").find(".map-thumb").removeClass("selected");
				$(node).addClass("selected");
				var name = $(node).parent().attr("name");
				var mapManager = user.getMapManager();
				mapManager.getMapObj(name,that.showMapInfo);

		        clicks = 0;             //after action performed, reset counter
		    }, DELAY);
		}else{
			clearTimeout(timer);    //prevent single-click action
			console.log("Double Click");  //perform double-click action
			var name = $(this).parent().attr("name");
			var mapManager = user.getMapManager();
			mapManager.getMapObj(name,that.initMap_callback);
			// if(mapObj != null){
			// 	mapObj.close();
			// }
			// mapObj = null;
			// that.showMapPanel();
			// that.showMapTab();
			// var info = "打开地图[" + name + "]";
			// mapObj = mapManager.getMap("mapCanvas_wrapper",name);
			// if(mapObj == null){
			// 	MapCloud.notify.showInfo("Warning",info + "失败");
			// }else{
			// 	mapObj.setNavControl(false);
			// 	$(".mc-panel").css("display","none");
			// 	mapObj.draw();
			// 	mapObj.addEventListener(GeoBeans.Event.MOUSE_MOVE, MapCloud.tools.onMapMove);
			// 	MapCloud.refresh_panel.refreshPanel();
			// 	MapCloud.dataGrid.cleanup();
			// 	MapCloud.notify.showInfo("success",info);
			// }
			clicks = 0;  
		}
	}).dblclick(function(e){
		e.preventDefault();
	});	
}


CoEditor.MapsPanel.prototype.initMap_callback = function(map){

	if(map == null){
		return;
	}

	var that = CoEditor.mapPanel;
	that.showMapPanel();
	that.initMap(map);
}




