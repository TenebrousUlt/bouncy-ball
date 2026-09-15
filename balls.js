const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const upperBoard = {
    width: canvas.width / 3,
    height: canvas.height * 0.2,
    x: (canvas.width - (canvas.width / 3)) / 2,
    y: 0
};

const board = {
    width: canvas.width / 3,
    height: canvas.height * 0.6,
    x: (canvas.width - (canvas.width / 3)) / 2,
    y: 0 + upperBoard.height
};


const lowerBoard = {
    width: canvas.width / 3,
    height: canvas.height * 0.2,
    x: (canvas.width - (canvas.width / 3)) / 2,
    y: 0 + upperBoard.height + board.height
};

let buttonWidth = lowerBoard.width * 0.25;
let buttonHeight = lowerBoard.height * 0.3;
let gap = lowerBoard.width * 0.05;
let gapY = lowerBoard.height * 0.1;
const lbButtons = [
    {
    text: "NORMAL",
    width: buttonWidth,
    height: buttonHeight,
    x: lowerBoard.x + gap,
    y: lowerBoard.y + gapY
},
    {
    text: "HARD",
    width: buttonWidth,
    height: buttonHeight,
    x: lowerBoard.x + (2.5 * gap) + buttonWidth,
    y: lowerBoard.y + gapY
},
    {
    text: "FREE",
    width: buttonWidth,
    height: buttonHeight,
    x: lowerBoard.x + (4 * gap) + (2 * buttonWidth), // make it so the location stays the same after resize
    y: lowerBoard.y + gapY
},
    {
    text: "QUIT",
    width: buttonWidth,
    height: buttonHeight,
    x: lowerBoard.x + (2.5 * gap) + buttonWidth,
    y: lowerBoard.y + gapY
},

]

const colors = {
    bg: "#17101c",
    stroke: "#100c14",
    ball: "#ffff",
    sub: "#e5c7fa",
    point: "#8d61ab",
    button: "#2e1f38"
}

const background = new Image();
background.src = "images/50863.jpg";

let fontSize = Math.min(board.width / 15, board.height / 15);
let start = false;

let radius = Math.min (board.width / 50, board.height / 50);
//let balls = [];

let deltaTime = 0;
let lastTime = 0;

let score = 0;

let normal = false;
let hard = false;
let timerN = 60;
let timerH = 30;

function game(time){

    requestAnimationFrame(game);

    deltaTime = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    ballMovement();
    gameLogic();
    draw();
    //console.log(Math.floor(lastTime / 1000))
    console.log(normal,hard)
}

function draw(){

    ctx.drawImage(background,0,0,canvas.width,canvas.height);

    ctx.fillStyle = colors.bg;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 5;

    ctx.fillRect(upperBoard.x,upperBoard.y,upperBoard.width,upperBoard.height);
    ctx.strokeRect(upperBoard.x, upperBoard.y, upperBoard.width, upperBoard.height);

    ctx.fillRect(board.x,board.y,board.width,board.height);
    ctx.strokeRect(board.x, board.y, board.width, board.height);

    ctx.fillRect(lowerBoard.x,lowerBoard.y,lowerBoard.width,lowerBoard.height);
    ctx.strokeRect(lowerBoard.x, lowerBoard.y, lowerBoard.width, lowerBoard.height);

    ctx.fillStyle = colors.sub;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${fontSize}px Germania One`;
    ctx.fillText(`SCORE: ${score}`,upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 2))
    

    if(!start){
        ctx.fillStyle = colors.sub;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${fontSize}px Germania One`;
        ctx.fillText("CLICK TO START",board.x + (board.width / 2), board.y + (board.height / 2))

        if(!normal && !hard){
            ctx.fillText("MODE: FREE",upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 4));
        }
        if(normal){
            ctx.fillText("MODE: NORMAL",upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 4));
        }
        if(hard){
            ctx.fillText("MODE: HARD",upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 4));
        }

        for(let button of lbButtons){
            if(button.text === "QUIT"){
                continue;
            }

            ctx.fillStyle = colors.button;
            ctx.fillRect(button.x,button.y,button.width,button.height);
            ctx.strokeRect(button.x, button.y, button.width, button.height);

            ctx.fillStyle = colors.sub;
            ctx.font = `${Math.min(button.width / 2, button.height / 2)}px Germania One`;
            ctx.fillText(button.text,button.x + button.width / 2,button.y + button.height / 2);
        }
    }
    if(start){

        spawnBall();
        spawnPoint();

        ctx.fillStyle = colors.button;
        ctx.fillRect(lbButtons[3].x,lbButtons[3].y,lbButtons[3].width,lbButtons[3].height);
        ctx.strokeRect(lbButtons[3].x, lbButtons[3].y, lbButtons[3].width, lbButtons[3].height);

        ctx.fillStyle = colors.sub;
        ctx.font = `${Math.min(lbButtons[3].width / 2, lbButtons[3].height / 2)}px Germania One`;
        ctx.fillText(lbButtons[3].text,lbButtons[3].x + lbButtons[3].width / 2,lbButtons[3].y + lbButtons[3].height / 2);

        ctx.fillText(`W/A/D  |  ↑/←/→ TO MOVE`,lowerBoard.x + (lowerBoard.width / 2), lowerBoard.y + (lowerBoard.height / 2))
        ctx.fillText(`ESC TO QUIT`,lowerBoard.x + (lowerBoard.width / 2), lowerBoard.y + (lowerBoard.height / 1.25))
    }

}
let ball = {
    
    x: board.x + (board.width / 2),
    y: board.y + (board.height / 2),
    radius: radius,
    velocityX: 0,
    velocityY: 0
};


const border = 5;
let topWall = board.y + border / 2;
let downWall = board.y + board.height - border / 2;
let leftWall = board.x + border / 2;
let rightWall = board.x + board.width - border / 2;

function spawnBall(){

    ctx.fillStyle = colors.ball;

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

const point = {

    x: Math.random() * (rightWall - leftWall - radius * 1.3 * 2)
             + leftWall + radius * 1.3,
    y: Math.random() * (downWall - topWall - radius * 1.3 * 2)
             + topWall + radius * 1.3,
    radius: radius * 1.3
}


function spawnPoint(){

    ctx.fillStyle = colors.point;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fill();

}

function gameLogic(){

    topWall = board.y + border / 2;
    downWall = board.y + board.height - border / 2;
    leftWall = board.x + border / 2;
    rightWall = board.x + board.width - border / 2;

    const distance = Math.hypot(
        ball.x - point.x,
        ball.y - point.y
    );
    if(distance < ball.radius + point.radius){
        point.x = Math.random() * (rightWall - leftWall - point.radius * 2)
             + leftWall + point.radius;

        point.y = Math.random() * (downWall - topWall - point.radius * 2)
             + topWall + point.radius;

        score++;
        }
}

let gravity = 1700;

let acceleration = 1000;
let accelerationV = 2000;
let friction = 900;


const keys = {
    up: false,
    down: false,
    right: false,
    left: false,
}

function ballMovement(){

    const topWall = board.y + border / 2;
    const downWall = board.y + board.height - border / 2;
    const leftWall = board.x + border / 2;
    const rightWall = board.x + board.width - border / 2;

    if(start){

        ball.velocityY += gravity * deltaTime;
        ball.x += ball.velocityX * deltaTime;
        ball.y += ball.velocityY * deltaTime;
        

        if(ball.y + ball.radius >= downWall){
            ball.velocityY *= -1;
        }
        if(ball.y - ball.radius <= topWall){
            ball.velocityY *= -1;
        }
        if(ball.x + ball.radius >= rightWall){
            ball.velocityX *= -1;
        }
        if(ball.x - ball.radius<= leftWall){
            ball.velocityX *= -1;
        }

        if(keys.up){
            ball.velocityY -= accelerationV * deltaTime;
        }
        if(keys.down){
            ball.velocityY += accelerationV * deltaTime;
        }
        if(keys.left){
           ball.velocityX -= acceleration * deltaTime;
        }   
        if(keys.right){
            ball.velocityX += acceleration * deltaTime;
        }

        if(!keys.right && ball.velocityX > 0){
            ball.velocityX = Math.max(0,ball.velocityX - friction * deltaTime);
        }
        if(!keys.left && ball.velocityX < 0){
            ball.velocityX = Math.min(0,ball.velocityX + friction * deltaTime);
        }
        if(!keys.up && ball.velocityY < 0){
            ball.velocityY = Math.min(0,ball.velocityY + friction * deltaTime);
        }
        if(!keys.down && ball.velocityY > 0){
            ball.velocityY = Math.max(0,ball.velocityY - friction * deltaTime);
        }



        ball.x = Math.max(board.x + border / 2 + ball.radius, Math.min(board.x + board.width - border / 2 - ball.radius, ball.x));
        ball.y = Math.max(board.y + border / 2 + ball.radius, Math.min(board.y + board.height - border / 2 - ball.radius, ball.y));

    }
}

function reset(){
    score = 0;
    start = false;
    ball.x = board.x + (board.width / 2);
    ball.y = board.y + (board.height / 2);
    ball.velocityX = 0;
    ball.velocityY = 0;
    point.x = Math.random() * (rightWall - leftWall - radius * 1.3 * 2) + leftWall + radius * 1.3;
    point.y = Math.random() * (downWall - topWall - radius * 1.3 * 2) + topWall + radius * 1.3;
}


canvas.addEventListener("pointerdown", event =>{

    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    if (
        mouseX >= board.x &&
        mouseX <= board.x + board.width &&
        mouseY >= board.y &&
        mouseY <= board.y + board.height
    ){
        start = true;
        spawnPoint();
    }

    for(let button of lbButtons){
        if (
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height
        ){
            switch(button.text){

                case "QUIT":
                    if(start === true){
                        reset();
                        break;
                    }
                    break;
                case "NORMAL":
                    if(!start){
                        normal = true;
                        hard = false;
                        break;
                    }
                    break;

                case "HARD":
                    if(!start){
                        normal = false;
                        hard = true;
                        break;
                    }
                    break;

                case "FREE":
                    if(!start){
                        normal = false;
                    hard = false;
                        break;
                    }
                    break;
            }
        }
    }
    
})

canvas.addEventListener("pointerup", event =>{

    keys.up = false;
    keys.right = false;
    keys.left = false;

})

window.addEventListener("keydown", event =>{

    if(event.key === " "){
        start = true;
        spawnPoint();
    }

    if(event.key === "Escape"){
        start = false;
        reset();
    }

    if(event.key === "ArrowUp" || event.key === "w"){
        keys.up = true;
    }

    if(event.key === "ArrowLeft" || event.key === "a"){
        keys.left = true;
        
    }

    if(event.key === "ArrowRight" || event.key === "d"){
        keys.right = true;
        
    }
})

window.addEventListener("keyup", event => { 

    if(event.key === "ArrowUp" || event.key === "w"){
        keys.up = false;
    }

    if(event.key === "ArrowLeft" || event.key === "a"){
        keys.left = false;
    }

    if(event.key === "ArrowRight" || event.key === "d"){
        keys.right = false;
    }
});

window.addEventListener("resize", () => {


    ball.relativeX = (ball.x - board.x) / board.width;
    ball.relativeY = (ball.y - board.y) / board.height;

    point.relativeX = (point.x - board.x) / board.width;
    point.relativeY = (point.y - board.y) / board.height;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    upperBoard.width = canvas.width / 3;
    upperBoard.height = canvas.height * 0.20;

    upperBoard.x = (canvas.width - (canvas.width / 3)) / 2;
    upperBoard.y = 0;

    board.width = canvas.width / 3;
    board.height = canvas.height * 0.60;

    board.x = (canvas.width - board.width) / 2;
    board.y = 0 + upperBoard.height;

    lowerBoard.width = canvas.width / 3;
    lowerBoard.height = canvas.height * 0.2;

    lowerBoard.x = (canvas.width - board.width) / 2;
    lowerBoard.y = 0 + upperBoard.height + board.height;


    fontSize = Math.min(board.width / 15, board.height / 15);
    radius = Math.min (board.width / 50, board.height / 50);


    ball.x = board.x + ball.relativeX * board.width;
    ball.y = board.y + ball.relativeY * board.height;
    ball.radius = radius;

    point.radius = radius * 1.3;

    point.x = board.x + point.relativeX * board.width;
    point.y = board.y + point.relativeY * board.height;

    point.x = Math.max(
        board.x + border / 2 + point.radius,
        Math.min(board.x + board.width - border / 2 - point.radius, point.x)
    );

    point.y = Math.max(
        board.y + border / 2 + point.radius,
        Math.min(board.y + board.height - border / 2 - point.radius, point.y)
    );


    topSide.x = 0;
    topSide.y = 0;
    topSide.width = 0 + canvas.width;
    topSide.height = 0 + upperBoard.height + board.height * 0.2;

    downSide.x = 0;
    downSide.y = 0 + upperBoard.height + board.height * 0.8;
    downSide.width = 0 + canvas.width;
    downSide.height = canvas.height;

    rightSide.x = board.x + board.width / 2;
    rightSide.y = 0 + upperBoard.height + board.height * 0.2;
    rightSide.width = 0 + canvas.width;
    rightSide.height = board.height * 0.6;

    leftSide.x = 0;
    leftSide.y = 0 + upperBoard.height + board.height * 0.2;
    leftSide.width = canvas.width / 2;
    leftSide.height = board.height * 0.6;

    buttonWidth = lowerBoard.width * 0.25;
    buttonHeight = lowerBoard.height * 0.3;
    gap = lowerBoard.width * 0.05;
    gapY = lowerBoard.height * 0.1;

    lbButtons[0].x = lowerBoard.x + gap;
    lbButtons[0].y = lowerBoard.y + gapY;
    lbButtons[0].width = buttonWidth;
    lbButtons[0].height = buttonHeight;

    lbButtons[1].x = lowerBoard.x + (2.5 * gap) + buttonWidth;
    lbButtons[1].y = lowerBoard.y + gapY;
    lbButtons[1].width = buttonWidth;
    lbButtons[1].height = buttonHeight;

    lbButtons[2].x = lowerBoard.x + (4 * gap) + (2 * buttonWidth);
    lbButtons[2].y = lowerBoard.y + gapY;
    lbButtons[2].width = buttonWidth;
    lbButtons[2].height = buttonHeight;

    lbButtons[3].x = lowerBoard.x + (2.5 * gap) + buttonWidth;
    lbButtons[3].y = lowerBoard.y + gapY;
    lbButtons[3].width = buttonWidth;
    lbButtons[3].height = buttonHeight;

    draw();

})

background.onload = () => {
    game();
}