import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { update } from 'firebase/database';
import { addDoc, collection, doc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import { Game } from './models/game';
import { OnlineGame } from './models/online-game';



@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  app = initializeApp(environment.firebase)
  db: any = getFirestore(this.app);
  game: Game;
  onlineGame: OnlineGame;
  testStack: any = []

  constructor() { 
  }

  async pushGameToFirestore(id) {
    const collectionRef = collection(this.db,'games', id, 'stack');
    this.game.stack.forEach(async(card) => {
      const docRef = await addDoc(collectionRef, card)
    })
  }

  pickFirstCard() {
    this.onlineGame.lastCard = this.testStack[0];
    this.onlineGame.updateCurrentColor();
    console.log(this.onlineGame.lastCard)
}

  loadStackFromFirestore(id) {
    return new Promise<void>((resolve) => {
      onSnapshot(collection(this.db, 'games', id, 'stack'), async (snapshot) => {
        snapshot.docChanges().forEach( async (change) => {
          if (change.type == 'added') {
            this.testStack.push(change.doc.data());
            this.onlineGame.stack.push(change.doc.data());
          } else if (change.type == 'removed') {
            let cardToRemove = this.onlineGame.stack.findIndex(c => c.card == change.doc.data()['card']);
            this.testStack.splice(cardToRemove, 1)
          }
        })
        resolve()
      })
    })
  }
}
