import { Model, DataTypes } from "sequelize";
import { sequelize } from "./connection";
export class Report extends Model {}

Report.init(
  {
    who_report: DataTypes.STRING,
    phone_number: DataTypes.INTEGER,
    message: DataTypes.STRING,
  },
  { sequelize, modelName: "report" }
);
