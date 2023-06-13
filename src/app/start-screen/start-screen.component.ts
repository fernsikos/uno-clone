import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent {

  constructor(private router: Router) {}

  startGame() {
    this.router.navigateByUrl('/config-game/P4ipHCPYOzyQU3u9reBu')
  }
}
