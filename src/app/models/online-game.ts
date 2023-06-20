export class OnlineGame {
    public gameDirection: string = 'clockwise';
    public lastCard: object;
    public currentColor: string;
    public stack: any[] = [];
    public firstCard: object;


    

    updateCurrentColor() {
        if (this.lastCard) {
            this.currentColor = this.lastCard['color'];
        } else {
            setTimeout(() => {
                this.currentColor = this.lastCard['color'];
                console.log('timeout used')
            }, 1000);
        }
    }

    pickFirstCard() {
        this.lastCard = this.stack[0];
        this.updateCurrentColor();
    }

    
}
