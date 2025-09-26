const mongoose = require('mongoose');
const cron = require('node-cron');
const Attendance = require('../model/Attendance');

const connectdb = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/admin", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};




function startCronJob() {
    cron.schedule('0 10 * * *', async () => {
        console.log('Running a task every day at 10:00 AM');
        try {
            const today = new Date().toISOString().split('T')[0];

            console.log(`Running attendance marking cron for ${today}`);
            const students = await Attendance.find({});
            for (const student of students) {
                const attendanceRecord = await Attendance.findOne({
                    a_studentId: student._id,
                    a_date: today,
                });
                if (!attendanceRecord) {
                    const absentRecord = new Attendance({
                        a_studentId: student._id,
                        a_date: today,
                        a_status: 'absent',
                        a_studentclass: student.class || 'Unknown',
                        a_phoneno: student.phone || '0000000000',
                    });
                    await absentRecord.save();
                    console.log(`Marked absent: ${student.name} for ${today}`);
                }
            }

            console.log('Attendance marking cron completed.');
        } catch (err) {
            console.error('Error in attendance cron:', err);
        }
    });
}
module.exports = { startCronJob, connectdb };