var express = require('express');

var app = express();

app.listen(3000,function(){
    console.log("App started in port 3000");
});

app.use(express.static('./dist'));