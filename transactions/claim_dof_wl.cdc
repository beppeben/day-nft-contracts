import DaysOnFlow from 0xDAYSONFLOW
import MetadataViews from 0xMETADATAVIEWS
import FlowToken from 0xFLOWTOKEN

transaction(seriesId: UInt64, bidAmount: UFix64) {

    let address: Address
    let vault: @FlowToken.Vault
    
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

        let mainVault = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                    ?? panic("Could not borrow a reference to the flow vault")
        self.vault <- mainVault.withdraw(amount: bidAmount) as! @FlowToken.Vault

        self.address = signer.address 
    }

    execute { 
        let series = DaysOnFlow.getSeries(seriesId: seriesId)
        series.mintWl(address: self.address, vault: <- self.vault)
    }
}
 