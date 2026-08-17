const { Model } = require('sequelize')
const pg = require('pg');
pg.types.setTypeParser(1114, 'text', function(text) {return text})

// * User Model
module.exports = (sequelize, DataTypes) => {
    const users = sequelize.define('users', {
        id : {
            type : DataTypes.STRING,
            primaryKey : true,
            allowNull : false,
            unique : true
        },
        reference_code : DataTypes.STRING,
        mydna_id : DataTypes.STRING,
        created_at : {
            type : DataTypes.DATE
        },
        status : DataTypes.STRING,
        first_name : DataTypes.STRING,
        last_name : DataTypes.STRING,
        nick_name : {
            type : DataTypes.STRING,
        }, 
        phone : DataTypes.STRING,
        email : DataTypes.STRING,
        secret : DataTypes.STRING,
        password : DataTypes.STRING,
        citizen_id : {
            type: DataTypes.STRING,
            unique : true
        },
        parent_name : DataTypes.STRING,
        parent_phone : DataTypes.STRING,
        remark : DataTypes.STRING,
        birth_date : DataTypes.DATE,
        gender : DataTypes.STRING,
        line_id : DataTypes.STRING,
        address : DataTypes.STRING,
        profile_image : DataTypes.STRING,
        report_id : DataTypes.STRING,
        disapproved_report : DataTypes.STRING,
        finger_id : DataTypes.STRING,
        reported : DataTypes.BOOLEAN,
        latest_modified : DataTypes.DATE
    }, 
    {
        sequelize,
        modelName : 'users',
        tableName : 'tb_users',
        timestamps : false
    })

    users.associate = (models) => {
        users.hasOne(models.reports, {foreignKey: 'id', as : 'reports', onUpdate : 'cascade', sourceKey: 'report_id'})
        users.hasOne(models.fingerprints, {foreignKey: 'id', as : 'fingerprints', onUpdate : 'cascade', sourceKey: 'finger_id'})
        users.hasMany(models.authorizations, {foreignKey: 'user_id', as : 'authorizations', onUpdate : 'cascade', sourceKey: 'id'})
        users.belongsToMany(models.officers, {through: 'operates', foreignKey: 'user_id', as: 'officers',  onUpdate : 'cascade'})
    }

    return users
}