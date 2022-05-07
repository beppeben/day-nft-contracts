import NonFungibleToken from 0xNONFUNGIBLETOKEN
import DaysOnFlow from 0xDAYSONFLOW

pub fun main(account: Address): [UInt64] {
    let collectionRef = getAccount(account)
        .getCapability(DaysOnFlow.CollectionPublicPath)
        .borrow<&DaysOnFlow.Collection{DaysOnFlow.CollectionPublic}>()
        ?? panic("Could not get reference to the NFT Collection")

    return collectionRef.getIDs()
}
