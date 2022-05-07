import NonFungibleToken from 0xNONFUNGIBLETOKEN
import DaysOnFlow from 0xDAYSONFLOW

// This script reads metadata about an NFT in a user's collection
pub fun main(account: Address, id: UInt64): &DaysOnFlow.NFT? {

    // Get the public collection of the owner of the token
    let collectionRef = getAccount(account)
        .getCapability(DaysOnFlow.CollectionPublicPath)
        .borrow<&DaysOnFlow.Collection{DaysOnFlow.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")

    // Borrow a reference to a specific NFT in the collection
    let nft = collectionRef.borrowDOF(id: id)

    return nft
}