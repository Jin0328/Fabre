const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
});

const db = {};

db.User = require('./user')(sequelize, Sequelize);
db.TrainerMembers = require('./trainerMembers')(sequelize, Sequelize);
db.Exercise = require('./exercise')(sequelize, Sequelize);
db.WorkoutDetail = require('./workoutDetail')(sequelize, Sequelize);
db.WorkoutLog = require('./workoutLog')(sequelize, Sequelize);


// 모델 연관 관계 설정

db.TrainerMembers.belongsTo(db.User, {
    foreignKey: 'memberId',
});

db.WorkoutLog.hasMany(db.WorkoutDetail, { 
    foreignKey: 'workout_log_id',
});

db.WorkoutDetail.belongsTo(db.WorkoutLog, { 
    foreignKey: 'workout_log_id',
});

db.WorkoutDetail.belongsTo(db.Exercise, {
    foreignKey: 'exercise_id',
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
