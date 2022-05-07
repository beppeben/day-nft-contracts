import DaysOnFlow from 0xDAYSONFLOW

pub fun main(seriesId: UInt64, address: Address): Bool {
    let series = DaysOnFlow.getSeries(seriesId: seriesId)
    return series.hasWlToMint(address: address)
}