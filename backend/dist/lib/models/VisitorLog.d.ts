import { Model } from "sequelize";
export declare class VisitorLog extends Model {
    id: number;
    source: string;
    hashedIP: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
//# sourceMappingURL=VisitorLog.d.ts.map