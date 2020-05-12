
var canvas = document.getElementById('renderCanvas');
console.log(canvas)
// Load the 3D engine
var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
// CreateScene function that creates and return the scene

var createScene = function(){
    // Create a basic BJS Scene object

    var scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;
    // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
    var camera = new BABYLON.ArcRotateCamera("Camera", 1, 0.8, 10, new BABYLON.Vector3(0, 0, 0), scene);
    // Target the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());
    // Attach the camera to the canvas
    camera.attachControl(canvas, false);
    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
    var gravityVector = new BABYLON.Vector3(0,-9.81, 0);
    var physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);
    // Move the sphere upward 1/2 of its height
    var airplane = BABYLON.MeshBuilder.CreateBox("myBox", {height: 2, width: 4, depth: 7}, scene);
    // airplane.physicsImpostor = new BABYLON.PhysicsImpostor(airplane, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0.9 }, scene);
    airplane.checkCollisions=true;
    var airplaneLeft = Math.PI
    var airplaneDown = 0.5
    var airplaneHealth = 1000
    // var path3d = new BABYLON.Path3D(points);
    // var normals = path3d.getNormals();
    //Wheel Material 
	var wheelMaterial = new BABYLON.StandardMaterial("wheel_mat", scene);
    var wheelTexture = new BABYLON.Texture("http://i.imgur.com/ZUWbT6L.png", scene);
    wheelMaterial.diffuseTexture = wheelTexture;
    var timer = 0
    
    //Set color for wheel tread as black
    var faceColors=[];
    faceColors[1] = new BABYLON.Color3(0,0,0);
    
    //set texture for flat face of wheel 
    var faceUV =[];
    faceUV[0] = new BABYLON.Vector4(0,0,1,1);
    faceUV[2] = new BABYLON.Vector4(0,0,1,1);
    
    //create wheel front inside and apply material
    var wheelFI = BABYLON.MeshBuilder.CreateCylinder("wheelFI", {diameter: 3, height: 1, tessellation: 24, faceColors:faceColors}, scene);
        wheelFI.material = wheelMaterial;
        
    //rotate wheel so tread in xz plane  
    wheelFI.rotate(BABYLON.Axis.Z, Math.PI/2, BABYLON.Space.WORLD);
    wheelFI.parent = airplane;

    /*------------Create other Wheels as Instances, Parent and Position----------*/
    var wheelFO = wheelFI.createInstance("FO");
    wheelFO.parent = airplane;
    wheelFO.position = new BABYLON.Vector3(-2.5, -2, 2.8);
    
    var wheelRI = wheelFI.createInstance("RI");
    wheelRI.parent = airplane;
    wheelRI.position = new BABYLON.Vector3(2.5, -2, -2.8);
    
    var wheelRO = wheelFI.createInstance("RO");
    wheelRO.parent = airplane;
    wheelRO.position = new BABYLON.Vector3(2.5, -2, 2.8);
    
    wheelFI.position = new BABYLON.Vector3(-2.5, -2, -2.8);

    // create tower //

    var tower = BABYLON.MeshBuilder.CreateCylinder("tower", {diameter: 3, height: 1, tessellation: 10}, scene);
    tower.physicsImpostor = new BABYLON.PhysicsImpostor(tower, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0.9 }, scene);
    tower.checkCollisions=true;
    tower.parent = airplane
    tower.position = new BABYLON.Vector3(0, 2, 0);

    // create gun //

    var gun = BABYLON.MeshBuilder.CreateBox("myBox", {height: 0.5, width: 10, depth: 0.5}, scene);
    gun.parent = tower
    gun.position = new BABYLON.Vector3(4, 0, 0);

    // create bullet //

    var itarg = BABYLON.Mesh.CreateBox("targ", 1, scene);
    itarg.position.y = 0;
    itarg.position.x = 5;
    itarg.visibility = .1;
    itarg.parent = gun;
    var power = 100;

    var firebullet = function (power) {
        var bullet = BABYLON.MeshBuilder.CreateSphere("Bullet", { segments: 3, diameter: 1 }, scene);
        bullet.checkCollisions=true;
        bullet.position = itarg.getAbsolutePosition();
        bullet.physicsImpostor = new BABYLON.PhysicsImpostor(bullet, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0.1, friction: 0.5, restition: 0.3 }, scene);

        var dir = itarg.getAbsolutePosition().subtract(gun.getAbsolutePosition());
        bullet.physicsImpostor.applyImpulse(dir.scale(power), gun.getAbsolutePosition());
        bullet.life = 0
    
        
        window.setInterval(function(){
            if(bullet){
                if(bullet.intersectsMesh(tankTower,false)){
                    tankHealth -=10;
                    if (tankHealth < 0){
                        alert('Первый игрок проиграл')
                    }
                }
            }
         },10);
         window.setTimeout(function () { if (bullet) bullet.dispose();}, 2000);
        scene.onBeforeRenderObservable.add(bullet.step)   

    }

    var map = {}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";

    }));

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));


    var tank = BABYLON.MeshBuilder.CreateBox("myBox", {height: 2, width: 4, depth: 7}, scene);
    tank.checkCollisions=true;
    // tank.physicsImpostor = new BABYLON.PhysicsImpostor(tank, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0.9 }, scene);
    var tankLeft = Math.PI
    var tankDown = 0.5
    var tankHealth = 1000
    tank.position = new BABYLON.Vector3(10, 0, 10);

    var wheelFI = BABYLON.MeshBuilder.CreateCylinder("wheelFI", {diameter: 3, height: 1, tessellation: 24, faceColors:faceColors}, scene);
        wheelFI.material = wheelMaterial;
        
    //rotate wheel so tread in xz plane  
    wheelFI.rotate(BABYLON.Axis.Z, Math.PI/2, BABYLON.Space.WORLD);
    wheelFI.parent = tank;

    /*------------Create other Wheels as Instances, Parent and Position----------*/
    var wheelFO = wheelFI.createInstance("FO");
    wheelFO.parent = tank;
    wheelFO.position = new BABYLON.Vector3(-2.5, -2, 2.8);
    
    var wheelRI = wheelFI.createInstance("RI");
    wheelRI.parent = tank;
    wheelRI.position = new BABYLON.Vector3(2.5, -2, -2.8);
    
    var wheelRO = wheelFI.createInstance("RO");
    wheelRO.parent = tank;
    wheelRO.position = new BABYLON.Vector3(2.5, -2, 2.8);
    
    wheelFI.position = new BABYLON.Vector3(-2.5, -2, -2.8);

    // create tankTower//

    var tankTower= BABYLON.MeshBuilder.CreateCylinder("tankTower", {diameter: 3, height: 1, tessellation: 10}, scene);
    tankTower.checkCollisions=true;
    tankTower.physicsImpostor = new BABYLON.PhysicsImpostor(tankTower, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0.9 }, scene);
    tankTower.parent = tank
    tankTower.position = new BABYLON.Vector3(0, 2, 0);

    // create gun //

    var gunTank = BABYLON.MeshBuilder.CreateBox("myBox", {height: 0.5, width: 10, depth: 0.5}, scene);
    gunTank.parent = tankTower
    gunTank.position = new BABYLON.Vector3(4, 0, 0);

    // create bullet //

    var itargTank = BABYLON.Mesh.CreateBox("targ", 1, scene);
    itargTank.position.y = 0;
    itargTank.position.x = 5;
    itargTank.visibility = .1;
    itargTank.parent = gunTank;
    var power = 4;

    var firebullet2 = function (power) {
        var bullet = BABYLON.MeshBuilder.CreateSphere("Bullet", { segments: 3, diameter: 1 }, scene);
        bullet.checkCollisions=true;
        bullet.position = itargTank.getAbsolutePosition();
        bullet.physicsImpostor = new BABYLON.PhysicsImpostor(bullet, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0.1, friction: 0.5, restition: 0.3 }, scene);

        var dir = itargTank.getAbsolutePosition().subtract(gunTank.getAbsolutePosition());
        bullet.physicsImpostor.applyImpulse(dir.scale(power), gunTank.getAbsolutePosition());
        bullet.life = 0
        

        
        window.setInterval(function(){
            if(bullet){
                if(bullet.intersectsMesh(tower,false)){

                    airplaneHealth -=10;

                    if (airplaneHealth < 0){
                        alert('Второй игрок проиграл')
                    }
                }
            }
         },10);
         window.setTimeout(function () { if (bullet) bullet.dispose();}, 2000);
            
 
        scene.onBeforeRenderObservable.add(bullet.step)   

    }

    var map = {}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";

    }));

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));

    scene.registerAfterRender(function () {
        // timer++

        
        if ((map["8"] || map["8"])) {
            var x =tankDown*parseFloat(Math.sin(tank.rotation.y)) ;
            var z =tankDown*parseFloat(Math.cos(tank.rotation.y)) ;
            var forwards = new BABYLON.Vector3(x, 0, z);
            tank.moveWithCollisions(forwards);
        };
        if ((map["5"] || map["5"])) {
            var x =tankDown*parseFloat(Math.sin(tank.rotation.y)) ;
            var z =tankDown*parseFloat(Math.cos(tank.rotation.y)) ;
            var backwards = new BABYLON.Vector3(-x, 0, -z);
            tank.moveWithCollisions(backwards);
        };

        if ((map["4"] || map["4"])) {
            // tank.position.x -= 0.1;

            tank.addRotation(0,-0.05,0);
            // tank.setPositionWithLocalVector(new BABYLON.Vector3(tank.position.x,0,tank.down));
        };

        if ((map["6"] || map["6"])) {

            tank.addRotation(0,0.05,0);
        };
        if ((map["7"] || map["7"])) {

            tankTower.addRotation(0,-0.01,0);
        };
        if ((map["9"] || map["9"])) {

            tankTower.addRotation(0,0.01,0);
            // gun.addRotation(0.05,0,0);
        };
        if ((map["0"] || map["0"])) {
            // if(timer % 1 ==0){
                
            // }
            firebullet2(power)
            
        };
        if ((map["w"] || map["W"])) {
            var x =airplaneDown*parseFloat(Math.sin(airplane.rotation.y)) ;
            var z =airplaneDown*parseFloat(Math.cos(airplane.rotation.y)) ;
            var forwards = new BABYLON.Vector3(x, 0, z);
            airplane.moveWithCollisions(forwards);
        };
        if ((map["s"] || map["S"])) {
            var x =airplaneDown*parseFloat(Math.sin(airplane.rotation.y)) ;
            var z =airplaneDown*parseFloat(Math.cos(airplane.rotation.y)) ;
            var backwards = new BABYLON.Vector3(-x, 0, -z);
            airplane.moveWithCollisions(backwards);
        };

        if ((map["a"] || map["A"])) {
            // airplane.position.x -= 0.1;

            airplane.addRotation(0,-0.05,0);
            // airplane.setPositionWithLocalVector(new BABYLON.Vector3(airplane.position.x,0,airplane.down));
        };

        if ((map["d"] || map["D"])) {

            airplane.addRotation(0,0.05,0);
        };
        if ((map["q"] || map["Q"])) {

            tower.addRotation(0,-0.01,0);
        };
        if ((map["e"] || map["E"])) {

            tower.addRotation(0,0.01,0);
            // gun.addRotation(0.05,0,0);
        };
        if ((map["g"] || map["G"])) {
            // if(timer % 1 ==0){
                
            // }
            firebullet(power)
        };
        

    });
    // Create a built-in "ground" shape; its constructor takes 6 params : name, width, height, subdivision, scene, updatable
    var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene, false);
    // rotate tower
    // scene.onPointerObservable.add(function () {
    //     var curentMousePosition = new BABYLON.Vector3(scene.pointerX, scene.pointerY, 0);

    //     var vectorX = Math.sqrt(Math.pow(curentMousePosition.x,2)+Math.pow(curentMousePosition.y,2))

    //     tower.rotation = new BABYLON.Vector3(0,vectorX/100,0);
    //     // tower.addRotation(0,parseFloat(Math.sin(scene.pointerX)),0)
    //     // scene.pointerX, scene.pointerY
    // })

    // Return the created scene
    return scene;
}
// call the createScene function
var scene = createScene();
// run the render loop
engine.runRenderLoop(function(){
    scene.render();
});
// the canvas/window resize event handler
window.addEventListener('resize', function(){
    engine.resize();
});