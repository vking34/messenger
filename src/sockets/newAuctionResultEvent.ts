
import { AUCTION_RESULT_NS } from '.';
import io from './index';

const NEW_AUCTION_RESULT = 'new_auction_result';
export default (auctionResult) => {
     console.log(auctionResult.id);

     io.of(AUCTION_RESULT_NS).in(auctionResult.id).emit(NEW_AUCTION_RESULT, auctionResult);
}