import { DataTypes, Model } from "sequelize";
import { sequelize } from "../clients/sequalize";

export class RouteLog extends Model {
  declare id: number;
  declare method: string;
  declare route: string;
  declare source?: string;
  declare hashedIP?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

RouteLog.init(
  {
    method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    route: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hashedIP: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "api_route_logs",
    timestamps: true,
  }
);
