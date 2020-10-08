# CZ Messenger

## Techstack
- Nodejs: Runtime Environment
- Express: Web framework
- Socket.io: Socket library
- Redis (for scalability): pub/sub messages and socket ids
- MongoDB: Message store


## API
### Rest API
- Postman docs: https://documenter.getpostman.com/view/4640091/TVRd8qr4

### Socket
1. Handshake:
     - Namespace: /v1/conversations/events
     - Path: /v1/conversations/sockets
     - Query:
          - ```token```
          - ```user_id```
          - ```user_role```: BUYER / SELLER

     - Example:
     ```
     var socket = io('https://api.chozoi.com/v1/conversations/events', {
     path: '/v1/conversations/sockets',
     transports: ['websocket'],
     query: {
          token: 'access_token',
          user_id: 'user_id',
          user_role: 'BUYER'
     }});
     ```

2. Events:

      - ```create_room```:
          - client:
               - ```type```: Room type. Value: BS
               - ```buyer```: Buyer ID
               - ```seller```: Seller ID
               - ```shop_id```: Shop ID
               -  ```creator```: Buyer ID or Seller ID

          - server:
               - ```room_id```: Room ID. Value: \<BuyerID\>.\<SellerID\>
               - ```type```: Room type. Value: BS
               - ```buyer```: Buyer ID
               - ```seller```: Seller ID
               - ```shop_id```: Shop ID
               -  ```creator```: Buyer ID or Seller ID

     - ```new_message```:
          - client:
               - ```room_id```: Room ID. Value: \<BuyerID\>.\<SellerID\>
               - ```from```: Sender ID
               - ```to```: Receiver ID
               - ```type```: TEXT | IMAGE | EMOJI
               -  ```content```: Message content
               -  ```client_message_id```: (optional) Client generator unique id for server to comfirm

          - server:
               - ```_id```: Message Id generated by server.
               - ```room_id```: Room ID. Value: \<BuyerID\>.\<SellerID\>
               - ```from```: Sender ID
               - ```to```: Receiver ID
               - ```type```: TEXT | IMAGE | EMOJI
               -  ```content```: Message content
               -  ```client_message_id```: (optional) Client generator unique id for server to comfirm
               - ```created_at```: Created time

     - ```reconnect```:
          - client: emit event ```verify_user```:
               - ```token```
               - ```user_id```
               - ```user_role```: BUYER / SELLER

     - ```verify_user```:
          - client:
               - ```token```
               - ```user_id```
               - ```user_role```: BUYER / SELLER
          - server:
               - ```status```: boolean

     - ```typing```:
          - client:
               - ```room_id```: Room ID. Value: \<BuyerID\>.\<SellerID\>
               - ```from```: Sender ID
               - ```to```: Receiver ID
          - server:
               - ```room_id```: Room ID. Value: \<BuyerID\>.\<SellerID\>
               - ```from```: Sender ID
               - ```to```: Receiver ID
          
     - ```stop_typing```:
          - client:
               - ```room_id```: Room ID. Value: \<BuyerID\>.\<SellerID\>
               - ```from```: Sender ID
               - ```to```: Receiver ID
          - server:
               - ```room_id```: Room ID. Value: \<BuyerID\>.\<SellerID\>
               - ```from```: Sender ID
               - ```to```: Receiver ID
          

     - ```seen_messages```:
          - client:
               - ```room_id```: Room ID. Value: \<BuyerID\>.\<SellerID\>
               - ```from```: Sender ID
               - ```to```: Receiver ID
               - ```message_ids```: An array of the seen messages 

          - server:
               - ```room_id```: Room ID. Value: \<BuyerID\>.\<SellerID\>
               - ```from```: Sender ID
               - ```to```: Receiver ID
               - ```message_ids```: An array of the seen messages 


## DB Schema
![](ref/img/cz-chat-schema.png)


## References
1. Socket.io
     - Server: https://socket.io/docs/server-api/
     - Client: https://socket.io/docs/client-api/