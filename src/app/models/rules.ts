export class Rules {

    lastCard: object;
    throwedCard: object;
    activeColor: any;
    public returnData: any;
       

    compareCards(throwedCard: object, lastCard: object, activeColor:any) {
        this.lastCard = lastCard;
        this.throwedCard = throwedCard;
        this.activeColor = activeColor;
        this.returnData = {
            pass: false,
            activateColorWheel: false
        }
        console.log(lastCard['number']+ ' ' + lastCard['color'] + ' lastcard')
        console.log(throwedCard['number']+ ' ' + throwedCard['color'] + ' throwedcard')
        this.preCheck();
        console.log(activeColor, 'active color')
        return this.returnData
    }

    preCheck() {
        if (this.throwedCard['color'] === 'wild') {
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

    checkForSameSpecial() {
        if (this.throwedCard['special'] === 'skip' && this.throwedCard['color'] !== this.lastCard['color']) {
            this.returnData.pass = true
        } else
        this.returnData.pass = true
    }

    checkForSameColor() {
        if(!this.lastCard['special'] || this.lastCard['special'] === 'reverse') {
            this.returnData.pass = true
        } else if (this.lastCard['special'] === 'skip' && this.throwedCard['special'] === 'pass') {
            this.returnData.pass = true
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
        } else if (this.throwedCard['special'] === 'wild' && this.lastCard['special'] === 'wild') {
            this.returnData.pass = true;
            this.returnData.activateColorWheel = true;
        } else if (this.throwedCard['special'] === 'wild' && !this.lastCard['special']) {
            this.returnData.pass = true;
            this.returnData.activateColorWheel = true;
        }
    }
}
