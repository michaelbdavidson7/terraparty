import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'myworkspace-file-builder',
  templateUrl: './file-builder.component.html',
  styleUrls: ['./file-builder.component.css']
})


export class FileBuilderComponent implements OnInit {

  fileToCreate = "main.tf, variables.tf, and terraform.tfvars.";
  resourceModel = new TFResource();
  variableModel = new TFVariable();
  //todo needs to allow object arrays


  resourceTypesMeta = [{
    "type":"aws_instance",
    "properties": {
      "instance_type": "string",
      "ami": "string"
    }
  }]
  model = {};
  mainTF = [];
  variablesTF = [];
  terraformTFVars = [];

  constructor() { }

  ngOnInit() {
  }

  addVariable() {
    this.variablesTF.push({ "key": this.variableModel.key });
    this.terraformTFVars.push(this.variableModel);
    console.log(this.terraformTFVars);
    this.variableModel = new TFVariable();
  }

  addResource() {
    console.log(this.resourceModel)
    this.mainTF.push(this.resourceModel)
    console.log(this.mainTF)
    this.resourceModel = new TFResource();
  }


}

class TFVariable {
  key = "";
  value = "";
}

class TFResource {
  name: string;
  type: string;
  // namePrefix  = "";
  // subType = "";
  // policy = "";
  // role = "";
}

class TFProvider {

}

