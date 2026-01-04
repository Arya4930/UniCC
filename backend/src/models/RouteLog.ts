import { DataTypes, Model } from "sequelize";
import { sequelize } from "../sequalize";

export class RouteLog extends Model {
  declare id: number;
  declare method: string;
  declare path: string;
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
  },
  {
    sequelize,
    tableName: "api_route_logs",
    timestamps: true,
  }
);
