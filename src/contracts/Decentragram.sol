pragma solidity ^0.5.0;

contract Decentragram {
    string public name = "Decentragram";
    uint public imageLength = 0;

    // Store Images
    mapping(uint => Image) public images;

    struct Image {
        uint id;
        string hash;
        string description;
        uint tipAmount;
        address payable author;
    }

    event ImageCreated (
        uint id,
        string hash,
        string description,
        uint tipAmount,
        address payable author
    );

    event ImageTipped (
        uint id,
        string hash,
        string description,
        uint tipAmount,
        address payable author
    );

    // Create Images
    function uploadImage(string memory _imgHash, string memory _description) public {
        // Require image
        require(bytes(_imgHash).length > 0);
        // Require description
        require(bytes(_description).length > 0);
        // Require sender is not blanck
        require(msg.sender != address(0x0));

        // Increment imageLength
        imageLength = imageLength + 1;
        // Add image to contract
        images[imageLength] = Image(imageLength, _imgHash, _description, 0, msg.sender);
        // Trigger event
        emit ImageCreated(imageLength, _imgHash, _description, 0, msg.sender);
    }

    // Tip Images
    function tipImageOwner(uint _id) public payable {
        // Make sure _id exists and is in range
        require(_id > 0 && _id <= imageLength);

        uint amountTip = msg.value;

        // Get image
        Image memory _image = images[_id];
        // Get author from image
        address payable _author = _image.author;
        // Transfer author
        address(_author).transfer(amountTip);

        // Update image tip amount
        _image.tipAmount = _image.tipAmount + amountTip;
        // Update image
        images[_id] = _image;

        // Trigger event
        emit ImageTipped(_id, _image.hash, _image.description, _image.tipAmount, _author);
    }
}
