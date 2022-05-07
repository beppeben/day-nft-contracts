import DaysOnFlow from 0xDAYSONFLOW

pub fun main(seriesId: UInt64, address: Address): Int {
    let series = DaysOnFlow.getSeries(seriesId: seriesId)
    return series.nbDayNFTwlToMint(address: address)
}