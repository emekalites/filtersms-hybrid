#!/usr/bin/env node
/**
 * After prepare, files are copied to the platforms/ios and platforms/android folders.
 * Lets clean up some of those files that arent needed with this hook.
 */
 var fs = require('fs');
 var path = require('path');


var deleteFolderRecursive = function(removePath) {
  if( fs.existsSync(removePath) ) {
    fs.readdirSync(removePath).forEach(function(file,index){
      var curPath = path.join(removePath, file);
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(removePath);
  }
};


var androidPlatformsDir_1 = path.resolve(__dirname, '../../platforms/android/assets/www/css');
var androidPlatformsDir_2 = path.resolve(__dirname, '../../platforms/android/assets/www/js');
 var androidPlatformsDir_3 = path.resolve(__dirname, '../../platforms/android/assets/www/lib');
var androidPlatformsDir_4 = path.resolve(__dirname, '../../platforms/android/assets/www/templates');


deleteFolderRecursive(androidPlatformsDir_1);
deleteFolderRecursive(androidPlatformsDir_2);
 deleteFolderRecursive(androidPlatformsDir_3);
deleteFolderRecursive(androidPlatformsDir_4);
