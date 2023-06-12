import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';



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
  db: any = getFirestore();
  allPlayers: any = []

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.gameId = params['id'],
      this.player = params['player']
    })

  }

  joinPlayerToGame() {
    onSnapshot(collection(this.db, 'games', this.gameId, 'player'), async (snapshot) => {
      snapshot.docs.forEach(async(doc) => {
        console.log(doc)
      })
    })
  }

}
