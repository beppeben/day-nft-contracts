import DaysOnFlow from 0xDAYSONFLOW

transaction(seriesId: UInt64) {
    
    prepare(signer: AuthAccount) {

        let minter = signer.borrow<&DaysOnFlow.SeriesMinter>(from: DaysOnFlow.SeriesMinterStoragePath)

        minter!.removeSeries(seriesId: seriesId)
    }
}
 