import { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, Trash2 } from 'lucide-react';

function Contacts() {
  const [contacts, setContacts] = useState([]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/contacts');
      setContacts(response.data);
    } catch (error) {
      console.log('Failed to fetch contacts:', error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/contacts/${id}/read`);
      fetchContacts();
    } catch (error) {
      console.log('Failed to update contact:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/contacts/${id}`);
      fetchContacts();
    } catch (error) {
      console.log('Failed to delete contact:', error);
    }
  };

  return (
    <div>
      <div className="module-header">
        <div>
          <h2>Contact Messages</h2>
          <p>View messages submitted from the public website.</p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.name}</td>
                <td>{contact.email}</td>
                <td>{contact.subject || 'No subject'}</td>
                <td>{contact.message}</td>
                <td>
                  <span className={contact.status === 'unread' ? 'badge warning' : 'badge success'}>
                    {contact.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="small-button view"
                      type="button"
                      onClick={() => handleMarkAsRead(contact.id)}
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="small-button delete"
                      type="button"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {contacts.length === 0 && (
              <tr>
                <td colSpan="6">No contact messages found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Contacts;