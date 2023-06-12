import { Component, OnInit } from '@angular/core';
import { Game } from '../models/game';
import { Rules } from '../models/rules';


@Component({
  selector: 'app-gameboard',
  templateUrl: './gameboard.component.html',
  styleUrls: ['./gameboard.component.scss']
})
export class GameboardComponent implements OnInit {

  game: Game;
  rules: Rules;
  toDrawcount: number = 1;
  public pickCardAnimation: boolean = false;
  public cardInThrow: string;
  myCards: any[] = [];

  ngOnInit(): void {
    this.game = new Game();
    this.rules = new Rules();
    this.pickInitialCards();

  }

  pickInitialCards() {
    for (let i = 0; i < 7; i++) {
      const element = this.game.stack[i];
      this.myCards.push(element)
    }
  }

  pickCard() {
    this.pickCardAnimation = true;
    setTimeout(() => {
      this.pickCardAnimation = false;
      for (let i = 0; i < this.toDrawcount; i++) {
        this.myCards.push(this.game.stack[this.game.stack.length - 1]);
        this.game.stack.pop();
      }
      if(this.toDrawcount > 1) {
        this.toDrawcount = 1
      }
    }, 1500);
    
  }

  checkIfCardThrowable(i) {
    let returnData = this.rules.compareCards(this.myCards[i], this.game.lastCard)
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
    this.game.lastCard = this.myCards[i]
  }

  throwCard(i) {
    this.myCards[i].throw = true
    setTimeout(() => {
      this.game.throwedCards.push(this.myCards[i])
      this.myCards.splice(i, 1)
    }, 500);
  }

}
