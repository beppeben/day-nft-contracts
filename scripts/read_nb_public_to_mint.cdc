import DaysOnFlow from 0xDAYSONFLOW

pub fun main(seriesId: UInt64): Int {
    let series = DaysOnFlow.getSeries(seriesId: seriesId)
    return series.nbPublicToMint()
}