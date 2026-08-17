const { Model } = require('sequelize')
const pg = require('pg');
pg.types.setTypeParser(1114, 'text', function(text) {return text})

// * Information Model
module.exports = (sequelize, DataTypes) => {
    const informations = sequelize.define('informations', {
        id : {
            type : DataTypes.STRING,
            primaryKey : true,
            allowNull : false,
            unique : true
        },
        mb_code : DataTypes.STRING,
        age_range : DataTypes.STRING,
        group : DataTypes.STRING,
        type : DataTypes.STRING,
        detail : DataTypes.STRING,
        status : DataTypes.STRING,
        latest_modified : DataTypes.DATE
    }, 
    {
        sequelize,
        modelName : 'informations',
        tableName : 'tb_information',
        timestamps : false
    })

    return informations
}