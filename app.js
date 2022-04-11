/*---------------------------------------------------------
Author: Junwei Liang
Date: 04/10/2022
Project: Snake Game
----------------------------------------------------------*/

let gameState = {
    apple: [],
    snake: {
        body: [],
        nextDirection: []
    }
};

let gridSize = 15;
let speed = 250;

let score = 0;
let total = 0;
let count = 0;
let average = 0;
let best = 0;

let finish = true;
let interval = -1;

const table = document.querySelector('table');

const currentScore = document.querySelector('#score');
const averageScore = document.querySelector('#average');
const bestScore = document.querySelector('#best');

const form = document.querySelector('form');
const level = document.querySelector('#level');
const start = document.querySelector('#start');

const result = document.querySelector('#result');
const message = document.querySelector('#message');
const reset = document.querySelector('#reset');

/* --------------------------- Event Listeners --------------------------------*/
level.addEventListener('change', function(event) {
    speed = event.target.value;
});

document.addEventListener("keydown", updateGameState);

// start game when submit speed
form.addEventListener('submit', function(event) {
    event.preventDefault();
    finish = false;
    // count how many games played
    count++;
    
    level.disabled = true;
    start.disabled = true;

    interval = setInterval(tick, speed);
});

reset.addEventListener('click', function() {
    level.disabled = false;
    start.disabled = false;
    result.className = "hidden";

    resetDefault();
    initialGameState();
});
/* ------------------------- End of Event Listeners -----------------------------*/

createBoard();
const allRows = document.querySelectorAll('tr');
initialGameState();

/* --------------------------- Functions --------------------------------*/
// initialize the apple, snake, and direction
function initialGameState() {
    gameState.apple.push(11);
    gameState.apple.push(4);
    gameState.snake.body.push([8, 2]);
    gameState.snake.body.push([8, 3]);
    gameState.snake.body.push([8, 4]);
    gameState.snake.body.push([8, 5]);
    gameState.snake.nextDirection.push(0);
    gameState.snake.nextDirection.push(1);
    // find the initial body location, append div, change class to blue-snake except for head
    const bodyLength = gameState.snake.body.length;
    for(let i = 0; i < bodyLength - 1; i++) {
        const bodyX = gameState.snake.body[i][0];
        const bodyY = gameState.snake.body[i][1];
        const snakeBody = document.createElement('div');
        snakeBody.className = "blue-snake";
        allRows[bodyY].childNodes[bodyX].appendChild(snakeBody);
    }
    // renderGameState function will assign class name to snake head
    const snakeHead = document.createElement('div');
    const headX = gameState.snake.body[bodyLength - 1][0];
    const headY = gameState.snake.body[bodyLength - 1][1];
    allRows[headY].childNodes[headX].appendChild(snakeHead);

    // renderGameState function will assign class name to apple
    const appleX = gameState.apple[0];
    const appleY = gameState.apple[1];
    const apple = document.createElement('div');
    allRows[appleY].childNodes[appleX].appendChild(apple);

    renderGameState();
}

// create the game board based on the gridSize
function createBoard() {
    for(let i = 0; i < gridSize; i++) {
        const newRow = document.createElement('tr');
        for(let j = 0; j < gridSize; j++) {
            const newCell = document.createElement('td');
            newCell.className = "light-orange";
            if(i % 2 === 0) {
                if(j % 2 === 0) {
                    newCell.className = "orange";
                }
            }
            else {
                if(j % 2 === 1) {
                    newCell.className = "orange";
                }
            }
            newRow.appendChild(newCell);
        }
        table.appendChild(newRow);
    }
}

// render snake head and apple
function renderGameState() {
    const bodyLength = gameState.snake.body.length;
    const headX = gameState.snake.body[bodyLength - 1][0];
    const headY = gameState.snake.body[bodyLength - 1][1];

    allRows[headY].childNodes[headX].childNodes[0].className = "blue-snake";

    // render apple div to red-apple if the location is empty
    // if user wins, snake head and apple location will be overlapping
    const appleX = gameState.apple[0];
    const appleY = gameState.apple[1];

    if(allRows[appleY].childNodes[appleX].childNodes[0].className === "") {
        allRows[appleY].childNodes[appleX].childNodes[0].className = "red-apple";
    }
}

// update game state based on user input
function updateGameState(event) {
    if(!finish) {
        const key = event.code;
        // return the old head if next direction is the same or opposite direction
        const newHead = createNewHead(key);

        // if old head the same as new head, don't update
        const bodyLength = gameState.snake.body.length;
        if(newHead[0] === gameState.snake.body[bodyLength - 1][0] 
            && newHead[1] === gameState.snake.body[bodyLength - 1][1]) {
            // do nothing
        }
        else {
            // check collision
            const collision = collisionCheck(newHead);

            switch(collision) {
                case "body":
                case "wall":
                    finish = true;
                    // display message, prompt user to play again
                    result.className = "not-hidden";
                    message.textContent = 'Game Over! Press "Play Again" button to play again!';
                    total += score;
                    average = (total / count).toFixed(1);
                    averageScore.textContent = `Average Score: ${average}`;
                    break;
                case "apple":
                    appendNewHead(newHead);
                    removeApple(newHead);
                    makeNewApple();
                    break;
                default:
                    // hits nothing
                    appendNewHead(newHead);
                    removeTail();
            }
            renderGameState();
        }
    } 
}

// return new head array based on keyboard input
function createNewHead(key) {
    const oldHeadX = gameState.snake.body[gameState.snake.body.length - 1][0];
    const oldHeadY = gameState.snake.body[gameState.snake.body.length - 1][1];

    if(key === "ArrowLeft" || key === "KeyA") {
        // if the same direction or opposite direction, return old head
        if(Math.abs(gameState.snake.nextDirection[0]) === 1) {
            return [oldHeadX, oldHeadY];
        }
        else {
            gameState.snake.nextDirection[0] = -1;
            gameState.snake.nextDirection[1] = 0;
        }
    }
    if(key === "ArrowRight" || key === "KeyD") {
        if(Math.abs(gameState.snake.nextDirection[0]) === 1) {
            return [oldHeadX, oldHeadY];
        }
        else {
            gameState.snake.nextDirection[0] = 1;
            gameState.snake.nextDirection[1] = 0;
        }
    }
    if(key === "ArrowDown" || key === "KeyS") {
        if(Math.abs(gameState.snake.nextDirection[1]) === 1) {
            return [oldHeadX, oldHeadY];
        }
        else {
            gameState.snake.nextDirection[0] = 0;
            gameState.snake.nextDirection[1] = 1;
        }
    }
    if(key === "ArrowUp" || key === "KeyW") {
        if(Math.abs(gameState.snake.nextDirection[1]) === 1) {
            return [oldHeadX, oldHeadY];
        }
        else {
            gameState.snake.nextDirection[0] = 0;
            gameState.snake.nextDirection[1] = -1;
        }
    }

    const newDirectionX = gameState.snake.nextDirection[0];
    const newDirectionY = gameState.snake.nextDirection[1];

    return [oldHeadX + newDirectionX, oldHeadY + newDirectionY];

}

// check collision with objects
function collisionCheck(newHead) {
    const x = newHead[0];
    const y = newHead[1];
    // collide with wall
    if(x >= gridSize || x <= -1 || y >= gridSize || y <= -1) {
        return "wall";
    }
    // collide with body or apple
    // allRows[y].childNodes[x].childNodes[0] cannot be empty, need to check length first
    const bodyOrApple = allRows[y].childNodes[x].childNodes;
    if(bodyOrApple.length !== 0) {
        if(bodyOrApple[0].className === "blue-snake") {
            return "body";
        }
        if(bodyOrApple[0].className === "red-apple") {
            return "apple";
        }
    }
    // hits nothing, return space, game contiune
    return " ";
}

// append the new head array to snake body
function appendNewHead(newHead) {
    gameState.snake.body.push(newHead);
    const headX = newHead[0];
    const headY = newHead[1];
    const snakeBody = document.createElement('div');
    allRows[headY].childNodes[headX].appendChild(snakeBody);
    // when board full of snake, user win
    if(gameState.snake.body.length === gridSize * gridSize) {
        finish = true;
        // display message, prompt user to play again
        result.className = "not-hidden";
        message.textContent = 'You Win! Press "Play Again" button to play again!';
        total += score;
        average = (total / count).toFixed(1);
        averageScore.textContent = `Average Score: ${average}`;
    }
}

// remove apple element when snake eats apple
function removeApple(newHead) {
    const appleX = newHead[0];
    const appleY = newHead[1];
    allRows[appleY].childNodes[appleX].childNodes[0].remove();

    score++;
    currentScore.textContent = `Score: ${score}`;

    // need to add 1 for the last point when user wins
    if(finish) {
        total += 1;
        average = (total / count).toFixed(1);
        averageScore.textContent = `Average Score: ${average}`;
    }
    if(score > best) {
        best = score;
        bestScore.textContent = `Best Record: ${best}`;
    }
}

// create new apple on empty location
function makeNewApple() {
    if(!finish) {
        const emptyLocations = [];
        // check empty location on each row
        for(let y = 0; y < allRows.length; y++) {
            for(let x = 0; x < allRows[y].childNodes.length; x++) {
                // push if location is empty
                if(allRows[y].childNodes[x].childNodes.length === 0) {
                    emptyLocations.push([x, y]);
                }
            }
        }
        // random generate the location from empty location array
        const randomIndex = Math.floor(Math.random() * emptyLocations.length);
        const randomLocationX = emptyLocations[randomIndex][0];
        const randomLocationY = emptyLocations[randomIndex][1];

        // update the new apple location
        gameState.apple[0] = randomLocationX;
        gameState.apple[1] = randomLocationY;

        // append new apple
        const newApple = document.createElement('div');
        allRows[randomLocationY].childNodes[randomLocationX].appendChild(newApple);
    }
}

// remove snake tail while snake is moving
function removeTail() {
    // remove tail
    const tail = gameState.snake.body.shift();
    const tailX = tail[0];
    const tailY = tail[1];
    allRows[tailY].childNodes[tailX].childNodes[0].remove();
}

// moving snake in one direction
function tick() {
    if(!finish) {
        const oldHeadX = gameState.snake.body[gameState.snake.body.length - 1][0];
        const oldHeadY = gameState.snake.body[gameState.snake.body.length - 1][1];
        const nextXdirection = gameState.snake.nextDirection[0];
        const nextYdirection = gameState.snake.nextDirection[1];
        const newHead = [oldHeadX + nextXdirection, oldHeadY + nextYdirection];

        const collision = collisionCheck(newHead);

        switch(collision) {
            case "body":
            case "wall":
                finish = true;
                // display message, prompt user to play again
                result.className = "not-hidden";
                message.textContent = 'Game Over! Press "Play Again" button to play again!';
                total += score;
                average = (total / count).toFixed(1);
                averageScore.textContent = `Average Score: ${average}`;
                break;
            case "apple":
                appendNewHead(newHead);
                removeApple(newHead);
                makeNewApple();
                break;
            default:
                // hits nothing
                appendNewHead(newHead);
                removeTail();
        }
        renderGameState();
    }

    if(finish) {
        clearInterval(interval);
    }
}

// set objects back to default
function resetDefault() {
    const bodyLength = gameState.snake.body.length;
    // pop snake, and remove snake elements
    for(let i = 0; i < bodyLength; i++) {
        const snakeBody = gameState.snake.body.pop();
        const bodyX = snakeBody[0];
        const bodyY = snakeBody[1];
        allRows[bodyY].childNodes[bodyX].childNodes[0].remove();
    }

    // pop apple, and remove apple element
    const appleY = gameState.apple.pop();
    const appleX = gameState.apple.pop();
    if(allRows[appleY].childNodes[appleX].childNodes.length !== 0) {
        allRows[appleY].childNodes[appleX].childNodes[0].remove();
    }

    // pop next direction
    gameState.snake.nextDirection.pop();
    gameState.snake.nextDirection.pop();

    score = 0;
    currentScore.textContent = `Score: ${score}`;
}
/* --------------------------- End of Functions --------------------------------*/