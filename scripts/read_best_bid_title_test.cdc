import DayNFT from 0xDAYNFTCONTRACTADDRESS
import DateUtils from 0xDATEUTILSCONTRACTADDRESS

pub fun main(today_arr: [Int]): String? {
    let today = DateUtils.Date(day: today_arr[0], month: today_arr[1], year: today_arr[2])
    return DayNFT.getBestBidTitleWithToday(today: today)
}
