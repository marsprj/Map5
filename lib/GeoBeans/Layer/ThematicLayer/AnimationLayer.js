GeoBeans.Layer.AnimationLayer = GeoBeans.Class(GeoBeans.Layer,{
	
	moveObjects : null,

	initialize : function(){
		this.moveObjects = [];
	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		window.animateLayer = this;
		window.requestNextAnimationFrame(this.animate);
	},


	addMoveObject : function(moveObject){
		if(moveObject == null){
			console.log("moveObject is null");
			return;
		}
		if(this.getMoveObject(moveObject.id) != null){
			console.log("map has moveObject id" + moveObject.id);
			return;
		}
		if(moveObject != null){
			this.moveObjects.push(moveObject);
		}
	},

	getMoveObject : function(id){
		for(var i = 0; i < this.moveObjects.length;++i){
			if(this.moveObjects[i].id == id){
				return this.moveObjects[i];
			}
		}
		return null;
	},

	removeMoveObject : function(id){
		for(var i = 0; i < this.moveObjects.length;++i){
			if(this.moveObjects[i].id == id){
				this.moveObjects[i].destroy();
				this.moveObjects.splice(i,1);
			}
		}
	},

	load : function(){
		// this.renderer.clearRect();
		this.drawStaticObjects();
		// this.drawMoveOjbects();
		this.flag = GeoBeans.Layer.Flag.LOADED;
	},

	animate : function(time){
		var layer = this.animateLayer;
		layer.renderer.clearRect();
		// layer.drawStaticObjects();
		layer.drawMoveOjbects(time);
		window.requestNextAnimationFrame(layer.animate);
	},


	drawStaticObjects : function(){
		for(var i = 0; i < this.moveObjects.length;++i){
			var object = this.moveObjects[i];
			if(object == null){
				continue;
			}
			var type = object.type;

			switch(type){
				case GeoBeans.MoveType.POINT:{
					this.drawStaticMovePoint(object);
					break;
				}
				default :
					break;
			}
		}
	},

	drawStaticMovePoint : function(movePoint){
		if(movePoint == null){
			return;
		}

		var point = movePoint.point;
		var line = movePoint.line;

		if(point == null || line == null){
			return;
		}

		var pointSymbolizer = movePoint.option.pointSymbolizer;
		var lineSymbolizer = movePoint.option.lineSymbolizer;
		if(pointSymbolizer == null){
			pointSymbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
		}
		if(lineSymbolizer == null){
			lineSymbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
		}

		this.renderer.setSymbolizer(pointSymbolizer);
		this.renderer.drawGeometry(point,pointSymbolizer,this.map.transformation);

		if(movePoint.option.showLine){
			this.renderer.setSymbolizer(lineSymbolizer);
			this.renderer.drawGeometry(line,lineSymbolizer,this.map.transformation);
		}
	},

	drawMoveOjbects : function(time){
		for(var i = 0; i < this.moveObjects.length;++i){
			var object = this.moveObjects[i];
			if(object == null){
				continue;
			}
			if(!object.flag){
				this.drawStaticObject();
				continue;
			}
			var type = object.type;

			switch(type){
				case GeoBeans.MoveType.POINT:{
					this.drawMovePoint(object,time);
					break;
				}
				default :
					break;
			}
		}

		this.map.drawLayersAll();
	},

	// 每次按照时间绘制，如果暂停过，按照上一次的绘制
	drawMovePoint : function(movePoint,time){
		if(movePoint == null || time == null){
			return;
		}

		// 如果只运行一次
		var once = movePoint.option.once;
		if(once && movePoint.onceAnimate){
			return;
		}

		var point = movePoint.point;

		var line = movePoint.line;

		var times = movePoint.points;

		var allTime = movePoint.option.duration;

		var once = movePoint.option.once;

		var elapsedTime = 0;
		if(movePoint.elapsedTime != null&& movePoint.beginTime == null){
			if(movePoint.elapsedTime == allTime){
				// 到达终点后，重回起点
				elapsedTime = 0;
				movePoint.beginTime = time;
			}else{
				elapsedTime = movePoint.elapsedTime;
				movePoint.beginTime = time - elapsedTime;
			}
		}else{
			if(movePoint.beginTime == null){
				movePoint.beginTime = time;
			}else{
				elapsedTime = time - movePoint.beginTime;
				if(elapsedTime > allTime){
					// 如果只运行一次，那么到底终点就不动了
					if(once){
						elapsedTime = allTime;
						movePoint.beginTime = null;
						movePoint.onceAnimate = true;
					}else{
						elapsedTime = 0;
						movePoint.beginTime = time;
					}
					
				}
			}
			movePoint.elapsedTime = elapsedTime;
		}


		var pointByTime = movePoint.getPoint(elapsedTime);

		var pointSymbolizer = movePoint.option.pointSymbolizer;
		this.renderer.setSymbolizer(pointSymbolizer);
		// if(pointSymbolizer.symbol != null){
		// 	if(pointSymbolizer.icon==null){
		// 		pointSymbolizer.icon = new Image();
		// 		pointSymbolizer.icon.crossOrigin="anonymous";
		// 		pointSymbolizer.icon.src = pointSymbolizer.symbol.icon;			
		// 	}
		// 	else{
		// 		if(pointSymbolizer.icon.src!=pointSymbolizer.symbol.icon){
		// 			pointSymbolizer.icon = null;
		// 			pointSymbolizer.icon = new Image();
		// 			pointSymbolizer.icon.crossOrigin="anonymous"	
		// 			pointSymbolizer.icon.src = pointSymbolizer.symbol.icon;
		// 		}
		// 	}
		// }else{
		// 	this.renderer.drawGeometry(pointByTime,pointSymbolizer,this.map.transformation);	
		// }
		
		this.renderer.drawGeometry(pointByTime,pointSymbolizer,this.map.transformation);	

	},


	drawStaticObject : function(moveObject){
		if(moveObject == null){
			return;
		}
		var type = moveObject.type;
		switch(type){
			case GeoBeans.MoveType.POINT:{
				this.drawStaticMovePoint(object,time);
				break;
			}
			default :
				break;
		}
	},

	drawStaticMovePoint : function(movePoint){
		if(movePoint == null){
			return;
		}
		var elapsedTime = movePoint.elapsedTime;
		if(elapsedTime == null){
			elapsedTime = 0;
		}
		var pointByTime = movePoint.getPoint(elapsedTime);

		var pointSymbolizer = movePoint.option.pointSymbolizer;
		this.renderer.setSymbolizer(pointSymbolizer);
		this.renderer.drawGeometry(pointByTime,pointSymbolizer,this.map.transformation);

		// if(pointSymbolizer.symbol != null){
		// 	if(pointSymbolizer.icon==null){
		// 		pointSymbolizer.icon = new Image();
		// 		pointSymbolizer.icon.crossOrigin="anonymous";
		// 		pointSymbolizer.icon.src = pointSymbolizer.symbol.icon;			
		// 	}
		// 	else{
		// 		if(pointSymbolizer.icon.src!=pointSymbolizer.symbol.icon){
		// 			pointSymbolizer.icon = null;
		// 			pointSymbolizer.icon = new Image();
		// 			pointSymbolizer.icon.crossOrigin="anonymous"	
		// 			pointSymbolizer.icon.src = pointSymbolizer.symbol.icon;
		// 		}
		// 	}
		// }else{
		// 	this.renderer.drawGeometry(pointByTime,pointSymbolizer,this.map.transformation);	
		// }
		

		if(movePoint.option.showLine){
			var line = movePoint.line;
			var lineSymbolizer = movePoint.option.lineSymbolizer;
			if(lineSymbolizer == null){
				lineSymbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
			}

			this.renderer.setSymbolizer(lineSymbolizer);
			this.renderer.drawGeometry(line,lineSymbolizer,this.map.transformation);
		}
	},



});

