class Point{

    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class BezierCurve{
    
    constructor(color){

        this.points = [];
        this.aprPoints = [];
        this.color = color;
        this.start = 0;
    }

    addPoint(p){
        this.points.push(p);
    }

    toString(){
        var str = "(";
        for(var i = 0; i < this.points.length; i++){
            if(i != 0){
                str += ",";
            }
            str += this.points[i];
        }

        return str + ")";
    }

    getColor(){
        return this.color;
    }

    setColor(color){
        this.color = color;
    }

    size(){
        return this.points.length;
    }

    resetStart(){
        this.start = 0;
    }

    matrixProduct(m1, m2){

        var result = [];
        for(var i = 0; i < m1.length; i++){
          
            var line = [];
            for(var j = 0; j < m2[0].length; j++){
            var asd = 0;
                for(var k = 0; k < m1[0].length; k++){
                    asd += m1[i][k] * m2[k][j];
                }
                line.push(asd);
            }
            result.push(line);
        }
        return result;
    }

    calculatePoints(){

        if(this.size() >= 4 && this.size() % 3 == 1){

            this.aprPoints = [];

            var bernsteinMatrix = [
                [1, -3, 3, -1],
                [0, 3, -6, 3],
                [0, 0, 3, -3],
                [0, 0, 0, 1]
            ];

            var step = 0;

            for(var i = 0; i < (this.size() - 1) / 3; i++){
                var pointVectors = [
                    [],
                    []
                ];
                
                if(i != 0){step += 1}

                for(var j = i * 3; j < (i + 1) * 4 - step; j++){
                    pointVectors[0].push(this.points[j].x);
                    pointVectors[1].push(this.points[j].y);
                }

                var master = this.matrixProduct(pointVectors, bernsteinMatrix);
                    
                for(var t = 0; t <= 1; t += 0.002){
                    var newPointVector = this.matrixProduct(master, [
                        [1], 
                        [t], 
                        [t * t],
                        [t * t * t]]);
                    var newPoint = new Point(newPointVector[0][0], newPointVector[1][0]);
                    this.aprPoints.push(newPoint);
                }
            }
        }
    }

    concatenate(){
        if(this.size() >= 7 && this.size() % 3 == 1){

            var newX = (this.points[this.size() - 3].x + this.points[this.size() - 5].x) / 2;
            var newY = (this.points[this.size() - 3].y + this.points[this.size() - 5].y) / 2;

            this.points[this.size() - 4].x = newX;
            this.points[this.size() - 4].y = newY;

            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    drawPoints(){
        for(var i = 0; i < this.size(); i++){

            if(i % 3 == 0){
                
                context.beginPath();
                context.rect(this.points[i].x - 5, this.points[i].y - 5, 10, 10);
                context.fillStyle = this.color;
                context.fill();

            } else{
                
                context.beginPath();
                context.arc(this.points[i].x, this.points[i].y, 5, 0, 2*Math.PI);
                context.fillStyle = this.color;
                context.fill();
            }
        }
    }

    drawCurve(){

        if(this.size() >= 4 && this.size() % 3 == 1){

            for(var j = 0; j < this.aprPoints.length; j++){

                context.beginPath();
                context.arc(this.aprPoints[j].x, this.aprPoints[j].y, 2, 0, 2*Math.PI);
                context.fillStyle = this.color;
                context.fill();
            }

            //context.lineTo(this.points[this.size() - 1].x, this.points[this.size() - 1].y)
            //context.strokeStyle = this.color;
            //context.stroke();
        }
    }
}

class CurveManager{

    constructor(){
        this.curves = [];
    }

    addCurve(c){
        this.curves.push(c);
    }

    toString(){
        var str = "(";
        for(var i = 0; i < this.curves.length; i++){
            if(i != 0){
                str += ",";
            }
            str += this.curves[i];
        }

        return str + ")";
    }

    size(){
        return this.curves.length;
    }

    drawCurves(){
        
        for(var i = 0; i < this.size(); i++){

            this.curves[i].drawPoints();
            this.curves[i].drawCurve();
        }
    }
}

var curveManager = new CurveManager();

var currentCurve;

var canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

canvas.addEventListener('dblclick', function(event) {

    if(currentCurve != null){

        var mousePos = getMousePos(canvas, event);
        createPoint(mousePos.x, mousePos.y, context);
        
        
        curveManager.curves[currentCurve].concatenate();
       
        curveManager.curves[currentCurve].calculatePoints();
        curveManager.drawCurves();
    }
   
}, false);

var colorArray = ["#FF0000", "#E33535", "#E38435", "#FF9200", "#E3B635", "#0A821F", "#3E625A", 
                  "#97E335", "#43E335", "#35E3D2", "#359BE3", "#3561E3", "#4B35E3", "#9535E3", 
                  "#DE35E3", "#000000"];
            
function createCurve(){

    var color = colorArray[event.srcElement.id.split("_")[1]];
    curveManager.addCurve(new BezierCurve(color));

    currentCurve = curveManager.size() - 1;

    var curveDropdown = document.createElement("div");
    curveDropdown.className = "dropdown";
                
    var curveListItem = document.createElement("div");
    curveListItem.id = curveManager.size() - 1;
    curveListItem.className = "cm_item";
    curveListItem.onclick = selectCurve;
    curveListItem.style.backgroundColor = color;
    curveListItem.style.marginBottom = "5px";
    curveListItem.style.boxShadow = "5px 5px 5px #888888";
    curveListItem.style.borderWidth = "2px";
    curveListItem.style.borderStyle = "solid";
    curveListItem.style.borderColor = color;

    var curveName = document.createTextNode("Curve " + curveManager.size());
    curveListItem.appendChild(curveName);
                
    var optionsMenu = document.createElement("div");
    optionsMenu.className = "options";
    optionsMenu.style.padding = "5px";

    var colorChange = document.createElement("div");
    colorChange.className = "change_color";
    colorChange.onclick = changeColor;
    colorChange.id = "cc_" + currentCurve;
                
    var colorChangeText = document.createTextNode("Change color");
    colorChange.appendChild(colorChangeText);
    optionsMenu.appendChild(colorChange);
    curveDropdown.appendChild(curveListItem);
    curveDropdown.appendChild(optionsMenu);
    
    document.getElementById("curveList").appendChild(curveDropdown);

    markSelectedCurve();
}

function createPoint(x, y){

    curveManager.curves[currentCurve].addPoint(new Point(x, y));       
}

function changeColor(){
    
    var randomColor = colorArray[Math.floor(Math.random() * colorArray.length)];
    var curveID = event.srcElement.id.split("_")[1];
    curveManager.curves[curveID].setColor(randomColor);
    var changedItem = document.getElementById(curveID);
    changedItem.style.backgroundColor = randomColor;
    if(curveID != currentCurve){
        changedItem.style.borderColor = randomColor;
    } else{
        changedItem.style.borderColor = "#000000";
    }

    curveManager.curves[curveID].drawPoints();
    curveManager.curves[curveID].drawCurve();
}

function selectCurve(){
    currentCurve = event.srcElement.id;
    markSelectedCurve();
}

function markSelectedCurve(){
    for(var i = 0; i < curveManager.size(); i++){
        if(i != currentCurve){
            document.getElementById(i).style.borderColor = curveManager.curves[i].getColor();
        } else{
            document.getElementById(i).style.borderColor = "#000000";
        }
    }
}

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function createColorPicker(){
    var cPicker = document.getElementById("color_picker");
    var table = document.createElement("table");
    cPicker.appendChild(table)
    for(var i = 0; i < colorArray.length; i++){
        var row;
        if(i % 4 == 0){
            row = document.createElement("tr");
            table.appendChild(row);
        }
        var data = document.createElement("td");
        data.style.backgroundColor = colorArray[i];
        data.id = "c_" + i;
        data.onclick = createCurve;
        row.appendChild(data);
    }
}