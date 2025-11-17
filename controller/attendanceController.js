const Attendance = require('../model/Attendance');
const User = require('../model/user');
const cron = require('node-cron');
const { sendSMS } = require('../utils/message');
const Event = require('../model/event');

exports.creatattendance = async (req, res) => {
    try {
        const {
            a_studentId,
            a_studentclass,
            a_date,
            a_status,
            a_phoneno,
            countryCode,
            a_remark,

        } = req.body;

        if (!a_studentId || !a_studentclass) {
            return res.status(400).json({ message: 'studentid and class are required' });
        }

        const existingRecord = await Attendance.findOne({ a_studentId, a_date: new Date(a_date) });
        if (existingRecord) {
            return res.status(409).json({ message: 'Attendance already recorded for this date.' });
        }

        const attendanceData = {
            a_studentId,
            a_studentclass,
            a_date: new Date(a_date),
            a_status,
            a_phoneno,
            countryCode,
            a_remark,

        };

        const newattendance = new Attendance(attendanceData);
        await newattendance.save();


        if (a_status === 'absent') {
            const fullPhoneNumber = `${countryCode}${a_phoneno}`;
            const message = `Student ID ${a_studentId} Your child has been marked absent today. Please contact the school ${a_date}.`;

            await sendSMS(fullPhoneNumber, message);
        }

        return res.status(200).json({
            status: true,
            message: "Attendance saved successfully",
            payload: []
        });

    } catch (error) {
        console.error('Error saving attendance:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


exports.getAllAttendance = async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find();

        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(404).json({ message: 'No attendance records found' });
        }

        return res.status(200).json({
            status: true,
            message: 'Attendance records fetched successfully',
            attendanceRecords
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error });
    }
};




exports.updateAttendance = async (req, res) => {
    try {
        const { a_studentId } = req.params;
        const { a_status, a_remark } = req.body;

        console.log('Received update request for studentId:', a_studentId);
        console.log('Request body:', req.body);

        if (!a_studentId) {
            return res.status(400).json({ message: 'studentId is required' });
        }

        const attendance = await Attendance.findOne({ a_studentId });
        console.log('Found attendance:', attendance);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        if (a_status) attendance.a_status = a_status;
        if (a_remark) attendance.a_remark = a_remark;

        await attendance.save();

        return res.status(200).json({
            status: true,
            message: 'Attendance updated successfully',
            attendance
        });

    } catch (error) {
        console.error('Error updating attendance:', error);
        return res.status(500).json({ message: 'internal server error' });
    }
};




exports.
    deleteAttendance = async (req, res) => {
        try {
            const { a_studentId } = req.params;

            if (!a_studentId) {
                return res.status(400).json({ message: 'studentId is required' });
            }

            const attendance = await Attendance.findOneAndDelete({ a_studentId });
            if (!attendance) {
                return res.status(404).json({ message: 'Attendance record not found' });
            }

            return res.status(200).json({
                status: true,
                message: 'Attendance deleted successfully',
                attendance
            });

        } catch (error) {
            console.error('Error deleting attendance:', error);
            return res.status(500).json({ message: 'internal server error' })
        }
    }

exports.getAttendanceByStudentId = async (req, res) => {
    try {
        const { a_studentId } = req.params;
        if (!a_studentId) {
            return res.status(400).json({ message: 'studentId is required' });
        }

        const attendance = await Attendance.find({ a_studentId });
        if (!attendance || attendance.length === 0) {
            return res.status(404).json({ message: 'No attendance records found for this studentId' });
        }

        return res.status(200).json({
            status: true,
            message: 'Attendance records fetched successfully',
            attendance
        });

    } catch (error) {
        console.error('Error fetching attendance by studentId:', error);
        return res.status(500).json({ message: 'internal server error' });
    }
}


//create class teacher
exports.createClassTeacher = async (req, res) => {
    try {
        const { u_uuid, classTeacher } = req.body;

        if (!u_uuid || !classTeacher) {
            return res.status(400).json({ message: 'u_uuid and classTeacher are required' });
        }

        const user = await User.findOne({ u_uuid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.classTeacher = classTeacher;
        await user.save();

        return res.status(200).json({
            status: true,
            message: 'Class teacher assigned successfully',
            user
        });
    } catch (error) {
        console.error('Error assigning class teacher:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
exports.leaveapproved = async (req, res) => {
    try {
        const { leaveRequestId, leaveStatus } = req.body;
        console.log('Received leaveRequestId:', leaveRequestId);
        console.log('Received leaveStatus:', leaveStatus);

        if (!leaveRequestId || !leaveStatus) {
            return res.status(400).json({ message: 'leaveRequestId and leaveStatus are required' });
        }

        const attendance = await Attendance.findOne({ leaveRequestId });
        console.log('Attendance found:', attendance);

        if (!attendance) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        attendance.leaveStatus = leaveStatus;
        await attendance.save();

        return res.status(200).json({
            status: true,
            message: 'Leave request approved successfully',
            attendance
        });

    } catch (error) {
        console.error('Error approving leave request:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// attendance delete API
exports.attendanceDelete = async (req, res) => {
    try {
        const { a_studentId } = req.body;
        if (!a_studentId) {
            return res.status(400).json({ message: 'studentId is required' });
        }
        const attendance = await Attendance.findOneAndDelete({ a_studentId });
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        return res.status(200).json({
            status: true,
            message: 'Attendance deleted successfully',
            data: attendance
        });


    } catch (error) {
        console.log('Error deleting attendance:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


//join class accept reject api

exports.joinClassResponse = async (req, res) => {
    try {
        const { a_studentId, joinclass } = req.body;

        if (!a_studentId || !joinclass) {
            return res.status(400).json({ message: 'a_studentId and joinclass are required' });
        }

        const attendance = await Attendance.findOne({ a_studentId });
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        attendance.joinclass = joinclass
        await attendance.save();

        return res.status(200).json({
            status: true,
            message: 'Class join request updated successfully',
            attendance
        });

    } catch (error) {
        console.error('Error updating class join request:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

//monthly attendance report api for student

exports.monthlyAttendanceReport = async (req, res) => {
    try {
        const { a_studentId, month, year } = req.body;
        if (!a_studentId || !month || !year) {
            return res.status(400).json({ message: 'a_studentId, month, and year are required' });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const attendanceRecords = await Attendance.find({
            a_studentId,
            a_date: { $gte: startDate, $lte: endDate }
        });

        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(404).json({ message: 'No attendance records found for this student in the specified month' });
        }

        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(record => record.a_status === 'present').length;
        const absentDays = attendanceRecords.filter(record => record.a_status === 'absent').length;
        const leaveDays = attendanceRecords.filter(record => record.leaveStatus === 'approved').length;

        return res.status(200).json({
            status: true,
            message: 'Monthly attendance report fetched successfully',
            report: {
                totalDays,
                presentDays,
                absentDays,
                leaveDays,
                attendanceRecords
            }
        });

    } catch (error) {
        console.error('Error generating monthly attendance report:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}



//total user join request api
exports.totalUserJoinRequests = async (req, res) => {
    try {
        const joinClass = await User.find({ joinclass: 'Accept' });


        return res.status(200).json({
            status: true,
            message: 'User join requests fetched successfully',
            total: joinClass.length,
            users: joinClass
        });

    } catch (error) {
        console.error('Error fetching user join requests:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


exports.updatedUserByToken = async (req, res) => {
    try {
       const u_uuid = req.user.u_uuid; 
        const updateData = req.body;

         if (!u_uuid) {
            return res.status(400).json({ message: 'Invalid user token' });
        }

        const updatedUser = await User.findOneAndUpdate({u_uuid});
           

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            status: true,
            message: 'User updated successfully',
            data: updatedUser
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



exports.deleteuserbytoken = async (req, res) => {
    try {
       const u_uuid = req.user.u_uuid; 
      if (!u_uuid) {
            return res.status(400).json({ message: 'invalid user token' });

        }
        const user = await User.findOneAndDelete({u_uuid});
            
        if(!user){
            return res.status(400).json({message:'user not found'});
        }
        return res.status(200).json({
            status: true,
            message: 'User deleted successfully',
            data: user
        });
    } catch (error) {
        console.error('user delete error', error);
        return res.status(500).json({ message: 'internal server error' });
    }

};

// Event creation by teacher
exports.createEventByTeacher = async (req, res) => {
    try{
        const{eventNames, eventDate, eventLocation, eventDescription, createdBy} = req.body;

        if(!eventNames || !eventDate || !eventLocation || !createdBy){
            return res.status(400).json({message:'eventNames, eventDate, eventLocation, and createdBy are required'});
        }

        const formattedDate = new Date(eventDate.split('-').reverse().join('-'));
        if (isNaN(formattedDate)) {
            return res.status(400).json({ message: 'Invalid date format. Use DD-MM-YYYY' });
        }

        const newEvent = new Event({
            eventNames,
            eventDate: formattedDate,
            eventLocation,
            eventDescription,
            createdBy,
    
        });

        const savedEvent = await newEvent.save();

        return res.status(201).json({
            status: true,
            message: 'Event created successfully',
            data: savedEvent
        });     

    }catch(error){
        console.error('Error creating event:', error);
        return res.status(500).json({message:'internal server error'});
        
    }
};







  