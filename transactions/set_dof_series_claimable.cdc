import DaysOnFlow from 0xDAYSONFLOW

transaction(seriesId: UInt64, wlClaimable: Bool, publicClaimable: Bool) {
    
    prepare(signer: AuthAccount) {

        let minter = signer.borrow<&DaysOnFlow.SeriesMinter>(from: DaysOnFlow.SeriesMinterStoragePath)

        minter!.setClaimable(seriesId: seriesId, wlClaimable: wlClaimable, publicClaimable: publicClaimable)
    }
}
 