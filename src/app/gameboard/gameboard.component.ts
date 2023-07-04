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
  toDrawcount: number = 1;
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
      this.firestoreService.playerNumber = params['player']
    })
    this.firestoreService.game = new Game(); //Eventuell nur player 1
    this.firestoreService.onlineGame = new OnlineGame();
    if (this.firestoreService.playerNumber == 1) {
      await this.firestoreService.pushGameToFirestore();
    } 
    await this.firestoreService.loadStackFromFirestore(this.firestoreService.gameId);
    await this.checkIfCardsLoaded(this.firestoreService);
    await this.firestoreService.loadfFirstcard();
    await this.firestoreService.snapGameChanges();
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
      for (let i = 0; i < this.toDrawcount; i++) {
        this.myCards.push(this.firestoreService.onlineGame.stack[this.firestoreService.onlineGame.stack.length - 1]);
        console.log(this.firestoreService.onlineGame.stack[this.firestoreService.onlineGame.stack.length - 1])
        this.firestoreService.onlineGame.stack.pop();
      }
      if(this.toDrawcount > 1) {
        this.toDrawcount = 1
      }
    }, 1500);
    
  }

  checkIfCardThrowable(i) {
    let returnData = this.rules.compareCards(this.myCards[i], this.firestoreService.onlineGame.lastCard)
    if(returnData['pass']) {
      if(!returnData['activateColorWheel']) {
        this.updateGameVariables(returnData)
        this.throwCard(i);
        this.firestoreService.updateLastCard(this.myCards[i])
      } else {
        this.showColorPalette(returnData, i);
        this.firestoreService.startColorWheelAnimation();
      }
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
      this.firestoreService.deleteCardFromMyCardsFirestore(this.myCards[i].id);
      this.myCards.splice(i, 1);
    }, 500);
  }

  showColorPalette(returnData, i) {
    this.firestoreService.colorWheel = true;
    this.throwCard(i);
    this.firestoreService.updateLastCard(this.myCards[i])
    this.updateGameVariables(returnData)
  }

  chooseColor(color) {
    console.log('color ' + color + ' choosen')
    this.firestoreService.colorWheel = false;
    this.firestoreService.stopColorWheelAnimation()
  }

}
// function getCollections(playerRef: DocumentReference<DocumentData>) {
//   throw new Error('Function not implemented.');
// }

