export class OnlineGame {
    public gameDirection: string = 'clockwise';
    public lastCard: object;
    public currentColor: string;
    public stack: any[] = [];


    

    updateCurrentColor() {
        this.currentColor = this.lastCard['color'];
    }
}
