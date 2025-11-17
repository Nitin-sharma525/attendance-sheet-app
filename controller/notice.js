const Notice = require('../model/notice');

exports.createNotice = async (req, res) => {
    try {
        const { title, message, createdBy } = req.body;

        const newNotice = new Notice({
            title,
            message,
            createdBy
        });

        const savedNotice = await newNotice.save();
        res.status(201).json({ message: 'Notice created successfully', notice: savedNotice });
    } catch (error) {
        res.status(500).json({ message: 'Error creating notice', error: error.message });
    }
};


exports.updateNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message } = req.body;

        const updatedNotice = await Notice.findByIdAndUpdate(
            id,
            { title, message },
            { new: true }
        );

        if (!updatedNotice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        res.status(200).json({ message: 'Notice updated successfully', notice: updatedNotice });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating notice', error: error.message });

    }
};

exports.deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedNotice = await Notice.findByIdAndDelete(id);

        if (!deletedNotice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        res.status(200).json({ message: 'Notice deleted successfully' });

    } catch (error) {       
        console.error(error);
        res.status(500).json({ message: 'Error deleting notice', error: error.message });

    }
};

exports.getAllNotices = async (req, res) => {
    try {
        const notices = await Notice.find().sort({ noticeDate: -1 });
        res.status(200).json({ notices });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching notices', error: error.message });
    }
};

exports.getNoticeById = async (req, res) => {
    try {
        const { id } = req.params;
        const notice = await Notice.findById(id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        res.status(200).json({ notice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching notice', error: error.message });
    }   
};


