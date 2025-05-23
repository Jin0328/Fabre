module.exports = (sequelize, DataTypes) => {
    const Exercise = sequelize.define('Exercise', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        category: {
            type: DataTypes.ENUM('상체', '하체', '전신', '유산소'),
            allowNull: true
        }
    }, {
        tableName: 'exercises',
        timestamps: true,
        underscored: true
    });

    return Exercise;
};
