const Event = require('../model/event');
const { v4: uuidv4 } = require('uuid');

exports.createEvent = async (req, res) => {
  try {
    const {
      eventNames,
      eventDate,   
      eventLocation,
      eventDescription,
      createdBy
    } = req.body;

  
    if (!eventNames || !eventDate || !eventLocation || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    
    const [day, month, year] = eventDate.split('-');
   const formattedDate = new Date(`${year}-${month}-${day}`); 

    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Use DD-MM-YYYY' });
    }

    
    const newEvent = new Event({
      eventNames,
      eventDate: formattedDate,
      eventLocation,
      eventDescription,
      createdBy,
      eventid: uuidv4()
    });

    const savedEvent = await newEvent.save();

    return res.status(201).json({
      status: true,
      message: 'Event created successfully',
      data: savedEvent
    });

  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



// Event request Accepted admin
exports.eventaccepted = async (req, res) => {
  try {
   const { eventid, eventstatus } = req.body;

   if (!eventid || !eventstatus) {
     return res.status(400).json({ message: 'eventid and eventstatus are required' });
   }

    const event = await Event.findOne({ eventid });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.eventstatus = eventstatus;
    await event.save();

    return res.status(200).json({
      status: true,
      message: 'Event request accepted successfully',
      event
    });

  } catch (error) {
    console.error('Error accepting event request:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

