import { model, Schema } from "mongoose";
import type { MigrationStatus } from "../types";

export interface MigrationLogDocument {
  partnerId: string;
  status: MigrationStatus;
  receivedCount: number;
  transformedCount: number;
  durationMs: number;
  diagnostics: string[];
  sourceFormat: "json" | "csv";
}

const migrationLogSchema = new Schema<MigrationLogDocument>(
  {
    partnerId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["SUCCESS", "PARTIAL_SUCCESS", "FAILED"],
      required: true
    },
    receivedCount: { type: Number, required: true, min: 0 },
    transformedCount: { type: Number, required: true, min: 0 },
    durationMs: { type: Number, required: true, min: 0 },
    diagnostics: { type: [String], default: [] },
    sourceFormat: { type: String, enum: ["json", "csv"], required: true }
  },
  { timestamps: true }
);

export const MigrationLog = model<MigrationLogDocument>("MigrationLog", migrationLogSchema);
