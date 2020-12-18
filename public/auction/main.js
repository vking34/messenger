$(function() {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    // Initialize variables
    var $window = $(window);
    var $auctionId = $('#auctionId'); // Input for from ID
    var $receiverId = $('#receiverId');
    var $userRole = $('#userRole');
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box

    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page

    // Prompt for setting a username
    var username;
    var receiver;
    var userRole;
    var roomId;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    // var $currentInput = $fromId.focus();
    var messages = [];

    var $receiver = $('.receiverId');
    var $sendBtn = $('#sendMsgBtn');

    // const API_URL = 'https://api.chozoi.com';
    const API_URL = 'https://api.chozoi.vn';
    // const API_URL = 'http://localhost:3002';
    const AUCTION_RESULT_NS = API_URL + '/v1/conversations/auction-result-events';

    $sendBtn.click(() => {
        console.log("sending...");
        sendMessage();
        socket.emit('stop_typing', {
            from: username,
            to: receiver
        });
        typing = false;
    })

    // Sets the client's username
    const createRoom = () => {
        const auctionId = cleanInput($auctionId.val().trim());

        let auctionSocket = io(AUCTION_RESULT_NS, {
            path: '/v1/conversations/sockets',
            transports: ['websocket'],
            query: {
                token: 'access_token',
                auction_id: auctionId
            }
        });

        auctionSocket.on('connect', () => {
            console.log('auction socket is connected!');
        })

        auctionSocket.on('new_auction_result', auctionResult => {
            console.log(auctionResult);
        })
    }

    // Sends a chat message
    const sendMessage = () => {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $inputMessage.val('');
            const data = {
                room_id: roomId,
                from: username,
                to: receiver,
                type: 'TEXT',
                content: message
            };
            console.log(data);
            //   addChatMessage(data);
            // tell server to execute 'new_message' and send along one parameter
            socket.emit('new_message', data);
        }
    }

    // Log a message
    const log = (message, options) => {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }

    // Adds the visual chat message to the message list
    const addChatMessage = (data, options) => {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var $usernameDiv = $('<span class="username"/>')
            .text(data.from)
            .css('color', getUsernameColor(data.from));
        var $messageBodyDiv = $('<span class="messageBody">')
            .text(data.content);

        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
            .data('username', data.from)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv, options);

        if (data._id) {
            messages.push(data);
            console.log("message store: ", messages);
        }
    }

    // Adds the visual chat typing message
    const addChatTyping = (data) => {
        data.typing = true;
        data.content = 'is typing';
        addChatMessage(data);
    }

    // Removes the visual chat typing message
    const removeChatTyping = (data) => {
        console.log("stop_typing: ", data);
        getTypingMessages(data).fadeOut(function() {
            $(this).remove();
        });
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    const addMessageElement = (el, options) => {
        var $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // Prevents input from having injected markup
    const cleanInput = (input) => {
        return $('<div/>').text(input).html();
    }

    // Updates the typing event
    const updateTyping = () => {
        if (connected) {
            if (!typing) {
                typing = true;

                socket.emit('typing', {
                    room_id: roomId,
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
                        room_id: roomId,
                        from: username,
                        to: receiver
                    });
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

    // Gets the 'X is typing' messages of a user
    const getTypingMessages = (data) => {
        return $('.typing.message').filter(function(i) {
            return $(this).data('username') === data.from;
        });
    }

    // Gets the color of a username through our hash function
    const getUsernameColor = (username) => {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    // Keyboard events

    $window.keydown(event => {
        // Auto-focus the current input when a key is typed
        // if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        //     $currentInput.focus();
        // }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                sendMessage();
                var receiver = $receiver.val();
                socket.emit('stop_typing', {
                    from: username,
                    to: receiver
                });
                typing = false;
            } else {
                createRoom();
            }
        }
    });

    $inputMessage.on('input', () => {
        updateTyping();
    });

    // Click events

    // Focus input when clicking anywhere on login page
    // $loginPage.click(() => {
    //     $currentInput.focus();
    // });

    // Focus input when clicking on the message input's border
    $inputMessage.click(() => {
        $inputMessage.focus();


        // all unseen messages
        var last_msg = messages[messages.length - 1];
        console.log('seen', last_msg);
        // if (last_msg00)
        //     if (last_msg00.from !== username)

        socket.emit('seen_messages', {
            room_id: roomId,
            from: username,
            to: receiver,
            last_message_id: last_msg._id,
            last_message_created_at: last_msg.created_at
        });
    });

    // // Socket events

    // socket.on('connect', () => {
    //     console.log(socket);
    // });

    // // get list of active users
    // socket.on('active_user_list', (data) => {
    //     console.log(data);
    // })

    // // on user status change
    // socket.on('change_user_status', (data) => {
    //     console.log(data);
    // })

    // // on create room
    // socket.on('create_room', room => {
    //     console.log('created room: ', room);
    //     connected = true;

    //     // Display the welcome message
    //     const { buyer, seller } = room;
    //     var message = "buyer: " + buyer + ", seller: " + seller;
    //     log(message, {
    //         prepend: true
    //     });
    //     addParticipantsMessage({ numUsers: 1 });
    // });

    // // Whenever the server emits 'new_message', update the chat body
    // socket.on('new_message', (data) => {
    //     console.log("receiving: ", data);
    //     addChatMessage(data);
    // });

    // // On the other client have seen messages
    // socket.on('seen_messages', (data) => {
    //     console.log(data);
    // })

    // // Whenever the server emits 'user joined', log it in the chat body
    // socket.on('user joined', (data) => {
    //     log(data.username + ' joined');
    //     addParticipantsMessage(data);
    // });

    // // Whenever the server emits 'user left', log it in the chat body
    // socket.on('user left', (data) => {
    //     log(data.username + ' left');
    //     addParticipantsMessage(data);
    //     removeChatTyping(data);
    // });

    // // Whenever the server emits 'typing', show the typing message
    // socket.on('typing', (data) => {
    //     addChatTyping(data);
    // });

    // // Whenever the server emits 'stop_typing', kill the typing message
    // socket.on('stop_typing', (data) => {
    //     removeChatTyping(data);
    // });

    // socket.on('disconnect', () => {
    //     console.log('disconnected!');
    //     log('you have been disconnected');
    // });

    // socket.on('reconnect', () => {
    //     log('you have been reconnected');
    //     if (username) {
    //         socket.emit('set usernames', { from: username, to: receiver });
    //     }
    // });

    // socket.on('reconnect_error', () => {
    //     log('attempt to reconnect has failed');
    // });

});