import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { MRCDataLoader} from '../../lib/loaders/MRCLoader';

@Component({
  selector: 'app-top-renderer',
  templateUrl: './top-renderer.component.html',
  styleUrls: ['./top-renderer.component.css']
})
export class TopRendererComponent implements OnInit {

  private renderer3;
  private camera3;
  private dirLight = new THREE.DirectionalLight(0xffffff);
  private windowWidth;
  private windowHeight;
  private containerX;
  private sceneX;
  private sliceX;
  private twoHeight = 200;
  private twoWidth = 200;
  private view;
  private views;

  constructor() {
  }

  ngOnInit() {
    this.views = [
      {
        left: 0.6,
        bottom: 0.70,
        width: 0.3,
        height: 0.233,
        background: new THREE.Color().setRGB(0, 0, 0),
        eye: [-300, 0, 0],
        up: [0, 1, 0],
        fov: 60,

        updateCamera: function (camera3, sceneX) {
          camera3.lookAt(sceneX.position);
        }
      }
    ];


    this.dirLight = new THREE.DirectionalLight(0xffffff);
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.init();
    this.animate();
  }

  init() {
  
    
    this.view = this.views[0];
    this.camera3 = new THREE.PerspectiveCamera(this.view.fov, this.twoWidth / this.twoHeight, 0.01, 10000);
    // this.camera3.position = [this.view.eye[0] + 128, this.view.eye[1], this.view.eye[2]];
    this.camera3.position.x = this.view.eye[0]+128;
    this.camera3.position.y = this.view.eye[1];
    this.camera3.position.z = this.view.eye[2];
    //this.camera3.up = [this.view.up[0], this.view.up[1], this.view.up[2]];
    this.camera3.up.x = this.view.up[0];
    this.camera3.up.y = this.view.up[1];
    this.camera3.up.z = this.view.up[2];

    this.sceneX = new THREE.Scene();

    this.dirLight.position.set(200, 200, 1000).normalize();
    this.sceneX.add(this.dirLight);
    const manager = new THREE.LoadingManager();
    const loader = new MRCDataLoader(manager);

    console.log('Manager is ready');

    loader.load('models/mrc/bin8Data/avebin8.mrc', function (volume) {
      const geometry = new THREE.BoxGeometry(volume.xLength, volume.yLength, volume.zLength);
      const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
      const cubeX = new THREE.Mesh(geometry, material);
      cubeX.visible = false;
      const boxX = new THREE.BoxHelper(cubeX);
      this.sceneX.add(this.cubeX);
      
      // this.sliceX = volume.extractSlice('x', Math.floor(volume.RASDimensions[0] / 2));
      // this.sliceXCopy = volume.extractSlice('x', Math.floor(volume.RASDimensions[0]/2));
      // this.sceneX.add(this.sliceX.mesh);
      // console.log(this.sliceX);
    });

    this.renderer3 = new THREE.WebGLRenderer({alpha: true});
    this.containerX = document.createElement('containerX');
    document.body.appendChild(this.containerX);
    this.containerX.appendChild(this.renderer3.domElement);

  }

  animate() {
    this.setupRenderer();
    requestAnimationFrame(this.animate);

  }

  setupRenderer() {
    this.containerX = document.getElementById('containerX');
    this.renderer3.setPixelRatio(window.devicePixelRatio);
    this.renderer3.setSize(this.twoWidth, this.twoHeight);
    this.containerX.appendChild(this.renderer3.domElement);
    this.view = this.views[0];
    this.view.updateCamera(this.camera3, this.sceneX);
    this.camera3.aspect = this.twoWidth / this.twoHeight;
    this.camera3.lookAt(this.sceneX.position);
    this.renderer3.render(this.sceneX, this.camera3);

  }


}
