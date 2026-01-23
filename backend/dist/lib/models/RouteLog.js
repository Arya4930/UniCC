"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteLog = void 0;
const sequelize_1 = require("sequelize");
const sequalize_1 = require("../clients/sequalize");
class RouteLog extends sequelize_1.Model {
}
exports.RouteLog = RouteLog;
RouteLog.init({
    method: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    route: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    source: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    hashedIP: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: sequalize_1.sequelize,
    tableName: "api_route_logs",
    timestamps: true,
});
//# sourceMappingURL=RouteLog.js.map