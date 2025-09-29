const { v4: uuidv4 } = require('uuid');
const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Attendance = require('../model/Attendance');
//const sendEmail = require("nodemailer");
const newModelObj = require("../middleware/email");






exports.userregister = async (req, res) => {
    console.log('Request body:', req.body);
    try {
        const { u_fullname, u_email, u_password, u_class, u_college, u_role } = req.body;

        if (!u_fullname || !u_email || !u_password || !u_class || !u_college || !u_role) {
            return res.status(400).json({ message: 'fullname, email,class, college, password, and role are required' });
        }

        const userExist = await User.findOne({ u_email });
        if (userExist) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(u_password, 10);

        const newUser = new User({
            u_uuid: uuidv4(),
            u_fullname,
            u_email,
            u_password: hashedPassword,
            u_class,
            u_college,
            u_role
        });

        await newUser.save();

        return res.status(201).json({
            status: true,
            message: 'User registered successfully',
            data: {
                uuid: newUser.u_uuid,
                fullname: newUser.u_fullname,
                email: newUser.u_email,
                class: newUser.u_class,
                college: newUser.u_college,
                role: newUser.u_role
            },
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


exports.userlogin = async (req, res) => {
    try {
        const { u_email, u_password } = req.body;
        if (!u_email || !u_password) {
            return res.status(400).json({ message: 'email,password require' });

        }
        const user = await User.findOne({ u_email });
        if (!user) {
            return res.status(400).json({ message: 'user not found' });
        }
        const token = jwt.sign(
            { uuid: user.u_uuid },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }//expirein 1 day
        );
        user.updated_at = Date.now();//user update
        await user.save();
        return res.status(200).json({
            status: true,
            message: 'user login succesfully',
            token,
        })

    } catch (error) {
        return res.status(500).json({ message: 'internal server error' });
    }

}

exports.updateduser = async (req, res) => {
    try {
        const { u_uuid } = req.params;
        const updateData = req.body;
        if (!u_uuid) {
            return res.status(400).json({ message: 'u_uuid is require' });

        }
        const user = await User.findOneAndUpdate(
            { u_uuid },
            updateData,
            { new: true }
        );
        if (!user) {
            return res.status(400).json({ message: 'user not found' });
        }
        return res.status(200).json({
            status: true,
            message: "User updated successfully",
            data: user
        });

    } catch (error) {
        return res.status(500).json({ message: 'internal server error' });
    }
}


exports.userdelete = async (req, res) => {//handel http request
    try {
        const { u_uuid } = req.params;//req params uc_uuid
        if (!u_uuid) {
            return res.status(400).json({ message: 'u_uuid is require' });
        }
        const user = await User.findOneAndDelete(
            { u_uuid },//find user by uc_uuid
            { new: true }//return the updated document
        );
        if (!user) {
            return res.status(400).json({ message: 'user not found' });
        }
        return res.status(200).json({
            status: true,
            message: "User Deleted successfully",
            data: user
        });


    } catch (error) {
        return res.status(400).json({ message: 'internal server error' });

    }
}


exports.getalluser = async (req, res) => {
    try {
        const { u_uuid } = req.params;
        if (!u_uuid)
            return res.status(400).json({ message: 'u_uuid is require' });
        const user = await User.findOne({ u_uuid });
        if (!user) {
            return res.status(400).json({ message: 'user not found' });

        }
        await user.save();
        return res.status(200).json({
            status: true,
            message: 'get all user succesfully',
            data: user
        })
    } catch (error) {
        return res.status(500).json({ message: 'internal server error' });
    }
}





exports.getAttendanceStatus = async (req, res) => {
    try {
        const { a_studentId } = req.params;
        const { startdate, enddate } = req.query;


        if (!a_studentId) {
            return res.status(400).json({ message: 'studentid is required' });
        }

        const user = await User.findOne({ u_uuid: a_studentId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const query = { a_studentId: user._id };

        if (startdate && enddate) {
            query.a_date = {
                $gte: new Date(startdate),
                $lte: new Date(enddate),
            };
        }
        const attendanceRecords = await Attendance.find(query).select('a_status a_date')
        console.log('Attendance records found:', attendanceRecords.length);

        const summary = attendanceRecords.reduce(
            (acc, record) => {
                if (record.a_status === 'present') acc.present++;
                else if (record.a_status === 'absent') acc.absent++;
                else if (record.a_status === 'leave') acc.leave++;
                return acc;
            },
            { totalday: 0, present: 0, absent: 0, leave: 0 }
        );
        const total = summary.present + summary.absent + summary.leave;

        summary.totalday = total;

        await user.save();
        return res.status(200).json({
            status: true,
            message: 'Attendance fetched successfully',
            attendance: {
                student: {
                    u_fullname: user.u_fullname,
                    _id: user._id,
                    u_uuid: user.u_uuid,

                    name: user.name,
                    u_class: user.u_class,
                    u_createdat: user.u_createdat,
                },
                summary: summary,
                records: attendanceRecords,
            },
        });

    } catch (error) {
        console.error('Error fetching attendance:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



//get user profile api
exports.getUserProfile = async (req, res) => {
    try {
        const { u_uuid } = req.params;
        if (!u_uuid) {
            return res.status(400).json({ message: 'u_uuid is required' });
        }

        const user = await User.findOne({ u_uuid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            status: true,
            message: 'User profile fetched successfully',
            data: user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


//user update profile api
exports.updateprofile = async (req, res) => {
    try {
        const { u_uuid } = req.params;
        const updateData = req.body;

        if (!u_uuid) {
            return res.status(400).json({ message: 'u_uuid is required' });
        }

        const user = await User.findOneAndUpdate(
            { u_uuid },
            updateData,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            status: true,
            message: 'User profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

//changepassword api
exports.changepassword = async (req, res) => {
    try {
        const { u_uuid } = req.params;
        const { oldPassword, newPassword } = req.body;

        if (!u_uuid || !oldPassword || !newPassword) {
            return res.status(400).json({ message: 'u_uuid, oldPassword, and newPassword are required' });
        }

        const user = await User.findOne({ u_uuid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.u_password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.u_password = hashedNewPassword;
        await user.save();

        return res.status(200).json({
            status: true,
            message: 'Password changed successfully',
            data: user
        });

    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
//userprofile image upload api
exports.uploadProfileImage = async (req, res) => {
    try {
        const { u_uuid } = req.params;
        if (!u_uuid) {
            return res.status(400).json({ message: 'u_uuid is required' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Profile image file is required' });
        }

        const user = await User.findOne({ u_uuid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.u_profileImage = req.file.path;
        await user.save();

        return res.status(200).json({
            status: true,
            message: 'Profile image uploaded successfully',
            data: {
                u_uuid: user.u_uuid,
                u_fullname: user.u_fullname,
                u_email: user.u_email,
                u_profileImage: user.u_profileImage
            }
        });

    } catch (error) {
        console.error('Error uploading profile image:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

//join class api
exports.joinClass = async (req, res) => {
    try {
        const { u_uuid } = req.params;
        const { classCode } = req.body;
        if (!u_uuid || !classCode) {
            return res.status(400).json({ message: 'u_uuid and classCode are required' });
        }
        const user = await User.findOne({ u_uuid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.u_status !== 'approved') {
            return res.status(403).json({ message: 'Admin approval is pending' });
        }
        user.classCode = classCode;
        await user.save();

        return res.status(200).json({
            status: true,
            message: 'User joined class successfully',
            data: user
        });
    } catch (error) {
        console.error('Error joining class:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

//join class getu_uuid
exports.getClass = async (req, res) => {
    try {
        const { u_uuid } = req.params;
        if (!u_uuid) {
            return res.status(400).json({ message: 'u_uuid is required' });
        }
        const user = await User.findOne({ u_uuid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({
            status: true,
            message: 'Class fetched successfully',
            data: {
                u_uuid: user.u_uuid,
                u_fullname: user.u_fullname,
                u_email: user.u_email,
                u_class: user.u_class,
                classCode: user.classCode || null
            }
        })

    } catch (error) {
        console.error('Error getting class:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

//class leave api
exports.leaveClass = async (req, res) => {
    try {
        const { u_uuid } = req.params;
        if (!u_uuid) {
            return res.status(400).json({ message: 'u_uuid is required' });
        }
        const user = await User.findOne({ u_uuid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.save();
        return res.status(200).json({
            status: true,
            message: 'User left class successfully',
            data: user
        });
    } catch (error) {
        console.error('Error leaving class:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}




// Approve user request by admin
exports.approveUserRequest = async (req, res) => {
    try {
        const { u_uuid } = req.body;

        if (!u_uuid) {
            return res.status(400).json({ message: 'u_uuid is required' });
        }

        const user = await User.findOne({ u_uuid });

        if (!user) {
            return res.status(404).json({ message: 'User request not found' });
        }

        user.u_status = 'approved';

        try {
            await user.save();
        } catch (err) {
            console.error('Error saving user:', err);
            return res.status(500).json({ message: 'Failed to update user status', error: err.message });
        }

        return res.status(200).json({
            status: true,
            message: 'User request approved successfully',
            user: {
                u_uuid: user.u_uuid,
                u_status: user.u_status,
                name: user.u_fullname,
            }
        });

    } catch (error) {
        console.error('Error approving user request:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


//admin 
//user list api with pagination
exports.userlist = async (req, res) => {
    try {

        const { total, page, limit, sort, select } = req.query;
        const users = await User.find().skip((total - page - 1) * limit).limit(limit).sort(sort).select(select);
        const totalUsers = await User.countDocuments();
        return res.status(200).json({
            status: true,
            message: 'User list fetched successfully',
            total: totalUsers,
            page,
            limit,
            users

        });
    } catch (error) {
        console.error('Error fetching user list:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

//send email otp
exports.sendEmail = async (req, res, next) => {
  try {
    const { u_email, u_password } = req.body;

    
    if (!u_email || !u_password) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "u_email and u_password are required",
        payload: []
      });
    }
    
    const user = await User.findOne({ u_email });
    if (!user) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "User not found",
        payload: []
      });
    }

    
    const token = Math.floor(100000 + Math.random() * 900000).toString(); 

    const emailData = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.u_email,
      subject: 'Your OTP for Registration',
      html: `
        <p>Hello,</p>
        <p>Your OTP for registration is: <strong>${token}</strong></p>
        <p>Thank you!</p>
      `
    };

    await newModelObj.generalMail(emailData);

    return res.status(200).json({
      status: true,
      code: 200,
      message: 'Email sent successfully',
      payload: []
    });
  } catch (error) {
    console.error('sendEmail internal error:', error);
    next(error);
  }
};

