const Admin = require("../models/admin.model");
const Student = require("../models/student.model");
const Teacher = require("../models/teacher.model");
const sendError = require("../utils/sendError");
const json2csv = require("json2csv").parse;



const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



module.exports.getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find(
            {},
            {
                password: 0,
            }
        );

        res.status(200).json({
            admins: admins,
        });
    } catch (err) {
        sendError(500, "Something went wrong", res);
    }
};
module.exports.getAllUsers = async (req, res) => {
    try {
        const admins = await Admin.find(
            {},
            {
                password: 0,
            }
        );
        const students = await Student.find({}, { password: 0 });
        const teachers = await Teacher.find({}, { password: 0 });

        res.status(200).json({
            admins,
            students,
            teachers,
        });
    } catch (err) {
        sendError(500, "Something went wrong", res);
    }
};
module.exports.getAdmin = async (req, res) => {
    if (req.user.user_type !== "admin")
        return sendError(401, "Only Admins allowed", res);
    const user = await Admin.findById(req.params.id);

    if (!user) return sendError(404, "Admin doesn't exists", res);

    try {
        await Admin.findByIdAndDelete(req.params.id);
        res.status(201).json({
            message: "Admin has been deleted",
        });
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
        });
    }
};

module.exports.exportToCSV = async (req, res) => {
    if (req.user.user_type !== "admin")
        return sendError(401, "Only Admins are allowed", res);

    try {
        const admins = await Admin.find({}, { password: 0 });

        const csv = json2csv(admins);

        return res.status(200).json({
            exported: csv,
        });
    } catch (err) {
        sendError(500, "Something went wrong", res);
    }
};



//NEW CREATE ADMIN BY LIN

// module.exports.createAdmin = async (req, res) => {
//     try {
//       const { name, email, username, password } = req.body;
  
//       if (!name || !email || !username || !password) {
//         return res.status(400).json({ message: 'All fields are required' });
//       }
  
//       const existingAdmin = await Admin.findOne({ email });
//       if (existingAdmin) {
//         return res.status(400).json({ message: 'Admin already exists' });
//       }
  
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       const newAdmin = new Admin({
//         name,
//         email,
//         username,
//         password: hashedPassword,
//         user_type: 'admin'
//       });
  
//       await newAdmin.save();
  
//       const payload = {
//         admin: {
//           id: newAdmin._id
//         }
//       };
  
//       const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
//       res.status(201).json({
//         token,
//         admin: {
//           id: newAdmin._id,
//           name: newAdmin.name,
//           email: newAdmin.email,
//           username: newAdmin.username,
//           user_type: newAdmin.user_type
//         }
//       });
//     } catch (error) {
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   };





module.exports.createAdmin = async (req, res) => {
    const { name, username, email, password } = req.body;

    if (req.user.user_type !== "admin")
        return sendError(401, "Only Admins are allowed", res);

    if (!name || !username || !email || !password)
        return sendError(400, "All fields are required!", res);

    const isEmailExist = await Admin.findOne({ email });
    if (isEmailExist) return sendError(400, "Email already exists", res);

    const isUsernameExists = await Admin.findOne({ username });
    if (isUsernameExists) return sendError(400, "Username already exists", res);

    const newAdmin = new Admin({
        name,
        email: String(email).toLowerCase(),
        username,
        password,
    });

    try {
        await newAdmin.save();
        res.status(201).json({
            message: "New admin created",
        });
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
        });
    }
};



module.exports.updateAdmin = async (req, res) => {
    const { name, username, email, _id: id, password } = req.body;

    if (req.user.user_type !== "admin")
        return sendError(401, "Only Admins are allowed", res);

    if (!name || !username || !email)
        return sendError(400, "All fields are required!", res);

    const user = await Admin.findById(id);

    if (email != user.email) {
        const isEmailExists = await Admin.find({
            email,
        });

        if (isEmailExists.length > 0)
            return sendError(400, "Email already exists", res);
    }

    if (password && password.trim() !== "") {
        user.password = password;
    }

    try {
        await Admin.findByIdAndUpdate(id, {
            $set: {
                name: name,
                username: username,
                email: email,
            },
        });
        await user.save();
        res.status(201).json({
            message: "Admin has been modified",
        });
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
        });
    }
};
