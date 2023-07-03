export class OnlineGame {
    public gameDirection: string = 'clockwise';
    public lastCard: object;
    public currentColor: string;
    public stack: any[] = [];
    public throwedCards: any = [];
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


    
}
