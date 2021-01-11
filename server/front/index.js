
let SYMBOL = ''
var state = []

//connecting to this address
const socket = io()


const Osvg = `<svg width="100" height="100" viewBox="-10 -10 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100ZM50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90Z" fill="#FC8585"/>
</svg>
`
const Xsvg = `<svg width="100" height="100" viewBox="20 20 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M98.9949 106.066C100.948 108.019 104.113 108.019 106.066 106.066C108.019 104.113 108.019 100.948 106.066 98.9949L77.7817 70.7107L106.066 42.4264C108.019 40.4738 108.019 37.308 106.066 35.3553C104.113 33.4027 100.948 33.4027 98.9949 35.3553L70.7107 63.6396L42.4264 35.3553C40.4738 33.4027 37.308 33.4027 35.3553 35.3553C33.4027 37.308 33.4027 40.4738 35.3553 42.4264L63.6396 70.7107L35.3553 98.9949C33.4027 100.948 33.4027 104.113 35.3553 106.066C37.308 108.019 40.4738 108.019 42.4264 106.066L70.7107 77.7817L98.9949 106.066Z" fill="#7ABCEB"/>
</svg>
`
let XavailableText = document.querySelector('.Xavailable')
let OavailableText = document.querySelector('.Oavailable')
const bell = document.querySelector('#bell')
const blop = document.querySelector('#blop')
const todo = document.querySelector('#todo')


window.onLoad(onLoad)


// ******************Life Cycle***************************
socket.on('connect', () => {
    console.log("Connected");
    document.querySelector('.connectionStatus').innerHTML = "Connected"
})


socket.on('disconnect', () => {
    document.querySelector('.connectionStatus').innerHTML = "Disconnected"

});


socket.on('reconnecting', () => {
    document.querySelector('.connectionStatus').innerHTML = "Reconnecting"
})


socket.on('reconnect', () => {
    document.querySelector('.connectionStatus').innerHTML = "Connected"
})

// ******************Life Cycle End***************************

socket.on('initialSymbolData', data => {
    const Xfound = data.find(symbol => symbol === 'X')
    const Ofound = data.find(symbol => symbol === 'O')

    if (!Xfound) {
        XavailableText.innerHTML = ''
    }
    if (!Ofound) {
        OavailableText.innerHTML = ''
    }
})

//assigning the symbol X or O
socket.on('symbol', data => {
    SYMBOL = data
})

//updating the state from backend
socket.on('update', data => {
    state = data
    document.querySelectorAll('.block').forEach((block, index) => {
        block.innerHTML = state[index] ? state[index] === 'O' ? Osvg : Xsvg : ''
    })
    if (JSON.stringify(data) === '[]') {
        console.log("%c Time out set", 'color:red;');
        setTimeout(() => {
            document.querySelector('.winner').innerHTML = ''

        }, 2000)
    }
});


//when someone wins showing alert
socket.on('winner', data => {
    console.log("Winner fired");
    bell.play()
    if (data === 'Tie') {
        document.querySelector('.winner').innerHTML = `Match Tie`
    }
    else {
        document.querySelector('.winner').innerHTML = `${data} won`
    }
})


socket.on('noAvailable', () => {
    if (XavailableText.innerHTML === 'available') {
        XavailableText.innerHTML = ''
    }
    if (OavailableText.innerHTML === 'available') {
        OavailableText.innerHTML = ''
    }
})


socket.on('symbolAvailable', (symbol) => {
    symbol === 'X' ? XavailableText.innerHTML = 'available' : OavailableText.innerHTML = 'available'
})


socket.on('symbolAssigned', data => {
    console.log("Symbol Assigned", data);

    data === 'X' ? XavailableText.innerHTML = 'You Selected' : OavailableText.innerHTML = 'You Selected'
    data === 'X' ? OavailableText.innerHTML = 'available' : XavailableText.innerHTML = 'available'

    SYMBOL = data
})


socket.on('symbolNotAvailable', symbol => {
    symbol === 'X' ? XavailableText.innerHTML = '' : OavailableText.innerHTML = ''
})



function symbolSelected(event, symbol) {
    //only sending when current assigned is not same as clicked
    blop.play()
    if (symbol !== SYMBOL) {
        socket.emit('symbolSelected', { symbol, assigned: SYMBOL })
    }
}


function onLoad() {
    //click event listeners to all blocks
    document.querySelectorAll('.block').forEach((block) => {
        block.addEventListener('click', function (event) {

            //block have id data
            const id = event.target.dataset.id

            blop.play()
            //if block is not clicked
            if (!state[id]) {
                // sending current id and current symbol to backend
                socket.emit('selectedBlock', { id, symbol: SYMBOL })
                   
            }
        })
    })

    //for restart button 
    document.querySelector('.restart').addEventListener('click', () => {
        socket.emit('restart', 0)
        document.querySelector('.winner').innerHTML = ''
    })

    document.querySelector('.X').innerHTML = Xsvg
    document.querySelector('.O').innerHTML = Osvg
}
