import { model, Schema } from "mongoose";

export interface PartnerKeyDocument {
  keyHash: string;
  partnerId: string;
  enabled: boolean;
  scopes: string[];
}

const partnerKeySchema = new Schema<PartnerKeyDocument>(
  {
    keyHash: { type: String, required: true, unique: true, index: true },
    partnerId: { type: String, required: true, index: true },
    enabled: { type: Boolean, default: true, index: true },
    scopes: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const PartnerKey = model<PartnerKeyDocument>("PartnerKey", partnerKeySchema);
