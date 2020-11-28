import { auctionNamespace } from './index';
import { AuctionEvent } from '../interfaces/auctionResult';

const NEW_AUCTION_RESULT = 'new_auction_result';
export default (auctionEvent: AuctionEvent) => {
    // console.log('auction id:', auctionEvent.id);
    auctionNamespace
        .in(auctionEvent.id.toString())
        .emit(NEW_AUCTION_RESULT, auctionEvent);
}