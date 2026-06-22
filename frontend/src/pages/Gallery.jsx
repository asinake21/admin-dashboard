import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';

function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [activeImage, setActiveImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: ''
  });

  const fetchGallery = async () => {
    try {
      const response = await axios.get('https://admin-dashboard-0g5e.onrender.com/api/gallery');
      setGalleryItems(response.data);
    } catch (error) {
      console.log('Failed to fetch gallery:', error);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleFileChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!imageFile) {
      alert('Please select an image file to upload.');
      return;
    }

    try {
      const admin = JSON.parse(localStorage.getItem('admin'));

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('uploaded_by', admin?.id);
      submitData.append('imageFile', imageFile);

      await axios.post('https://admin-dashboard-0g5e.onrender.com/api/gallery', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData({ title: '', category: '' });
      setImageFile(null);
      const fileInput = document.getElementById('imageFileInput');
      if (fileInput) fileInput.value = '';

      fetchGallery();
    } catch (error) {
      console.log('Axios Error:', error);
      alert(error.response?.data?.message || 'Failed to upload image');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await axios.delete(`https://admin-dashboard-0g5e.onrender.com/api/gallery/${id}`);
      fetchGallery();
    } catch (error) {
      console.log('Failed to delete gallery item:', error);
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f0f0f0%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20fill%3D%22%23999%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fsvg%3E';
  };

  return (
    <div>
      <div className="module-header">
        <div>
          <h2>Gallery Management</h2>
          <p>Upload and manage gallery images.</p>
        </div>
      </div>

      <form className="module-form" onSubmit={handleSubmit}>
        <h3>Add Gallery Image</h3>

        <div className="form-grid" style={{ marginBottom: '16px' }}>
          <input
            type="text"
            name="title"
            placeholder="Image title"
            value={formData.title}
            onChange={handleChange}
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        <input
          id="imageFileInput"
          type="file"
          name="imageFile"
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginBottom: '16px', display: 'block' }}
        />

        <button className="primary-button" type="submit" style={{ marginTop: '8px' }}>
          <Plus size={18} />
          Add Image
        </button>
      </form>

      <div className="gallery-grid">
        {galleryItems.map((item) => (
          <div className="gallery-card" key={item.id}>
            <img
              src={item.image}
              alt={item.title || 'Gallery item'}
              onError={handleImageError}
              onClick={() => setActiveImage(item)}
            />
            <div className="gallery-card-body">
              <div>
                <h3>{item.title || 'Untitled image'}</h3>
                <span>{item.category || 'General'}</span>
              </div>
              <button
                className="small-button delete"
                type="button"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {galleryItems.length === 0 && (
          <div className="empty-card">No gallery images found.</div>
        )}
      </div>

      {activeImage && (
        <div className="lightbox-overlay" onClick={() => setActiveImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setActiveImage(null)}>
              &times;
            </button>
            <img 
              src={activeImage.image} 
              alt={activeImage.title || 'Gallery item'} 
              onError={handleImageError} 
              style={{ maxWidth: '80vw', maxHeight: '80vh', cursor: 'pointer' }} 
            />
            <div className="lightbox-caption">
              <h3>{activeImage.title || 'Untitled image'}</h3>
              <p>{activeImage.category || 'General'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;