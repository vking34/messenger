var TYPING_TIMER_LENGTH = 400; // ms
var $inputMessage = $('.inputMessage');

$inputMessage.on('input', () => {
    updateTyping();
});

// Updates the typing event
const updateTyping = () => {
    if (connected) {
        if (!typing) {
            typing = true;

            socket.emit('typing', {
                room_id,
                from: username,
                to: receiver
            });
        }
        lastTypingTime = (new Date()).getTime();

        setTimeout(() => {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                socket.emit('stop_typing', {
                    from: username,
                    to: receiver
                });
                typing = false;
            }
        }, TYPING_TIMER_LENGTH);
    }
}