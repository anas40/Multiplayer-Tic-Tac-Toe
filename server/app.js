const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const path = require('path')

const checkWinner = require('./Calculations')
//closign previos server

app.use("/front", express.static(__dirname + '/front'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/front/index.html'));
});

let availSymbol = ['X', 'O']

var lastCall = ''

var state = []
var connections = 0
//when connection occur for first time
io.on('connection', (socket) => {

    connections++
    console.log("connection", connections);

    socket.emit("initialSymbolData", availSymbol)

    socket.emit('update', state)
    //assigning first available letter

    socket.on('symbolSelected', ({ symbol, assigned = '' }) => {

        if (availSymbol.length === 2) {

            availSymbol = availSymbol.filter(value => value !== symbol)
            socket.emit('symbolAssigned', symbol)
            socket.broadcast.emit('symbolNotAvailable', symbol)
            socket.symbolAssigned = symbol
        }

        else if (availSymbol.length === 1) {
            if (!assigned) {

                if (availSymbol[0] === symbol) {
                    availSymbol.pop()
                    socket.emit('symbolAssigned', symbol)
                    socket.symbolAssigned = symbol
                    io.emit('noAvailable')

                }

            }
            else {

                availSymbol = []
                assigned === 'X' ? availSymbol.push('X') : availSymbol.push('O')
                socket.emit('symbolAssigned', symbol)
                socket.symbolAssigned = symbol
                socket.broadcast.emit('symbolAvailable', availSymbol[0])
                socket.broadcast.emit('symbolNotAvailable', symbol)

            }
        }

    })

    //whenever a block is clicked
    socket.on('selectedBlock', (data) => {

        if (lastCall != data.symbol) {
            //checking if not already clicked
            lastCall = data.symbol
            if (!state[data.id]) {
                // updating symbol in array
                state[data.id] = data.symbol;
                //checking if anyone has won or not
                const winner = checkWinner(state)
                console.log(winner);
                if (winner) {
                    //sinding winner symbol
                    console.log("Server winner", winner);
                    io.emit('winner', winner)
                    io.emit('update', state)
                    restart()
                }
                else {
                    //sending updated state
                    io.emit('update', state)
                }
            }
        }
    })

    //when to restart
    socket.on('restart', () => {
        restart()
    })


    socket.on('disconnect', () => {
        connections--
        if (socket.symbolAssigned) {
            const found = availSymbol.find(symbol => symbol === socket.symbolAssigned)
            if (!found) {
                availSymbol.push(socket.symbolAssigned)
            }
        }
        console.log('array', availSymbol);
        console.log(connections, "connections");
    })
})

//sending empty state as a update 
function restart() {
    console.log("Restart");
    lastCall = ''
    state = []
    availSymbol = ['X', 'O']
    io.emit('update', state)
}





http.listen(3000, () => {
    console.log('listening on *:3000');
});
