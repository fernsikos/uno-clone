import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, doc, getFirestore } from 'firebase/firestore';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent {
  app = initializeApp(environment.firebase);
  db: any = getFirestore(this.app)

  constructor(private router: Router) {}

  async startGame() {
    const collectionRef = collection(this.db, 'games');
    const data = {gameStarted: false}
    const docData = await addDoc(collectionRef, data)
    this.router.navigateByUrl('/config-game/'+ docData.id)
  }
}
