import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here


import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { FileBuilderComponent } from './file-builder/file-builder.component';
import { HowToComponent } from './how-to/how-to.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


const appRoutes: Routes = [
  { path: 'filebuilder', component: FileBuilderComponent },

  { path: 'homepage', component: HomepageComponent, data: {} },
  { path: 'howto', component: HowToComponent, data: {} },
  { path: '', component: FileBuilderComponent, data: {} },

  { path: '**', component: PagenotfoundComponent }
]

@NgModule({
  declarations: [AppComponent, HomepageComponent, PagenotfoundComponent, FileBuilderComponent, HowToComponent],
  imports: [
    NgbModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
