import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'myworkspace-file-builder',
  templateUrl: './file-builder.component.html',
  styleUrls: ['./file-builder.component.css']
})


export class FileBuilderComponent implements OnInit {

  fileToCreate = "main.tf";
  resourceName=""
  resourceType=""
  resources = [];
  constructor() { }

  ngOnInit() {
  }

  onResourceNameKey(value: string){
    this.resourceName = value;
  }
  onResourceTypeKey(value: string){
    this.resourceType = value;
  }

  addResource() {
    var newTFR = new TFResource();
    newTFR.name = this.resourceName;
    newTFR.type = this.resourceType;
    this.resources.push(newTFR)
    console.log(this.resources)
  }


}

class TFResource {
  name = "";
  // namePrefix  = "";
  type = "";
  // subType = "";
  // policy = "";
  // role = "";
}

class TFProvider {

}