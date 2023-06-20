import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { update } from 'firebase/database';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import { Game } from './models/game';
import { OnlineGame } from './models/online-game';
import { Component, OnInit } from '@angular/core';




@Injectable({
  providedIn: 'root'
})
export class FirestoreService implements OnInit {

  app = initializeApp(environment.firebase)
  db: any = getFirestore(this.app);
  game: Game;
  gameId: string;
  onlineGame: OnlineGame;
  testStack: any = []

  constructor() {
  }

  ngOnInit() {
  }

  async pushGameToFirestore(id) {
    await this.pushFirstCardToFirestore(this.gameId);
    await this.pushStackToFirestore(this.gameId);

  }

  async pushStackToFirestore(id) {
    const collectionRef = collection(this.db, 'games', id, 'stack');

    try {
      const querySnapshot = await getDocs(collectionRef);
      if (querySnapshot.empty) {
        this.game.stack.forEach(async (card) => {
          await addDoc(collectionRef, card);
        });
      } else {
        console.log('Die Sammlung "stack" existiert bereits, keine neue karten Hinzugefügt');
      }
    } catch (error) {
      console.log('Fehler beim Überprüfen der Sammlung:', error);
    }
  }

  async pushMyCardsToFirestore(playerMe, myCards) {
    const collectionRef = collection(this.db, 'games', this.gameId, 'player', playerMe, 'initialCards')

    try {
      myCards.forEach(async card => {
        await addDoc(collectionRef, card);
      });
    } catch (error) {
      console.log('Fehler beim Überprüfen der Sammlung:', error);      
    }
    console.log('my Cards added to firestore')
  }


  async pushFirstCardToFirestore(id) {
    await setDoc(doc(this.db, 'games', this.gameId), {
      firstcard: this.game.stack[0]
    })
    this.game.stack.splice(0, 1)
  }




  loadStackFromFirestore(id) {
    return new Promise<void>((resolve) => {
      onSnapshot(collection(this.db, 'games', id, 'stack'), async (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type == 'added') {
            const dataWithId = { ...change.doc.data(), id: change.doc.id }
            this.onlineGame.stack.push(dataWithId);
          } else if (change.type == 'removed') {
            let cardToRemove = this.onlineGame.stack.findIndex(c => c.card == change.doc.data()['card']);
            this.onlineGame.stack.splice(cardToRemove, 1)
          }
        })
        resolve()
      })
    })
  }

  deleteCardFromStack(gameId, cardId) {
    deleteDoc(doc(this.db, 'games', gameId, 'stack', cardId))
  }

  async loadfFirstcard() {
    let firstcard = await getDoc(doc(this.db, 'games', this.gameId));
    this.onlineGame.firstCard = firstcard.data()['firstcard']
  }

  async handOutCards() {
    let players = await getDocs(collection(this.db, 'games', this.gameId, 'player'));
    console.log(players)
  }
}
