import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import json from '../import-fields-scripts/resourcesOutputFile3.json';
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
  userSettings = {
    "showLongDescriptions" : false
  }
  output = { "resource": [], "variable": [] }
  networkStarterKit = {
    "resource": [
      { "aws_vpc": { "my_vpc": { "cidr_block": "10.0.0.0/16" } } },
      {
        "aws_subnet": {
          "my_subnet1": { "cidr_block": "10.0.10.0/24", "vpc_id": "${aws_vpc.my_vpc.id}" },
          "my_subnet2": { "cidr_block": "10.0.11.0/24", "vpc_id": "${aws_vpc.my_vpc.id}" }
        }
      },
      {
        "aws_internet_gateway":
          { "my_internet_gateway": { "vpc_id": "${aws_vpc.my_vpc.id}" } }
      }, {
        "aws_route_table":
        {
          "my_route_table":
            { "cidr_block": "0.0.0.0/0", "gateway_id": "${aws_internet_gateway.my_internet_gateway.id}" }
        }
      }
    ],
    "variable": []
  }

  resourceTypesMeta = []
  model = {};
  mainTF = [];
  variablesTF = [];
  terraformTFVars = [];
  selectedValueOptions = []

  valueOptions = [{ "id": 1, "name": "value", "displayName": "Value" },
  { "id": 2, "name": "newVariable", "displayName": "New Variable" },
  { "id": 3, "name": "existingVariable", "displayName": "Existing Variable" },
  { "id": 4, "name": "existingResource", "displayName": "Existing Resource" }];

  constructor(private modalService: NgbModal) {
    // let myjson = json.sort((a,b) => (a.type > b.type) ? 1 : ((b.type > a.type) ? -1 : 0)); 
    let myjson = json.sort((a, b) => a.type.localeCompare(b.type))
    // let formattedJson = json.sort(function(a, b){return a.type > b.type;})
    this.resourceTypesMeta = myjson;
  }

  ngOnInit() {
  }

  resourceTypeOnChange(i) {
    console.log('resourceTypeOnChange. i: ', i)
    let mySelectedValueOptions = []
    this.resourceTypesMeta[i].properties.forEach(function (property) {
      // literally just adding one for each
      mySelectedValueOptions.push("value");
    })
    this.selectedValueOptions = mySelectedValueOptions;
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
    this.output = { "resource": [], "variable": [] }
    let variablesHash = {};
    let resourcesHash = {};

    // cycle through variables
    if (this.terraformTFVars.length > 0) {
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


  // open(content) {
  //   const modalRef = this.modalService.open(NgbdModalContent);
  //   modalRef.componentInstance.name = 'World';
  // }

  openOutputModal(content) {
    this.exportTF()
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      // this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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
  valueOptionType: string;
}

class ResourceTypesMeta {
  type: string
}

class TFProvider {

}

