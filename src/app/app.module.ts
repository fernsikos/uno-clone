import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameboardComponent } from './gameboard/gameboard.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { StartScreenComponent } from './start-screen/start-screen.component';
import { ConfigGameComponent } from './config-game/config-game.component';
import { AngularFireModule } from '@angular/fire/compat';
import { FormsModule } from '@angular/forms';
import { WaitingroomComponent } from './waitingroom/waitingroom.component';


@NgModule({
  declarations: [
    AppComponent,
    GameboardComponent,
    StartScreenComponent,
    ConfigGameComponent,
    WaitingroomComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
