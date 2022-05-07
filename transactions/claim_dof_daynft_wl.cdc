import DaysOnFlow from 0xDAYSONFLOW
import MetadataViews from 0xMETADATAVIEWS

transaction(seriesId: UInt64) {

    let address: Address
    
    prepare(signer: AuthAccount) {
        if (signer.getCapability(DaysOnFlow.CollectionPublicPath)
            .borrow<&DaysOnFlow.Collection{DaysOnFlow.CollectionPublic}>() == nil) {
            // Create a Collection resource and save it to storage
            let collection <- DaysOnFlow.createEmptyCollection()
            signer.save(<-collection, to: DaysOnFlow.CollectionStoragePath)

            // create a public capability for the collection
            signer.link<&DaysOnFlow.Collection{DaysOnFlow.CollectionPublic, MetadataViews.ResolverCollection}>(
                DaysOnFlow.CollectionPublicPath,
                target: DaysOnFlow.CollectionStoragePath
            )
        }

        self.address = signer.address 
    }

    execute { 
        let series = DaysOnFlow.getSeries(seriesId: seriesId)
        series.mintDayNFTwl(address: self.address)
    }
}
 