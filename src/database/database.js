const mongoose = require('mongoose');
module.exports = mongoose.connect('mongodb+srv://BeIntelligentDB:Bintelligent12@beintelligentdb.mupzm.gcp.mongodb.net/dashboard', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});