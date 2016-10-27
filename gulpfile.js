/*!
 * gulp 
 *
 * Warning : 请先安装nodejs、npm、gulp及插件
 * window下本文件的位置为Map5和MapCloud的所在目录，如D:\nginx-1.6.2\html\Map5
 * linux下本文件的位置为auge的所在目录，如/opt/auge/htdocs/Map5
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
//var linuxPath = "auge/htdocs/";
var linuxPath = "";
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
	gulp.task('map5-task',['map5','map5-css','map5-images'],function(){

	});

	// 压缩map5
	var map5List = [
			//'src/depends/requestNextAnimationFrame.js',
			//'src/depends/jquery-1.11.1.js',
			//'src/depends/jquery.nouislider.js',
			//'src/depends/heatmap.min.js',
			//'src/depends/echarts-all.js',
			//'src/depends/bootstrap.min.js',
			'src/GeoBeans.js',
			'src/GeoBeans/BaseTypes/Class.js',
			'src/GeoBeans/BaseTypes/*.js',
			'src/GeoBeans/*.js',
			'src/GeoBeans/Geometry/*.js',
			'src/GeoBeans/Geometry/*/*.js',
			'src/GeoBeans/Utility/*.js',
			'src/GeoBeans/Format/*.js',
			'src/GeoBeans/Filter/*.js',
			'src/GeoBeans/Filter/*/*.js',
			'src/GeoBeans/Style/*.js',
			'src/GeoBeans/Style/*/*.js',
			'src/GeoBeans/Source/*.js',
			'src/GeoBeans/Source/*/*.js',
			'src/GeoBeans/Source/*/*/*.js',
			'src/GeoBeans/Layer/FeatureLayer.js',
			'src/GeoBeans/Layer/ImageLayer.js',
			'src/GeoBeans/Layer/OverlayLayer.js',
			'src/GeoBeans/Layer/Tile.js',
			'src/GeoBeans/Layer/TileCache.js',
			'src/GeoBeans/Layer/TileLayer.js',
			'src/GeoBeans/Layer/*/*.js',
			'src/GeoBeans/Overlay/*.js',
			'src/GeoBeans/Render/*.js',
			'src/GeoBeans/Render/*/*.js',		
			'src/GeoBeans/Control/*.js',
			'src/GeoBeans/Control/*/*.js',
			'src/GeoBeans/Interaction/*.js',
			'src/GeoBeans/Widget/*.js',
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
	var map5cssList = ['css/bootstrap.min.css',
			'css/custom_slider.css',
			'css/Map5.css'
		];
	var map5cssDest = 'lib/css';
	if(platform == "linux"){
		map5cssList = changeToLinuxList(linuxPath,map5cssList);
		map5cssDest = linuxPath + map5cssDest;
	}
	gulp.task('map5-css',function(){
		return gulp.src(map5cssList)
			.pipe(minifycss())
			.pipe(concat('Map5.min.css'))
			.pipe(gulp.dest(map5cssDest));
	});


	// 移动images
	var map5ImageList = ['images/*.*'];
	var map5ImageDest = 'lib/images';
	if(platform == "linux"){
		map5ImageList = changeToLinuxList(linuxPath,map5ImageList);
		map5ImageDest = linuxPath + map5ImageDest;
	}
	gulp.task('map5-images',function(){
		gulp.src(map5ImageList)
			.pipe(gulp.dest(map5ImageDest));
	});


	gulp.task('default',['map5-task'],function(){

	});