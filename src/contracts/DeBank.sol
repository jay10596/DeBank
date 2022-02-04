// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeBank {
    // State variables
    string public name;
    uint public postCount = 0; 

    // Equivalent to database
    struct Post {
        uint id;
        string content;
        string mediaHash;
        uint tip;
        address author;
    }

    // Similar to declaring PK for adding data
    mapping(uint => Post) public posts;

    // Emit event when a post is created
    event PostCreated(
        uint id,
        string content,
        string mediaHash,
        uint tip,
        address author
    );

    // Emit event when a post gets tipped
    event PostTipped(
        uint id,
        string content,
        string mediaHash,
        uint tip,
        address author
    );

    constructor() {
        name = "A Decentralized Bank";

        // Create a default post
        createPost("This is a Default Post", "", 0);
    }

    function createPost(string memory _content, string memory _mediaHash, uint _tip) public {
        // Validation
        require(bytes(_content).length > 0);
        require(_tip == 0); // Initial tip amount will be 0 when you create a post

        // Update counter
        postCount ++;

        // Create a post
        posts[postCount] = Post(postCount, _content, _mediaHash, _tip, msg.sender);

        // Trigger an event (Similar to return)
        emit PostCreated(postCount, _content, _mediaHash, _tip, msg.sender);
    }

    function tipPost(uint _id) public payable {
        // Fetch post and author
        Post memory _post = posts[_id];

        // Validation
        require(_post.id > 0 && _post.id <= postCount); // Id is valid
        require(msg.value > 0); // There is enough ETH in transation
        require(msg.sender != _post.author); // Reader is not the author

        // Add new tip to the post
        _post.tip = _post.tip + msg.value;

        // Update the actual product in blockchain
        posts[_id] = _post;

        // Pay the author
        payable(_post.author).transfer(msg.value);

        // Trigger an event
        emit PostTipped(postCount, _post.content, _post.mediaHash, _post.tip, _post.author);
    }
}



/*
Extra Notes:
    1) Why counter?
    Solidity doesn't tell us how many products are in Struct. It returns empty vals if you've 5 prods and search for 6. 

    2) What is state/public variable?
    Using public converts vaiable into function which can be used globally including console. More like auto increment PK.

    3) Why to trigger event?
    In Laravel, we return some value in the function. In solidity, we can trigger an event which will be passed as an argument in the callback of this function.

    4) What is msg.sender?
    It's the address of the person who calls the function i.e the one who makes the purchase with his wallet. In this case, msg. values come from metadata (msg.sender = from: buyer). 

    5) What is require() in a function?
    The function will throw an exception and will stop the execution if the condition is not correct in order to save gas fee.

    6) Why _ on parameters?
    _ is just for naming convention to differentiate local variables from state variables. 

    7) What is Product memory _product?
    Creates a duplicate copy of the product that exists in the blockchain and assigns it to the local variable _product. 

    8) What is payable?
    Solidity can't let you transfer money or use metadata(msg) value without payable function. The variable which contains owner address also must have payable.

    9) What happens ofter transfering the value?
    Check the Ganache network. The msg.sender/from: buyer (3rd account) will lose 1 eth and owner (2nd account) will gain one.   

    10) Why we use Wei?
    Solidity doesn't have decimal data type. Therefore, we have to convert decimal values (actual ETH) into wei. In other words, Eth = Dollar, Wei = Cent.
*/

