import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'myworkspace-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  title = 'Terraparty';
  constructor() { }

  ngOnInit() {
  }

}
