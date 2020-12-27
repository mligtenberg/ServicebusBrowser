import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  {
    path: "",
    component: MainComponent
  },
  {
    path: "connections",
    loadChildren: () => import('./connections/connections-routing.module').then(m => m.ConnectionsRoutingModule)
  },
  {
    path: "messages",
    loadChildren: () =>  import('./messages/messages.module').then(m => m.MessagesModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
