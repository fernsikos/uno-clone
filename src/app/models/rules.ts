export class Rules {

    lastCard: object;
    throwedCard: object;
    activeColor: any;
    forceDraw: boolean;
    public returnData: any;
       

    compareCards(throwedCard: object, lastCard: object, activeColor:any, forceDraw: boolean) {
        this.lastCard = lastCard;
        this.throwedCard = throwedCard;
        this.activeColor = activeColor;
        this.forceDraw = forceDraw;
        this.returnData = {
            pass: false,
            activateColorWheel: false
        }
        console.log(lastCard, ' lastcard')
        console.log(throwedCard, ' throwedcard')
        this.preCheck();
        console.log(activeColor, 'active color')
        return this.returnData
    }

    preCheck() {
        if(this.forceDraw) {
            if(this.throwedCard['special'] === '+4') {
                this.returnData.pass = true
            }
            console.log('filter ForceDraw')
        }else if(this.activeColor === 'exeption') {
            this.allowCardWithSameColor()
            console.log('filter exeption')
        } else if(this.activeColor && this.activeColor !== 'none') {
            this.checkIfCardHasNewColor()
            console.log('filter CardHasnewColor')
        } else if (this.throwedCard['color'] === 'wild') {
            this.checkForWild();
            console.log('filterWild')
        } else  if (this.throwedCard['special'] === this.lastCard['special'] && !this.throwedCard['special'] === false) {
            this.checkForSameSpecial()
            console.log('filterSameSpecial')
        } else if (this.throwedCard['color'] === this.lastCard['color']) {
            this.checkForSameColor()
            console.log('filterSameColor')
        } else if (this.throwedCard['number'] === this.lastCard['number']) {
            this.checkForSameNumber()
            console.log('filterSameNumer')
        }

    }

    allowCardWithSameColor() {
        if(this.throwedCard['color'] === this.lastCard['color']) {
            this.returnData.pass = true;
            this.returnData.resetExeption = true;
        }
    }

    checkIfCardHasNewColor() {
        if(this.throwedCard['color'] === this.activeColor) {
            this.returnData.pass = true;
        }
        if(this.throwedCard['special'] === 'wild') {
            this.returnData.pass = true,
            this.returnData.activateColorWheel = true;

        }
    }

    checkForSameSpecial() {
        if (this.throwedCard['special'] === 'skip' && this.throwedCard['color'] !== this.lastCard['color']) {
            this.returnData.pass = true
        } else if(this.lastCard['special'] === '+2' && this.throwedCard['special'] == '+2') {
            this.returnData.pass = true;
            this.returnData.draw = 2
        } 
    }

    checkForSameColor() {
        if (this.throwedCard['special'] === '+2') {
            this.returnData.pass = true;
            this.returnData.draw = 2;
            console.log('first')
        } else if(!this.lastCard['special'] || this.lastCard['special'] === 'reverse') {
            this.returnData.pass = true
            console.log('second')
        } else if (this.lastCard['special'] === 'skip' && this.throwedCard['special'] === 'pass') {
            this.returnData.pass = true
            console.log('third')
        }
    }

    checkForSameNumber() {
        if (this.throwedCard['number'] === false || this.lastCard['number'] === false) {
            this.returnData.pass = false
        } else
        this.returnData.pass = true
    }

    checkForWild() {
        if (this.throwedCard['special'] === '+4') {
            this.returnData.draw = 4;
            this.returnData.pass = true;
            this.returnData.activateColorWheel = true;
            this.returnData.forceDraw = true;
        } else if (this.throwedCard['special'] === 'wild' && this.lastCard['special'] === 'wild') {
            this.returnData.pass = true;
            this.returnData.activateColorWheel = true;
        } else if (this.throwedCard['special'] === 'wild' && !this.lastCard['special']) {
            this.returnData.pass = true;
            this.returnData.activateColorWheel = true;
        }
    }
}
