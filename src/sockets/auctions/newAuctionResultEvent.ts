import { auctionNamespace, auctionSetNamespace } from '../index';
import { AuctionEvent } from '../../interfaces/auctionResult';
import { getUserName } from '../../utils/chozoi.utils';


const NEW_AUCTION_RESULT = 'new_auction_result';
export default async (auctionEvent: AuctionEvent) => {
    
    auctionNamespace
        .in(auctionEvent.id.toString())
        .emit(NEW_AUCTION_RESULT, auctionEvent);

    const winnerName = await getUserName(auctionEvent.winnerId);
    auctionEvent.winnerName = winnerName;
    // console.log('auction id:', auctionEvent.id, 'winner id:', auctionEvent.winnerId, 'name:', winnerName);
    auctionSetNamespace
        .in(auctionEvent.id.toString())
        .emit(NEW_AUCTION_RESULT, auctionEvent)
        ;
}