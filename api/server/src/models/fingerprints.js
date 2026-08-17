const { Model } = require('sequelize')
const pg = require('pg');
pg.types.setTypeParser(1114, 'text', function(text) {return text})

// * Fingerprint Model
module.exports = (sequelize, DataTypes) => {
    const fingerprints = sequelize.define('fingerprints', {
        id : {
            type : DataTypes.STRING,
            primaryKey : true,
            allowNull : false,
            unique : true
        },
        latest_modified : DataTypes.DATE
    }, 
    {
        sequelize,
        modelName : 'fingerprints',
        tableName : 'tb_fingerprint',
        timestamps : false
    })

    fingerprints.associate = (models) => {
        fingerprints.belongsTo(models.users, {foreignKey: 'id', as : 'users', onUpdate : 'cascade', targetKey: 'finger_id'})
        fingerprints.hasMany(models.sideFingers, {foreignKey: 'finger_id', as : 'sideFingers', onUpdate : 'cascade', sourceKey: 'id'})
    }

    return fingerprints
}