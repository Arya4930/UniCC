import { Model } from "sequelize";
export declare class RouteLog extends Model {
    id: number;
    method: string;
    path: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
//# sourceMappingURL=RouteLog.d.ts.map