import DaysOnFlow from 0xDAYSONFLOW

transaction(_wlClaimable: Bool,
            _publicClaimable: Bool,
            _description: String, 
            _image: String, 
            _name: String,
            _dayNFTwl: [UInt64],           
            _wl: [Address],
            _wlPrice: UFix64,
            _publicSupply: UInt64,
            _publicPrice: UFix64) {
    
    prepare(signer: AuthAccount) {

        let minter = signer.borrow<&DaysOnFlow.SeriesMinter>(from: DaysOnFlow.SeriesMinterStoragePath)

        minter!.createSeries(
            _wlClaimable: _wlClaimable,
            _publicClaimable: _publicClaimable,
            _description: _description, 
            _image: _image, 
            _name: _name,
            _dayNFTwl: _dayNFTwl,           
            _wl: _wl,
            _wlPrice: _wlPrice,
            _publicSupply: _publicSupply,
            _publicPrice: _publicPrice)
    }
}
 