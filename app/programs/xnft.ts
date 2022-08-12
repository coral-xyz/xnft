export type Xnft = {
  version: '0.1.0';
  name: 'xnft';
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
          name: 'metadataProgram';
          isMut: false;
          isSigner: false;
        },
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
          docs: ['metadata program.'];
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
          docs: ['metadata program.'];
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
          name: 'rent';
          isMut: false;
          isSigner: false;
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
                account: 'Xnft2';
                path: 'xnft';
              }
            ];
          };
        },
        {
          name: 'installVault';
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
      accounts: [];
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
      name: 'xnft2';
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
            name: 'kind';
            type: {
              defined: 'Kind';
            };
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
            name: 'bump';
            type: 'u8';
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
            name: 'installAuthority';
            type: {
              option: 'publicKey';
            };
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'suspended';
            type: 'bool';
          },
          {
            name: 'tag';
            type: {
              defined: 'Tag';
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
            name: 'id';
            type: 'u64';
          },
          {
            name: 'masterMetadata';
            type: 'publicKey';
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
      name: 'SuspendedInstallation';
      msg: 'Attempting to install a currently suspended xNFT';
    }
  ];
};

export const IDL: Xnft = {
  version: '0.1.0',
  name: 'xnft',
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
          name: 'metadataProgram',
          isMut: false,
          isSigner: false
        },
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
          docs: ['metadata program.'],
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
          docs: ['metadata program.'],
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
          name: 'rent',
          isMut: false,
          isSigner: false
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
                account: 'Xnft2',
                path: 'xnft'
              }
            ]
          }
        },
        {
          name: 'installVault',
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
      accounts: [],
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
      name: 'xnft2',
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
            name: 'kind',
            type: {
              defined: 'Kind'
            }
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
            name: 'bump',
            type: 'u8'
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
            name: 'installAuthority',
            type: {
              option: 'publicKey'
            }
          },
          {
            name: 'name',
            type: 'string'
          },
          {
            name: 'suspended',
            type: 'bool'
          },
          {
            name: 'tag',
            type: {
              defined: 'Tag'
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
            name: 'id',
            type: 'u64'
          },
          {
            name: 'masterMetadata',
            type: 'publicKey'
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
      name: 'SuspendedInstallation',
      msg: 'Attempting to install a currently suspended xNFT'
    }
  ]
};
