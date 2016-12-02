// 加载点样式
function loadPointStyle(){
	var html = "<ul>";
	var obj = null,image = null;
	for(var i = 0; i < g_pointType.length;++i){
		obj = g_pointType[i];
		image = obj.image;
		html += '<li pimage="' + image + '">'
			+	'	<a href="javascript:void(0)" class="point-style-thumb"'
			+	' style="background-image:url('+ image + ')"></a>'
			+ 	'</li>';
	}
	html += "</ul>";
	return html;
}

// 加载线样式
function loadLineStyle(){
	var html = '<div class="line-style-panel style-panel">'
	html +='<div class="row ">'
			+'	<div class="col-md-2 col-xs-2" style="width:32px">'
			+'		<div class="btn btn-default colorSelector" title="线段颜色" data-toggle="tooltip" data-placement="top">'
			+'			<div class="style-div"></div>'
			+'		</div>'
			+'	</div>'
			+'	<div class="col-md-6 col-xs-6 control-label">'
			+'		<input  type="text" class="form-control slider" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="100"/>'
			+'	</div>'
			+'	<div class="col-md-2 col-xs-2">'
			+'		<input class="form-control slider-value" readonly="" value="100%" type="text" title="透明度" data-toggle="tooltip" data-placement="top">'
			+'	</div>'
			+'	<div class="col-md-2 col-xs-2">'
			+'		<input class="form-control stroke-width" value="2" type="number" min="0" title="线宽度" data-toggle="tooltip" data-placement="top">'
			+'	</div>'
			+'</div>';
	html += "</div>";
	return html;
}

//  加载面样式
function loadPolygonStyle(){
	var html = '<div class="style-panel polygon-style-panel">'
			+'	<div class="row stroke-row">'
			+'		<div class="col-md-1 col-xs-1" style="width:16px">'
			+'			<input type="checkbox" class="style-enable" checked="" title="边框" data-toggle="tooltip" data-placement="top">'
			+'		</div>'
			+'		<div class="col-md-1 col-xs-1" style="width:32px">'
			+'			<div class="btn btn-default colorSelector" title="线段颜色" data-toggle="tooltip" data-placement="top">'
			+'				<div class="style-div"></div>'
			+'			</div>'
			+'		</div>'
			+'		<div class="col-md-6 col-xs-6 control-label">'
			+'			<input  type="text" class="form-control slider" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="100"/>'
			+'		</div>'
			+'		<div class="col-md-2 col-xs-2">'
			+'			<input class="form-control slider-value" readonly="" value="100%" type="text" title="透明度" data-toggle="tooltip" data-placement="top">'
			+'		</div>'
			+'		<div class="col-md-2 col-xs-2">'
			+'			<input class="form-control stroke-width" value="2" type="number" min="0" title="线宽度" data-toggle="tooltip" data-placement="top">'
			+'		</div>'
			+'	</div>'
			+'	<div class="row fill-row">'
			+'		<div class="col-md-1 col-xs-1" style="width:16px">'
			+'			<input type="checkbox" class="style-enable" checked="" title="填充" data-toggle="tooltip" data-placement="top">'
			+'		</div>'
			+'		<div class="col-md-1 col-xs-1" style="width:32px">'
			+'			<div class="btn btn-default colorSelector" title="填充颜色" data-toggle="tooltip" data-placement="top">'
			+'				<div class="style-div"></div>'
			+'			</div>'
			+'		</div>'
			+'		<div class="col-md-6 col-xs-6 control-label">'
			+'			<input  type="text" class="form-control slider" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="100"/>'
			+'		</div>'
			+'		<div class="col-md-2 col-xs-2">'
			+'			<input class="form-control slider-value" readonly="" value="100%" type="text" title="透明度" data-toggle="tooltip" data-placement="top">'
			+'		</div>'
			+'	</div>'
			+'</div>'
	return html;
}

// 加载样式面板
function showStylePanel(layerDiv){
	if(layerDiv == null){
		return;
	}
	var type = $(layerDiv).attr("ltype");
	switch(type){
		case "Point":{
			var html = loadPointStyle();
			$(layerDiv).find(".layer-style").attr("data-content",html);
			break;
		}
		case "LineString":{
			var html = loadLineStyle();
			$(layerDiv).find(".layer-style").attr("data-content",html);
			break;
		}
		case "Polygon":{
			var html = loadPolygonStyle();
			$(layerDiv).find(".layer-style").attr("data-content",html);
			break;
		}
		default:
			break;
	}
}
// 设置某一行的样式是否可操作
function setStyleItemEnabled(item,checked){
	if(item == null || checked == null){
		return;
	}
	item.find("input[type='checkbox']").prop("checked",checked);
	var inputs = item.find("input[type='text'],input[type='number']").not(".slider-value ,.slider");
	var sliderControl = item.find("input.slider");
	var colorPicker = item.find(".colorSelector");
	if(checked){
		inputs.prop("readonly",false);
		sliderControl.slider("enable");
	}else{
		inputs.prop("readonly",true);
		sliderControl.slider("disable");
	}
}

// 初始化线样式
function initLineSymbolizer(symbolizer){
	if(symbolizer == null){
		return;
	}
	var stroke = symbolizer.stroke;

	var color = stroke.color;
	var hex = color.getHex();
	$(".line-style-panel .colorSelector").colpickSetColor(hex);
	$(".line-style-panel .colorSelector div").css("background-color",hex);

	var opacity = color.getOpacity();
	opacity = parseInt((opacity*100).toFixed());
	$(".line-style-panel .slider-value").val(opacity + "%");
	$(".line-style-panel input.slider").slider("setValue",opacity);

	var width = stroke.width;
	$(".line-style-panel .stroke-width").val(width);

}

// 线样式的颜色更改
function changeLineStyle_color(hex){
	if(layerCur == null || hex == null){
		return;
	}

	var style = layerCur.style;
	var symbolizer = style.rules[0].symbolizer;
	var stroke = symbolizer.stroke;
	var color = stroke.color;
	var opacity = color.getOpacity();
	color.setHex(hex,opacity);
	mapObj.refresh();
}


// 线样式的颜色透明度更改
function changeLineStyle_colorOpacity(opacity){
	if(layerCur == null || opacity == null){
		return;
	}

	var style = layerCur.style;
	var symbolizer = style.rules[0].symbolizer;
	var stroke = symbolizer.stroke;
	var color = stroke.color;	
	var hex = color.getHex();
	color.setHex(hex,opacity);
	mapObj.refresh();
}


// 线样式的宽度更改
function changeLineStyle_width(width){
	if(layerCur == null || width == null){
		return;
	}
	var style = layerCur.style;
	var symbolizer = style.rules[0].symbolizer;
	var stroke = symbolizer.stroke;
	stroke.width = width;
	mapObj.refresh();
}

// 初始化面样式
function initPolygonSymbolizer(symbolizer){
	if(symbolizer == null){
		return;
	}
	var stroke = symbolizer.stroke;
	var strokeItem = $(".polygon-style-panel .stroke-row");
	if(stroke != null){
		setStyleItemEnabled(strokeItem,true);
		var color = stroke.color;
		var hex = color.getHex();
		var opacity = color.getOpacity();
		strokeItem.find(".colorSelector").colpickSetColor(hex);
		strokeItem.find(".colorSelector div").css("background-color",hex);
		opacity = parseInt((opacity*100).toFixed());

		strokeItem.find(".slider-value").val(opacity + "%");
		strokeItem.find("input.slider").slider("setValue",opacity);

		var width = stroke.width;
		strokeItem.find(".stroke-width").val(width);
	}else{
		setStyleItemEnabled(strokeItem,false);
	}

	var fill = symbolizer.fill;
	var fillItem = $(".polygon-style-panel .fill-row");
	if(fill != null){
		setStyleItemEnabled(fillItem,true);
		var color = fill.color;
		var hex = color.getHex();
		var opacity = color.getOpacity();

		fillItem.find(".colorSelector").colpickSetColor(hex);
		fillItem.find(".colorSelector div").css("background-color",hex);
		opacity = parseInt((opacity*100).toFixed());

		fillItem.find(".slider-value").val(opacity + "%");
		fillItem.find("input.slider").slider("setValue",opacity);
	}else{
		setStyleItemEnabled(fillItem,false);
	}
}

// 更改面样式 stroke color
function changePolygonStyle_strokeColor(hex){
	if(layerCur == null || hex == null){
		return;
	}
	var style = layerCur.style;
	var symbolizer = style.rules[0].symbolizer;
	var stroke = symbolizer.stroke;
	var color = stroke.color;
	var opacity = color.getOpacity();
	color.setHex(hex,opacity);
	mapObj.refresh();
}

// 更改面样式 stroke opacity
function changePolygonStyle_colorOpacity(opacity){
	if(layerCur == null || opacity == null){
		return;
	}

	var style = layerCur.style;
	var symbolizer = style.rules[0].symbolizer;
	var stroke = symbolizer.stroke;
	var color = stroke.color;	
	var hex = color.getHex();
	color.setHex(hex,opacity);
	mapObj.refresh();	
}

// 更改面样式 stroke width
function changePolygonStyle_width(width){
	if(layerCur == null || width == null){
		return;
	}
	var style = layerCur.style;
	var symbolizer = style.rules[0].symbolizer;
	var stroke = symbolizer.stroke;
	stroke.width = width;
	mapObj.refresh();
}

// 更改面样式 fill color 
function changePolygonStyle_fillColor(hex){
	if(layerCur == null || hex == null){
		return;
	}

	var style = layerCur.style;
	var symbolizer = style.rules[0].symbolizer;
	var fill = symbolizer.fill;
	var color = fill.color;
	var opacity = color.getOpacity();
	color.setHex(hex,opacity);
	mapObj.refresh();
}

// 更改fill color opacity
function changePolygonStyle_fillColorOpacity(opacity){
	if(layerCur == null || opacity == null){
		return;
	}

	var style = layerCur.style;
	var symbolizer = style.rules[0].symbolizer;
	var fill = symbolizer.fill;
	var color = fill.color;	
	var hex = color.getHex();
	color.setHex(hex,opacity);
	mapObj.refresh();	
}
// 是否设置面样式 stroke
function changePolygonStyle_stroke(checked){
	if(layerCur == null || checked == null){
		return;
	}
	var item = $(".polygon-style-panel .stroke-row");
	if(checked){
		var stroke = new GeoBeans.Style.Stroke();
		var colorItem = item.find(".colorSelector div");
		var backgroundColor = colorItem.css("background-color");
		var opacity = colorItem.css("opacity");
		var color = new GeoBeans.Color();
		color.setRgb(backgroundColor,opacity);
		stroke.color = color;

		var strokeWidth = item.find(".stroke-width").val();
		stroke.width = parseFloat(strokeWidth);
		layerCur.style.rules[0].symbolizer.stroke = stroke;

	}else{
		layerCur.style.rules[0].symbolizer.stroke = null;
	}
	mapObj.refresh();
}

// 是否设置面样式 fill
function changePolygonStyle_fill(checked){
	if(layerCur == null || checked == null){
		return;
	}
	var item = $(".polygon-style-panel .fill-row");
	if(checked){
		var fill = new GeoBeans.Style.Fill();
		var colorItem = item.find(".colorSelector div");
		var backgroundColor = colorItem.css("background-color");
		var opacity = colorItem.css("opacity");
		var color = new GeoBeans.Color();
		color.setRgb(backgroundColor,opacity);
		fill.color = color;

		layerCur.style.rules[0].symbolizer.fill = fill;

	}else{
		layerCur.style.rules[0].symbolizer.fill = null;
	}
	mapObj.refresh();	
}