const mongoose = require('mongoose')

const ManualSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter an equipment name"]
        },
       troubleShootStep: [String],
        escapeRoute:{
            type: String,
            required: true,
        }
    }
)


const Manual = mongoose.model('Manual', ManualSchema);

module.exports = Manual;