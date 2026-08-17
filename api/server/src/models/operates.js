const { Model } = require('sequelize')
const pg = require('pg');
pg.types.setTypeParser(1114, 'text', function(text) {return text})

// * Operates Model
module.exports = (sequelize, DataTypes) => {
    const operates = sequelize.define('operates', {
        id : {
            type : DataTypes.STRING,
            primaryKey : true,
            allowNull : false,
            unique : true
        },
        user_id : DataTypes.STRING,
        officer_collector : DataTypes.STRING,
        latest_modified : DataTypes.DATE
    }, 
    {
        sequelize,
        modelName : 'operates',
        tableName : 'tb_operate',
        timestamps : false
    })

    operates.associate = (models) => {
        operates.belongsTo(models.users, {foreignKey: 'user_id', onUpdate : 'cascade'})
        operates.belongsTo(models.officers, {foreignKey: 'officer_collector', onUpdate : 'cascade'})
    }

    return operates
}