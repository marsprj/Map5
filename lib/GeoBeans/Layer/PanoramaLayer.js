GeoBeans.Layer.PanoramaLayer = GeoBeans.Class(GeoBeans.Layer.FeatureLayer,{
	overlays : null,

	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);

		this.overlays = [];
	},

	// 添加全景图标注
	addMarker : function(point,name,htmlPath,icon){
		if(point == null || name == null || htmlPath == null){
			return;
		}
		if(icon == null){
			icon = "images/360.png";
		}
		var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
		// symbolizer.icon_url = "images/marker.png";
		// symbolizer.icon_url = "images/360.png";
		symbolizer.icon_url = icon;
		symbolizer.icon_offset_x = 0;
		symbolizer.icon_offset_y = 0;
		var marker = new GeoBeans.Overlay.Marker(name,point,symbolizer);
		marker.setLayer(this);
		marker.htmlPath = htmlPath;
		this.overlays.push(marker);

		if(this.clickEvent == null){
			this.registerClickEvent();
		}
	},

	// 删除全景图标注
	removeMarker : function(name){
		var overlay = null;
		for(var i = 0; i < this.overlays.length; ++i){
			overlay = this.overlays[i];
			if(overlay.name == name){
				this.overlays.splice(i,1);
			}
		}
		if(this.overlays.length == 0){
			this.unRegisterClickEvent();
		}
		if(this.map.infoWindow.attr("data-original-title") == name){
			this.map.closeInfoWindow();
		}
	},

	// 清空全景图标注
	clearMarkers : function(){
		var n = this.overlays.length;
		while(n>0){
			this.overlays.splice(n-1,1);
			n = this.overlays.length;
		}
		this.renderer.clearRect();
		this.unRegisterClickEvent();
		this.map.closeInfoWindow();	
	},

	load : function(){
		this.renderer.clearRect();
		for(var i = 0; i < this.overlays.length;++i){
			var overlay = this.overlays[i];
			overlay.draw();
		}
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

	// 点击弹窗
	registerClickEvent : function(){
		var map = this.map;

		var that = this;
		this.clickEvent = function(evt){
			var mp = map.transformation.toMapPoint(evt.layerX, evt.layerY);
			that.hit(mp.x,mp.y,that.hitOverlayCallback);
		};

		map.canvas.addEventListener("click",this.clickEvent);
	},

	unRegisterClickEvent :function(){
		var map = this.map;
		map.canvas.removeEventListener('click', this.clickEvent);
		this.clickEvent = null;
	},

	hit : function(x,y,hitOverlayCallback){
		// console.log(x + "," + y);
		var selection = [];
		var i=0, j=0;
		var f=null, g=null;
		var len = this.overlays.length;
		for(i=0; i<len; i++){
			f = this.overlays[i];
			g = f.geometry;
			if(g!=null){
				if(g.hit(x, y, this.map.tolerance)){
					selection.push(f);
				}
			}
		}	
		hitOverlayCallback(this,selection);
	},

	// 弹框
	hitOverlayCallback : function(layer,selection){
		if(selection == null){
			return;
		}
		if(selection.length == 0){
			return;
		}
		var overlay = selection[0];
		if(overlay == null){
			return;
		}

		var options = {
			title : overlay.name
		};

		var htmlPath = overlay.htmlPath;
		var point = overlay.geometry;
		if(htmlPath == null || point == null){
			return;
		}

		var html = "<div style='width:400px;height:300px;'><iframe src='"
			+	htmlPath + "' style='width:100%;height:100%' frameborder='no'></iframe></div>";
		var infoWindow = new GeoBeans.InfoWindow(html,options);
		mapObj.openInfoWindow(infoWindow,point);
	}
});