GeoBeans.Layer.AnimationLayer = GeoBeans.Class(GeoBeans.Layer,{
	
	moveObjects : null,

	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.moveObjects = [];
	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		this.map.beginAnimate();
	},


	draw : function(time){
		if(!isValid(time)){
			return;
		}
		this.clear();
		this.drawMoveOjbects(time);
	},

	drawMoveOjbects : function(time){
		for(var i = 0; i < this.moveObjects.length;++i){
			var object = this.moveObjects[i];
			if(object == null){
				continue;
			}
			if(!object.flag){
				this.drawStaticObject(object,time);
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

	},

	// 每次按照时间绘制，如果暂停过，按照上一次的绘制
	drawMovePoint : function(movePoint,time){
		if(movePoint == null || time == null){
			return;
		}

		// 如果只运行一次
		var once = movePoint.once;
		if(once && movePoint.onceAnimate){
			return;
		}

		var point = movePoint.point;

		var line = movePoint.line;

		var times = movePoint.points;

		var allTime = movePoint.duration;

		var once = movePoint.once;

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


		if(movePoint.showLine){
			var line = movePoint.line;
			var lineSymbolizer = movePoint.lineSymbolizer;
			if(lineSymbolizer == null){
				lineSymbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
			}
			this.renderer.save();
			this.renderer.setSymbolizer(lineSymbolizer);
			this.renderer.drawGeometry(line,lineSymbolizer,this.map.getViewer());
			this.renderer.restore();
		}

		var pointByTime = movePoint.getPoint(elapsedTime);
		this.renderer.save();
		var pointSymbolizer = movePoint.pointSymbolizer;
		this.renderer.setSymbolizer(pointSymbolizer);
		this.renderer.drawGeometry(pointByTime,pointSymbolizer,this.map.getViewer());	
		this.renderer.restore();
	},

	/**
	 * 绘制静止的运动要素
	 */
	drawStaticObject : function(moveObject,time){
		if(moveObject == null){
			return;
		}
		var type = moveObject.type;
		switch(type){
			case GeoBeans.MoveType.POINT:{
				this.drawStaticMovePoint(moveObject,time);
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

		if(movePoint.showLine){
			var line = movePoint.line;
			var lineSymbolizer = movePoint.lineSymbolizer;
			if(lineSymbolizer == null){
				lineSymbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
			}
			this.renderer.save();
			this.renderer.setSymbolizer(lineSymbolizer);
			this.renderer.drawGeometry(line,lineSymbolizer,this.map.getViewer());
			this.renderer.restore();
		}

		var elapsedTime = movePoint.elapsedTime;
		if(elapsedTime == null){
			elapsedTime = 0;
		}
		var pointByTime = movePoint.getPoint(elapsedTime);

		var pointSymbolizer = movePoint.pointSymbolizer;
		this.renderer.save();
		this.renderer.setSymbolizer(pointSymbolizer);
		this.renderer.drawGeometry(pointByTime,pointSymbolizer,this.map.getViewer());
		this.renderer.restore();
	},
});


/**
 * 是否是动画图层
 * @private
 * @return {Boolean} 
 */
GeoBeans.Layer.AnimationLayer.prototype.isAnimation = function(){
	return true;
};

/**
 * 添加运动要素
 * @public
 * @param {GeoBeans.MoveObject} moveObject 运动要素
 * @return {boolean} 添加结果
 */
GeoBeans.Layer.AnimationLayer.prototype.addMoveObject = function(moveObject){
	if(!isValid(moveObject)){
		console.log("moveObject is null");
		return false;
	}
	if(isValid(this.getMoveObject(moveObject.id))){
		console.log("map has moveObject id" + moveObject.id);
		return false;
	}
	if(moveObject != null){
		this.moveObjects.push(moveObject);
	}
	return true;	
};

/**
 * 获取运动要素
 * @public
 * @param  {string} id id 值
 * @return {GeoBeans.MoveObject}    运动要素
 */
GeoBeans.Layer.AnimationLayer.prototype.getMoveObject = function(id){
	for(var i = 0; i < this.moveObjects.length;++i){
		if(this.moveObjects[i].id == id){
			return this.moveObjects[i];
		}
	}
	return null;
};

/**
 * 删除运动要素
 * @public
 * @param  {string} id id值
 */
GeoBeans.Layer.AnimationLayer.prototype.removeMoveObject = function(id){
	for(var i = 0; i < this.moveObjects.length;++i){
		if(this.moveObjects[i].id == id){
			this.moveObjects[i].destroy();
			this.moveObjects.splice(i,1);
		}
	}	
}