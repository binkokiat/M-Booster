const { Model } = require('sequelize')
const pg = require('pg');
pg.types.setTypeParser(1114, 'text', function(text) {return text})

// * Authorization Angle Model
module.exports = (sequelize, DataTypes) => {
    const authorizations = sequelize.define('authorizations', {
        id : {
            type : DataTypes.STRING,
            primaryKey : true,
            allowNull : false,
            unique : true
        },
        user_id : DataTypes.STRING,
        officer_id : DataTypes.STRING,
        access_token : DataTypes.STRING,
        refresh_token : DataTypes.STRING,
        device_id : DataTypes.STRING,
        token_type : DataTypes.STRING,
        token_expired : DataTypes.BOOLEAN,
        timestamp : DataTypes.DATE,
        latest_modified : DataTypes.DATE
    }, 
    {
        sequelize,
        modelName : 'authorizations',
        tableName : 'tb_authorization',
        timestamps : false
    })
    
    authorizations.associate = (models) => {
        authorizations.belongsTo(models.users, {foreignKey: 'user_id', as : 'users', onUpdate : 'cascade', targetKey: 'id'})
        authorizations.belongsTo(models.officers, {foreignKey: 'officer_id', as : 'officers', onUpdate : 'cascade', targetKey: 'id'})
    }
    
    return authorizations
}