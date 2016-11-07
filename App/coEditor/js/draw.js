function addDrawEvent(){
	$("#draw_marker").click(function(){
		onDrawPoint();
	});

	$("#draw_line").click(function(){
		onDrawLine();
	});

	$("#draw_polygon").click(function(){
		onDrawPolygon();
	});
}


function onDrawPoint(){
	var symbol = new GeoBeans.Style.Symbol();
	symbol.icon = "images/marker.png";
	symbol.scale = 1.0;

	symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
	symbolizer.symbol = symbol;	

	drawer.draw(GeoBeans.Geometry.Type.POINT,symbolizer);
}

function onDrawLine(){
	symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
	var stroke = symbolizer.stroke;
	stroke.color.set(0,153,255,1);

	drawer.draw(GeoBeans.Geometry.Type.LINESTRING,symbolizer);
}

function onDrawPolygon(){
	symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
	var stroke = symbolizer.stroke;
	stroke.color.set(0,153,255,1);
	var fill = symbolizer.fill;
	fill.color.set(255,255,255,0.25);

	drawer.draw(GeoBeans.Geometry.Type.POLYGON,symbolizer);
}


/**
 * 绘制结束
 */
function onComplete(geometry){
	if(geometry == null){
		return;
	}
	drawer.enable(false);
	var type = geometry.type;
	switch(type){
		case GeoBeans.Geometry.Type.POINT:{
			onCompletePoint(geometry);
			break;
		}
	}
}

/**
 * 处理绘制完成点
 */
function onCompletePoint(point){
	if(point == null){
		return;
	}

	$(".left_tab").removeClass("active");
	$("#point_type_tab").addClass("active");
	
	$("#point_type_tab .list-type").click(function(){
		var image = $(this).find("img").attr("src");

		var symbol = new GeoBeans.Style.Symbol();
		symbol.icon = image;
		symbol.scale = 1.0;

		var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
		symbolizer.symbol = symbol;	

		var source = featureLayer.getSource();
		var feature = new GeoBeans.Feature({
			fid : 1,
			geometry : point,
			value : {}
		});

		feature.symbolizer = symbolizer;
		source.addFeature(feature);
		mapObj.draw();

		$(".left_tab").removeClass("active");
		$("#overlay-info-tab").addClass("active");

		// 保存
		$(".save-btn").click(function(){
			var name = $(".overlay-name").val();
			if(name == null || name == ""){
				alert("请输入名称");
				return;
			}
			feature.setValue("name",name);
			$(".left_tab").removeClass("active");
			$("#overlay-tab").addClass("active");
			// 刷新列表

			// 
			drawer.enable(true);
		});
	});
}

/**
 * 刷新列表
 */
function refreshFeatures(){

}