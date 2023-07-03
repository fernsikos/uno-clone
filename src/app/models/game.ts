export class Game {
    public stack: any[] = [];
    // public throwedCards: any = [];
    public types: string[] = [
        "blue", "green", "yellow", "red"
    ];


    constructor() {
       
        for (let i = 0; i < this.types.length; i++) {
            const element = this.types[i];
            this.pushZeroToNine(element);
            this.pushOneToNine(element);
            this.pushSpecials(element);
        }
        this.pushWilds();
        this.shuffle(this.stack);
        
    }

    public toJson() {
        return {
            stack: this.stack,
        }
    }

    

    shuffle(array) {
        let currentIndex = array.length, randomIndex: number;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    /**
     * Pushes the cards 0 - 9 to the array
     * @param color string
     */
    pushZeroToNine(color) {
        for (let i = 0; i < 10; i++) {
            let card: any = {
                card: color + '-' + i + '-card-clipart-md.png',
                color: color,
                number: i,
                special: false,
                offset: this.getRandomAngle()
            }
            // this.stack.push(color + '-' + i + '-card-clipart-md.png');
            this.stack.push(card);
        }
    }

    /**
     * Pushes the cards 1 - 9 to array
     * @param color string
     */
    pushOneToNine(color) {
        for (let i = 1; i < 10; i++) {
            let card: any = {
                card: color + '-' + i + '-card-clipart-md.png',
                color: color,
                number: i,
                special: false,
                offset: this.getRandomAngle()
            }
            // this.stack.push(color + '-' + i + '-card-clipart-md.png');
            this.stack.push(card);

        }
    }

    /**
     * Pushes special cards to array
     * @param color string
     */
    pushSpecials(color) {
        for (let i = 0; i < 2; i++) {
            this.pushDrawTwo(color),
                this.pushReverse(color);
            this.pushSkip(color);
        }
    }

    pushDrawTwo(color) {
        let card: any = {
            card: color + '-draw-two-card-clipart-md.png',
            color: color,
            special: "+2",
            number: false,
            offset: this.getRandomAngle(),
        }
        this.stack.push(card);
    }

    pushReverse(color) {
        let card: any = {
            card: color + '-reverse-card-clipart-md.png',
            color: color,
            number: false,
            special: "reverse",
            offset: this.getRandomAngle()
        }
        this.stack.push(card);
    }

    pushSkip(color) {
        let card: any = {
            card: color + '-skip-card-clipart-md.png',
            color: color,
            number: false,
            special: "skip",
            offset: this.getRandomAngle()
        }
        this.stack.push(card);
    }





    /**
     * Pushes wild cards to array
     */
    pushWilds() {
        for (let i = 0; i < 4; i++) {
            this.pushWild();
            this.pushWildDraw();
        }
    }

    pushWild() {
        let card: any = {
            card: 'wild-card-clipart-md.png',
            color: 'wild',
            special: 'wild',
            number: false,
            offset: this.getRandomAngle()
        }
        this.stack.push(card);
    }

    pushWildDraw() {
        let card: any = {
            card: 'wild-draw-four-card-clipart-md.png',
            color: 'wild',
            special: '+4',
            number: false,
            offset: this.getRandomAngle()
        }
        this.stack.push(card);
    }

    /**
     * Returns random number between 0 - 360
     * @returns number
     */
    getRandomAngle() {
        return Math.floor(Math.random() * 361)
    }

    


}
