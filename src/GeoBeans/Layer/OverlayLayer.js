GeoBeans.Layer.OverlayLayer = GeoBeans.Class(GeoBeans.Layer.FeatureLayer,{
	
	overlays : null,


	hitOverlay : null,

	hitOverlayCallback : null,

	editCanvas : null,
	editRenderer : null,
	editEvent : null,
	editOverlay : null,
	// isEdit : false,


	// 自增id值
	incrementID : 0,

	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);

		this.overlays = [];
	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);	
		this.clickCanvas = document.createElement("canvas");
		this.clickCanvas.width = this.canvas.width;
		this.clickCanvas.height = this.canvas.height;
		this.clickRenderer  = new GeoBeans.Renderer(this.clickCanvas);
	},
	

	addOverlay : function(overlay){
		if(overlay == null){
			console.log("overlay is null")
			return;
		}
		if(overlay.id == null && overlay.symbolizer == null){
			console.log("overlay is invalid");
			return;
		}
		if(this.getOverlay(overlay.id) != null){
			console.log("overlay id repeat");
			return;
		}
		overlay.setLayer(this);
		this.overlays.push(overlay);
	},

	getOverlay : function(id){
		for(var i = 0; i < this.overlays.length;++i){
			var overlay = this.overlays[i];
			if(overlay.id == id){
				return overlay;
			}
		}
		return null;
	},

	addOverlays : function(overlays){
		for(var i = 0; i < overlays.length; ++i){
			var overlay = overlays[i];
			this.addOverlay(overlay);
		}
	},

	removeOverlay : function(id){
		var len = this.overlays.length;
		for(var i=len-1; i>=0; i--){
			var o = this.overlays[i];
			if(o.id == id){
				this.overlays.splice(i,1);
				o.destroy();
				o = null;
				return;
			}
		}
	},

	removeOverlayObj : function(overlay){
		var id = overlay.id;
		this.removeOverlay(id);
	},

	
	removeOverlays : function(ids){
		if(!$.isArray(ids)){
			console.log("ids is null")
			return;
		}

		for(var i = 0; i < ids.length;++i){
			this.removeOverlay(ids[i]);
		}
	},

	clearOverlays : function(){
		var n = this.overlays.length;
		while(n>0){
			this.overlays.splice(n-1,1);
			n = this.overlays.length;
		}
		if(this.editRenderer != null){
			this.editRenderer.clearRect();
		}
		if(this.hitRenderer != null){
			this.hitRenderer.clearRect();
		}
	},

	load : function(){
		this.renderer.clearRect();
		if(this.hitRenderer != null){
			this.hitRenderer.clearRect();
		}
		if(this.editRenderer != null){
			this.editRenderer.clearRect();
		}
		
		for(var i = 0; i < this.overlays.length;++i){
			var overlay = this.overlays[i];
			overlay.draw();
		}

		this.drawClickLayer();

	},

	draw : function(){
		var flag = this.getLoadFlag();
		if(flag == GeoBeans.Layer.Flag.LOADED){
			this.map.drawLayersAll();
		}
	},

	getLoadFlag : function(){
		for(var i = 0; i < this.overlays.length;++i){
			var overlay = this.overlays[i];
			var flag = overlay.loadFlag;
			if(flag != GeoBeans.Overlay.Flag.LOADED){
				return GeoBeans.Layer.Flag.READY;
			}
		}
		return GeoBeans.Layer.Flag.LOADED;		

	},

	drawClickLayer : function(){
		this.clickRenderer.clearRect();
		if(this.clickOverlay == null){
			return;
		}

		var symbolizer = this.getClickSymbolizer(this.clickOverlay);
		if(symbolizer == null){
			return;
		}
		this.clickRenderer.setSymbolizer(symbolizer);
		this.clickRenderer.drawOverlay(this.clickOverlay,symbolizer,this.map.getMapViewer());		
	},


	setHitOverlayCallback : function(callback){
		this.hitOverlayCallback = callback;
	},


	onOverlayHit : function(layer,selection){
		// 只绘制最后一个selection
		var len = selection.length;
		if(len >=1){
			var f = selection[len-1];
			if(f.isEdit){
				layer.hitRenderer.clearRect();
				layer.map.drawLayersAll();
				return;
			}
			
			
			var symbolizer = layer.getHitOverlaySymbolizer(f);
			layer.drawHitOverlay(f, symbolizer);
			// layer.editOverlay = f; //待编辑的
			if(layer.hitOverlay != null){
				layer.hitOverlay.isHit = false;
			}
			
			layer.hitOverlay = f;
			f.isHit = true;
			
			if(layer.hitOverlayCallback != null){
				layer.hitOverlayCallback(f);
			}
			// layer.editOverlay = null;
		}else{
			if(layer.editOverlay != null){
				layer.editOverlay.isHit = false;
				// layer.editOverlay.isEdit = false;
			}
			if(layer.hitOverlayCallback != null){
				layer.hitOverlayCallback(null);
			}
			if(layer.hitOverlay != null){
				layer.hitOverlay.isHit = false;
			}
		}

	},

	//根据类型选取样式
	getHitOverlaySymbolizer : function(overlay){
		var type = overlay.type;
		var symbolizer = null;
		switch(type){
			case GeoBeans.Overlay.Type.MARKER:
				symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
				var symbol = new GeoBeans.Symbol();
				symbol.icon = "../images/marker-hit.png";
				symbolizer.symbol = symbol;
				break;
			case GeoBeans.Overlay.Type.PLOYLINE:
				symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
				symbolizer.stroke.color.set(255,0,0,1);
				symbolizer.stroke.width = 4;
				break;
			case GeoBeans.Overlay.Type.POLYGON:
				symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
				symbolizer.fill.color.set(255,255,255,1);
				symbolizer.stroke.color.set(255,0,0,1);
			default:
				break;
		}
		return symbolizer;
	},

	//绘制选中的overlay
	drawHitOverlay : function(overlay,symbolizer){
		this.hitRenderer.clearRect();
		this.hitRenderer.setSymbolizer(symbolizer);
		var ret = this.hitRenderer.drawOverlay(overlay, symbolizer, this.map.getMapViewer());
		if(ret){
			this.map.renderer.drawImage(this.hitCanvas,0,0,this.hitCanvas.width,this.hitCanvas.height);
		}
	},

	//注册hit事件
	registerHitEvent:function(){
		this.hitCanvas = document.createElement("canvas");
		this.hitCanvas.width = this.canvas.width;
		this.hitCanvas.height = this.canvas.height;

		this.hitRenderer  = new GeoBeans.Renderer(this.hitCanvas);

		var that = this;	
		var x_o = null;
		var y_o = null;
		var tolerance = 10;
		var map = that.map;		

		this.hitEvent = function(evt){
			if(x_o==null){
				x_o = evt.layerX;
				y_o = evt.layerY;
			}
			else{
				var dis = Math.abs(evt.layerX-x_o) + Math.abs(evt.layerY-y_o);
				if(dis > tolerance){
					
					x_o = evt.layerX;
					y_o = evt.layerY;
				
					var mp = map.getMapViewer().toMapPoint(evt.layerX, evt.layerY);
					
					that.hit(mp.x, mp.y);
				}
			}

		};
		map.canvas.addEventListener('mousemove', this.hitEvent);
		this.registerEditEvent();

	},

	unregisterHitEvent:function(){
		var map = this.map;
		map.canvas.removeEventListener('mousemove', this.hitEvent);
		this.unregisterEditEvent();
		this.editOverlay = null;
		this.editRenderer.clearRect();
		this.hitRenderer.clearRect();
		this.map.drawLayersAll();
	},

	hit : function(x, y){
		if(this.overlays==null){
			return;
		}
		
		var render = this.map.renderer;
		
		this.selection = [];
		
		var i=0, j=0;
		var f=null, g=null;
		var len = this.overlays.length;
		for(i=0; i<len; i++){
			f = this.overlays[i];
			g = f.geometry;
			if(g!=null){
				if(g.hit(x, y, this.map.tolerance)){
					this.selection.push(f);
				}
			}
		}
		
		this.hitRenderer.clearRect();
		this.map.drawLayersAll();
		if(this.onOverlayHit != undefined){
			this.onOverlayHit(this,this.selection);
		}
	},


	// 注册edit编辑事件
	registerEditEvent : function(){
		if(this.editCanvas == null){
			this.editCanvas = document.createElement("canvas");
			this.editCanvas.width = this.canvas.width;
			this.editCanvas.height = this.canvas.height;
			this.editRenderer = new GeoBeans.Renderer(this.editCanvas);

		}

		var map = this.map;
		var that = this;


		this.editEvent = function(evt){
		
			var overlay = that.hitOverlay;
			if(overlay == null){
				return;
			}
			if(that.editOverlay != null){
				that.editOverlay.isEdit = false;
			}

			var mp = map.getMapViewer().toMapPoint(evt.layerX, evt.layerY);
			var geometry = overlay.geometry;
			if(geometry.hit(mp.x, mp.y, map.tolerance)){
				//绘制当前编辑的overlay
				that.editOverlay = overlay;
				var symbolizer = that.getEditOverlaySymbolizer(overlay);
				that.drawEditOverlay(overlay,symbolizer);
				overlay.isEdit = true;
				if(that.hitOverlayCallback != null){
					that.hitOverlayCallback(overlay);
				}
			}else{
			}
		}

		this.map.canvas.addEventListener("click", this.editEvent);
	},

	unregisterEditEvent : function(){
		this.map.canvas.removeEventListener("click",this.editEvent);
	},

	//根据类型选取样式
	getEditOverlaySymbolizer : function(overlay){
		var type = overlay.type;
		var symbolizer = null;
		switch(type){
			case GeoBeans.Overlay.Type.MARKER:
				symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
				var symbol = new GeoBeans.Symbol();
				symbol.icon = "../images/marker-edit.png";
				symbolizer.symbol = symbol;
				break;
			case GeoBeans.Overlay.Type.PLOYLINE:
				symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
				symbolizer.stroke.color.set(255,0,0,1);
				symbolizer.stroke.width = 6;
				break;
			case GeoBeans.Overlay.Type.POLYGON:
				symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
				symbolizer.fill.color.set(255,0,0,1);
				symbolizer.stroke.color.set(255,0,0,1);
				symbolizer.stroke.width = 8;
			default:
				break;
		}
		return symbolizer;
	},

	//绘制编辑中的overlay
	drawEditOverlay : function(overlay,symbolizer){
		this.editRenderer.clearRect();
		this.editRenderer.setSymbolizer(symbolizer);
		var ret = this.editRenderer.drawOverlay(overlay, symbolizer, this.map.getMapViewer());
		// this.map.drawLayersAll();
		if(ret){
			this.map.renderer.drawImage(this.editCanvas,0,0,this.editCanvas.width,this.editCanvas.height);
		}

	},


	// getOverlayIndex : function(overlay){
	// 	if(overlay == null){
	// 		return -1;
	// 	}
	// 	for(var i = 0; i < this.overlays.length;++i){
	// 		if(overlay == this.overlays[i]){
	// 			return i;
	// 		}
	// 	}
	// 	return -1;
	// },


	registerInfoWindowEvent : function(){
		if(this.hitInfoWindowEvent != null){
			return;
		}
		var that = this;
		var x_o = null;
		var y_o = null;
		var tolerance = 10;
		this.hitInfoWindowEvent = function(evt){
			if(x_o==null){
				x_o = evt.layerX;
				y_o = evt.layerY;
			}
			else{
				var dis = Math.abs(evt.layerX-x_o) + Math.abs(evt.layerY-y_o);
				if(dis > tolerance){
					
					x_o = evt.layerX;
					y_o = evt.layerY;
				
					var mp = that.map.getMapViewer().toMapPoint(evt.layerX, evt.layerY);
					
					that.hitInfoWindow(mp.x, mp.y);
				}
			}

		};
		this.map.canvas.addEventListener('mousemove', this.hitInfoWindowEvent);
	},


	hitInfoWindow : function(x,y){
		if(this.overlays==null){
			return;
		}
		
		var render = this.map.renderer;
		
		var selection = [];
		
		var i=0, j=0;
		var f=null, g=null;
		var len = this.overlays.length;
		for(i=0; i<len; i++){
			f = this.overlays[i];
			g = f.geometry;
			if(g!=null && g instanceof GeoBeans.Geometry.Point){
				if(g.hit(x, y, this.map.tolerance)){
					selection.push(f);
				}
			}
		}


		if(selection.length >=1){
			var f = selection[selection.length - 1];
			var geometry = f.geometry;
			var infoWindow = f.infoWindow;
			if(geometry != null && infoWindow != null){
				this.map.openInfoWindow(infoWindow,geometry);
			}
		}else{
			this.map.closeInfoWindow();
		}

	},

	unRegisterInfoWindowEvent : function(){
		this.map.canvas.removeEventListener('mousemove', this.hitInfoWindowEvent);
		this.hitInfoWindowEvent = null;
	},


	_getOverlayIDByIdentity : function(){
		var id = null;
		id = "overlay_" + this.incrementID;
		while(this.getOverlay(id) != null){
			this.incrementID++;
			id = "overlay_" + this.incrementID;
		}
		
		return id;
	},


	// 注册点击事件
	registerOverlayClickEvent : function(callback){
		var layer = this;	
		var x_o = null;
		var y_o = null;
		var tolerance = 10;
		var map = layer.map;		


		this.clickEvent = function(evt){
			var trackOverlayControl =layer.map._getTrackOverlayControl();
			if(trackOverlayControl.drawing){
				return;
			}

			var index = layer.map.controls.find(GeoBeans.Control.Type.DRAG_MAP)
			var dragControl = layer.map.controls.get(index);
			if(dragControl.draging){
				console.log("draging");
				return;
			}
			layer.clickRenderer.clearRect();
			layer.map.drawLayersAll();
			var mp = map.getMapViewer().toMapPoint(evt.layerX, evt.layerY);
			layer.clickHit(mp.x, mp.y, callback);
		};
		map.canvas.addEventListener('mouseup', this.clickEvent);
	},

	clickHit : function(x,y,callback){
		if(this.overlays == null){
			if(callback != null){
				callback(null);
			}
			return;
		}

		var selection = [];
		var i=0, j=0;
		var o=null, g=null;
		var len = this.overlays.length;
		for(i=0; i<len; i++){
			o = this.overlays[i];
			if(o.type == GeoBeans.Overlay.Type.LABEL){
				var label = o.label;
				if(label != null){
					var extent = label.extent;
					var pt = this.map.getMapViewer().toScreenPoint(x,y);
					if(extent != null && pt != null && extent.contain(pt.x,pt.y)){
						selection.push(o);
					}
				}
			}else{
				g = o.geometry;
				if(g!=null){
					if(g.hit(x, y, this.map.tolerance)){
						selection.push(o);
					}
				}
			}
		}

		if(selection.length == 0){
			this.clickOverlay = null;
			if(callback != null){
				callback(null);	
			}
			return;
		}

		var overlay = selection[0];
		var geometry = overlay.geometry;
		var distance = this.getDistance(x,y,geometry);
		for(var i = 1; i <  selection.length;++i){
			var o = selection[i];
			var g = o.geometry;
			var d = this.getDistance(x,y,o.geometry);
			if(d < distance){
				overlay = f;
			}
		}

		if(callback != null){
			this.clickOverlay = overlay;
			this.map.drawLayersAll();
			callback(overlay);
		}
	},

	getDistance : function(x,y,geometry){
		var geomType = geometry.type;
		var distance = null;
		switch(geomType){
			case GeoBeans.Geometry.Type.POINT:
			case GeoBeans.Geometry.Type.MULTIPOINT:{
				var center = geometry.getCentroid();
				distance = GeoBeans.Utility.getDistance(x,y,geometry.x,geometry.y);
				break;
			}
			case GeoBeans.Geometry.Type.LINESTRING:
			case GeoBeans.Geometry.Type.MULTILINESTRING:{
				distance = geometry.distance(x,y);
				break;
			}
			case GeoBeans.Geometry.Type.POLYGON:
			case GeoBeans.Geometry.Type.MULTIPOLYGON:{
				var center = geometry.getCentroid();
				distance = GeoBeans.Utility.getDistance(x,y,geometry.x,geometry.y);
				break;
			}
			default :
				break;
		}
		return distance;
	},

	// 获取点击样式
	getClickSymbolizer : function(overlay){
		if(overlay == null){
			return null;
		}
		var symbolizer = overlay.symbolizer;
		var clickSymbolizer = null;
		var type = symbolizer.type;
		switch(type){
			case GeoBeans.Symbolizer.Type.Point:{
				var image = symbolizer.image;
				if(image == null || symbolizer.symbol == null){
					break;
				}
				var width = (symbolizer.symbol.width == null)? image.width : symbolizer.symbol.width;
				var height = (symbolizer.symbol.height == null)? image.height : symbolizer.symbol.height;
				clickSymbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
				var symbol = new GeoBeans.Symbol();
				symbol.icon = symbolizer.symbol.icon;
				symbol.icon_width = width * 1.2;
				symbol.icon_height = height * 1.2;
				clickSymbolizer.symbol = symbol;
				break;
			}
			case GeoBeans.Symbolizer.Type.Line:{
				clickSymbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
				var width = symbolizer.stroke.width;
				clickSymbolizer.stroke = symbolizer.stroke.clone();
				clickSymbolizer.stroke.width = symbolizer.stroke.width * 3;
				break;
			}
			case GeoBeans.Symbolizer.Type.Polygon:{
				clickSymbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();

				var stroke = symbolizer.stroke;
				if(stroke == null){
					var stroke = new GeoBeans.Stroke();
					stroke.color.setByHex("#0099FF",1);
					stroke.width = 5;
					clickSymbolizer.stroke = stroke;
				}else{
					var width = stroke.width;
					clickSymbolizer.stroke = stroke.clone();
					clickSymbolizer.stroke.width = width *3;
				}
				var fill = symbolizer.fill;
				if(fill != null){
					clickSymbolizer.fill = fill.clone();
				}else{
					clickSymbolizer.fill = null;
				}
				break;
			}
			case GeoBeans.Symbolizer.Type.Text:{
				clickSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();
				
				clickSymbolizer = symbolizer.clone();
				var fontSize = symbolizer.font.size;
				clickSymbolizer.font.size = fontSize *2;
				break;
			}
			default:
				break;
		}

		return clickSymbolizer;
	},


	// 注销点击事件
	unRegisterOverlayClickEvent : function(){
		if(this.clickEvent != null){
			this.map.canvas.removeEventListener('mouseup', this.clickEvent);
			this.clickEvent = null;
			this.clickOverlay = null;
			this.map.drawLayersAll();

		}
	},
});