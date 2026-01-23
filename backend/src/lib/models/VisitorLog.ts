import { DataTypes, Model } from "sequelize";
import { sequelize } from "../clients/sequalize";

export class VisitorLog extends Model {
  declare id: number;
  declare source: string;
  declare hashedIP: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

VisitorLog.init(
  {
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hashedIP: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "visitor_logs",
    timestamps: true,
  }
);
