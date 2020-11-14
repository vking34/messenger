export interface AuctionResult {
    id: number,
    type: string,
    phaseId: number,
    state: string,
    bidsCount: number,
    biddersCount: number,
    winnerId: number,
    currentPrice: number,
    priceBidAutoHighest: number,
    timeStart: number,
    timeEnd: number
};