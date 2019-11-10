import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import json from '../import-fields-scripts/souped-provider-outputs/aws_resourcesOutputFile.json';
import providerSettings from '../import-fields-scripts/soupToGetTFDocsSettings.json';
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
  tmpResourceModelSelectedIndex = 0;
  modelFromSearch = {};
  tempOutputString = "Your output will go here";
  userSettings = {
    "showLongDescriptions": false
  }
  output = new TFOutput();
  
  // provider stuff
  selectedProvider = "aws";
  // providerList = [{ "displayName": "Google Cloud Platform", "providerShortName": "google" },
  // { "displayName": "AWS", "providerShortName": "aws" },
  // { "displayName": "Azure", "providerShortName": "azurerm" },
  // { "displayName": "F5 BIG-IP", "providerShortName": "bigip" },
  // { "displayName": "VMware vCloud Director", "providerShortName": "vcd" },
  // { "displayName": "Digital Ocean", "providerShortName": "do" }];
  providerList = providerSettings.providers;
  usedProviders = { "aws": true };


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

  importProvider(provider) {
    console.log('importProvider', provider);
    let location = '../import-fields-scripts/souped-provider-outputs/' + provider + '_resourcesOutputFile.json'

    if (this.providerList.map((x) => x.providerShortName).includes(provider)) {
      try {
        import('../import-fields-scripts/souped-provider-outputs/' + provider + '_resourcesOutputFile.json').then((z) => {
          console.log('successful import', typeof z, z)
          let arr = Object.keys(z.default).map(function (key) {
            // item.type = item.type.toString();
            z[key]['type'] = z[key]['type'].trim();
            return z[key];
          })
          let test = JSON.parse(JSON.stringify(arr));
          this.resourceTypesMeta = test;

          // Add it to the TF providers output list
          this.usedProviders[provider] = true;
          console.log(this.resourceTypesMeta, this.usedProviders)
        });
      } catch (e) {
        console.log('failed to import', e);
      }
    }
  }

  resourceTypeOnChange(i) {
    console.log('resourceTypeOnChange. i: ', i)
    this.model = {};
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
    this.output = new TFOutput()
    let variablesHash = {};
    let resourcesHash = {};

    // cyle through providers
    // EDIT - NOT SURE THIS IS NECESSSARY
    // Object.keys(this.usedProviders).forEach((providerShortName) => {
    //   this.output.provider.push(providerShortName);
    // });

    // cycle through variables
    if (this.terraformTFVars.length > 0) {
      this.output.variable = [];
      this.terraformTFVars.forEach((varr) => {
        let newVar = {};
        newVar[varr.name] = { "default": varr.value }

        this.output.variable.push(newVar);
      });
    }

    // cycle through resources
    if (this.mainTF.length > 0) {
      this.output.resource = [];
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

  openOutputModal(content) {
    this.exportTF()
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      // this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }



  resourceTypeTypeahead = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      // distinctUntilChanged(),
      map(term => term.length < 2 ? []
        : this.resourceTypesMeta.filter(v => v.type.trim().toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 20))
    )

  resourceTypeTypeaheadFormatter = function (x) {
    console.log('resourceTypeTypeaheadFormatter', x, x.type)
    if (!this.resourceModel) {
      console.log('no RM', this)
    } else {
      console.log(this.resourceModel)
    }
    return x.type;
  };

  setIndex = (event) => {
    console.log('SETINDEX', event)
    let desiredIndex = 0;
    let x = this.resourceTypesMeta.forEach(function (typeObj, index) {
      if (typeObj.id === event.item.id) {
        desiredIndex = index;
        return false;
      }
    });
    console.log(desiredIndex)
    this.resourceModel.selectedIndex = desiredIndex;
    return true
  }

  consoleLogger = (name) => {
    console.log('consoleLogger', name)
    return true
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

class TFOutput { 
  resource: any;
  variable?: any;
  provider?: any;
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

