import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { collection, doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';
import { environment } from 'src/environments/environment';




@Component({
  selector: 'app-waitingroom',
  templateUrl: './waitingroom.component.html',
  styleUrls: ['./waitingroom.component.scss']
})
export class WaitingroomComponent implements OnInit {
  constructor(private router:Router, private route: ActivatedRoute) {

  }
  gameId: string;
  playerNumer: number;
  app = initializeApp(environment.firebase)
  db: any = getFirestore(this.app);
  joinedPlayers: any = [];
  gameStarted: boolean = false;


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.gameId = params['id'],
      this.playerNumer = params['player']
    })
    this.snapPlayersJoinedGame();
    this.snapGameStarted()

  }

  snapPlayersJoinedGame() {
    onSnapshot(collection(this.db, 'games', this.gameId, 'player'), async (snapshot) => {
      snapshot.docChanges().forEach(async(change) => {
        if (change.type === 'added') {
          this.joinedPlayers.push(change.doc.data())
        } else if (change.type === 'removed') {
         this.removePlayer(change)
        }
      })

    })
  }

  removePlayer(change) {
    let playerToREemove = this.joinedPlayers.findIndex(m => m.number === change.doc.data()['number']);
    this.joinedPlayers.splice(playerToREemove, 1)
  }

  startGame() {
    if (this.joinedPlayers.length > 1){
      this.router.navigateByUrl('/waitingroom/P4ipHCPYOzyQU3u9reBu/' + this.playerNumer)
    }
  }

  snapGameStarted() {
    const documentRef = doc(this.db, 'games', this.gameId);
    onSnapshot(documentRef, (snapshot) => {
      this.gameStarted = snapshot.data()['gameStarted']
      if (this.gameStarted) {
        this.startGameForAllPlayers()
      }
    })
  }

  startGameForAllPlayers() {
    if (!this.gameStarted) {
      setDoc(doc(this.db, 'games', this.gameId), {
        gameStarted: true
      })
    }
    this.enterGame()
  }

  enterGame() {
    this.router.navigateByUrl('/game/P4ipHCPYOzyQU3u9reBu/' + this.playerNumer)
  }

}
