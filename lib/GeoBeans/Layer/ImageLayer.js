GeoBeans.Layer.ImageLayer = GeoBeans.Class(GeoBeans.Layer,{
	images : null,

	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.images = [];
	},


	addImage : function(url,extent){
		if(url == null || extent == null){
			return;
		}

		var image = new Image();
		image.src = url;
		var imageObj = {
			image : image,
			extent : extent,
			flag : false
		};

		this.images.push(imageObj);
	},


	load : function(){

		var w = this.map.canvas.width;
		var h = this.map.canvas.height;

		this.renderer.clearRect(0,0,w,h);
		var image = null, imageObj = null;
		var extent = null;
		for(var i = 0; i < this.images.length; ++i){
			imageObj = this.images[i];
			if(imageObj == null){
				continue;
			}
			image = imageObj.image;
			extent = imageObj.extent;
			var leftTop = this.map.transformation.toScreenPoint(extent.xmin,extent.ymax);
			var rightBottom = this.map.transformation.toScreenPoint(extent.xmax,extent.ymin);

			var imageScreenWidth = rightBottom.x - leftTop.x;
			var imageScreenHeight = rightBottom.y - leftTop.y;
			if(image.complete){
				var width = image.width;
				var height = image.height;
				this.renderer.drawImageParms(image,0,0,width,height,leftTop.x,leftTop.y,imageScreenWidth,imageScreenHeight);
				imageObj.flag = true;
			}else{
				var that = this;
				image.onload = function(){
					imageObj.flag = true;
					var width = this.width;
					var height = this.height;
					that.renderer.drawImageParms(image,0,0,width,height,leftTop.x,leftTop.y,imageScreenWidth,imageScreenHeight);
					that.map.drawLayersAll();
				};
			}
		}

		for(var i = 0; i < this.images.length; ++i){
			imageObj = this.images[i];
			if(!imageObj.flag){
				this.flag = GeoBeans.Layer.Flag.READY;
				return;
			}
		}
		this.flag = GeoBeans.Layer.Flag.LOADED;
	},

	getLoadFlag : function(){
		return this.flag;
	}
});