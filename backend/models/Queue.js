const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  // Step 1 — Center & Department
  center: {
    type: String,
    required: [true, 'Markaz tanlanishi shart'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Bo\'lim tanlanishi shart'],
    trim: true,
  },

  // Step 2 — Personal info
  name: {
    type: String,
    required: [true, 'Ism kiritilishi shart'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Telefon raqami kiritilishi shart'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Yosh kiritilishi shart'],
    min: [18, 'Yosh kamida 18 bo\'lishi kerak'],
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Jins tanlanishi shart'],
  },
  complaint: {
    type: String,
    required: [true, 'Shikoyat kiritilishi shart'],
    trim: true,
    maxlength: [500, 'Shikoyat 500 ta belgidan oshmasligi kerak'],
  },

  // Admin assigned slot
  assignedDate: {
    type: String,
  },
  assignedTime: {
    type: String,
  },

  // Status & meta
  status: {
    type: String,
    enum: ['pending', 'waiting', 'serving', 'done', 'rejected'],
    default: 'pending',
  },
  queueNumber: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-assign queue number before saving
queueSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({
      center: this.center,
      department: this.department
    });
    this.queueNumber = count + 1;
  }
  next();
});

module.exports = mongoose.model('Queue', queueSchema);
