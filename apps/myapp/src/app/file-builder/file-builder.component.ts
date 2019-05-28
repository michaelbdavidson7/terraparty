import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'myworkspace-file-builder',
  templateUrl: './file-builder.component.html',
  styleUrls: ['./file-builder.component.css']
})


export class FileBuilderComponent implements OnInit {

  fileToCreate = "main.tf.json.";
  resourceModel = new TFResource();
  variableModel = new TFVariable();
  //todo needs to allow object arrays
  showOutput = false;
  finalOutput = [];


  resourceTypesMeta = [{
    "id": 1,
    "type": "aws_instance",
    "properties": [{
      "key": "instance_type",
      "value": "",
      "dataType": "string"
    }, {
      "key": "ami",
      "value": "",
      "dataType": "string"
    }
    ]
  }, {
    "id": 2,
    "type": "aws_vpc",
    "properties": [{
      "key": "cidr_block",
      "value": "",
      "dataType": "string"
    },
    {
      "key": "enable_dns_hostnames",
      "value": "",
      "dataType": "bool"
    }, {
      "key": "enable_dns_support",
      "value": "",
      "dataType": "bool"
    }
      // ,{
      //   "key": "ami",
      //   "value": "",
      //   "dataType": "string"
      // }
    ]
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

  exportTF(){ 
    this.showOutput = true;
    this.finalOutput = [];
    // cycle through variables
    this.terraformTFVars.forEach((varr) => {
      let newVar = {"variable" : {}};
      newVar.variable[varr.key] = {"default": varr.value}

      this.finalOutput.push(newVar)
    });

    // cycle through resources
    this.mainTF.forEach((resource)=>{
      let newResource = {"resource":{}};
      newResource.resource[resource.type] = {};
      newResource.resource[resource.type][resource.name] = {};
      resource.properties.forEach((prop)=>{
        newResource.resource[resource.type][resource.name][prop.key] = prop.value;
      });

      this.finalOutput.push(newResource);
      
    });
  }

}

class TFVariable {
  key = "";
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
  // namePrefix  = "";
  // subType = "";
  // policy = "";
  // role = "";
}

class ResourceProperty {
  key: string;
  value: string;
  type: string;
}

class ResourceTypesMeta {
  type: string
}

class TFProvider {

}

