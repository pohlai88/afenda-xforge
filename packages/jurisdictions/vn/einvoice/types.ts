export type VNEInvoiceSignature = {
  certificateNumber?: string;
  signatureValue: string;
  signerName: string;
  signingDate: Date;
};
