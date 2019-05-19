import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'myworkspace-file-builder',
  templateUrl: './file-builder.component.html',
  styleUrls: ['./file-builder.component.css']
})


export class FileBuilderComponent implements OnInit {

  fileToCreate = "main.tf, variables.tf, and terraform.tfvars";
  resourceName = ""
  resourceType = ""
  variableInputKey = ""
  //todo needs to allow object arrays
  variableInputValue = ""
  mainTF = [];
  variablesTF = [];
  terraformTFVars = [];
  constructor() { }

  ngOnInit() {
  }

  onKey(value: string, varName: string) {
    this[varName] = value;
    console.log(this[varName], varName);
  }

  addVariable() {
    console.log('this.variableInputKey', this.variableInputKey)
    var newTFV = new TFVariable();
    newTFV.key = this.variableInputKey;
    newTFV.value = this.variableInputValue;
    this.variablesTF.push({ "key": newTFV.key });
    this.terraformTFVars.push(newTFV);
    console.log(this.terraformTFVars);
  }

  addResource() {
    var newTFR = new TFResource();
    newTFR.name = this.resourceName;
    newTFR.type = this.resourceType;
    this.mainTF.push(newTFR)
    console.log(this.mainTF)
  }


}

class TFVariable {
  key = "";
  value = "";
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