import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (blog.content && blog.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft'
  });
  const [editingId, setEditingId] = useState(null);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/blogs');
      setBlogs(response.data);
    } catch (error) {
      console.log('Failed to fetch blogs:', error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title,
      content: blog.content,
      status: blog.status
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const admin = JSON.parse(localStorage.getItem('admin'));

      if (editingId) {
        await axios.put(`http://localhost:5000/api/blogs/${editingId}`, {
          ...formData,
        });
      } else {
        await axios.post('http://localhost:5000/api/blogs', {
          ...formData,
          created_by: admin?.id
        });
      }

      setFormData({
        title: '',
        content: '',
        status: 'draft'
      });
      setEditingId(null);

      fetchBlogs();
    } catch (error) {
      console.log('Failed to save blog:', error);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/blogs/${id}`);
      fetchBlogs();
    } catch (error) {
      console.log('Failed to delete blog:', error);
    }
  };

  return (
    <div>
      <div className="module-header">
        <div>
          <h2>Blog Management</h2>
          <p>Create, edit, publish, and delete blog posts.</p>
        </div>
      </div>

      <form className="module-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Blog' : 'Add New Blog'}</h3>

        <div className="form-grid">
          <input
            type="text"
            name="title"
            placeholder="Blog title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <textarea
          name="content"
          placeholder="Blog content"
          value={formData.content}
          onChange={handleChange}
          required
        />

        <button className="primary-button" type="submit">
          <Plus size={18} />
          {editingId ? 'Update Blog' : 'Add Blog'}
        </button>
        {editingId && (
          <button 
            type="button" 
            style={{marginLeft: '10px', padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer'}} 
            onClick={() => { setEditingId(null); setFormData({title: '', content: '', status: 'draft'}); }}
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
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBlogs.map((blog) => (
              <tr key={blog.id}>
                <td>{blog.title}</td>
                <td>
                  <span className={blog.status === 'published' ? 'badge success' : 'badge warning'}>
                    {blog.status}
                  </span>
                </td>
                <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button className="small-button edit" type="button" onClick={() => handleEdit(blog)}>
                      <Pencil size={16} />
                    </button>

                    <button
                      className="small-button delete"
                      type="button"
                      onClick={() => handleDelete(blog.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredBlogs.length === 0 && (
              <tr>
                <td colSpan="4">No blogs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Blogs;