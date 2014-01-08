var fs = require('fs');
var base64_data = fs.readFileSync('Videos/motionpicture/motionpicture-35.jpg').toString('base64');
fs.writeFile("Pictures/mypic_base64.txt", base64_data, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 