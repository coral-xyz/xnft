import { PublicKey } from '@solana/web3.js';
import { IDL } from '../programs/xnft';

export const ALLOWED_IMAGE_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg']
};

export const BACKPACK_LINK = 'https://backpack.app';
export const CORAL_LINKS = {
  github: 'https://github.com/coral-xyz',
  home: 'https://coral.community',
  twitter: 'https://twitter.com/0xCoral'
};
export const DOCS_LINK = 'https://docs.xnft.gg';

export const MAX_NAME_LENGTH = 30;
export const APP_ICON_CONSTRAINTS = [320, 1500];
export const APP_SCREENSHOT_CONSTRAINTS = [350, 2000];

export const PLACEHOLDER_PUBKEY = '3f1Ypov9Lv1Lmr4arkjY2fTMHcj4dRWP7BcpiDW6PTe3';

export const PRICE_RX = /^\d*(\.\d{0,5})?$/;
export const ROYALTY_RX = /^\d*(\.\d{0,2})?$/;

export const S3_BUCKET_URL = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;

export const XNFT_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_XNFT_PROGRAMID);
export const XNFT_KIND_OPTIONS = IDL.types[1].type.variants.map(v => v.name);
export const XNFT_TAG_OPTIONS = IDL.types[2].type.variants.map(v => v.name);
