const { Model } = require('sequelize')
const pg = require('pg');
pg.types.setTypeParser(1114, 'text', function(text) {return text})

// * Side Finger Model
module.exports = (sequelize, DataTypes) => {
    const sideFingers = sequelize.define('sideFingers', {
        id : {
            type : DataTypes.STRING,
            primaryKey : true,
            allowNull : false,
            unique : true
        },
        finger_id : DataTypes.STRING,
        side : {
            type : DataTypes.STRING,
            allowNull : false,
        },
        finger : {
            type : DataTypes.STRING,
            allowNull : false,
        },
        ai_type : DataTypes.STRING,
        ai_RC1 : DataTypes.INTEGER,
        ai_RC2 : DataTypes.INTEGER,
        analyst_type : DataTypes.STRING,
        analyst_RC1 : DataTypes.INTEGER,
        analyst_RC2 : DataTypes.INTEGER,
        latest_modified : DataTypes.DATE
    }, 
    {
        sequelize,
        modelName : 'sideFingers',
        tableName : 'tb_side_finger',
        timestamps : false
    })

    sideFingers.associate = (models) => {
        sideFingers.belongsTo(models.fingerprints, {foreignKey: 'finger_id', as : 'fingerprints', onUpdate : 'cascade', targetKey: 'id'})
        sideFingers.hasMany(models.fingerprintAngle, {foreignKey: 'side_finger_id', as : 'fingerprintAngle', onUpdate : 'cascade', sourceKey: 'id'})
    }

    return sideFingers
}