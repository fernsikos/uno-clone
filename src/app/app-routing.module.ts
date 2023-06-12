import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameboardComponent } from './gameboard/gameboard.component';
import { StartScreenComponent } from './start-screen/start-screen.component';
import { ConfigGameComponent } from './config-game/config-game.component';

const routes: Routes = [
  {path:'', component: StartScreenComponent},
  {path:'game/:id/:player', component: GameboardComponent},
  {path:'config-game/:id/:player', component: ConfigGameComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
