var baliseBoutonMarche;
var baliseBoutonArret;
var baliseCadre;
var baliseBoutonVitessePlus;
var baliseBoutonVitesseMoins;
var baliseBoutonObstacle;
var timer1;
var dillatation = 5
var fps = 1/60
var pi4eps0 = 8.854*10**(-12)*4*Math.PI;
var chargePlaque = 5*10**-6;
var dt = fps/dillatation ;// en secondes
var echelle = 200; // en pixels par mètre
var amorti = 0.96;
var boules = [];
var zone = { // en m
	xmin : 0,
	xmax : 4,
	ymin : 0,
	ymax : 2.2,
}
var xProche;
var yProche;
var xSouris;
var ySouris;
var obstacles = [];
var g = 9.80665 // m/s²
var champs = -1*10**5; // N/C

var setupEvents = function() {
	
    baliseBoutonMarche = document.getElementById("boutonMarche");
    baliseBoutonArret = document.getElementById("boutonArret");
    baliseBoutonBoule = document.getElementById("boutonBoule");
    baliseBoutonVitessePlus = document.getElementById("boutonVitessePlus");
	baliseBoutonVitesseMoins = document.getElementById("boutonVitesseMoins");
    baliseCadre = document.getElementById("cadre");
	baliseBoutonObstacle = document.getElementById("boutonObstacle");
	baliseBoutonMarche.addEventListener("click",lancerDeplacement);
	baliseCadre.addEventListener("click",coordonneesSouris);
	baliseBoutonArret.addEventListener("click",arreterDeplacement);
	baliseBoutonBoule.addEventListener("click",creerBoule);
	baliseBoutonVitessePlus.addEventListener("click",vitessePlus);
	baliseBoutonVitesseMoins.addEventListener("click",vitesseMoins);
	baliseBoutonObstacle.addEventListener("click",creerObstacle);
}

window.addEventListener("load", setupEvents);

var creerBoule = function(){
	var boule = { 
		x : 2,// en m
		y : 1.1,// en m
		Vx : .21,// en m/s
		Vy : .3,// en m/s
		rayon : 0.075,// en m
		masse : 0.100, // en kg
		q : 0, // en C
	}
	boule.div = creerBouleDiv(boule)
	boules.push(boule)
	baliseCadre.appendChild(boule.div)
}


var lancerDeplacement = function() {
    clearInterval(timer1); 
    timer1 = setInterval(deplaceTout,1000*fps); 

}

var arreterDeplacement = function() {  
    clearInterval(timer1);
}
 
var creerBouleDiv = function(boule){
	var div =document.createElement("div");
	div.style.backgroundColor = "chartreuse";
	div.style.width = boule.rayon*2*echelle+"px";
	div.style.height = boule.rayon*2*echelle+"px";
	div.style.position = "absolute";
	div.style.top = (boule.y-boule.rayon)*echelle + "px";
	div.style.left = (boule.x-boule.rayon)*echelle + "px";
	div.style.borderRadius = "50%";

	return(div)
}

var coordonneesSouris = function(event) {
	xSouris = (event.clientX/echelle)-0.045;
	ySouris = (event.clientY/echelle)-0.515;
	creerBouleSouris()
}

var creerBouleSouris = function(){
	var boule = { 
			x : xSouris,// en m
			y : ySouris,// en m
			Vx : .21,// en m/s
			Vy : .3,// en m/s
			rayon : 0.075,// en m
			masse : 0.100, // en kg
			q : 0, // en C
		}
	boule.div = creerBouleDiv(boule)
	boules.push(boule)
	baliseCadre.appendChild(boule.div)
}	

var creerObstacle= function() {
	var obstacle = {
		longueur : 0.4,
	}
	obstacle.xmin = Math.random()*(3.6-0)+0;
	obstacle.xmax = obstacle.xmin+obstacle.longueur;
	obstacle.ymin = Math.random()*(1.8-0)+0;
	obstacle.ymax = obstacle.ymin+obstacle.longueur;
	obstacle.div = creerObstacleDiv(obstacle)
	baliseCadre.appendChild(obstacle.div)
	obstacles.push(obstacle)
}

var creerObstacleDiv = function(obstacle){
	var div =document.createElement("div");
	div.style.backgroundColor = "yellow";
	div.style.width = obstacle.longueur*echelle+"px";
	div.style.height = obstacle.longueur*echelle+"px";
	div.style.position = "absolute";
	div.style.top = obstacle.ymin*echelle + "px";
	div.style.left = obstacle.xmin*echelle + "px";
	
	return(div)
}


var deplaceTout = function() {
	for (var k=0; k<boules.length;k=k+1){
		deplace(boules[k])
	}
	for (var i=0; i<boules.length;i=i+1){
		for (var j=i+1; j<boules.length;j=j+1){
			collision (boules[i],boules[j])
		}
	}
	changerCouleur()
}

var deplace = function(boule) {
    boule.x = boule.x + boule.Vx*dt
	boule.y = boule.y + boule.Vy*dt
	// Gestion des forces
	var TotalFx = 0
	var TotalFy = boule.masse*g+boule.q*champs
	for (var k=0; k<boules.length;k=k+1){
		if (boules[k]!=boule){
			var F = force(boule,boules[k])
			TotalFx = TotalFx + F.Fx
			TotalFy = TotalFy + F.Fy
		}
	}
	//Accélération
	var Ax = TotalFx/boule.masse
	var Ay = TotalFy/boule.masse
	boule.Vx = boule.Vx +Ax*dt
	boule.Vy = boule.Vy +Ay*dt
	for (var k=0; k<obstacles.length;k=k+1){
		collisionObstacle(boule,obstacles[k])
	}
	collisionBord(boule)
    boule.div.style.left=(boule.x-boule.rayon)*echelle+"px"; 
	boule.div.style.top=(boule.y-boule.rayon)*echelle+"px";
}

var vitessePlus = function (boule){
	dt=1.1*dt

}
var vitesseMoins = function (boule){
	dt = 0.9*dt
}

var collision = function(boule1,boule2) {
	var distance2 = (boule1.x-boule2.x)**2+(boule1.y-boule2.y)**2
	if((boule1.x-boule2.x)**2+(boule1.y-boule2.y)**2<(boule1.rayon+boule2.rayon)**2){
		var distance = Math.sqrt(distance2)
		var produitScalaire = ((boule2.Vx-boule1.Vx)*(boule2.x-boule1.x)+(boule2.Vy-boule1.Vy)*(boule2.y-boule1.y))
		if (produitScalaire<0){
			var nx = (boule2.x - boule1.x)/distance;
			var ny = (boule2.y- boule1.y)/distance;
			var bx = -ny;
			var by = nx;
		
			var v1n = nx*boule1.Vx + ny*boule1.Vy;
			var v1b = bx*boule1.Vx + by*boule1.Vy;
			var v2n = nx*boule2.Vx + ny*boule2.Vy;
			var v2b = bx*boule2.Vx + by*boule2.Vy;
		
			boule1.Vx=(nx*v2n + bx*v1b)*amorti;
			boule1.Vy=(ny*v2n + by*v1b)*amorti;
			boule2.Vx=(nx*v1n + nx*v2b)*amorti;
			boule2.Vy=(ny*v1n + ny*v2b)*amorti;
			
			var moyenne = (boule1.q + boule2.q) /2;
			boule1.q = moyenne;
			boule2.q = moyenne;
			
		}
	}	
}


	
var collisionBord = function(boule){
	if (boule.x+boule.rayon>zone.xmax){
		boule.x = 2*(zone.xmax-boule.rayon)-boule.x;
		boule.Vx = -boule.Vx *amorti;
	}
	if (boule.x-boule.rayon<zone.xmin){
		boule.x = 2*(zone.xmin+boule.rayon)-boule.x;
		boule.Vx = -boule.Vx *amorti;
	}
	if (boule.y+boule.rayon>zone.ymax){
		boule.y = 2*(zone.ymax-boule.rayon)-boule.y;
		boule.Vy = -boule.Vy *amorti;
		boule.q = chargePlaque;
	}	
	if (boule.y-boule.rayon<zone.ymin){
		boule.y = 2*(zone.ymin+boule.rayon)-boule.y;
		boule.Vy = -boule.Vy*amorti;
		boule.q = -chargePlaque;
	}
}
	
var force = function(boule1,boule2){
	var dx = boule1.x-boule2.x
	var dy = boule1.y-boule2.y
	var distance3 = (dx**2+dy**2)**(3/2)
	var K = (boule1.q*boule2.q)/(pi4eps0*distance3)
	var fx = K*dx;
	var fy = K*dy;
	return({Fx: fx,Fy: fy})
}

		
var changerCouleur = function(){
	for (var k=0; k<boules.length;k=k+1) {
		boules[k].div.style.backgroundColor = couleurCharge(boules[k].q)
	}
}
var couleurCharge = function(charge){
	if (charge>0){
		return("rgb(0,"+Math.min(255*charge/chargePlaque,255)+",0)")
	}
	else {
		return("rgb("+Math.min(-255*charge/chargePlaque,255)+",0,0)")
	}
}

var plusProche = function(xmin,xmax,x){
	if (x<=xmin){
		return xmin
	}
	else if (x>=xmax){
		return xmax
	}
	else{
		return x
	}
}
 

var collisionObstacle = function(boule,obstacle){
	var xProche = plusProche(obstacle.xmin,obstacle.xmax,boule.x)
	var yProche = plusProche(obstacle.ymin,obstacle.ymax,boule.y)
	var xBP = xProche-boule.x
	var yBP = yProche-boule.y
	var d2 = xBP**2+yBP**2
	if (d2<=boule.rayon**2){
		var alpha = (boule.Vx*xBP+boule.Vy*yBP)/d2
		if (alpha>0){
			boule.Vx = boule.Vx-2*alpha*xBP
			boule.Vy = boule.Vy-2*alpha*yBP
		}
	}
}