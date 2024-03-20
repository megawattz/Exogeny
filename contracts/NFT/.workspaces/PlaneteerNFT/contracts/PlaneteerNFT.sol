/// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/presets/ERC1155PresetMinterPauser.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title PlaneteerNFT
 * @dev Planeteer NFT Contract ERC1155 Standardasdf
 */

// OpenSea code added to let users buy Polygon tokens without paying Polygon gas fees because
// most don't have MATIC in their wallet
abstract contract ContextMixin {
    function msgSender()
        internal
        view
        returns (address payable sender)
    {
        if (msg.sender == address(this)) {
            bytes memory array = msg.data;
            uint256 index = msg.data.length;
            assembly {
                // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
                sender := and(
                    mload(add(array, index)),
                    0xffffffffffffffffffffffffffffffffffffffff
                )
            }
        } else {
            sender = payable(msg.sender);
        }
        return sender;
    }
}

contract PlaneteerNFT is ERC1155, Ownable, ERC1155Pausable, ERC1155Burnable, ERC1155Supply, ContextMixin {

    using EnumerableSet for EnumerableSet.UintSet;
    mapping(address => EnumerableSet.UintSet) private _ownedTokens;

    string public name;
    string public symbol;
    string contractMetadataURI;

    // example or URL template, ipfs://QmZ3MqUtkTR8amyzFWkKeabqVWH4vEfLSxEaNN6s9tJVap/{id}.json
    constructor(string memory _name) ERC1155("") Ownable(msg.sender)
    {
        name = _name;
    }

    // Open sea hook to allow users without MATIC in wallet to transact
    function _msgSender() internal override view returns (address sender)
    {
        return ContextMixin.msgSender();
    }

    // Override the _beforeTokenTransfer hook to update the ownership mapping
    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal virtual override
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        if (from != address(0)) { // If not minting
            for (uint256 i = 0; i < ids.length; ++i) {
                _ownedTokens[from].remove(ids[i]);
            }
        }
        if (to != address(0)) { // If not burning
            for (uint256 i = 0; i < ids.length; ++i) {
                _ownedTokens[to].add(ids[i]);
            }
        }
    }

    // Function to get the list of token IDs owned by an account
    function getOwnedTokens(address account) external view returns (uint256[] memory) {
        uint256 length = _ownedTokens[account].length();
        uint256[] memory tokens = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            tokens[i] = _ownedTokens[account].at(i);
        }
        return tokens;
    }

    function contractURI() public view returns (string memory) {
        return contractMetadataURI; // just use the raw NFT URI for the contract metadata 
    }

    function setContractURI(string memory _uri) public onlyOwner {
        contractMetadataURI = _uri; 
    }

    function setURI(string memory _newuri) public onlyOwner {
        _setURI(_newuri);
    }

    function setName(string memory _newname) public onlyOwner {
        name = _newname;
    }

    function setSymbol(string memory _newsymbol) public onlyOwner {
        symbol = _newsymbol;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Pausable, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }

    function isApprovedForAll(address _owner,address _operator) public override view returns (bool isOperator) {
        // if OpenSea's ERC1155 Proxy Address is detected, auto-return true
            // for Polygon's Mumbai testnet, use 0x53d791f18155C211FF8b58671d0f7E9b50E596ad
        if (_operator == address(0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101)) { // for Polygon
            return true;
        }
        if (_operator == address(0x53d791f18155C211FF8b58671d0f7E9b50E596ad)) { //for Mumbai
            return true;
        }
        // otherwise, use the default ERC1155.isApprovedForAll()
        return ERC1155.isApprovedForAll(_owner, _operator);
    }
}
