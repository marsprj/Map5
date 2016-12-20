CoEditor.StyleControl = CoEditor.Class({
	
	// 当前图层
	_layer : null,

	initialize : function(){

	}

});

// 显示样式面板
CoEditor.StyleControl.prototype.showStylePanel = function(layerDiv){
	if(layerDiv == null){
		return;
	}
	var type = $(layerDiv).attr("ltype");
	switch(type){
		case "Point":{
			var html = this.loadPointStyleHtml();
			$(layerDiv).find(".layer-style").attr("data-content",html);
			break;
		}
		case "LineString":{
			var html = this.loadLineStyleHtml();
			$(layerDiv).find(".layer-style").attr("data-content",html);
			break;
		}
		case "Polygon":{
			var html = this.loadPolygonStyleHtml();
			$(layerDiv).find(".layer-style").attr("data-content",html);
			break;
		}
		default:
			break;
	}	
}

// 设置弹出内容和事件
CoEditor.StyleControl.prototype.set = function(layerDiv){
	if(layerDiv == null){
		return;
	}

	this.showStylePanel(layerDiv);

	// 关闭弹窗
	$(".popover").hide();
	// 弹窗
	layerDiv.find(".layer-style").popover({
		html : true
	});

	this.registerPopoverEvent(layerDiv);
}

// 加载点样式
CoEditor.StyleControl.prototype.loadPointStyleHtml = function(){
	var html = '<div class="line-style-panel style-panel">'
			+ '<ul>';
	var obj = null,image = null;
	for(var i = 0; i < g_pointType.length;++i){
		obj = g_pointType[i];
		image = obj.image;
		html += '<li pimage="' + image + '">'
			+	'	<a href="javascript:void(0)" class="point-style-thumb"'
			+	' style="background-image:url('+ image + ')"></a>'
			+ 	'</li>';
	}
	html += '</ul>';
	html += '<div class="row">'
			+'	<button class="btn btn-sm btn-success save-style-btn">保存样式</button></div>'
	html += '</div>';
	return html;
}

// 加载线样式
CoEditor.StyleControl.prototype.loadLineStyleHtml = function(){
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
	html += '<div class="row">'
			+'	<button class="btn btn-sm btn-success save-style-btn">保存样式</button></div>'
	html += "</div>";
	return html;	
}

// 加载面样式
CoEditor.StyleControl.prototype.loadPolygonStyleHtml = function(){
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
			
	html += '<div class="row">'
			+'	<button class="btn btn-sm btn-success save-style-btn">保存样式</button></div>'
			+'</div>';
	return html;	
}

// 注册页面内点击事件
CoEditor.StyleControl.prototype.registerPopoverEvent = function(layerDiv){
	if(layerDiv == null){
		return;
	}

	var that = this;
	layerDiv.find(".layer-style").on('show.bs.popover',function(){
		$(".popover").hide();
	});

	layerDiv.find(".layer-style").on('shown.bs.popover', function(){

	    $(".style-panel").find('[data-toggle="tooltip"]').tooltip({
	        container: "body"
	    });

	    // 设置点样式面板
	    that.initPointStylePanel();

	    // 设置线样式面板
	    that.initLineStylePanel();

	    // 设置面样式面板
	    that.initPolygonStylePanel();

	    // 初始化样式
	    var layerName = layerDiv.find(".layer-name").html();
	    var layer = mapObj.getLayer(layerName);
	    that._layer = layer;
	    if(layer != null){
	    	var style = layer.style;
	    	if(style != null){
	    		var symbolizer = style.rules[0].symbolizer;
	    		if(symbolizer instanceof GeoBeans.Symbolizer.LineSymbolizer){
	    			that.initLineSymbolizer(symbolizer);
	    		}else if(symbolizer instanceof GeoBeans.Symbolizer.PolygonSymbolizer){
	    			that.initPolygonSymbolizer(symbolizer);
	    		}
	    	}
	    }

	    // 离开面板后消失
	    $(".popover").mouseleave(function(){
	    	if($(".colpick:visible").length == 0){
	    		$(".popover").hide();
	    	}
	    });
	});
}


// 初始化线样式
CoEditor.StyleControl.prototype.initLineSymbolizer = function(symbolizer){
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

// 初始化面样式
CoEditor.StyleControl.prototype.initPolygonSymbolizer = function(symbolizer){
	if(symbolizer == null){
		return;
	}

	var stroke = symbolizer.stroke;
	var strokeItem = $(".polygon-style-panel .stroke-row");
	if(stroke != null){
		this.setStyleItemEnabled(strokeItem,true);
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
		this.setStyleItemEnabled(strokeItem,false);
	}

	var fill = symbolizer.fill;
	var fillItem = $(".polygon-style-panel .fill-row");
	if(fill != null){
		this.setStyleItemEnabled(fillItem,true);
		var color = fill.color;
		var hex = color.getHex();
		var opacity = color.getOpacity();

		fillItem.find(".colorSelector").colpickSetColor(hex);
		fillItem.find(".colorSelector div").css("background-color",hex);
		opacity = parseInt((opacity*100).toFixed());

		fillItem.find(".slider-value").val(opacity + "%");
		fillItem.find("input.slider").slider("setValue",opacity);
	}else{
		this.setStyleItemEnabled(fillItem,false);
	}
}

// 设置面样式面板
CoEditor.StyleControl.prototype.initPolygonStylePanel = function(){
	var that = this;
	$(".polygon-style-panel input[type='checkbox']").change(function(){
		var item = $(this).parents(".row");
		var checked = $(this).prop("checked");
		that.setStyleItemEnabled(item,checked);
	});

	// 线段颜色
    $(".polygon-style-panel .stroke-row .colorSelector").colpick({
		color:'cccccc',
		onChange:function(hsb,hex,rgb,el,bySetColor) {
			$(el).children().css("background-color","#" + hex);
			that.changePolygonStyle_strokeColor(hex);

		},
		onSubmit:function(hsb,hex,rgb,el,bySetColor){
			$(el).children().css("background-color","#" + hex);
			$(el).colpickHide();
			that.changePolygonStyle_strokeColor(hex);
		}
	});	

	$(".polygon-style-panel .slider").slider({
		tooltip : 'hide'
	});
	$(".polygon-style-panel .stroke-row .slider").on("slide",function(slideEvt){
		var parent = $(this).parents(".row");
		var input = parent.find(".slider-value")
						.val(slideEvt.value + "%");
		parent.find(".colorSelector div").css("opacity",
					slideEvt.value/100);	
		that.changePolygonStyle_colorOpacity(slideEvt.value/100);
	});

	$(".polygon-style-panel .stroke-width").change(function(){
		var value = $(this).val();
		value = parseFloat(value);
		that.changePolygonStyle_width(value);
	});

	// 填充颜色
	$(".polygon-style-panel .fill-row .colorSelector").colpick({
		color:'cccccc',
		onChange:function(hsb,hex,rgb,el,bySetColor) {
			$(el).children().css("background-color","#" + hex);
			that.changePolygonStyle_fillColor(hex);

		},
		onSubmit:function(hsb,hex,rgb,el,bySetColor){
			$(el).children().css("background-color","#" + hex);
			$(el).colpickHide();
			that.changePolygonStyle_fillColor(hex);
		}
	});	
	// 填充颜色透明度
	$(".polygon-style-panel .fill-row .slider").on("slide",function(slideEvt){
		var parent = $(this).parents(".row");
		var input = parent.find(".slider-value")
						.val(slideEvt.value + "%");
		parent.find(".colorSelector div").css("opacity",
					slideEvt.value/100);	
		that.changePolygonStyle_fillColorOpacity(slideEvt.value/100);
	});		

	// 设置面样式stroke
	$(".polygon-style-panel .stroke-row .style-enable").change(function(){
		var checked = $(this).prop("checked");
		that.changePolygonStyle_stroke(checked);
	});

	// 设置面样式fill
	$(".polygon-style-panel .fill-row .style-enable").change(function(){
		var checked = $(this).prop("checked");
		that.changePolygonStyle_fill(checked);
	});	

	// 保存样式
	$(".polygon-style-panel .save-style-btn").click(function(){
		that.saveStyle();
	});
}

// 设置某一行是否可操作
CoEditor.StyleControl.prototype.setStyleItemEnabled = function(item,checked){
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

// 更改面样式 stroke color
CoEditor.StyleControl.prototype.changePolygonStyle_strokeColor = function(hex){
	if(this._layer == null || hex == null){
		return;
	}
	var style = this._layer.style;
	var symbolizer = style.rules[0].symbolizer;
	var stroke = symbolizer.stroke;
	if(stroke == null){
		return;
	}
	var color = stroke.color;
	var opacity = color.getOpacity();
	color.setHex(hex,opacity);
	mapObj.refresh();
}
// 更改面样式 fill color 
CoEditor.StyleControl.prototype.changePolygonStyle_fillColor = function(hex){
	if(this._layer == null || hex == null){
		return;
	}

	var style = this._layer.style;
	var symbolizer = style.rules[0].symbolizer;
	var fill = symbolizer.fill;
	if(fill == null){
		return;
	}
	var color = fill.color;
	var opacity = color.getOpacity();
	color.setHex(hex,opacity);
	mapObj.refresh();	
}

// 更改面样式fill color opacity
CoEditor.StyleControl.prototype.changePolygonStyle_fillColorOpacity = function(opacity){
	if(this._layer == null || opacity == null){
		return;
	}

	var style = this._layer.style;
	var symbolizer = style.rules[0].symbolizer;
	var fill = symbolizer.fill;
	var color = fill.color;	
	var hex = color.getHex();
	color.setHex(hex,opacity);
	mapObj.refresh();	
}

// 是否设置面样式 stroke
CoEditor.StyleControl.prototype.changePolygonStyle_stroke = function(checked){
	if(this._layer == null || checked == null){
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
		this._layer.style.rules[0].symbolizer.stroke = stroke;

	}else{
		this._layer.style.rules[0].symbolizer.stroke = null;
	}
	mapObj.refresh();
}

// 是否设置面样式 fill
CoEditor.StyleControl.prototype.changePolygonStyle_fill = function(checked){
	if(this._layer == null || checked == null){
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

		this._layer.style.rules[0].symbolizer.fill = fill;

	}else{
		this._layer.style.rules[0].symbolizer.fill = null;
	}
	mapObj.refresh();	
}

// 更改面样式 stroke opacity
CoEditor.StyleControl.prototype.changePolygonStyle_colorOpacity = function(opacity){
	if(this._layer == null || opacity == null){
		return;
	}

	var style = this._layer.style;
	var symbolizer = style.rules[0].symbolizer;
	var stroke = symbolizer.stroke;
	var color = stroke.color;	
	var hex = color.getHex();
	color.setHex(hex,opacity);
	mapObj.refresh();
}

// 更改面样式 stroke width
CoEditor.StyleControl.prototype.changePolygonStyle_width = function(width){
	if(this._layer == null || width == null){
		return;
	}
	var style = this._layer.style;
	var symbolizer = style.rules[0].symbolizer;
	var stroke = symbolizer.stroke;
	stroke.width = width;
	mapObj.refresh();
}

// 设置线样式面板
CoEditor.StyleControl.prototype.initLineStylePanel = function(){
	var that = this;
    $(".line-style-panel .colorSelector").colpick({
		color:'cccccc',
		onChange:function(hsb,hex,rgb,el,bySetColor) {
			$(el).children().css("background-color","#" + hex);
			that.changeLineStyle_color(hex);

		},
		onSubmit:function(hsb,hex,rgb,el,bySetColor){
			$(el).children().css("background-color","#" + hex);
			$(el).colpickHide();
			that.changeLineStyle_color(hex);
		}
	});

	$(".line-style-panel .slider").slider({
		tooltip : 'hide'
	});
	$(".line-style-panel .slider").on("slide",function(slideEvt){
		var parent = $(this).parents(".row");
		var input = parent.find(".slider-value")
						.val(slideEvt.value + "%");
		parent.find(".colorSelector div").css("opacity",
					slideEvt.value/100);	
		that.changeLineStyle_colorOpacity(slideEvt.value/100);
	});
	$(".line-style-panel .stroke-width").change(function(){
		var value = $(this).val();
		value = parseFloat(value);
		that.changeLineStyle_width(value);
	});	

	$(".line-style-panel .save-style-btn").click(function(){
		that.saveStyle();
	});
}

// 更改线样式的 color
CoEditor.StyleControl.prototype.changeLineStyle_color = function(hex){
	if(this._layer == null || hex == null){
		return;
	}
	var style = this._layer.style;
	var symbolizer = style.rules[0].symbolizer;
	var stroke = symbolizer.stroke;
	var color = stroke.color;
	var opacity = color.getOpacity();
	color.setHex(hex,opacity);
	mapObj.refresh();	
}

// 更改线样式的 color opacity
CoEditor.StyleControl.prototype.changeLineStyle_colorOpacity = function(opacity){
	if(this._layer == null || opacity == null){
		return;
	}
	var style = this._layer.style;
	var symbolizer = style.rules[0].symbolizer;
	var stroke = symbolizer.stroke;
	var color = stroke.color;	
	var hex = color.getHex();
	color.setHex(hex,opacity);
	mapObj.refresh();	
}

// 更改线样式的width
CoEditor.StyleControl.prototype.changeLineStyle_width = function(width){
	if(this._layer == null || width == null){
		return;
	}
	var style = this._layer.style;
	var symbolizer = style.rules[0].symbolizer;
	var stroke = symbolizer.stroke;
	stroke.width = width;
	mapObj.refresh();	
}

// 设置点样式面板
CoEditor.StyleControl.prototype.initPointStylePanel = function(){
	var that = this;
	// 点样式的事件
	$(".popover-content li").click(function(){

		var image = $(this).attr("pimage");

		// 设置新的样式
		// $(that).find("img").attr("src",image);
		// $(that).popover("hide");
		// var style = new GeoBeans.Style.FeatureStyle();
		// var symbol = new GeoBeans.Style.Symbol();
		// symbol.icon = image;
		// symbol.scale = 1.0;
		// var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
		// symbolizer.symbol = symbol;
		// var rule = new GeoBeans.Style.Rule();
		// rule.symbolizer = symbolizer;
		// style.addRule(rule);
		// layerCur.setStyle(style);

		if(that._layer == null){
			return;
		}
		var style = that._layer.style;
		if(style == null){
			return;
		}
		var symbol = style.rules[0].symbolizer.symbol;
		symbol.icon = image;

		mapObj.refresh();
	});	
}

// 点击保存样式按钮
CoEditor.StyleControl.prototype.saveStyle = function(){
	if(this._layer == null){
		return;
	}

	var style = this._layer.style;
	if(style == null){
		return;
	}
	var styleName = style.name;
	// 默认的样式，添加，否则更新
	if(styleName == "default"){
		this.addStyle(style);
	}else{
		this.updateStyle(style);
	}
}

// 增加样式
CoEditor.StyleControl.prototype.addStyle = function(style){
	if(style == null){
		return;
	}

	var styleManager = user.getStyleManager();
	var styleWriter = new GeoBeans.StyleWriter();
	var name = GeoBeans.Utility.uuid(6);
	style.name = name;
	var xml = styleWriter.write(style);

	var type = null;
	var geometryType = this._layer.getGeometryType();
	if(geometryType == GeoBeans.Geometry.Type.POINT || 
		geometryType == GeoBeans.Geometry.Type.MULTIPOINT){
		type = "point";
	}else if(geometryType == GeoBeans.Geometry.Type.LINESTRING ||
		geometryType == GeoBeans.Geometry.Type.MULTILINESTRING){
		type = "linestring";
	}else if(geometryType == GeoBeans.Geometry.Type.POLYGON ||
		geometryType == GeoBeans.Geometry.Type.MULTIPOLYGON){
		type = "polygon";
	}
	CoEditor.notify.loading();
	styleManager.addStyle(xml,name,type,this.addStyle_callback);
}

// 更新样式
CoEditor.StyleControl.prototype.updateStyle = function(style){
	if(style == null){
		return;
	}
	var styleManager = user.getStyleManager();
	var styleWriter = new GeoBeans.StyleWriter();
	var xml = styleWriter.write(style);
	var name = style.name;
	CoEditor.notify.loading();
	styleManager.updateStyle(xml,name,this.updateStyle_callback);
}


// 增加样式回调
CoEditor.StyleControl.prototype.addStyle_callback = function(result){
	CoEditor.notify.showInfo("更新样式",result.toString());	
	if(result != "success"){
		return;
	}
	var that = CoEditor.styleControl;
	that.setLayerStyle();
}

// 给图层设置样式
CoEditor.StyleControl.prototype.setLayerStyle = function(){
	if(this._layer == null){
		return;
	}
	var style = this._layer.style;
	if(style == null){
		return;
	}
	var mapWorkspace = new GeoBeans.MapWorkspace(user.getServer(),mapObj);
	mapWorkspace.setStyle(this._layer.name,style,this.setLayerStyle_callback);
}

// 设置样式回调
CoEditor.StyleControl.prototype.setLayerStyle_callback = function(result){
	// 关闭弹窗
	$(".popover").hide()
}

CoEditor.StyleControl.prototype.updateStyle_callback = function(result){
	CoEditor.notify.showInfo("更新样式",result.toString());
	$(".popover").hide()
}