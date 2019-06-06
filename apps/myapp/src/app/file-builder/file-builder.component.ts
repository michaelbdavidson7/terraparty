import { Component, OnInit } from '@angular/core';
import json from  '../import-fields-scripts/resourcesOutputFile.json';
console.log(json.length)

@Component({   
  selector: 'myworkspace-file-builder',
  templateUrl: './file-builder.component.html',
  styleUrls: ['./file-builder.component.css']
})


export class FileBuilderComponent implements OnInit {

  resourceModel = new TFResource();
  variableModel = new TFVariable();
  //todo needs to allow object arrays
  showOutput = false;
  tempOutputString = "Your output will go here"; 
  output = { "resource": [], "variable":[] }


  resourceTypesMeta = [{
    "id": 1,
    "type": "aws_instance",
    "properties": [{
      "name": "instance_type",
      "value": "",
      "dataType": "string"
    }, {
      "name": "ami",
      "value": "",
      "dataType": "string"
    }
    ]
  }, {
    "id": 2,
    "type": "aws_vpc",
    "properties": [{
      "name": "cidr_block",
      "value": "",
      "dataType": "string"
    },
    {
      "name": "enable_dns_hostnames",
      "value": "",
      "dataType": "bool"
    }, {
      "name": "enable_dns_support",
      "value": "",
      "dataType": "bool"
    }
      // ,{
      //   "name": "ami",
      //   "value": "",
      //   "dataType": "string"
      // }
    ]
  }]
  model = {};
  mainTF = [];
  variablesTF = [];
  terraformTFVars = [];

  constructor() { 
  this.resourceTypesMeta = json;
}

  ngOnInit() {
  }

  addVariable() {
    this.variablesTF.push({ "name": this.variableModel.name });
    this.terraformTFVars.push(this.variableModel);
    console.log(this.terraformTFVars);
    this.variableModel = new TFVariable();
  }

  addResource() {
    // cleanup
    // console.log('IT SHOULD BE EMPTY -- ', this.resourceModel)
    this.resourceModel.type = this.resourceTypesMeta[this.resourceModel.selectedIndex].type;

    // reformat properties array, as a new deep copy
    let newPropertiesModel = JSON.parse(JSON.stringify(this.resourceTypesMeta[this.resourceModel.selectedIndex].properties));
    this.resourceModel.properties.forEach(function (prop, i) {
      newPropertiesModel[i].value = prop;
    });
    this.resourceModel.properties = newPropertiesModel;

    console.log(this.resourceModel)
    this.mainTF.push(this.resourceModel)
    console.log(this.mainTF)
    this.resourceModel = new TFResource();
    newPropertiesModel = [];
  }

  exportTF() {
    this.showOutput = true;
    // this.finalOutput = {};
    this.output = { "resource": [], "variable":[] }
    let variablesHash = {};
    let resourcesHash = {};

    // cycle through variables
    if(this.terraformTFVars.length > 0){
      this.terraformTFVars.forEach((varr) => {
        let newVar = {};
        newVar[varr.name] = { "default": varr.value }
  
        this.output.variable.push(newVar);
      });  
    }

    // cycle through resources
    if (this.mainTF.length > 0) {
      this.mainTF.forEach((resource) => {
        if (!resourcesHash[resource.type]) {
          resourcesHash[resource.type] = {};
        }
        resourcesHash[resource.type][resource.name] = {};
        resource.properties.forEach((property) => {
          resourcesHash[resource.type][resource.name][property.name] = property.value;
        });
      })

      console.log('resourcesHash', resourcesHash)
      Object.keys(resourcesHash).forEach((typeKey) => {
        let obj = {};
        obj[typeKey] = {};
        Object.keys(resourcesHash[typeKey]).forEach((nameKey) => {
          obj[typeKey][nameKey] = resourcesHash[typeKey][nameKey];
          console.log(obj)
        });

        this.output.resource.push(obj);
      })
    }
  }
}

class TFVariable {
  name = "";
  value = "";
}

class TFResource {

  constructor() {
    // this.properties = new Array();
    // this.resourceTypesMeta = new ResourceTypesMeta()
  }
  name: string;
  resourceTypesMeta: ResourceTypesMeta;
  type: string;
  selectedIndex: number;
  properties: ResourceProperty[] = [];
  docsUrl: string;
  // namePrefix  = "";
  // subType = "";
  // policy = "";
  // role = "";
}

class ResourceProperty {
  name: string;
  value: string;
  type: string;
}

class ResourceTypesMeta {
  type: string
}

class TFProvider {

}

