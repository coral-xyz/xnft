export type Xnft = {
  version: '0.1.0';
  name: 'xnft';
  constants: [
    {
      name: 'MAX_NAME_LEN';
      type: {
        defined: 'usize';
      };
      value: '30';
    },
    {
      name: 'MAX_RATING';
      type: 'u8';
      value: '5';
    }
  ];
  instructions: [
    {
      name: 'createXnft';
      docs: [
        'Creates all parts of an xNFT instance.',
        '',
        '* Master mint (supply 1).',
        '* Master token.',
        '* Master metadata PDA associated with the master mint.',
        '* Master edition PDA associated with the master mint.',
        '* xNFT PDA associated with the master edition.',
        '',
        'Once this is invoked, an xNFT exists and can be "installed" by users.'
      ];
      accounts: [
        {
          name: 'masterMint';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'publisher';
              },
              {
                kind: 'arg';
                type: 'string';
                path: 'name';
              }
            ];
          };
        },
        {
          name: 'masterToken';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'token';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Mint';
                path: 'master_mint';
              }
            ];
          };
        },
        {
          name: 'masterMetadata';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'metadata';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'metadata_program';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Mint';
                path: 'master_mint';
              }
            ];
            programId: {
              kind: 'account';
              type: 'publicKey';
              path: 'metadata_program';
            };
          };
        },
        {
          name: 'masterEdition';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'metadata';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'metadata_program';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Mint';
                path: 'master_mint';
              },
              {
                kind: 'const';
                type: 'string';
                value: 'edition';
              }
            ];
            programId: {
              kind: 'account';
              type: 'publicKey';
              path: 'metadata_program';
            };
          };
        },
        {
          name: 'xnft';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'xnft';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'master_edition';
              }
            ];
          };
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'publisher';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'metadataProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'symbol';
          type: 'string';
        },
        {
          name: 'tag';
          type: {
            defined: 'Tag';
          };
        },
        {
          name: 'kind';
          type: {
            defined: 'Kind';
          };
        },
        {
          name: 'uri';
          type: 'string';
        },
        {
          name: 'sellerFeeBasisPoints';
          type: 'u16';
        },
        {
          name: 'installPrice';
          type: 'u64';
        },
        {
          name: 'installVault';
          type: 'publicKey';
        },
        {
          name: 'supply';
          type: {
            option: 'u64';
          };
        }
      ];
    },
    {
      name: 'updateXnft';
      docs: ['Updates the code of an xNFT.', '', 'This is simply a token metadata update cpi.'];
      accounts: [
        {
          name: 'xnft';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'masterMetadata';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'metadataProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'updates';
          type: {
            defined: 'UpdateParams';
          };
        }
      ];
    },
    {
      name: 'createReview';
      docs: ['Creates a "review" of an xNFT containing a URI to a comment and a 0-5 rating.'];
      accounts: [
        {
          name: 'review';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'review';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Xnft';
                path: 'xnft';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'author';
              }
            ];
          };
        },
        {
          name: 'install';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'xnft';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'author';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'uri';
          type: 'string';
        },
        {
          name: 'rating';
          type: 'u8';
        }
      ];
    },
    {
      name: 'createInstall';
      docs: [
        'Creates an "installation" of an xNFT.',
        '',
        'Installation is just a synonym for minting an xNFT edition for a given',
        'user.'
      ];
      accounts: [
        {
          name: 'xnft';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'install';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'install';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'authority';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Xnft';
                path: 'xnft';
              }
            ];
          };
        },
        {
          name: 'installVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'masterMetadata';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'createInstallWithAuthority';
      docs: [
        'Variant of `create_xnft_installation` where the install authority is',
        'required to sign.'
      ];
      accounts: [
        {
          name: 'xnft';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'install';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'install';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'authority';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Xnft';
                path: 'xnft';
              }
            ];
          };
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'installAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'deleteInstall';
      docs: ['Closes the install account.'];
      accounts: [
        {
          name: 'install';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'receiver';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: 'deleteReview';
      docs: ['Closes the review account and removes metrics from xNFT account.'];
      accounts: [
        {
          name: 'review';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'xnft';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'receiver';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'author';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: 'setSuspended';
      docs: ['Sets the install suspension flag on the xnft.'];
      accounts: [
        {
          name: 'xnft';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: 'flag';
          type: 'bool';
        }
      ];
    }
  ];
  accounts: [
    {
      name: 'xnft';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'publisher';
            type: 'publicKey';
          },
          {
            name: 'installVault';
            type: 'publicKey';
          },
          {
            name: 'masterEdition';
            type: 'publicKey';
          },
          {
            name: 'masterMetadata';
            type: 'publicKey';
          },
          {
            name: 'masterMint';
            type: 'publicKey';
          },
          {
            name: 'installAuthority';
            type: {
              option: 'publicKey';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'kind';
            type: {
              defined: 'Kind';
            };
          },
          {
            name: 'tag';
            type: {
              defined: 'Tag';
            };
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'totalInstalls';
            type: 'u64';
          },
          {
            name: 'installPrice';
            type: 'u64';
          },
          {
            name: 'createdTs';
            type: 'i64';
          },
          {
            name: 'updatedTs';
            type: 'i64';
          },
          {
            name: 'suspended';
            type: 'bool';
          },
          {
            name: 'totalRating';
            type: 'u64';
          },
          {
            name: 'numRatings';
            type: 'u32';
          },
          {
            name: 'reserved';
            type: {
              array: ['u8', 20];
            };
          }
        ];
      };
    },
    {
      name: 'install';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'xnft';
            type: 'publicKey';
          },
          {
            name: 'masterMetadata';
            type: 'publicKey';
          },
          {
            name: 'edition';
            type: 'u64';
          },
          {
            name: 'reserved';
            type: {
              array: ['u8', 64];
            };
          }
        ];
      };
    },
    {
      name: 'review';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'author';
            type: 'publicKey';
          },
          {
            name: 'xnft';
            type: 'publicKey';
          },
          {
            name: 'rating';
            type: 'u8';
          },
          {
            name: 'uri';
            type: 'string';
          },
          {
            name: 'reserved';
            type: {
              array: ['u8', 32];
            };
          }
        ];
      };
    }
  ];
  types: [
    {
      name: 'UpdateParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'installVault';
            type: {
              option: 'publicKey';
            };
          },
          {
            name: 'name';
            type: {
              option: 'string';
            };
          },
          {
            name: 'price';
            type: {
              option: 'u64';
            };
          },
          {
            name: 'tag';
            type: {
              option: {
                defined: 'Tag';
              };
            };
          },
          {
            name: 'uri';
            type: {
              option: 'string';
            };
          }
        ];
      };
    },
    {
      name: 'Kind';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'App';
          }
        ];
      };
    },
    {
      name: 'Tag';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'None';
          },
          {
            name: 'Defi';
          },
          {
            name: 'Game';
          },
          {
            name: 'Nft';
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: 'CannotReviewOwned';
      msg: 'You cannot create a review for an xNFT that you currently own';
    },
    {
      code: 6001;
      name: 'InstallAuthorityMismatch';
      msg: 'The asserted authority did not match that of the Install account';
    },
    {
      code: 6002;
      name: 'InstallExceedsSupply';
      msg: 'The max supply has been reached for the xNFT.';
    },
    {
      code: 6003;
      name: 'NameTooLong';
      msg: 'The name provided for creating the xNFT exceeded the byte limit';
    },
    {
      code: 6004;
      name: 'RatingOutOfBounds';
      msg: 'The rating for a review must be between 0 and 5';
    },
    {
      code: 6005;
      name: 'ReviewInstallMismatch';
      msg: 'The installation provided for the review does not match the xNFT';
    },
    {
      code: 6006;
      name: 'SuspendedInstallation';
      msg: 'Attempting to install a currently suspended xNFT';
    }
  ];
};

export const IDL: Xnft = {
  version: '0.1.0',
  name: 'xnft',
  constants: [
    {
      name: 'MAX_NAME_LEN',
      type: {
        defined: 'usize'
      },
      value: '30'
    },
    {
      name: 'MAX_RATING',
      type: 'u8',
      value: '5'
    }
  ],
  instructions: [
    {
      name: 'createXnft',
      docs: [
        'Creates all parts of an xNFT instance.',
        '',
        '* Master mint (supply 1).',
        '* Master token.',
        '* Master metadata PDA associated with the master mint.',
        '* Master edition PDA associated with the master mint.',
        '* xNFT PDA associated with the master edition.',
        '',
        'Once this is invoked, an xNFT exists and can be "installed" by users.'
      ],
      accounts: [
        {
          name: 'masterMint',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'mint'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'publisher'
              },
              {
                kind: 'arg',
                type: 'string',
                path: 'name'
              }
            ]
          }
        },
        {
          name: 'masterToken',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'token'
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'master_mint'
              }
            ]
          }
        },
        {
          name: 'masterMetadata',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'metadata'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'metadata_program'
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'master_mint'
              }
            ],
            programId: {
              kind: 'account',
              type: 'publicKey',
              path: 'metadata_program'
            }
          }
        },
        {
          name: 'masterEdition',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'metadata'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'metadata_program'
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'master_mint'
              },
              {
                kind: 'const',
                type: 'string',
                value: 'edition'
              }
            ],
            programId: {
              kind: 'account',
              type: 'publicKey',
              path: 'metadata_program'
            }
          }
        },
        {
          name: 'xnft',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'xnft'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'master_edition'
              }
            ]
          }
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true
        },
        {
          name: 'publisher',
          isMut: false,
          isSigner: true
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'metadataProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'symbol',
          type: 'string'
        },
        {
          name: 'tag',
          type: {
            defined: 'Tag'
          }
        },
        {
          name: 'kind',
          type: {
            defined: 'Kind'
          }
        },
        {
          name: 'uri',
          type: 'string'
        },
        {
          name: 'sellerFeeBasisPoints',
          type: 'u16'
        },
        {
          name: 'installPrice',
          type: 'u64'
        },
        {
          name: 'installVault',
          type: 'publicKey'
        },
        {
          name: 'supply',
          type: {
            option: 'u64'
          }
        }
      ]
    },
    {
      name: 'updateXnft',
      docs: ['Updates the code of an xNFT.', '', 'This is simply a token metadata update cpi.'],
      accounts: [
        {
          name: 'xnft',
          isMut: true,
          isSigner: false
        },
        {
          name: 'masterMetadata',
          isMut: true,
          isSigner: false
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true
        },
        {
          name: 'metadataProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: 'updates',
          type: {
            defined: 'UpdateParams'
          }
        }
      ]
    },
    {
      name: 'createReview',
      docs: ['Creates a "review" of an xNFT containing a URI to a comment and a 0-5 rating.'],
      accounts: [
        {
          name: 'review',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'review'
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Xnft',
                path: 'xnft'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'author'
              }
            ]
          }
        },
        {
          name: 'install',
          isMut: false,
          isSigner: false
        },
        {
          name: 'xnft',
          isMut: true,
          isSigner: false
        },
        {
          name: 'author',
          isMut: true,
          isSigner: true
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: 'uri',
          type: 'string'
        },
        {
          name: 'rating',
          type: 'u8'
        }
      ]
    },
    {
      name: 'createInstall',
      docs: [
        'Creates an "installation" of an xNFT.',
        '',
        'Installation is just a synonym for minting an xNFT edition for a given',
        'user.'
      ],
      accounts: [
        {
          name: 'xnft',
          isMut: true,
          isSigner: false
        },
        {
          name: 'install',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'install'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'authority'
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Xnft',
                path: 'xnft'
              }
            ]
          }
        },
        {
          name: 'installVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'masterMetadata',
          isMut: false,
          isSigner: false
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'createInstallWithAuthority',
      docs: [
        'Variant of `create_xnft_installation` where the install authority is',
        'required to sign.'
      ],
      accounts: [
        {
          name: 'xnft',
          isMut: true,
          isSigner: false
        },
        {
          name: 'install',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'install'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'authority'
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Xnft',
                path: 'xnft'
              }
            ]
          }
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true
        },
        {
          name: 'installAuthority',
          isMut: false,
          isSigner: true
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'deleteInstall',
      docs: ['Closes the install account.'],
      accounts: [
        {
          name: 'install',
          isMut: true,
          isSigner: false
        },
        {
          name: 'receiver',
          isMut: true,
          isSigner: false
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true
        }
      ],
      args: []
    },
    {
      name: 'deleteReview',
      docs: ['Closes the review account and removes metrics from xNFT account.'],
      accounts: [
        {
          name: 'review',
          isMut: true,
          isSigner: false
        },
        {
          name: 'xnft',
          isMut: true,
          isSigner: false
        },
        {
          name: 'receiver',
          isMut: true,
          isSigner: false
        },
        {
          name: 'author',
          isMut: false,
          isSigner: true
        }
      ],
      args: []
    },
    {
      name: 'setSuspended',
      docs: ['Sets the install suspension flag on the xnft.'],
      accounts: [
        {
          name: 'xnft',
          isMut: true,
          isSigner: false
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true
        }
      ],
      args: [
        {
          name: 'flag',
          type: 'bool'
        }
      ]
    }
  ],
  accounts: [
    {
      name: 'xnft',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey'
          },
          {
            name: 'publisher',
            type: 'publicKey'
          },
          {
            name: 'installVault',
            type: 'publicKey'
          },
          {
            name: 'masterEdition',
            type: 'publicKey'
          },
          {
            name: 'masterMetadata',
            type: 'publicKey'
          },
          {
            name: 'masterMint',
            type: 'publicKey'
          },
          {
            name: 'installAuthority',
            type: {
              option: 'publicKey'
            }
          },
          {
            name: 'bump',
            type: 'u8'
          },
          {
            name: 'kind',
            type: {
              defined: 'Kind'
            }
          },
          {
            name: 'tag',
            type: {
              defined: 'Tag'
            }
          },
          {
            name: 'name',
            type: 'string'
          },
          {
            name: 'totalInstalls',
            type: 'u64'
          },
          {
            name: 'installPrice',
            type: 'u64'
          },
          {
            name: 'createdTs',
            type: 'i64'
          },
          {
            name: 'updatedTs',
            type: 'i64'
          },
          {
            name: 'suspended',
            type: 'bool'
          },
          {
            name: 'totalRating',
            type: 'u64'
          },
          {
            name: 'numRatings',
            type: 'u32'
          },
          {
            name: 'reserved',
            type: {
              array: ['u8', 20]
            }
          }
        ]
      }
    },
    {
      name: 'install',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey'
          },
          {
            name: 'xnft',
            type: 'publicKey'
          },
          {
            name: 'masterMetadata',
            type: 'publicKey'
          },
          {
            name: 'edition',
            type: 'u64'
          },
          {
            name: 'reserved',
            type: {
              array: ['u8', 64]
            }
          }
        ]
      }
    },
    {
      name: 'review',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'author',
            type: 'publicKey'
          },
          {
            name: 'xnft',
            type: 'publicKey'
          },
          {
            name: 'rating',
            type: 'u8'
          },
          {
            name: 'uri',
            type: 'string'
          },
          {
            name: 'reserved',
            type: {
              array: ['u8', 32]
            }
          }
        ]
      }
    }
  ],
  types: [
    {
      name: 'UpdateParams',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'installVault',
            type: {
              option: 'publicKey'
            }
          },
          {
            name: 'name',
            type: {
              option: 'string'
            }
          },
          {
            name: 'price',
            type: {
              option: 'u64'
            }
          },
          {
            name: 'tag',
            type: {
              option: {
                defined: 'Tag'
              }
            }
          },
          {
            name: 'uri',
            type: {
              option: 'string'
            }
          }
        ]
      }
    },
    {
      name: 'Kind',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'App'
          }
        ]
      }
    },
    {
      name: 'Tag',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'None'
          },
          {
            name: 'Defi'
          },
          {
            name: 'Game'
          },
          {
            name: 'Nft'
          }
        ]
      }
    }
  ],
  errors: [
    {
      code: 6000,
      name: 'CannotReviewOwned',
      msg: 'You cannot create a review for an xNFT that you currently own'
    },
    {
      code: 6001,
      name: 'InstallAuthorityMismatch',
      msg: 'The asserted authority did not match that of the Install account'
    },
    {
      code: 6002,
      name: 'InstallExceedsSupply',
      msg: 'The max supply has been reached for the xNFT.'
    },
    {
      code: 6003,
      name: 'NameTooLong',
      msg: 'The name provided for creating the xNFT exceeded the byte limit'
    },
    {
      code: 6004,
      name: 'RatingOutOfBounds',
      msg: 'The rating for a review must be between 0 and 5'
    },
    {
      code: 6005,
      name: 'ReviewInstallMismatch',
      msg: 'The installation provided for the review does not match the xNFT'
    },
    {
      code: 6006,
      name: 'SuspendedInstallation',
      msg: 'Attempting to install a currently suspended xNFT'
    }
  ]
};
