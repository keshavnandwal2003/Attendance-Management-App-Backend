const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [3, 'Name must be at least 3 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },

        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email address',
            ],
        },

        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            validate: {
                validator: function (value) {
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(value);
                },
                message:
                    'Password must contain uppercase, lowercase, and a number',
            },
            select: false, // 🔥 IMPORTANT: hide password by default
        },

        role: {
            type: String,
            enum: {
                values: ['Teacher', 'Student'],
                message: 'Role must be either Teacher or Student',
            },
            required: [true, 'Role is required'],
        },

        refreshToken: {
            type: String,
            default: null,
        },

        resetPasswordToken: String,

        resetPasswordExpire: Date,
    },
    { timestamps: true }
);

/* =========================
   PASSWORD HASHING
========================= */

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/* =========================
   COMPARE PASSWORD
========================= */

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/* =========================
   HIDE PASSWORD IN RESPONSE
========================= */

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.refreshToken; // 🔥 hide sensitive token too
    return user;
};

module.exports = mongoose.model('User', userSchema);