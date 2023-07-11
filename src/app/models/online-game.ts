export class OnlineGame {
    public gameDirection: string = 'clockwise';
    public lastCard: object;
    public currentColor: string;
    public stack: any[] = [];
    public throwedCards: any = [];
    public firstCard: object;
    public totalPlayer: number;
    public players: object[] = [];
    public unoCalls:object[] = [];
    public lateCalls: object[] = [];


}
