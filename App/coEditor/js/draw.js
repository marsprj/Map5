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
	onCompleteGeometry(geometry);
}

/**
 * 处理绘制完成点
 */
function onCompleteGeometry(g){
	if(g == null){
		return;
	}

	geometry = g;

	switch(geometry.type){
		case GeoBeans.Geometry.Type.POINT:{
			$(".left_tab").removeClass("active");
			$("#point_type_tab").addClass("active");
			$("#point_type_tab .list-type").removeClass("active");
			addDefaultPoint();
			break;
		}
		case GeoBeans.Geometry.Type.LINESTRING:{
			$(".left_tab").removeClass("active");
			$("#line_type_tab").addClass("active");
			$("#line_type_tab .list-type").removeClass("active");
			addDefaultLine();
			break;
		}
		case  GeoBeans.Geometry.Type.POLYGON:{
			$(".left_tab").removeClass("active");
			$("#polygon_type_tab").addClass("active");
			$("#polygon_type_tab .list-type").removeClass("active");
			addDefaultPolygon();
			break;
		}
		default:
			break;
	}
}

// 默认加载点
function addDefaultPoint(){
	var type = "点";
	var source = featureLayer.getSource();
	var fid = GeoBeans.Utility.uuid();
	featureCur = new GeoBeans.Feature({
		fid : fid,
		geometry : geometry,
		properties : {
			type : type
		}
	});

	var listTypeDiv = $("#point_type_tab .list-type[ltype='" + type +"']");
	listTypeDiv.addClass("active");

	var symbolizer = getSymbolizer(listTypeDiv);
	featureCur.symbolizer = symbolizer;
	source.addFeature(featureCur);
	mapObj.refresh();
}

// 默认加载线
function addDefaultLine(){
	var type = "线";
	var source = featureLayer.getSource();
	var fid = GeoBeans.Utility.uuid();
	featureCur = new GeoBeans.Feature({
		fid : fid,
		geometry : geometry,
		properties : {
			type : type
		}
	});

	var listTypeDiv = $("#line_type_tab .list-type[ltype='" + type +"']");
	listTypeDiv.addClass("active");

	var symbolizer = getSymbolizer(listTypeDiv);
	featureCur.symbolizer = symbolizer;
	source.addFeature(featureCur);
	mapObj.refresh();	
}

// 默认加载面
function addDefaultPolygon(){
	var type = "面";
	var source = featureLayer.getSource();
	var fid = GeoBeans.Utility.uuid();
	featureCur = new GeoBeans.Feature({
		fid : fid,
		geometry : geometry,
		properties : {
			type : type
		}
	});

	var listTypeDiv = $("#polygon_type_tab .list-type[ltype='" + type +"']");
	listTypeDiv.addClass("active");

	var symbolizer = getSymbolizer(listTypeDiv);
	featureCur.symbolizer = symbolizer;
	source.addFeature(featureCur);
	mapObj.refresh();	
}
