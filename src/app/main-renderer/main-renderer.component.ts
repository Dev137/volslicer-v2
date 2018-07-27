import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-renderer',
  templateUrl: './main-renderer.component.html',
  styleUrls: ['./main-renderer.component.css']
})
export class MainRendererComponent implements OnInit {
  afuConfig = {
    multiple: false,
    formatsAllowed: ".mrc",
    maxSize: "10",
    uploadAPI:  {
      url:"https://example-file-upload-api",
      headers: {
     "Content-Type" : "text/plain;charset=UTF-8",
      }
    },
    theme: "dragNDrop",
    hideProgressBar: true,
    hideResetBtn: true,
    hideSelectBtn: true
};
  constructor() { }

  ngOnInit() {
  }

}
