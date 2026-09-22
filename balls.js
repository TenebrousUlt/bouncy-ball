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
    x: lowerBoard.x + (4 * gap) + (2 * buttonWidth),
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
    obstacle: "#bbacc5",
    sub: "#e5c7fa",
    point: "#8d61ab",
    button: "#2e1f38",
}

const background = new Image();
background.src = "images/50863.jpg";

let fontSize = Math.min(board.width / 15, board.height / 15);
let start = false;
let lost = false;
let won = false;

let wins1 = 0;
wins1 = Number(localStorage.getItem("win1"));
let wins2 = 0;
wins2 = Number(localStorage.getItem("win2"));

let radius = Math.min (board.width / 50, board.height / 50);

let deltaTime = 0;
let lastTime = 0;

let score = 0;
let requiredScore = 50;
let highscore = 0;
highscore = Number(localStorage.getItem("score"));

let normal = true;
let hard = false;
let timer = 80;
let startTime = 0;

function game(time){

    requestAnimationFrame(game);

    deltaTime = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    ballMovement();
    gameLogic();
    draw();
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

    
    

    if(!start){

        ctx.fillStyle = colors.sub;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${fontSize}px Germania One`;

        if(!won && !lost){
            ctx.fillText("CLICK TO START",board.x + (board.width / 2), board.y + (board.height / 2));
        }

        if(!normal && !hard){
            ctx.fillText("MODE: FREE",upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 4));
            ctx.fillText(`HIGHSCORE: ${highscore}`,upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 2));
            ctx.font = `${fontSize / 2}px Germania One`;
            ctx.fillText("NO TIMER, PLAY AS MUCH AS YOU WANT",lowerBoard.x + (lowerBoard.width / 2), lowerBoard.y + (lowerBoard.height / 1.5));
        }
        if(normal){
            ctx.fillText("MODE: NORMAL",upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 4));
            ctx.fillText(`WINS: ${wins1}`,upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 2));
            ctx.font = `${fontSize / 2}px Germania One`;
            ctx.fillText(`WIN BY GETTING A SCORE OF ${requiredScore} IN ${timer} SECONDS`,lowerBoard.x + (lowerBoard.width / 2), lowerBoard.y + (lowerBoard.height / 1.5));
        }
        if(hard){
            ctx.fillText("MODE: HARD",upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 4));
            ctx.fillText(`WINS: ${wins2}`,upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 2));
            ctx.font = `${fontSize / 2}px Germania One`;
            ctx.fillText(`WIN BY GETTING A SCORE OF ${requiredScore} IN ${timer} SECONDS`,lowerBoard.x + (lowerBoard.width / 2), lowerBoard.y + (lowerBoard.height / 1.5));
            ctx.fillText(`WATCH OUT FOR OBSTACLES TOO`,lowerBoard.x + (lowerBoard.width / 2), lowerBoard.y + (lowerBoard.height / 1.25));
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

        ctx.fillStyle = colors.sub;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${fontSize}px Germania One`;
        ctx.fillText(`SCORE: ${score}`,upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 2))

        ctx.fillStyle = colors.button;
        ctx.fillRect(lbButtons[3].x,lbButtons[3].y,lbButtons[3].width,lbButtons[3].height);
        ctx.strokeRect(lbButtons[3].x, lbButtons[3].y, lbButtons[3].width, lbButtons[3].height);

        ctx.fillStyle = colors.sub;
        ctx.font = `${Math.min(lbButtons[3].width / 2, lbButtons[3].height / 2)}px Germania One`;
        ctx.fillText(lbButtons[3].text,lbButtons[3].x + lbButtons[3].width / 2,lbButtons[3].y + lbButtons[3].height / 2);

        ctx.fillText(`W/A/D  |  ↑/←/→ TO MOVE`,lowerBoard.x + (lowerBoard.width / 2), lowerBoard.y + (lowerBoard.height / 2))
        ctx.fillText(`ESC TO QUIT`,lowerBoard.x + (lowerBoard.width / 2), lowerBoard.y + (lowerBoard.height / 1.25))

        if(!hard && !normal){
            ctx.fillStyle = colors.sub;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = `${fontSize}px Germania One`;
            ctx.fillText(`HIGHSCORE: ${highscore}`,upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 4))
        }

        if(hard || normal){
            ctx.fillText(timer,upperBoard.x + (upperBoard.width / 2), upperBoard.y + (upperBoard.height / 4));
        }
        if(hard){

            ctx.strokeStyle = colors.obstacle;
            ctx.lineWidth = obstacleLineWidth;

            ctx.beginPath();
            ctx.moveTo(obstacle1.x, obstacle1.y);
            ctx.lineTo(obstacle1.x + obstacleLength, obstacle1.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(obstacle2.x, obstacle2.y);
            ctx.lineTo(obstacle2.x, obstacle2.y + obstacleLength);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(obstacle3.x, obstacle3.y);
            ctx.lineTo(obstacle3.x, obstacle3.y + obstacleLength);
            ctx.stroke();
        }
    }

    if(won){
        ctx.fillStyle = colors.sub;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${fontSize}px Germania One`;
        ctx.fillText("YOU WON",board.x + (board.width / 2), board.y + (board.height / 2));
    }
    if(lost){
        ctx.fillStyle = colors.sub;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${fontSize}px Germania One`;
        ctx.fillText("YOU LOST",board.x + (board.width / 2), board.y + (board.height / 2));
    }

}
let ball = {
    
    x: board.x + (board.width / 2),
    y: board.y + (board.height / 2),
    radius: radius,
    velocityX: 0,
    velocityY: 0
};

let obstacleLength = board.width * 0.2;
let obstacleLineWidth = 10;
let obstacles = [

    {
        x: board.x + (board.width / 2),
        y: board.y + (board.height / 3),
        size: obstacleLength,
        obstacleSpeed : 200,
    },

    {
        x: board.x + (board.width * 0.2),
        y: board.y + (board.height / 2),
        size: obstacleLength,
        obstacleSpeed : 200,
    },

    {
        x: board.x + (board.width * 0.8),
        y: board.y + (board.height / 2),
        size: obstacleLength,
        obstacleSpeed : 200,
    },
]

let obstacle1 = obstacles[0];
let obstacle2 = obstacles[1];
let obstacle3 = obstacles[2];

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
        if(score > highscore){
            highscore = score;
            localStorage.setItem("score", highscore);
        }
        }
    
    if(start && (normal || hard)){
        let elapsed = (performance.now() - startTime) / 1000;
        timer = Math.max(0, 70 - Math.floor(elapsed));

        if(timer === 0){
            lost = true;
            start = false;
            reset();
        }
        if((normal || hard) && score === requiredScore){
            if(normal){
                wins1++;
                localStorage.setItem("win1", wins1);
            }
            if(hard){
                wins2++;
                localStorage.setItem("win2", wins2);
            }
            won = true;
            start = false;
            reset();
        }
    }

    if(start && hard){

        obstacle1.x += obstacle1.obstacleSpeed * deltaTime;
        obstacle2.y += obstacle2.obstacleSpeed * deltaTime;
        obstacle3.y -= obstacle3.obstacleSpeed * deltaTime;

        if(obstacle1.x + obstacleLength >= rightWall){
            obstacle1.obstacleSpeed *= -1;
        }
        if(obstacle1.x <= leftWall){
            obstacle1.obstacleSpeed *= -1;
        }

        if(obstacle2.y + obstacleLength >= downWall){
            obstacle2.obstacleSpeed *= -1;
        }
        if(obstacle2.y <= topWall){
            obstacle2.obstacleSpeed *= -1;
        }

        if(obstacle3.y + obstacleLength >= downWall){
            obstacle3.obstacleSpeed *= -1;
        }
        if(obstacle3.y <= topWall){
            obstacle3.obstacleSpeed *= -1;
        }
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

    let ob1CenterX = obstacle1.x + obstacleLength / 2;
    let ob1CenterY = obstacle1.y;
    let ob2CenterX = obstacle2.x
    let ob2CenterY = obstacle2.y + obstacleLength / 2;
    let ob3CenterX = obstacle3.x;
    let ob3CenterY = obstacle3.y + obstacleLength / 2;

    let halfWidth = (obstacleLength / 2) + ball.radius;
    let halfHeight = (obstacleLineWidth / 2) + ball.radius;
    let halfWidth2 = (obstacleLineWidth / 2) + ball.radius;
    let halfHeight2 = (obstacleLength / 2) + ball.radius;

    let dx = ball.x - ob1CenterX;
    let dy = ball.y - ob1CenterY;
    let dx2 = ball.x - ob2CenterX;
    let dy2 = ball.y - ob2CenterY;
    let dx3 = ball.x - ob3CenterX;
    let dy3 = ball.y - ob3CenterY;

    if(start){

        if(hard){

            if(Math.abs(dx) < halfWidth && Math.abs(dy) < halfHeight){

                let overlapX = halfWidth - Math.abs(dx);
                let overlapY = halfHeight - Math.abs(dy);


                if(overlapX < overlapY){

                    if(dx > 0){
                        ball.x = (obstacle1.x + obstacleLength) + ball.radius;
                    }
                    else{
                        ball.x = obstacle1.x - ball.radius;
                    }
                    ball.velocityX *= -1;
                }
                else{

                    if(dy > 0){
                        ball.y = (obstacle1.y + obstacleLineWidth / 2) + ball.radius;
                    }
                    else{
                        ball.y = (obstacle1.y - obstacleLineWidth / 2) - ball.radius;
                    }
                    ball.velocityY *= -1;
                }
            }

            if(Math.abs(dx2) < halfWidth2 && Math.abs(dy2) < halfHeight2){

                let overlapX = halfWidth2 - Math.abs(dx2);
                let overlapY = halfHeight2 - Math.abs(dy2);


                if(overlapX < overlapY){

                    if(dx2 > 0){
                        ball.x = obstacle2.x + obstacleLineWidth / 2 + ball.radius;
                    }
                    else{
                        ball.x = obstacle2.x - obstacleLineWidth / 2 - ball.radius;
                    }
                    ball.velocityX *= -1;
                }
                else{

                    if(dy2 > 0){
                        ball.y = obstacle2.y + obstacleLength + ball.radius;
                    }
                    else{
                        ball.y = obstacle2.y - ball.radius;
                    }
                    ball.velocityY *= -1;
                }
            }

            if(Math.abs(dx3) < halfWidth2 && Math.abs(dy3) < halfHeight2){

                let overlapX = halfWidth2 - Math.abs(dx3);
                let overlapY = halfHeight2 - Math.abs(dy3);

                if(overlapX < overlapY){

                    if(dx3 > 0){
                        ball.x = obstacle3.x + obstacleLineWidth / 2 + ball.radius;
                    }
                    else{
                        ball.x = obstacle3.x - obstacleLineWidth / 2 - ball.radius;
                    }
                    ball.velocityX *= -1;
                }
                else{

                    if(dy3 > 0){
                        ball.y = obstacle3.y + obstacleLength + ball.radius;
                    }
                    else{
                        ball.y = obstacle3.y - ball.radius;
                    }
                    ball.velocityY *= -1;
                }
            }
        }

        ball.velocityY += gravity * deltaTime;
        ball.x += ball.velocityX * deltaTime;
        ball.y += ball.velocityY * deltaTime;


        if((ball.y + ball.radius >= downWall)){
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
    timer = 60;
    startTime = 0;
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
        startTime = performance.now();
        spawnPoint();
        won = false;
        lost = false;
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
        startTime = performance.now();
        spawnPoint();
        won = false;
        lost = false;
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

    let obstacle1RelativeX = (obstacle1.x - board.x) / board.width;
    let obstacle1RelativeY = (obstacle1.y - board.y) / board.height;

    let obstacle2RelativeX = (obstacle2.x - board.x) / board.width;
    let obstacle2RelativeY = (obstacle2.y - board.y) / board.height;
    
    let obstacle3RelativeX = (obstacle3.x - board.x) / board.width;
    let obstacle3RelativeY = (obstacle3.y - board.y) / board.height;

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

    obstacleLength = board.width * 0.2;
    obstacleLineWidth = 10;

    obstacle1.x = board.x + obstacle1RelativeX * board.width;
    obstacle1.y = board.y + obstacle1RelativeY * board.height;
    obstacle1.size = obstacleLength;
    obstacle1.obstacleSpeed = 200;

    obstacle2.x = board.x + obstacle2RelativeX * board.width;
    obstacle2.y = board.y + obstacle2RelativeY * board.height;
    obstacle2.size = obstacleLength;
    obstacle2.obstacleSpeed = 200;

    obstacle3.x = board.x + obstacle3RelativeX * board.width;
    obstacle3.y = board.y + obstacle3RelativeY * board.height;
    obstacle3.size = obstacleLength;
    obstacle3.obstacleSpeed = 200;


    draw();

})

background.onload = () => {
    game();
}