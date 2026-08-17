const { Model } = require('sequelize')
const pg = require('pg');
pg.types.setTypeParser(1114, 'text', function(text) {return text})

// * Fingerprint Angle Model
module.exports = (sequelize, DataTypes) => {
    const fingerprintAngle = sequelize.define('fingerprintAngle', {
        id : {
            type : DataTypes.STRING,
            primaryKey : true,
            allowNull : false,
            unique : true
        },
        side_finger_id : DataTypes.STRING,
        angle : {
            type : DataTypes.STRING,
            allowNull : false,
        },
        image : DataTypes.STRING,
        ai_RC : DataTypes.INTEGER,
        ai_count_image : DataTypes.STRING,
        ai_enhanced_image : DataTypes.STRING,
        analyst_RC : DataTypes.INTEGER,
        line : DataTypes.STRING,
        plot_coordinates : DataTypes.STRING,
        latest_modified : DataTypes.DATE
    }, 
    {
        sequelize,
        modelName : 'fingerprintAngle',
        tableName : 'tb_fingerprint_angle',
        timestamps : false
    })
    
    fingerprintAngle.associate = (models) => {
        fingerprintAngle.belongsTo(models.sideFingers, {foreignKey: 'side_finger_id', as : 'sideFingers', onUpdate : 'cascade', targetKey: 'id'})
    }
    
    return fingerprintAngle
}