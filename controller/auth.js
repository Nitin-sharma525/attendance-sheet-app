const { v4: uuidv4 } = require('uuid');
const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Attendance = require('../model/Attendance');
const sendEmail = require("nodemailer");
const newModelObj = require("../middleware/email");
const multer = require('multer');
const errorhandler = require('../middleware/error_handler');
const { randomBytes, createHash } = require("crypto");
const { generalMail } = require("../middleware/email");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(268198972526);






exports.userregister = async (req, res) => {
    console.log('Request body:', req.body);
    try {
        const { u_fullname, u_email, u_password, u_class, u_college, u_role } = req.body;

        if (!u_fullname) {
            return res.status(400).json({ message: 'fullname is require' });
        };
        if (!u_email) {
            return res.status(400).json({ message: 'email is require' });
        };
        if (!u_password) {
            return res.status(400).json({ message: 'password is require' });
        };
        if (!u_class) {
            return res.status(400).json({ message: 'class is require' });
        };
        if (!u_college) {
            return res.status(400).json({ message: 'college is require' });
        };
        if (!u_role) {
            return res.status(400).json({ message: 'role is require' });
        };

        const userExist = await User.findOne({ u_email });
        if (userExist) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(u_password, 10);
        const u_profileImage = req.file ? req.file.filename : null;
        const newUser = new User({
            u_uuid: uuidv4(),
            u_fullname,
            u_email,
            u_password: hashedPassword,
            u_class,
            u_college,
            u_role,
            u_profileImage: u_profileImage
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
                role: newUser.u_role,
                profileImage: newUser.u_profileImage
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
        const isPasswordValid = await bcrypt.compare(u_password, user.u_password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: false,
                code: 401,
                message: "Invalid password",
                payload: []
            });
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
// exports.uploadProfileImage = async (req, res) => {
//     try {
//         const { u_uuid } = req.params;
//         if (!u_uuid) {
//             return res.status(400).json({ message: 'u_uuid is required' });
//         }
//         if (!req.file) {
//             return res.status(400).json({ message: 'Profile image file is required' });
//         }

//         const user = await User.findOne({ u_uuid });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         user.u_profileImage = req.file.path;
//         await user.save();

//         return res.status(200).json({
//             status: true,
//             message: 'Profile image uploaded successfully',
//             data: {
//                 u_uuid: user.u_uuid,
//                 u_fullname: user.u_fullname,
//                 u_email: user.u_email,
//                 u_profileImage: user.u_profileImage
//             }
//         });

//     } catch (error) {
//         console.error('Error uploading profile image:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// }

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

//email otp
exports.sendEmail = async (req, res, next) => {
    try {
        const { u_email, u_password } = req.body;

        if (!u_email) {
            return res.status(400).json({
                status: false,
                code: 400,
                message: "u_email is required",
                payload: [],
            });
        }
        if (!u_password) {
            return res.status(400).json({
                status: false,
                code: 400,
                message: "u_password is required",
                payload: [],
            });
        }

        const user = await User.findOne({ u_email });

        if (!user) {
            return res.status(404).json({
                status: false,
                code: 404,
                message: "User not found",
                payload: [],
            });
        }

        const userPasswordMatch = await bcrypt.compare(u_password, user.u_password);
        if (!userPasswordMatch) {
            return res.status(401).json({
                status: false,
                code: 401,
                message: "Invalid password",
                payload: [],
            });
        }


        const token = Math.floor(100000 + Math.random() * 900000).toString();


        user.otp = token;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.u_status = "0";

        await user.save();


        const emailData = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: user.u_email,
            subject: "Your OTP for Registration",
            html: `
        <p>Hello,</p>
        <p>Your OTP for registration is: <strong>${token}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>Thank you!</p>
      `,
        };

        await newModelObj.generalMail(emailData);

        return res.status(200).json({
            status: true,
            code: 200,
            message: "OTP sent successfully",
            otp: token,
            payload: [],
        });
    } catch (error) {
        console.error("sendEmail internal error:", error);
        next(error);
    }
};


exports.forgotPasswordSendOtp = async (req, res) => {
    try {
        const { u_email } = req.body;

        if (!u_email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ u_email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
        await user.save();
        const emailData = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: user.u_email,
            subject: 'Your Password Reset OTP',
            body: `
        <p>Hello,</p>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `
        };

        const result = await newModelObj.generalMail(emailData);

        if (!result) {
            return res.status(500).json({ message: 'Failed to send OTP email' });
        }

        return res.status(200).json({
            status: true,
            message: 'send otp succesfully',
            data: otp

        })
    } catch (error) {
        console.error('Forgot password OTP error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


//reset password

exports.resetPasswordWithOtp = async (req, res) => {
    try {
        const { u_email, otp, newPassword } = req.body;
        if (!u_email || !otp || !newPassword) {
            return res.status(400).json({ message: 'email,password,otp is require' });

        }
        const user = await User.findOne({ u_email });
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        if (
            !user.resetOtp ||
            user.resetOtp !== otp ||
            !user.resetOtpExpire ||
            user.resetOtpExpire < Date.now()
        ) {
            console.log('Invalid or expired OTP for user:', u_email);
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.u_password = hashedPassword;
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        await user.save();

        return res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        console.log('reset password error', error);
        return res.status(500).json({ message: 'internal server error' });
    }

}

exports.uploadProfileImage = async (req, res) => {
    try {
        const { u_uuid } = req.params;
        if (!u_uuid) {
            return res.status(400).json({ message: 'u_uuid is required' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Profile image file is required' });
        }

        const user = await User.findOne({ u_uuid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.u_profileImage = req.files.map(file => file.path);
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
};


exports.verifyEmailOtp = async (req, res) => {
    try {
        const { u_email, otp } = req.body;
        if (!u_email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ u_email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp || !user.otpExpires || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }


        user.u_status = '1';
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        return res.status(200).json({ message: 'OTP verified successfully' });

    } catch (error) {
        console.error('verify email otp error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



exports.socialLogin = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }


        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ uc_email: email });

        if (!user) {
            user = await User.create({
                uc_uuid: uuidv4(),
                uc_username: name,
                uc_email: email,
                uc_profile_picture: picture,
            });
        }


        const jwtToken = jwt.sign(
            { uc_uuid: user.uc_uuid, email: user.uc_email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.uc_username,
                email: user.uc_email,
                profilePicture: user.uc_profile_picture,
            },
            token: jwtToken,
        });

    } catch (err) {
        console.error('Google login error:', err);
        return res.status(500).json({ message: 'Login failed' });
    }
};



exports.facebookLogin = async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            return res.status(400).json({ message: 'Access token is required' });
        }

        const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
        const fbData = await response.json();

        if (fbData.error) {
            return res.status(400).json({ message: 'Invalid Facebook access token' });
        }

        const email = fbData.email?.toLowerCase();
        if (!email) {
            return res.status(400).json({ message: 'Email permission not granted by Facebook' });
        }

        let user = await User.findOne({ u_email: email });
        if (!user) {
            user = await User.create({
                u_uuid: uuidv4(),
                u_email: email,
                u_fullname: fbData.name,
                u_profileImage: fbData.picture?.data?.url ? [fbData.picture.data.url] : [],
                u_status: '1',
                u_role: 'student',
            });
        }

            const jwtToken = jwt.sign({ u_uuid: user.u_uuid, email: user.u_email }, process.env.JWT_SECRET, { expiresIn: '1d' });

            return res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user._id,
                    email: user.u_email,
                    fullname: user.u_fullname,
                    profileImage: user.u_profileImage,
                },
                token: jwtToken,
            });
        } catch (error) {
            console.error('Facebook login error:', error);
            return res.status(500).json({ message: 'Login failed' });
        }
    };
