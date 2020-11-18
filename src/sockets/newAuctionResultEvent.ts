// import { auctionNamespace } from './index';
// import { AuctionResult } from '../interfaces/auctionResult';

// const NEW_AUCTION_RESULT = 'new_auction_result';
// export default (auctionResut: AuctionResult) => {
//     // console.log('auction id:', auctionResut.id);
//     auctionNamespace
//         .in(auctionResut.id.toString())
//         .emit(NEW_AUCTION_RESULT, auctionResut);
// }