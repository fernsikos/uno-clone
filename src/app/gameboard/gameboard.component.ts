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
    ]),
    trigger('slide-UNO-Calls', [
      state('void', style({ left: -150 })),
      state('active', style({ left: 0 })),
      transition('void => active', animate('800ms ease-in-out')),
      transition('active => void', animate('800ms ease-in-out'))
    ]),
    trigger('slide-margin-left', [
      state('void', style({ marginLeft: 0 })),
      state('active', style({ marginLeft: 148 })),
      transition('void => active', animate('800ms ease-in-out')),
      transition('active => void', animate('800ms ease-in-out'))
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
    await this.firestoreService.loadPlayers();
    await this.firestoreService.loadStackFromFirestore();
    await this.checkIfCardsLoaded(this.firestoreService);
    await this.firestoreService.loadfFirstcard();
    await this.firestoreService.snapGameChanges();
    await this.firestoreService.snapUnoCalls();
    await this.firestoreService.snapLateCalls()
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


  pickCard(exeption) {
    if (this.firestoreService.activePlayer === this.firestoreService.playerNumber || exeption) {
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
          this.firestoreService.setForceDrawFirestore(false);
          this.setNextPlayer(0)
        } else this.activateTimeBar()

      }, 1500);
    } else console.log('not my Turn')
  }

  activateTimeBar() {
    this.firestoreService.timebar = true;
    setTimeout(() => {
      if (this.firestoreService.timebar) {
        this.firestoreService.timebar = false
        this.setNextPlayer(0)
      }
    }, 5000);

  }

  checkIfMyTurn(i) {
    if(this.firestoreService.activePlayer === this.firestoreService.playerNumber) {
      this.checkIfCardThrowable(i)
    } else console.log('not my turn')
  }

  checkIfCardThrowable(i) {
    let returnData = this.rules.compareCards(this.myCards[i], this.firestoreService.onlineGame.lastCard, this.firestoreService.activeColor, this.firestoreService.forceDraw, this.firestoreService.activePlayer)
    if(returnData['pass']) {
      this.updateDrawcount(returnData)
      this.updateGameDirection(returnData)
      this.firestoreService.updateLastCard(this.myCards[i])
      this.checkWhoIsNextPlayer(returnData);
      if(!returnData['activateColorWheel']) {
        this.throwCard(i);
        this.checkIfExeptionNeedToReset(returnData)
      } else {
        this.showColorPalette(returnData, i);
        this.firestoreService.startColorWheelAnimation();
        this.checkIfForceDrawIsSet(returnData)
      }
    }
  }

  updateGameDirection(returnData) {
    if(returnData.reverse) {
      if(this.firestoreService.onlineGame.gameDirection === 'clockwise') {
        this.firestoreService.updateGameDirectionFirestore('anticlockwise')
      } else this.firestoreService.updateGameDirectionFirestore('clockwise')
    }
  }

  checkWhoIsNextPlayer(returnData) {
    let skipCount: number = 0;
    if(returnData.skip) {
      skipCount = 1;
      this.checkIfNeedExeption();
    };
    this.setNextPlayer(skipCount)
  }

  setNextPlayer(skipCount) {
    let nextPlayer: number;
    if(this.firestoreService.onlineGame.gameDirection = 'clockwise') {
      nextPlayer = (this.firestoreService.activePlayer + 1 + skipCount) % this.firestoreService.onlineGame.totalPlayer || this.firestoreService.onlineGame.totalPlayer
    } else {nextPlayer = (this.firestoreService.activePlayer - 1 - skipCount) % this.firestoreService.onlineGame.totalPlayer || this.firestoreService.onlineGame.totalPlayer
    }
    this.firestoreService.updateActivePlayerFirestore(nextPlayer)
  }

  checkIfForceDrawIsSet(returnData) {
    if(returnData['forceDraw']) {
      this.firestoreService.setForceDrawFirestore(true)
    }
  }

  checkIfNeedExeption() {
    if(this.firestoreService.activeColor === 'none' ) {
      this.firestoreService.setActiveColorFirestore('exeption')
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
    this.myCards[i].throw = true;
    this.firestoreService.timebar = false;
    setTimeout(() => {
      this.firestoreService.onlineGame.throwedCards.push(this.myCards[i]);
      this.myCards[i].throwNumber = this.firestoreService.onlineGame.throwedCards.length;
      this.firestoreService.pushCardToThrowedCardsFirestore(this.myCards[i]);
      this.firestoreService.deleteCardFromMyCardsFirestore(this.myCards[i].id);
      this.removeCardFromMyCard(i);
      if(this.firestoreService.onlineGame.lastCard['special'] !== 'skip') {
        this.firestoreService.setActiveColorFirestore('none')
      }
    }, 500);
  }

  removeCardFromMyCard(i) {
    this.myCards.splice(i,1);
    if(this.myCards.length < 2) {
      this.firestoreService.addLatecallFirestore();
      setTimeout(() => {
        this.pickCard(true)
      }, 2000);
      setTimeout(() => {
        this.firestoreService.deleteLatecallFirestore()
      }, 5000);
    }
  }

  showColorPalette(returnData, i) {
    this.firestoreService.colorWheel = true;
    this.throwCard(i);
    this.firestoreService.updateLastCard(this.myCards[i])
  }

  chooseColor(color) {
    this.firestoreService.setActiveColorFirestore(color);
    this.firestoreService.colorWheel = false;
    this.firestoreService.stopColorWheelAnimation()
  }

  callUno() {
    let validCall = true;
    let alreadyCalledUno = this.firestoreService.onlineGame.unoCalls.some((player) => player['name'] == this.firestoreService.myName)
    if(!alreadyCalledUno) {
      this.firestoreService.updateCallOutUnoOnFirestore(validCall)
      console.log('calledUno')
      // this.checkIfUnoCallWasValid()
    }
  }

  checkIfUnoCallWasValid() {
    if(this.myCards.length>1) {
      setTimeout(() => {
        this.firestoreService.updateCallOutUnoOnFirestore(false)
      }, 2000);
      setTimeout(() => {
        this.firestoreService.deleteUnoCallOutFirestore(this.firestoreService.myName)
      }, 5000);
    }
  }

  

}
// function getCollections(playerRef: DocumentReference<DocumentData>) {
//   throw new Error('Function not implemented.');
// }

