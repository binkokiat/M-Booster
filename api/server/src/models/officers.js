const { Model } = require('sequelize')
const pg = require('pg');
pg.types.setTypeParser(1114, 'text', function(text) {return text})

// * Officer Model
module.exports = (sequelize, DataTypes) => {
    const officers = sequelize.define('officers', {
        id : {
            type : DataTypes.STRING,
            primaryKey : true,
            allowNull : false,
            unique : true
        },
        role : DataTypes.STRING,
        name : DataTypes.STRING,
        profile_image : DataTypes.STRING,
        email : {
            type : DataTypes.STRING,
            unique : true
        },
        password : DataTypes.STRING,
        secret : DataTypes.STRING,
        status : DataTypes.STRING,
        latest_modified : DataTypes.DATE
    }, 
    {
        sequelize,
        modelName : 'officers',
        tableName : 'tb_officer',
        timestamps : false
    })

    officers.associate = (models) => {
        officers.belongsToMany(models.users, {through: 'operates', foreignKey: 'officer_collector', as: 'users', onUpdate : 'cascade'})
        officers.hasMany(models.authorizations, {foreignKey: 'officer_id', as : 'authorizations', onUpdate : 'cascade', sourceKey: 'id'})
    }

    return officers
}