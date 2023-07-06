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
  playerNumber:any;
  activeColor: string;
  drawCount: number = 1;
  public forceDraw: boolean;
  public colorWheelAnimation: boolean = false;
  public colorWheel: boolean = false;


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
    const indexOfFirstcard = this.pickFirstCard()
    if (!gameSnap.data()['firstcard']) {
      await updateDoc(doc(this.db, 'games', this.gameId), {
        firstcard: this.game.stack[indexOfFirstcard],
        lastCard: this.game.stack[indexOfFirstcard]
      })
      this.game.stack.splice(indexOfFirstcard, 1)
    }
  }

  pickFirstCard() {
    for (let i = 0; i < this.game.stack.length; i++) {
      const element = this.game.stack[i];
      if(!element['special']) {
        return i
      }
    }
    return -1
  }

  async pickInitialCards(myCards, playerNumber) {
    const playerRef = doc(this.db, 'games', this.gameId, 'player', playerNumber.toString());
    const myCardsCollectionRef = collection(playerRef, 'myCards')
    const myCardsSnap = await getDocs(myCardsCollectionRef)

    if (myCardsSnap.size > 0) {
      myCardsSnap.docs.forEach((doc) => {
        myCards.push(doc.data())
      })
    }
    else {
      for (let i = playerNumber * 7; i < playerNumber * 7 + 7; i++) {
        const element = this.onlineGame.stack[i];
        myCards.push(element);
        this.deleteCardFromStack(element.id)
      }
      this.pushMyCardsToFirestore(playerNumber.toString(), myCards)
    }
  }

  deleteCardFromMyCardsFirestore(id) {
    deleteDoc(doc(this.db, 'games', this.gameId, 'player', this.playerNumber, 'myCards', id))
  }

  loadStackFromFirestore() {
    return new Promise<void>((resolve) => {
      onSnapshot(collection(this.db, 'games', this.gameId, 'stack'), async (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type == 'added') {
            const dataWithId = { ...change.doc.data(), id: change.doc.id }
            this.onlineGame.stack.push(dataWithId);
          } else if (change.type == 'removed') {
            // console.log('delete incoming')
            let cardToRemove = this.onlineGame.stack.findIndex(c => c.card == change.doc.data()['card']);
            // console.log('card To Remove   ', cardToRemove, 'card that be found:  ' , this.onlineGame.stack[cardToRemove], 'stack länge :', this.onlineGame.stack.length)
            this.onlineGame.stack.splice(cardToRemove, 1)
            // console.log('stack länge ',this.onlineGame.stack.length)
          }
        })
        resolve()
      })
    })
  }

  deleteCardFromStack(cardId) {
    // console.log('stack' , cardId)
    deleteDoc(doc(this.db, 'games', this.gameId, 'stack', cardId))
  }

  async loadfFirstcard() {
    let firstcard = await getDoc(doc(this.db, 'games', this.gameId));
    this.onlineGame.firstCard = firstcard.data()['firstcard'];
  }

  async snapGameChanges() {
    onSnapshot(doc(this.db, 'games', this.gameId), async (snapshot) => {
      if(snapshot.data()['lastCard']) {
        this.onlineGame.lastCard = snapshot.data()['lastCard']
      }
      if(snapshot.data()['colorWheelAnimation']) {
        if(!this.colorWheel) {
          this.colorWheelAnimation = snapshot.data()['colorWheelAnimation']
        } 
      }
      if(!snapshot.data()['colorWheelAnimation']) {
        this.colorWheelAnimation = false
      }
      if(snapshot.data()['activeColor']) {
        this.activeColor = snapshot.data()['activeColor']
      }
      if(snapshot.data()['drawCount']) {
        this.drawCount = snapshot.data()['drawCount']
        console.log('new draw count ' + snapshot.data()['drawCount'])
      }
      if(snapshot.data()['forceDraw']) {
        this.forceDraw = snapshot.data()['forceDraw']
        console.log('force draw: ', this.forceDraw)
      } else this.forceDraw = false;
      // console.log('recieved change on game:',snapshot.data())
    })
    this.snapThrowedCards()
  }

  startColorWheelAnimation() {
    updateDoc(doc(this.db, 'games', this.gameId), {colorWheelAnimation: true})
  }

  stopColorWheelAnimation() {
    updateDoc(doc(this.db, 'games', this.gameId), {colorWheelAnimation: false})
  }

  setActiveColorFirestore(color) { 
    updateDoc(doc(this.db, 'games', this.gameId), {activeColor: color})
  }

  setForceDrawFirestore(state) {
    updateDoc(doc(this.db, 'games', this.gameId), {forceDraw: state})
  }

  updateDrawCountFirestore(count) {
    updateDoc(doc(this.db, 'games', this.gameId), {drawCount: count})
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

  pushPickedCardToMyCardsFirestore(card) {
    setDoc(doc(this.db,'games', this.gameId, 'player', this.playerNumber, 'myCards', card.id), card)
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
