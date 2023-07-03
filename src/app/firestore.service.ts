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

  constructor() {
  }

  ngOnInit() {
  }

  async pushGameToFirestore() {
    await this.pushFirstCardToFirestore();
    await this.pushStackToFirestore();

  }

  async pushStackToFirestore() {
    const collectionRef = collection(this.db, 'games', this.gameId, 'stack');

    try {
      const querySnapshot = await getDocs(collectionRef);
      if (querySnapshot.empty) {
        this.game.stack.forEach(async (card) => {
          await addDoc(collectionRef, card);
        });
      } 
    } catch (error) {
      console.log('Fehler beim Überprüfen der Sammlung:', error);
    }
  }

  async pushMyCardsToFirestore(playerMe, myCards) {
    const collectionRef = collection(this.db, 'games', this.gameId, 'player', playerMe, 'myCards')

    try {
      myCards.forEach(async card => {
        const docRef = doc(collectionRef, card.id);
        await setDoc(docRef, card);
      });
    } catch (error) {
      console.log('Fehler beim Überprüfen der Sammlung:', error);
    }
    
  }


  /**
   * Checkes if the game already has a firstcard and pushes one if false
   */
  async pushFirstCardToFirestore() {
    const gameRef = doc(this.db, 'games', this.gameId)
    const gameSnap = await getDoc(gameRef)
    if (!gameSnap.data()['firstcard']) {
      await updateDoc(doc(this.db, 'games', this.gameId), {
        firstcard: this.game.stack[0],
        lastCard: this.game.stack[0]
      })
      this.game.stack.splice(0, 1)
    }
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
    this.onlineGame.firstCard = firstcard.data()['firstcard'];
    // this.onlineGame.lastCard = this.onlineGame.firstCard; /// auf snap umwandeln
    // this.onlineGame.updateCurrentColor();
  }

  async snapGameChanges() {
    onSnapshot(doc(this.db, 'games', this.gameId), async (snapshot) => {
      this.onlineGame.lastCard = snapshot.data()['lastCard']
      console.log('recieved change on game:',snapshot.data())
    })
    this.snapThrowedCards()
  }

  async handOutCards() {
    let players = await getDocs(collection(this.db, 'games', this.gameId, 'player'));
  }

  async updateLastCard(card) {
    await updateDoc(doc(this.db, 'games', this.gameId), {lastCard: card})
  }

  pushCardToThrowedCardsFirestore(card) {
    setDoc(doc(this.db, 'games', this.gameId, 'throwedCards', card.id), card)
  }

  async snapThrowedCards() {
    await onSnapshot(collection(this.db, 'games', this.gameId, 'throwedCards'), async (snapshot) => {
      snapshot.docs.forEach(async (doc) => {
        const cardAlreadyExists = this.onlineGame.throwedCards.some((card) => card.id === doc.data()['id']);
        if (!cardAlreadyExists) {
          this.onlineGame.throwedCards.push(doc.data())
        }
        // console.log('incoming throwed cards change:', doc.data())
      })
    })
  }
}
