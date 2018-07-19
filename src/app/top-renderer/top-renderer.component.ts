import { Component, OnInit } from '@angular/core';
 import * as THREE from 'three';
 import {THREE.MRCLoader} from ("../../js/loaders/MRCLoader");

@Component({
  selector: 'app-top-renderer',
  templateUrl: './top-renderer.component.html',
  styleUrls: ['./top-renderer.component.css']
})
export class TopRendererComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    var renderer3, camera3, stats;
    var windowWidth, windowHeight;
    var containerX, sceneX;
    windowWidth  = window.innerWidth;
    windowHeight = window.innerHeight;
    var twoHight = 200;
    var twoWith = 200;
    var view;
    var views = [
      
      {
          left: 0.6,
          bottom: 0.70,
          width: 0.3,
          height: 0.233,
          background: new THREE.Color().setRGB( 0, 0, 0 ),
          eye: [-300, 0, 0],
          up: [ 0, 1, 0 ],
          fov: 60,

          updateCamera : function ( camera3, sceneX ) {
              camera3.lookAt(sceneX.position);
          }
  
      }
    ];
    init();
    animate();

    function init(){
      
      view = views[0];
      camera3 = new THREE.PerspectiveCamera(view.fov, twoWith / twoHight, 0.01, 10000);

      camera3.position.x = view.eye[0]+128;
      camera3.position.y = view.eye[1];
      camera3.position.z = view.eye[2];

      camera3.up.x = view.up[0];
      camera3.up.y = view.up[1];
      camera3.up.z = view.up[2];

      //views[0].camera3 = camera3;

      sceneX=new THREE.Scene();

      var dirLight = new THREE.DirectionalLight(0xffffff);
      dirLight.position.set(200, 200, 1000).normalize();
      sceneX.add(dirLight);

      
      var manager = new THREE.LoadingManager();
      var loader = new THREE.MRCLoader(manager);

      console.log("Manager is ready");

      loader.load("models/mrc/bin8Data/avebin8.mrc", function (volume) {

              //box helper to see the extend of the volume
      var geometry = new THREE.BoxGeometry(volume.xLength, volume.yLength, volume.zLength);
      var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
      
      var cubeX=new THREE.Mesh(geometry, material);
      
      cubeX.visible=false;
      var boxX = new THREE.BoxHelper(cubeX);
      sceneX.add(cubeX);
      });
      renderer3 = new THREE.WebGLRenderer({alpha: true});
      containerX= document.createElement('containerX');
      document.body.appendChild(containerX);
      containerX.appendChild( renderer3.domElement );
      
    };
    
    function animate() {
      setupRenderer3();
      requestAnimationFrame(animate);

    };
    function setupRenderer3(){
      containerX = document.getElementById('containerX');
      renderer3.setPixelRatio(window.devicePixelRatio);
      renderer3.setSize(twoWith, twoHight);
      containerX.appendChild(renderer3.domElement);
      view = views[0];
      //camera3= view.camera3;
      view.updateCamera (camera3, sceneX);
      camera3.aspect = twoWith / twoHight;
      //camera3.updateProjectionMatrix();
      //camera3.position.x=view.eye[0]+128;
      camera3.lookAt(sceneX.position);
      renderer3.render(sceneX, camera3);

  }
  }

}
