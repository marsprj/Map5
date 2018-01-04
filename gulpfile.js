/*!
 * gulp 
 *
 * Warning : 请先安装nodejs、npm、gulp及插件
 * window下本文件的位置为Map5和MapCloud的所在目录，如D:\nginx-1.6.2\html
 * linux下本文件的位置为auge的所在目录，如/opt
 * 在本文件的目录下运行gulp,linux运行需要以管理员身份运行
 *
 * Date: 2015-12-30
 */

var gulp = require("gulp"),
	rename = require("gulp-rename"),
	concat = require("gulp-concat"),
	jshint = require("gulp-jshint"),
	minifycss = require('gulp-minify-css'),
	uglify = require("gulp-uglify");

// 判断运行环境
var os = require("os");
var platform = os.platform();
var linuxPath = "auge/htdocs/";
if(platform == "win32"){
	console.log("platform is win32");
}else if(platform == "linux"){
	console.log("platform is linux");
}else{
	console.log("platform is " + platform);
	return;
}


	// 转换到linux的对应环境
	function changeToLinuxList(path,list){
		if(path == null || list == null){
			return [];
		}
		var l = null;
		var a = [],b = null;
		for(var i = 0; i < list.length; ++i){
			l = list[i];
			b = path + l;
			a.push(b);
		}
		return a;
	}
/***************************************************************************/
/*		 Map5                                                     			*/
/***************************************************************************/

	// 统一压缩Map5
	gulp.task('map5-task',['map5','map5-css'],function(){

	});

	// 压缩Map5
	var map5List = ["lib/GeoBeans.js",
			"lib/requestNextAnimationFrame.js", 
			'lib/GeoBeans/BaseTypes/*.js',
			'lib/GeoBeans/*.js',
			'lib/GeoBeans/AQI/*.js',
			'lib/GeoBeans/Auth/*.js',
			'lib/GeoBeans/Control/*.js',
			'lib/GeoBeans/Control/*/*.js',
			'lib/GeoBeans/DBS/*.js',
			'lib/GeoBeans/File/*.js',
			'lib/GeoBeans/Filter/*.js',
			'lib/GeoBeans/Filter/*/*.js',
			'lib/GeoBeans/Geometry/*.js',
			'lib/GeoBeans/Geometry/*/*.js',
			'lib/GeoBeans/GPS/*.js',
			'lib/GeoBeans/Label/*.js',
			'lib/GeoBeans/Layer/DBLayer.js',
			'lib/GeoBeans/Layer/FeatureDBLayer.js',
			'lib/GeoBeans/Layer/FeatureLayer.js',
			'lib/GeoBeans/Layer/ChartLayer.js',
			'lib/GeoBeans/Layer/GroupLayer.js',
			'lib/GeoBeans/Layer/HeatMapLayer.js',
			'lib/GeoBeans/Layer/MapLayer.js',
			'lib/GeoBeans/Layer/OverlayLayer.js',
			'lib/GeoBeans/Layer/PanoramaLayer.js',
			'lib/GeoBeans/Layer/QueryLayer.js',
			'lib/GeoBeans/Layer/RasterDBLayer.js',
			'lib/GeoBeans/Layer/Tile.js',
			'lib/GeoBeans/Layer/TileCache.js',
			'lib/GeoBeans/Layer/TileLayer.js',
			'lib/GeoBeans/Layer/WFSLayer.js',
			'lib/GeoBeans/Layer/WMSLayer.js',
			'lib/GeoBeans/Layer/ClusterLayer.js',
			'lib/GeoBeans/Layer/ImageLayer.js',
			'lib/GeoBeans/Layer/RippleLayer.js',
			'lib/GeoBeans/Layer/AirlineLayer.js',
			'lib/GeoBeans/Layer/*/*.js',
			'lib/GeoBeans/Overlay/*.js',
			'lib/GeoBeans/Poi/*.js',
			'lib/GeoBeans/RasterDB/*.js',
			'lib/GeoBeans/Style/*.js',
			'lib/GeoBeans/Subscribe/*.js',
			'lib/GeoBeans/TileDB/*.js',
			'lib/GeoBeans/WFS/*.js',
			'lib/GeoBeans/WMS/*.js',
			'lib/GeoBeans/WMTS/*.js',
			'lib/GeoBeans/Service/*.js',
			];
	var map5Dest = 'lib/';	
	if(platform == "linux"){
		map5List = changeToLinuxList(linuxPath,map5List);
		map5Dest = linuxPath + map5Dest;
	}
	gulp.task('map5',function(){
		return gulp.src(map5List)
			.pipe(uglify())
			.pipe(concat('Map5.min.js'))
			.pipe(gulp.dest(map5Dest));		
	});



	// 压缩Map5 css
	var map5cssList = ['css/Map5.css'];
	var map5cssDest = 'css';
	if(platform == "linux"){
		map5cssList = changeToLinuxList(linuxPath,map5cssList);
		map5cssDest = linuxPath + map5cssDest;
	}
	gulp.task('map5-css',function(){
		return gulp.src(map5cssList)
			.pipe(minifycss())
			.pipe(rename('Map5.min.css'))
			.pipe(gulp.dest(map5cssDest));
	});



	gulp.task('default',['map5-task'],function(){

	});