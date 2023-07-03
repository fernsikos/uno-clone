import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { environment } from 'src/environments/environment';




@Component({
  selector: 'app-config-game',
  templateUrl: './config-game.component.html',
  styleUrls: ['./config-game.component.scss']
})
export class ConfigGameComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {
  }

  gameId:string;
  player:number;
  joinedPlayers: any = [];
  app = initializeApp(environment.firebase)
  db: any = getFirestore(this.app);
  public myName: string;

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.gameId = params['id']
    })
    this.snapPlayersJoinedGame();
   
    
  }
  
  addPlayerToGame() {
    if (this.myName.length > 0) {
      setDoc(doc(this.db, 'games', this.gameId, 'player', this.player.toString()), {
        number: this.player,
        name: this.myName
      })
    }
    this.enterWaitingroom()
  }

  enterWaitingroom() {
    this.router.navigateByUrl('/waitingroom/'+ this.gameId + '/' + this.player)
  }
  
  snapPlayersJoinedGame() {
    onSnapshot(collection(this.db, 'games', this.gameId, 'player'), async (snapshot) => {
      snapshot.docChanges().forEach(async(change) => {
        if (change.type === 'added') {
          this.joinedPlayers.push(change.doc.data())
        } else if (change.type === 'removed') {
         this.removePlayer(change)
        }
        console.log(change.type);
      })
      console.log(this.joinedPlayers.length)
      this.player = this.joinedPlayers.length + 1
      console.log('i am player number: ' + this.player)
    })
  }

  removePlayer(change) {
    let playerToRemove = this.joinedPlayers.findIndex(m => m.number === change.doc.data()['number']);
    this.joinedPlayers.splice(playerToRemove, 1)
  }

}
