import { Component, OnInit } from '@angular/core';
import { Game } from '../models/game';
import { Rules } from '../models/rules';
import { OnlineGame } from '../models/online-game';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../firestore.service';


@Component({
  selector: 'app-gameboard',
  templateUrl: './gameboard.component.html',
  styleUrls: ['./gameboard.component.scss']
})
export class GameboardComponent implements OnInit {

  playerNumber: number;
  gameId: string;
  rules: Rules;
  toDrawcount: number = 1;
  public pickCardAnimation: boolean = false;
  public cardInThrow: string;
  myCards: any[] = [];

  constructor(private route:ActivatedRoute, public firestoreService: FirestoreService) {
  }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.gameId = params['id'];
      this.playerNumber = params['player']
    })
    this.firestoreService.game = new Game();
    this.firestoreService.onlineGame = new OnlineGame();
    if (this.playerNumber == 1) {
      this.firestoreService.pushGameToFirestore(this.gameId);
    } 
    
    await this.firestoreService.loadStackFromFirestore(this.gameId)
    
    this.rules = new Rules();
    // this.firestoreService.onlineGame.stack = this.firestoreService.testStack;
    this.firestoreService.pickFirstCard();
    this.pickInitialCards();
  }

 

  pickInitialCards() {
    for (let i = this.playerNumber * 7; i < this.playerNumber * 7 + 7; i++) {
      const element = this.firestoreService.testStack[i];
      this.myCards.push(element)
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
      this.updateLastCard(i)
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

  updateLastCard(i) {
    this.firestoreService.onlineGame.lastCard = this.myCards[i]
  }

  throwCard(i) {
    this.myCards[i].throw = true
    setTimeout(() => {
      this.firestoreService.game.throwedCards.push(this.myCards[i])
      this.myCards.splice(i, 1)
    }, 500);
  }

}
