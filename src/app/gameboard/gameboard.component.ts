import { Component, OnInit } from '@angular/core';
import { Game } from '../models/game';
import { Rules } from '../models/rules';
import { OnlineGame } from '../models/online-game';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../firestore.service';
import { DocumentData, DocumentReference, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';


@Component({
  selector: 'app-gameboard',
  templateUrl: './gameboard.component.html',
  styleUrls: ['./gameboard.component.scss']
})
export class GameboardComponent implements OnInit {

  playerNumber: number;
  rules: Rules;
  toDrawcount: number = 1;
  app = initializeApp(environment.firebase)
  db: any = getFirestore(this.app)
  public pickCardAnimation: boolean = false;
  public cardInThrow: string;
  myCards: any[] = [];

  constructor(private route:ActivatedRoute, public firestoreService: FirestoreService) {
  }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.firestoreService.gameId = params['id'];
      this.playerNumber = params['player']
    })
    this.firestoreService.game = new Game(); //Eventuell nur player 1
    this.firestoreService.onlineGame = new OnlineGame();
    if (this.playerNumber == 1) {
      await this.firestoreService.pushGameToFirestore();
    } 
    await this.firestoreService.loadStackFromFirestore(this.firestoreService.gameId);
    await this.checkIfCardsLoaded(this.firestoreService);
    await this.firestoreService.loadfFirstcard();
    await this.firestoreService.snapGameChanges();
    this.rules = new Rules();
    this.pickInitialCards();
  }

 checkIfCardsLoaded(service) {
  return new Promise<void>((resolve) => {
    function check() {
      if (service.onlineGame.stack.length > 1) {
        resolve()
      } else {
        setTimeout(check, 500)
      }
    }
    check()
  })
 }

  async pickInitialCards() {
    const playerRef = doc(this.db, 'games', this.firestoreService.gameId, 'player', this.playerNumber.toString());
    const myCardsCollectionRef = collection(playerRef, 'myCards')
    const myCardsSnap = await getDocs(myCardsCollectionRef)

    if (myCardsSnap.size > 0) {
      myCardsSnap.docs.forEach((doc) => {
        this.myCards.push(doc.data())
      })
    }
    else {
      for (let i = this.playerNumber * 7; i < this.playerNumber * 7 + 7; i++) {
        const element = this.firestoreService.onlineGame.stack[i];
        this.myCards.push(element);
        this.firestoreService.deleteCardFromStack(this.firestoreService.gameId,element.id)
      }
      this.firestoreService.pushMyCardsToFirestore(this.playerNumber.toString(), this.myCards)
    }
    
  }

  pickCard() {
    this.pickCardAnimation = true;
    setTimeout(() => {
      this.pickCardAnimation = false;
      for (let i = 0; i < this.toDrawcount; i++) {
        this.myCards.push(this.firestoreService.game.stack[this.firestoreService.game.stack.length - 1]);
        this.firestoreService.game.stack.pop();
      }
      if(this.toDrawcount > 1) {
        this.toDrawcount = 1
      }
    }, 1500);
    
  }

  checkIfCardThrowable(i) {
    let returnData = this.rules.compareCards(this.myCards[i], this.firestoreService.onlineGame.lastCard)
    if(returnData['pass']) {
      this.updateGameVariables(returnData)
      this.throwCard(i);
      this.firestoreService.updateLastCard(this.myCards[i])
      // this.firestoreService.pushCardToThrowedCardsFirestore(this.myCards[i])
    }
  }

  updateGameVariables(returnData) {
    if(returnData['draw']) {
      if (this.toDrawcount > 1) {
        this.toDrawcount = this.toDrawcount + returnData['draw']
      } else
      this.toDrawcount = returnData.draw
    }
  }

  // updateLastCard(i) {
  //   this.firestoreService.onlineGame.lastCard = this.myCards[i]
  // }

  throwCard(i) {
    this.myCards[i].throw = true
    setTimeout(() => {
      this.firestoreService.onlineGame.throwedCards.push(this.myCards[i]);
      this.firestoreService.pushCardToThrowedCardsFirestore(this.myCards[i]);
      this.myCards.splice(i, 1);
    }, 500);
  }

}
// function getCollections(playerRef: DocumentReference<DocumentData>) {
//   throw new Error('Function not implemented.');
// }

