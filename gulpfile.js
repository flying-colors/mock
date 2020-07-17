const gulp = require("gulp");
const ejs = require('gulp-ejs')
const rename = require('gulp-rename')
const fs = require('fs');

// 監視　※gulp4の書き方です。
gulp.task( "default", function () {
    gulp.watch( "ejs/*.ejs", gulp.series( "ejs" ) ); // ejsディレクトリ以下の.ejsファイルの更新を監視
});

// EJS
gulp.task( "ejs", function () {
    // ページ生成用JSONファイルの読み込み
    var jsonData = require('./ejs/pages.json');
    // return gulp.src(["ejs/**/*.ejs", '!' + "ejs/**/_*.ejs"])
    //     .pipe(ejs(json,{}))
    //     .pipe(rename({ extname: '.html' }))
    //     .pipe( gulp.dest( "./" ) );

    //タスクをページ毎に設定、まとめて定義
    jsonData.pages.forEach(function (data, index) {
        //PC
        return gulp.src("./ejs/template.ejs")
           .pipe(ejs({
                data:{ //JSONデータをテンプレートファイルに渡す
                    name: data.page,//ページ名
                    title: data.title,//タイトル
                    imageSrc: data.imageSrc,//画像ファイル名
                }
            }))
            .pipe(rename(data.page+".html")) //出力ファイル名を指定
            .pipe(gulp.dest("./dist/")); //ファイル出力先を設定
    });
});
