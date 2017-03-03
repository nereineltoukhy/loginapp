var mongoose = require('mongoose');

var projectSchema = mongoose.Schema({
    title:{
        type:String,
        required:true, 
        unique:true
    },
    URL:{
    	type: String
    }
});

var Project;

if (mongoose.models.Project) {
  Project = mongoose.model('Project');
} else {
  Project = mongoose.model('Project', projectSchema);
}

//var Project = module.exports = mongoose.model('Project', projectSchema);

module.exports.createProject = function(newProject, callback){
	newProject.save(callback);
}

module.exports = Project;