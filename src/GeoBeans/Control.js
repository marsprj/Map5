/**
 * @classdesc
 * Map的控件基类。
 * @class
 */
GeoBeans.Control = GeoBeans.Class({
	type : null,
	map : null,
	enabled : true,
	
	initialize : function(name){
		//GeoBeans.Class.prototype.initialize.apply(this, arguments);
	},
	
	destory : function(){
		//GeoBeans.Class.prototype.destory.apply(this, arguments);
	},
	
	attach : function(map){
		this.map = map;
	},
	
	detach : function(){
		this.map = map;
	},
	
	enable : function(f){
		this.enabled = f;
	},

	isEnabled : function(){
		return this.enabled;
	}
});

GeoBeans.Control.Type = {
	SCROLL_MAP		: "ScrollMapControl",
	DRAG_MAP		: "DragMapControl",
	TRACK			: "TrackControl",
	TRACKBUFFER 	: "TrackBufferControl",
	TRACKTRANSACTION: "TrackTransactionControl",
	TRACKOVERLAY 	: "TrackOverlayControl",
	HIT_FEATURE		: "FeatureHitControl",
	NAV 			: "navControl",
	ZOOM 			: "zoom"
};


GeoBeans.Control.Controls = GeoBeans.Class({
	map : null,
	controls : [],
	
	initialize : function(map){
		this.map = map;
		this.controls = [];

		var dragControl = new GeoBeans.Control.DragMapControl(this.map);
		dragControl.enable(true);
		this.add(dragControl);

		var scrollControl = new GeoBeans.Control.ScrollMapControl(this.map);
		scrollControl.enable(true);
		this.add(scrollControl);

		var tracker = new GeoBeans.Control.TrackControl();
		this.map.tracker = tracker;
		this.add(tracker);

		var zoomControl = new GeoBeans.Control.ZoomControl();
		this.add(zoomControl);

		var mapNavControl = new GeoBeans.Control.MapNavControl(this.map);
		mapNavControl.enable(false);
		this.add(mapNavControl);
	},

	destory : function(){
		this.controls = null;
	},
	
	add : function(c){
		if( (c==null) || (c=='undefined')){
			return;
		}
		var i = this.find(c.type);
		if(i<0){
			c.attach(this.map);
			this.controls.push(c);
		}
		else{
			this.controls[i] = null;
			this.controls[i] = c;
		}
	},
	
	remove : function(c){
		if( (c==null) || (c=='undefined')){
			return;
		}
		var i = this.find(c.type);
		if(i>=0){
			this.controls[i] = null;
			this.controls[i].splice(i,1);
		}
	},

	get : function(i){
		return this.controls[i];
	},
	
	find : function(t){
		var len = this.controls.length;
		for(var i=0; i<len; i++){
			var c = this.controls[i];
			if(c!=null &&c.type==t){
				return i;
			}
		}
		return -1;
	},
	
	cleanup : function(){
		var len = this.controls.length;
		for(var i=0; i<len; i++){
			this.controls[i].destory();
			this.controls[i] = null;
		}
		this.controls = [];
	}
});