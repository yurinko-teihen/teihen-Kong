let ladder_Image = new Image();
ladder_Image.src = "./images/ladder2.png";

class LADDER{
  constructor(positionX,positionY,height = 4){
    // this.width = width;
    this.positionX = positionX;
    this.positionY = positionY;
    this.height = height;

  }

  draw(){
    ctx.beginPath();
    var patternladder = ctx.createPattern(ladder_Image, "repeat-y");
    ctx.fillStyle = patternladder;
    ctx.save();
    ctx.translate(this.positionX,this.positionY);
    ctx.fillRect(0,0,ladder_Image.width,ladder_Image.height * this.height );
    ctx.translate(-this.positionX,-this.positionY);
    ctx.restore();

    }
}

let ladderArray = [];

let ladderOne = new LADDER(500,610,6);
let ladderTwo = new LADDER(280,486,6);
let ladderThree = new LADDER(110,500,6);
let ladderFour = new LADDER(500,376,6);
let ladderFive = new LADDER(340,376,6);
let ladderSix = new LADDER(230,253,6);
let ladderSeven = new LADDER(110,253,6);
let ladderEight = new LADDER(500,149,6);
let ladderNine = new LADDER(400,74,3);
let ladderTen = new LADDER(280,33,6);
let ladderEleven = new LADDER(230,33,6);

ladderArray.push(ladderOne);
ladderArray.push(ladderTwo);
ladderArray.push(ladderThree);
ladderArray.push(ladderFour);
ladderArray.push(ladderFive);
ladderArray.push(ladderSix);
ladderArray.push(ladderSeven);
ladderArray.push(ladderEight);
ladderArray.push(ladderNine);
ladderArray.push(ladderTen);
ladderArray.push(ladderEleven);

let ladderArraynext = [];

let ladderTwelve = new LADDER(260,693,1);
let ladderThirteen = new LADDER(200,459,1);
let ladderFourteen = new LADDER(450,335,1);
let ladderFifteen = new LADDER(290,211,1);

ladderArraynext.push(ladderTwelve);
ladderArraynext.push(ladderThirteen);
ladderArraynext.push(ladderFourteen);
ladderArraynext.push(ladderFifteen);
