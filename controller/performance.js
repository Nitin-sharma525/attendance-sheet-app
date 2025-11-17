const Performance = require('../model/Performance');
const attendance = require('../model/Attendance');
const syllabus = require('../model/Syllabus');


exports.generatePerformanceReport = async (req, res, next) => {
  try {
    const { studentId, classId } = req.params;

    
    const totalDays = await attendance.countDocuments({ classId, studentId });
    const presentDays = await attendance.countDocuments({ classId, studentId, status: 'Present' });
    const attendancePercentage = totalDays ? (presentDays / totalDays) * 100 : 0;

    
    const totalTopics = await syllabus.countDocuments({ classId });
    const completedTopics = await syllabus.countDocuments({ classId, progress: { $gte: 100 } });
    const syllabusCompletion = totalTopics ? (completedTopics / totalTopics) * 100 : 0;

    
    const performance = await Performance.findOneAndUpdate(
      { studentId, classId },
      {
        attendancePercentage,
        syllabusCompletion,
        remarks: `Attendance: ${attendancePercentage.toFixed(1)}%, Syllabus: ${syllabusCompletion.toFixed(1)}%`
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      status: true,
      message: 'Performance report generated successfully',
      data: performance
    });
  } catch (error) {
    console.error('Performance report error:', error);
    next(error);
  }
};