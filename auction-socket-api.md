# Auction Socket API

## Lib: socket.io-client
## Handshake:

- Auction Result Namespace:
    ```
    const API_URL = 'https://api.chozoi.com';
    const AUCTION_RESULT_NS = API_URL + '/v1/conversations/auction-result-events';

    let auctionSocket = io(AUCTION_RESULT_NS, {
            path: '/v1/conversations/sockets',
            transports: ['websocket'],
            query: {
                token: 'access_token',
                auction_id: '3753'
            }
        });
    ```

- Auction Result List Namespace:
    ```
    const API_URL = 'https://api.chozoi.com';
    const AUCTION_RESULT_LIST_NS = API_URL + '/v1/conversations/auction-result-list-events';

    let auctionSetSocket = io(AUCTION_RESULT_LIST_NS, {
            path: '/v1/conversations/sockets',
            transports: ['websocket'],
            query: {
                token: 'access_token',
                auction_ids: '3753,4523'
            }
        });
    ```

## Events: (server ```emit```, client ```on```)

- ```new_auction_result```:
     - server:
          - ```id```: long. Auction ID
          - ```type```: string
          - ```phaseId```: long
          - ```state```: string
          - ```bidsCount```: int
          - ```biddersCount```: int
          - ```winnerId```: long. 0 if no one wins.
          - ```currentPrice```: long
          - ```priceBidAutoHighest```: long
          - ```timeStart```: long. The starting time of the next phase = the ending time of the current phase + 3s
          - ```timeEnd```: long.
          - ```isSold```: int. 0 - not sold yet, 1 - sold. default: 0
          - ```winnerName```: string. present only in Auction Set namespace.

## Get name of winner
- API: {account_service}/v1/users/\<user-id>
- Response:
    - ```name```
