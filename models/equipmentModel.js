const mongoose = require('mongoose')

const EquipmentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter an equipment name"]
        },
       location: {
            type: String,
            required: true,
            default: 0
        },
        temperature: {
            type: Number,
            required: true
        },
        humid: {
            type: Number,
            required: true
        },
        active: {
            type: Boolean,
            required: true
        },
        nextPM:{
            type: String,
            default:"12/31/2033",
            required: true
        }
    },
    {
        timestamps: true
    }
)


const Equipment = mongoose.model('Equipment', EquipmentSchema);

module.exports = Equipment;