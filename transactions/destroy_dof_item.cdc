import DaysOnFlow from 0xDAYSONFLOW

transaction(id: UInt64) {
    prepare(signer: AuthAccount) {

        let collection = signer.borrow<&DaysOnFlow.Collection>(from: DaysOnFlow.CollectionStoragePath)?? panic("Could not borrow a reference to the collection")

        let nft <- collection.withdraw(withdrawID: id)
        destroy nft
    }
}
 