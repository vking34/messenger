export interface AuctionEvent {
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
    timeEnd: number,
    isSold: number,
    winnerName: string
};