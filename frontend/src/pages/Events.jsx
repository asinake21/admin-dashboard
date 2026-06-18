import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';

function Events() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: ''
  });

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events');
      setEvents(response.data);
    } catch (error) {
      console.log('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const admin = JSON.parse(localStorage.getItem('admin'));

      await axios.post('http://localhost:5000/api/events', {
        ...formData,
        created_by: admin?.id
      });

      setFormData({
        title: '',
        description: '',
        location: '',
        event_date: ''
      });

      fetchEvents();
    } catch (error) {
      console.log('Failed to create event:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.log('Failed to delete event:', error);
    }
  };

  return (
    <div>
      <div className="module-header">
        <div>
          <h2>Event Management</h2>
          <p>Create, update, and manage upcoming events.</p>
        </div>
      </div>

      <form className="module-form" onSubmit={handleSubmit}>
        <h3>Add New Event</h3>

        <div className="form-grid">
          <input
            type="text"
            name="title"
            placeholder="Event title"
            value={formData.title}
            onChange={handleChange}
          />

          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
          />
        </div>

        <input
          type="text"
          name="location"
          placeholder="Event location"
          value={formData.location}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Event description"
          value={formData.description}
          onChange={handleChange}
        />

        <button className="primary-button" type="submit">
          <Plus size={18} />
          Add Event
        </button>
      </form>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Event Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.location}</td>
                <td>{new Date(event.event_date).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button className="small-button edit" type="button">
                      <Pencil size={16} />
                    </button>

                    <button
                      className="small-button delete"
                      type="button"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {events.length === 0 && (
              <tr>
                <td colSpan="4">No events found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Events;