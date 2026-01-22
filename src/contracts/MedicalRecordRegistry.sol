// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MedicalRecordRegistry
 * @dev Registry for storing hashes of medical records to ensure integrity.
 */
contract MedicalRecordRegistry {
    struct Record {
        bytes32 docHash;
        string ipfsCid;
        address doctor;
        uint256 timestamp;
    }

    // Mapping from document hash to Record details
    mapping(bytes32 => Record) public records;

    event RecordStored(
        bytes32 indexed docHash,
        string ipfsCid,
        address indexed doctor,
        uint256 timestamp
    );

    /**
     * @dev Store a new medical record hash.
     * @param _docHash The SHA-256/Keccak-256 hash of the document (PDF).
     * @param _ipfsCid The IPFS Content Identifier where the document is stored.
     */
    function storeRecord(bytes32 _docHash, string memory _ipfsCid) public {
        require(records[_docHash].timestamp == 0, "Record already exists");

        records[_docHash] = Record({
            docHash: _docHash,
            ipfsCid: _ipfsCid,
            doctor: msg.sender,
            timestamp: block.timestamp
        });

        emit RecordStored(_docHash, _ipfsCid, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify if a record exists and return its details.
     * @param _docHash The hash of the document to verify.
     */
    function verifyRecord(bytes32 _docHash) public view returns (bool exists, string memory ipfsCid, address doctor, uint256 timestamp) {
        Record memory rec = records[_docHash];
        if (rec.timestamp == 0) {
            return (false, "", address(0), 0);
        }
        return (true, rec.ipfsCid, rec.doctor, rec.timestamp);
    }
}
