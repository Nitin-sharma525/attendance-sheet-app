const Syllabus = require('../model/Syllabus');
const User = require('../model/user');

exports.createSyllabus = async (req, res, next) => {
    try {
        const { classId, subject, topic, description } = req.body;
        if (!classId || !subject || !topic) {
            return res.status(400).json({ message: "classId, subject, and topic are required." });
        }
        const newSyllabus = new Syllabus({
            classId,
            subject,
            topic,
            description,
            createdBy: req.user._id,
        });
        const savedSyllabus = await newSyllabus.save();
        res.status(201).json(savedSyllabus);

    } catch (error) {
        console.error("Error creating syllabus:", error);
        next(error);
    }
};


exports.updateSyllabus = async (req, res, next) => {
    try {
        const { classid } = req.params;
        const updateData = req.body;
        if (!classid) {
            return res.status(400).json({ message: 'id is require' });
        }
        const syllabus = await Syllabus.findOneAndUpdate(
            { classId: classid },
            updateData,
            { new: true }
        );
        if (!syllabus) {
            return res.status(404).json({ message: 'user not found' });
        }
        await syllabus.save();
        return res.status(200).json({
            status: true,
            message: "User updated successfully",
            data: syllabus
        });
    } catch (error) {
        console.error('updatesyllabus', error);
        next(error);
    }
};


exports.deletesyllabus = async (req, res, next) => {
    try {
        const { classid } = req.params;
         if (!classid) {
            return res.status(400).json({ message: 'classid is required' });
        };
        const syllabus = await Syllabus.findOneAndDelete({ classId: classid });
        if (!syllabus) {
            return res.status(404)({ message: 'class syllabus not found' });
        }
        return res.status(200).json({ messa: 'user delete successfully' });

    } catch (error) {
        console.error('deletesyllabus', error);
        next(error);
    }
};


exports.getallsyllabus = async (req,res,next)=>{
    try{
        const syllabus = await Syllabus.find();
        if(!syllabus){
            return res.status(400).json({message:'syllabus is require'});
        };

    }catch(error){
        console.error('get all syllabus',error);
    }
}