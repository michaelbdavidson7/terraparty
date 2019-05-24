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
    },{
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
    this.resourceModel.type = this.resourceTypesMeta[this.resourceModel.selectedIndex].type;

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

  constructor() {
    // this.resourceTypesMeta = new ResourceTypesMeta()
  }
  name: string;
  resourceTypesMeta: ResourceTypesMeta;
  type: string;
  selectedIndex: number;
  // namePrefix  = "";
  // subType = "";
  // policy = "";
  // role = "";
}

class ResourceTypesMeta {
  type: string
}

class TFProvider {

}

