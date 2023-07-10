import { Component, OnInit } from '@angular/core';
import { Game } from '../models/game';
import { Rules } from '../models/rules';
import { OnlineGame } from '../models/online-game';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../firestore.service';
import { DocumentData, DocumentReference, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';
import { timeout } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';



@Component({
  selector: 'app-gameboard',
  templateUrl: './gameboard.component.html',
  animations: [
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      state('active', style({ opacity: 1 })),
      transition('void => active', animate('300ms ease-in')),
      transition('active => void', animate('300ms ease-out'))
    ])
  ],
  styleUrls: ['./gameboard.component.scss']
})
export class GameboardComponent implements OnInit {

  // playerNumber: number;
  rules: Rules;
  
  app = initializeApp(environment.firebase)
  db: any = getFirestore(this.app)
  myCards: any[] = [];
  public pickCardAnimation: boolean = false;
  public cardInThrow: string;
  public fadeOut: boolean = false;
 

  constructor(private route:ActivatedRoute, public firestoreService: FirestoreService) {
  }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.firestoreService.gameId = params['id'];
      this.firestoreService.playerNumber = parseInt(params['player'])
    })
    this.firestoreService.game = new Game(); //Eventuell nur player 1
    this.firestoreService.onlineGame = new OnlineGame();
    if (this.firestoreService.playerNumber == 1) {
      await this.firestoreService.pushGameToFirestore();
    } 
    await this.firestoreService.loadStackFromFirestore();
    await this.checkIfCardsLoaded(this.firestoreService);
    await this.firestoreService.loadfFirstcard();
    await this.firestoreService.snapGameChanges();
    // await this.firestoreService.snapThrowedCards()
    this.rules = new Rules();
    this.firestoreService.pickInitialCards(this.myCards, this.firestoreService.playerNumber);
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


  pickCard() {
    this.pickCardAnimation = true;
    setTimeout(() => {
      this.pickCardAnimation = false;
      for (let i = 0; i < this.firestoreService.drawCount; i++) {
        const cardToDelete = this.firestoreService.onlineGame.stack[i]
        this.myCards.push(cardToDelete);
        this.firestoreService.pushPickedCardToMyCardsFirestore(cardToDelete);
        this.firestoreService.deleteCardFromStack(cardToDelete['id'])
      }
      if(this.firestoreService.drawCount > 1) {
        this.firestoreService.drawCount = 1;
        this.firestoreService.updateDrawCountFirestore(this.firestoreService.drawCount)
        this.checkIfNeedExeption();
        this.firestoreService.setForceDrawFirestore(false)
      }
    }, 1500);
  }

  checkIfNeedExeption() {
    if(this.firestoreService.activeColor === 'none') {
      this.firestoreService.setActiveColorFirestore('exeption')
    }
  }

  checkIfMyTurn(i) {
    console.log('myTurncheck')
    console.log(this.firestoreService.activePlayer)
    console.log(this.firestoreService.playerNumber)
    if(this.firestoreService.activePlayer === this.firestoreService.playerNumber) {
      this.checkIfCardThrowable(i)
    }
  }

  checkIfCardThrowable(i) {
    let returnData = this.rules.compareCards(this.myCards[i], this.firestoreService.onlineGame.lastCard, this.firestoreService.activeColor, this.firestoreService.forceDraw)
    if(returnData['pass']) {
      if(!returnData['activateColorWheel']) {
        // this.updateGameVariables(returnData)
        this.updateDrawcount(returnData)
        this.throwCard(i);
        this.firestoreService.updateLastCard(this.myCards[i])
        this.checkIfExeptionNeedToReset(returnData)
      } else {
        this.updateDrawcount(returnData);
        this.showColorPalette(returnData, i);
        this.firestoreService.startColorWheelAnimation();
        this.firestoreService.updateLastCard(this.myCards[i])
        this.checkIfForceDrawIsSet(returnData)
      }
    }
  }

  checkIfForceDrawIsSet(returnData) {
    if(returnData['forceDraw']) {
      this.firestoreService.setForceDrawFirestore(true)
    }
  }

  checkIfExeptionNeedToReset(returnData) {
    if(returnData['resetExeption']) {
      this.firestoreService.setActiveColorFirestore('none')

    }
  }

  updateDrawcount(returnData) {
    if(returnData.draw) {
      let newDrawCount: number;
      if(this.firestoreService.drawCount === 1) {
        newDrawCount = returnData.draw
      } else {
        newDrawCount = this.firestoreService.drawCount + returnData.draw;
      }
      this.firestoreService.updateDrawCountFirestore(newDrawCount)
    }
  }

  throwCard(i) {
    this.myCards[i].throw = true
    setTimeout(() => {
      this.firestoreService.onlineGame.throwedCards.push(this.myCards[i]);
      this.myCards[i].throwNumber = this.firestoreService.onlineGame.throwedCards.length;
      this.firestoreService.pushCardToThrowedCardsFirestore(this.myCards[i]);
      this.firestoreService.deleteCardFromMyCardsFirestore(this.myCards[i].id);
      this.myCards.splice(i, 1);
      this.firestoreService.setActiveColorFirestore('none')
    }, 500);
  }

  showColorPalette(returnData, i) {
    this.firestoreService.colorWheel = true;
    this.throwCard(i);
    this.firestoreService.updateLastCard(this.myCards[i])
    // this.updateGameVariables(returnData)
  }

  chooseColor(color) {
    this.firestoreService.setActiveColorFirestore(color);
    this.firestoreService.colorWheel = false;
    this.firestoreService.stopColorWheelAnimation()
  }

}
// function getCollections(playerRef: DocumentReference<DocumentData>) {
//   throw new Error('Function not implemented.');
// }

