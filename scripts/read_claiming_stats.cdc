import DaysOnFlow from 0xDAYSONFLOW

pub fun main(seriesId: UInt64): [Int] {
    let series = DaysOnFlow.getSeries(seriesId: seriesId)
    let dwl = series.dayNFTwlStats()
    var allStats = series.wlStats()
    for d in dwl {
      allStats.append(d)
    }
    return allStats
}