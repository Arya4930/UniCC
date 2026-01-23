"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorLog = void 0;
const sequelize_1 = require("sequelize");
const sequalize_1 = require("../clients/sequalize");
class VisitorLog extends sequelize_1.Model {
}
exports.VisitorLog = VisitorLog;
VisitorLog.init({
    source: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    hashedIP: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: sequalize_1.sequelize,
    tableName: "visitor_logs",
    timestamps: true,
});
//# sourceMappingURL=VisitorLog.js.map