import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Plus, Download, Pencil, Trash2, Upload } from 'lucide-react';

function Resources() {
  const [resources, setResources] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Document'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  const fetchResources = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/resources');
      setResources(response.data);
    } catch (error) {
      console.log('Failed to fetch resources:', error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0] || null);
  };

  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      type: resource.type
    });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const admin = JSON.parse(localStorage.getItem('admin'));
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('type', formData.type);
      data.append('uploaded_by', admin?.id || '');
      if (selectedFile) {
        data.append('resourceFile', selectedFile);
      }

      if (editingId) {
        await axios.put(`http://localhost:5000/api/resources/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('http://localhost:5000/api/resources', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setFormData({ title: '', description: '', type: 'Document' });
      setSelectedFile(null);
      setEditingId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      fetchResources();
    } catch (error) {
      console.log('Failed to save resource:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/resources/${id}`);
      fetchResources();
    } catch (error) {
      console.log('Failed to delete resource:', error);
    }
  };

  return (
    <div>
      <div className="module-header">
        <div>
          <h2>Resources Management</h2>
          <p>Upload and manage downloadable files and resources.</p>
        </div>
      </div>

      <form className="module-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Resource' : 'Add New Resource'}</h3>

        <div className="form-grid">
          <input
            type="text"
            name="title"
            placeholder="Resource Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="Document">Document</option>
            <option value="PDF">PDF</option>
            <option value="Spreadsheet">Spreadsheet</option>
            <option value="Image">Image</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div
          style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: selectedFile ? '#f0fdf4' : '#f8fafc',
            transition: 'background 0.2s'
          }}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            required={!editingId}
          />
          <Upload size={28} style={{ color: '#94a3b8', marginBottom: '8px' }} />
          {selectedFile ? (
            <p style={{ margin: 0, color: '#16a34a', fontWeight: 500 }}>
              {selectedFile.name}
            </p>
          ) : (
            <>
              <p style={{ margin: 0, fontWeight: 500, color: '#475569' }}>
                Click to upload a file
              </p>
              {editingId && (
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  Leave empty to keep the existing file
                </p>
              )}
            </>
          )}
        </div>

        <textarea
          name="description"
          placeholder="Resource description (optional)"
          value={formData.description}
          onChange={handleChange}
        />

        <button className="primary-button" type="submit">
          <Plus size={18} />
          {editingId ? 'Update Resource' : 'Add Resource'}
        </button>
        {editingId && (
          <button
            type="button"
            style={{ marginLeft: '10px', padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
            onClick={() => {
              setEditingId(null);
              setFormData({ title: '', description: '', type: 'Document' });
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Uploaded Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td>{resource.title}</td>
                <td>
                  <span className="badge info">{resource.type}</span>
                </td>
                <td>{new Date(resource.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <a href={resource.file} target="_blank" rel="noopener noreferrer" className="small-button view" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'inherit' }}>
                      <Download size={16} />
                    </a>
                    <button className="small-button edit" onClick={() => handleEdit(resource)}>
                      <Pencil size={16} />
                    </button>
                    <button className="small-button delete" onClick={() => handleDelete(resource.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {resources.length === 0 && (
              <tr>
                <td colSpan="4">No resources found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Resources;