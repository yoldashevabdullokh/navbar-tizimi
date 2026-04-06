const Queue = require('../models/Queue');

// Get all queue entries
const getQueue = async (req, res) => {
  try {
    const queue = await Queue.find().sort({ createdAt: 1 });
    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// Add new entry to queue
const addToQueue = async (req, res) => {
  try {
    const { center, department, name, phone, age, gender, complaint } = req.body;

    if (!center || !department || !name || !phone || !age || !gender || !complaint) {
      return res.status(400).json({ message: 'Barcha maydonlarni to\'ldiring' });
    }
    if (Number(age) < 18) {
      return res.status(400).json({ message: 'Yosh kamida 18 bo\'lishi kerak' });
    }

    const entry = new Queue({ center, department, name, phone, age: Number(age), gender, complaint });
    await entry.save();

    // Emit socket event
    const io = req.app.get('io');
    const allQueue = await Queue.find().sort({ createdAt: 1 });
    io.emit('queue:updated', allQueue);

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};


// Update status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'waiting', 'serving', 'done', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Noto\'g\'ri status' });
    }

    const entry = await Queue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Topilmadi' });

    // Emit socket event
    const io = req.app.get('io');
    const allQueue = await Queue.find().sort({ createdAt: 1 });
    io.emit('queue:updated', allQueue);

    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// Delete entry
const deleteEntry = async (req, res) => {
  try {
    const entry = await Queue.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Topilmadi' });

    // Emit socket event
    const io = req.app.get('io');
    const allQueue = await Queue.find().sort({ createdAt: 1 });
    io.emit('queue:updated', allQueue);

    res.json({ message: 'O\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// Approve entry
const approveQueue = async (req, res) => {
  try {
    const { assignedDate, assignedTime } = req.body;
    if (!assignedDate || !assignedTime) {
      return res.status(400).json({ message: 'Sana va vaqt belgilanishi shart' });
    }

    const entry = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: 'waiting', assignedDate, assignedTime },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Topilmadi' });

    const io = req.app.get('io');
    const allQueue = await Queue.find().sort({ createdAt: 1 });
    io.emit('queue:updated', allQueue);

    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// Reject entry
const rejectQueue = async (req, res) => {
  try {
    const entry = await Queue.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!entry) return res.status(404).json({ message: 'Topilmadi' });

    const io = req.app.get('io');
    const allQueue = await Queue.find().sort({ createdAt: 1 });
    io.emit('queue:updated', allQueue);

    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

module.exports = { getQueue, addToQueue, updateStatus, deleteEntry, approveQueue, rejectQueue };
