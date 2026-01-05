import { Sequelize } from "sequelize";
import path from "path";

export const sequelize = new Sequelize({
    host: "localhost",
    dialect: "sqlite",
    storage: path.join(process.cwd(), "route-logs.sqlite"),
    logging: false,
});

export async function initDB() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log("✅ SQLite connected");
    } catch (error) {
        console.error("❌ Unable to connect to SQLite:", error);
        process.exit(1);
    }
}
